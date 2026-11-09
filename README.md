# Daily Dose Gallery

Website of Daily Dose Gallery, Blaricum. Astro (static) on Netlify, content in Sanity.

- `npm install`, then `npm run dev` for the site and `npm run studio` for the CMS locally.
- `npm run build` builds the site into `dist/` and, when `SANITY_STUDIO_PROJECT_ID` is set, the Studio into `dist/studio/`.
- Content comes from Sanity when `SANITY_STUDIO_PROJECT_ID` is set, else from `content/` and `images/` (the starting data).
- First import into Sanity: `npm run import` (see `docs/SANITY-INSTALLATIE.md`).
- Owner manual (Dutch): `HANDLEIDING-CMS.md`. Build brief: `BRIEF.md`.
