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
## Managing content

There is no admin panel and no Vercel Blob. Content lives in the repository:

- **Products**: edit `lib/data/gemstones.ts` (name, details, image and video paths, `featured`).
- **Collections page**: every image in `public/jew`.
- **Gallery page**: every image and video in `public/` (including `public/images/gallery` and `public/videos`), except `public/jew`, `public/images/gems` and `public/images/site`.

**Add an image**

1. Copy the file into `public/images/gems`, `public/images/gallery` or `public/images/site`. Use `.webp`, `.avif`, `.jpg` or `.png` with lowercase names, e.g. `public/images/gems/blue-sapphire-3ct.webp`.
2. For a product, set its `image` (and `gallery`) in `lib/data/gemstones.ts` to `/images/gems/blue-sapphire-3ct.webp`. Files in `public/images/gallery` appear in the Gallery automatically.
3. Commit, push and deploy:
   ```bash
   git add public lib
   git commit -m "Add blue sapphire"
   git push
   ```

**Replace an image**: add the new file under a *new* filename (browsers and the CDN cache old ones), update the path, deploy.

**Remove an image**: remove every reference to it, deploy, then delete the file in a later commit.

**Videos** work the same way, in `public/videos` (reference as `/videos/name.mp4`).

### Newsletter storage

Only the newsletter keeps runtime data. Locally it is `data/newsletter.json`; on Vercel add **Upstash Redis** (Storage, Marketplace, free) to the project and redeploy. See `docs/newsletter.md`.
