# Newsletter & new-product announcements

Flow: footer form → validation → **pending** row (JSON file) → confirmation email (Brevo transactional) →
visitor presses *Confirm* → **active** + added to the Brevo list → new gemstone published → outbox job →
Brevo marketing campaign to the list → unsubscribe / spam / hard-bounce webhooks update our records.

## Architecture

| Concern | Where |
| --- | --- |
| All newsletter data (subscribers, queue, events, rate limits) | one JSON document, `lib/newsletter/state.ts` |
| Subscribe / confirm / sync / provider events | `lib/newsletter/subscribers.ts` |
| Publication detection + baseline | `lib/newsletter/products.ts` |
| Outbox worker (campaign create/send, retries) | `lib/newsletter/worker.ts` |
| Brevo REST client | `lib/newsletter/brevo.ts` |
| Email HTML | `lib/newsletter/templates.ts` |
| Endpoints | `POST /api/newsletter/subscribe`, `POST /api/newsletter/webhook`, `GET /api/cron/newsletter` |
| Screens | `/newsletter/confirm`, `/newsletter/result` |

**No database.** Locally the data is `data/newsletter.json` (git-ignored). On Vercel the filesystem is read-only, so
the same JSON is kept in a **private** Vercel Blob (`private/newsletter-state.json`), selected automatically when
`BLOB_READ_WRITE_TOKEN` is set. Writes use ETag conditional writes plus an in-process lock: if two serverless
instances write at once, the loser re-reads and re-applies its change. Do **not** use a public Blob for this: the
code refuses to (it always requests `access: "private"`) so emails can never become publicly readable.
This is a good fit for a small list; if you ever reach many thousands of subscribers, move to a real database.

Confirmation is custom double opt-in: a 256-bit random token, only its SHA-256 is stored, 48 h expiry. Opening
the link is read-only (email scanners prefetch links); the subscriber is activated only when the *Confirm* button
posts. Contacts are added to the Brevo list **only after** confirmation, so the list holds confirmed people only.

## What counts as a "new publication"

- Only **gemstones** have product pages (`/shop/[slug]`). Every gemstone saved in the admin is live immediately
  (the CMS has no draft state), so a *newly created* gemstone is the first publication.
- **Jewellery** (the *Collections* admin) is a bare image gallery with no product pages, names or descriptions,
  so it is **not** announced. If jewellery products are added later, map them to `AnnouncedProduct` with
  `type: "jewellery"` in `lib/newsletter/products.ts` and include them in `listPublishedProducts`.
- Product identity is the CMS `id`. `newsletter_products.product_id` is the primary key and `newsletter_jobs.product_id`
  is unique, so edits, rebuilds, retries and concurrent workers cannot announce a product twice. The product row and
  its job are created in one atomic write.
- Admin create → `after()` runs the worker immediately. The daily cron also rescans the catalogue, so a product whose
  hook failed is still found.

### Baseline (first-publication workflow)

The **first worker run** after deployment (the first cron run) records every existing product as `baseline = true` and
announces nothing. Until that has happened the admin hook enqueues nothing. Run it before publishing your first
"real" new product: `curl -H "Authorization: Bearer $CRON_SECRET" https://<site>/api/cron/newsletter`
(response shows `"baselined": N`). Products created before that run are treated as existing catalogue.

## Delivery guarantees

1. Job states: `pending → campaign_created → sent` (or `skipped` / `failed`). "sent" means **accepted by Brevo**
   (`accepted_at`); delivery, opens and bounces are reported in Brevo, not tracked here.
2. Campaign name is deterministic (`tapro-product-<product id>`, unique). Before creating, the worker looks the name up in
   Brevo, so an ambiguous create timeout never produces a duplicate. The campaign ID is saved **before** `sendNow`.
3. Before `sendNow` the worker reads the campaign status; `queued/in_process/sent/archive` ⇒ already accepted, mark sent.
4. Retries: 429/5xx/network errors back off 1 min × 2ⁿ (cap 6 h, honours `Retry-After`), max 6 attempts, then
   `failed` with `last_error`. 4xx errors fail immediately. Review with:
   look for entries in `jobs` with `"status": "failed"` in the JSON (`lastError` explains why).
5. A job created while no confirmed subscriber exists is `skipped` (new subscribers do not receive old announcements).
6. Jobs are claimed with `FOR UPDATE SKIP LOCKED` plus a 5-minute lease.

## Unsubscribe & suppression

Campaigns contain Brevo's `{{ unsubscribe }}` link. Brevo's `unsubscribe`, `spam` and `hard_bounce` marketing
webhooks update our `status` (`unsubscribed` / `suppressed`). Events are de-duplicated and an event older than the
latest confirmation is ignored. A contact that Brevo has blocklisted is never re-added; sync retries only touch
`active` (confirmed) rows. An unsubscribed visitor can subscribe again only by going through a new confirmation.
Newsletter state is separate from transactional mail (appointment emails are untouched).

The subscribe endpoint answers identically whether or not an email was sent (already active, suppressed, cooldown)
so it cannot be used to discover who is subscribed.

## External setup still required

1. **Private Blob store**: your existing `BLOB_READ_WRITE_TOKEN` may belong to a *public* store. If saving fails with an
   access error, create a second **private** Blob store in Vercel (Storage → Blob → Private) and point
   `BLOB_READ_WRITE_TOKEN` at it. (The admin content store uses the same token and public access, so check the
   Vercel docs on whether one store can serve both; if not, tell me and I'll add a separate token variable.)
2. **Brevo list**: Contacts → Lists → create "Tapro Gems Newsletter" (and a separate *test* list). Put its numeric ID in
   `BREVO_NEWSLETTER_LIST_ID`.
3. **Sender/domain**: verify `BREVO_SENDER_EMAIL` and authenticate the domain (SPF/DKIM/DMARC) in Brevo. Marketing
   campaigns also need a postal address in the footer (the one from `lib/data/contact.ts` is used; confirm it is correct).
4. **Webhook**: Brevo → Transactional/Marketing → Webhooks → Marketing. URL `https://<site>/api/newsletter/webhook`,
   events *Unsubscribe*, *Marked as spam*, *Hard bounce*, authentication **Bearer token** = `BREVO_WEBHOOK_TOKEN`.
5. **Unsubscribe page behaviour**: Brevo account settings decide whether the unsubscribe link removes the contact from
   the list or blocklists it; both fire the webhook.
6. **Vercel env vars**: everything in `.env.example` (`SITE_URL`, `CRON_SECRET`, …) for Production (and test values for Preview).
7. **Cron**: `vercel.json` schedules `/api/cron/newsletter` daily (`0 6 * * *`, the most frequent Hobby plan allows).
   The admin save also triggers the worker, so the cron is the retry/safety net. On Pro, tighten to e.g. `*/10 * * * *`.
8. Update the Privacy Policy wording if you want it to mention the newsletter explicitly (section 4 already covers
   marketing emails and unsubscribing).

## Verify safely (never use real subscribers)

1. Use a Preview/local environment with `BREVO_NEWSLETTER_LIST_ID` = the **test list** containing only your own addresses.
2. `npm run dev`; submit your address in the footer. Open the email, press *Confirm subscription*.
   Check the contact now sits in the test list and `data/newsletter.json` shows `"status": "active"`.
3. Trigger the baseline: `curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/newsletter`.
4. Sign in to `/admin`, create a gemstone. The test list receives one campaign; edit the gemstone — nothing is sent.
5. Click *Unsubscribe* in the campaign; after Brevo's webhook arrives the row becomes `unsubscribed`.
   (Locally, expose the dev server with a tunnel or POST a sample payload with the bearer token.)

## Tests

`npm test` runs against an in-memory store with a fake Brevo; no network or credentials are used.
