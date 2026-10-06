# Tapro Gems

Tapro Gems is a premium gemstone website for a Finland-based, family-owned business specialising in 100% natural Sri Lankan gemstones.

The website is designed with a calm Nordic luxury style, combining clean layouts, cinematic gemstone visuals, and smooth interactions.

## Features

- Premium luxury UI
- Natural Sri Lankan gemstone collections
- 3D sapphire hero experience
- Smooth GSAP animations
- Responsive design
- Gemstone detail pages
- Certification information
- Private appointment booking
- Contact and enquiry sections
- Multilingual-ready structure
- English, Finnish, and Swedish support

## Target Audience

- Collectors
- Investors
- Jewellery designers
- Wholesale gemstone buyers
- Private luxury buyers
- Couples looking for unique gemstones

## Brand Direction

- Sapphire Blue
- Midnight Navy
- Champagne Gold
- Soft White / Ivory
- Elegant serif typography
- Clean modern sans-serif typography
- Nordic luxury aesthetic
- Cinematic gemstone presentation

## Tech Stack

- React
- TypeScript
- GSAP
- ScrollTrigger
- Three.js / React Three Fiber
- Responsive CSS

## Main Pages

- Home
- Shop
- Gemstone Collections
- Gemstone Details
- About
- Certification
- Collectors / Wholesale
- Book Appointment
- FAQ
- Contact

## Project Goal

The goal of Tapro Gems is to create a premium European-facing digital experience that presents authentic Sri Lankan gemstones with trust, transparency, and refined luxury.

---

© Tapro Gems
## Managing images

Images live in the repository under `public/images`, not in Vercel Blob. Product, gallery and collection records (kept in the admin store) only hold the image *path*.

**Add an image**

1. Copy the file into the right folder: `public/images/gems`, `public/images/gallery` or `public/images/site`. Use `.webp`, `.avif`, `.jpg` or `.png`, lowercase names without special characters, e.g. `public/images/gems/blue-sapphire-3ct.webp`. Export at the largest size it is shown at; Next.js resizes it per device.
2. Commit, push and deploy:
   ```bash
   git add public/images
   git commit -m "Add blue sapphire image"
   git push
   ```
   Wait for the Vercel deployment to finish. The image is not available on the live site until then.
3. In the admin panel, edit the gemstone (or add/edit a Gallery or Collections item) and enter the path in the image field, e.g. `/images/gems/blue-sapphire-3ct.webp`. A preview appears; if it says no image was found, the filename is wrong or the deployment has not finished. Gallery image paths can be reordered with the arrows.

**Replace an image**: add the new file under a *new* filename (browsers and the CDN cache old ones), deploy, then change the path in the admin panel.

**Remove an image**: first change or remove every record that uses the path in the admin panel, then delete the file from `public/images` in a later commit. Deleting a product or gallery record in the admin never deletes a file from the repository.

Videos are still uploaded in the admin and stored in Vercel Blob, as are the admin store and newsletter state, so `BLOB_READ_WRITE_TOKEN` is still required.

### Migrating existing Blob images

`scripts/migrate-blob-images.mjs` moves images already stored in Blob. It defaults to a dry run and never deletes Blob files or touches the database unless asked:

```bash
node --env-file=.env.local scripts/migrate-blob-images.mjs                  # dry run: list Blob images and proposed paths
node --env-file=.env.local scripts/migrate-blob-images.mjs --download       # download + verify into public/images, write migration/blob-image-manifest.json
# commit, push and deploy public/images and the manifest, then:
node --env-file=.env.local scripts/migrate-blob-images.mjs --apply --dry-run --site-url https://your-site   # check only
node --env-file=.env.local scripts/migrate-blob-images.mjs --apply --site-url https://your-site             # back up the store, rewrite verified references
```

References whose file is missing, invalid or not yet live keep their original Blob URL and are listed in the output.
