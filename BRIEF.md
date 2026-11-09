# Build brief — Daily Dose Gallery website

You are building the website for **Daily Dose Gallery**, a gallery in Blaricum, the Netherlands, selling paintings online and in its space at Meentweg 37 B. The design has been approved; build it faithfully. All copy is in `content/en.md`; all works are in `content/works.json`; all images are in `images/`.

## Stack

- **Astro** (static output), no client-side framework needed. Plain CSS.
- Every page must be delivered as complete static HTML (Astro does this by default). No client-only rendering of content.
- Deploy target: Netlify or Vercel, custom domain dailydosegallery.com.
- Use Astro's image tooling (`astro:assets`) to generate responsive WebP/AVIF versions with width/height set.

## Design (approved — follow exactly)

Reference: the minimal white-cube look of Gagosian and White Cube. The paintings bring all the colour; the site itself is black, white and grey.

- Background #FFFFFF. Text #111111. Secondary text #595959 (passes contrast). Dividing lines 1px #E4E4E4.
- One typeface: **Inter Tight** (400, 500, 600) via Google Fonts or self-hosted, fallback Helvetica Neue, Arial. **No italics anywhere.**
- Logo (text): "DAILY DOSE" 22px, weight 600, letter-spacing 0.28em; "GALLERY" underneath 11px, weight 500, letter-spacing 0.42em, #595959.
- Menu: ART · ARTIST · ABOUT · CONTACT — 13px, weight 500, letter-spacing 0.12em. Active page underlined with a 1px line.
- Section labels: 13px uppercase, weight 600, letter-spacing 0.24em, in a left column; content in a wider right column (two-column layout that stacks on mobile).
- Big statements: 34px, weight 500, line-height 1.2. Body text: 19px, line-height 1.6, #333333. Max line length about 760px.
- Max content width 1440px, side padding 4%. Generous vertical spacing (96–120px between sections).
- Buttons: either text with a 1px underline, or a solid black block with white uppercase text (13px, letter-spacing 0.16em, min height 44px).
- Paintings are shown **uncropped**, directly on white, no frames, shadows or rounded corners. Only the home hero uses a crop.
- No animations beyond simple hover colour changes. Fully responsive; test at 375px, 768px and 1440px.

## Pages and routes

The site is in English only (no language switch). Set `<html lang="en">`.

| Page | Route |
|---|---|
| Home | / |
| Art | /art/ |
| Artist | /artist/julian-villafane/ |
| About | /about/ |
| Contact | /contact/ |
| Privacy | /privacy/ |

Menu "ARTIST" links directly to Julián's page while there is one artist. All artists and artworks come from the CMS (see below), so more artists, including the owner's own paintings, can be added without code. Prepare for an "Exhibitions" page to be added later.

### Layout rules for the works (Art page and Artist page)

Group by `format` in `works.json`, with large white space between groups:

1. **square** — side by side, each half the width (Distance, El Mayamero).
2. **tall** (140 × 40 cm) — one row, all the same height (about 40rem on desktop): Father Mother, School, Way home, Waiting, Family Games. **Waiting and Family Games are a pair and must always stay side by side**, also when the row wraps.
3. **landscape** — stacked: **Baila 2 on top, Baila 1 below, both the same width** (max about 900px).

Under each work: title (18px, 500), artist name as link (Art page only), "Oil on canvas · [size] cm" in #595959, a thin line, then "Price on request" left and ENQUIRE right. ENQUIRE = `mailto:hello@dailydosegallery.com?subject=Enquiry: [Title] by Julián Villafañe` (URL-encoded).

### Home

1. Hero: wide 16:8 crop of `distance.png`, then FEATURED ARTIST / Julián Villafañe (h1) / "Distance · Oil on canvas · 120 × 120 cm" / VIEW ARTIST.
2. ART: Father Mother, School, Waiting side by side at equal height; below a divider, El Mayamero large with its caption beside it. Link "All works".
3. Short About teaser or full About text, then newsletter signup.

### Contact

The two space photos side by side, then three columns: address, opening hours, email. Then the BY APPOINTMENT block with the SEND AN EMAIL button. Then newsletter.

Note: the space photos are only 600×400. Use them for now, sized so they are not upscaled beyond their resolution; they will be replaced with high-resolution photos.

## CMS — the owner adds and edits content herself (required)

The owner is not a developer. She must be able to add new paintings and artists, mark works as sold, and edit texts in a browser, without touching code.

- Use **Sanity** as headless CMS (free tier), with Sanity Studio embedded or hosted at `/studio` (or `studio.dailydosegallery.com`). Sanity Studio labels in **Dutch** where possible.
- Import all current content from `content/` and `images/` into Sanity as the initial data.
- Schemas:
  - **Artist**: name, slug, portrait, origin line, bio (rich text), exhibitions (list: title, year/period), optional quote, order.
  - **Artwork**: title, slug, artist (reference), year (optional), medium (default "Oil on canvas"), height cm, width cm, **format** (square / tall / landscape — choose automatically from height and width, with manual override), image (with hotspot), **status** (available / reserved / sold), featured on home (yes/no), pair with (optional reference, e.g. Waiting ↔ Family Games, so pairs always stay side by side), order within its group.
  - **Pages**: About, Contact block texts, home hero (artwork reference + label), gallery details (address, opening hours, email, KvK, BTW, Instagram) used everywhere incl. footer and JSON-LD.
- Status display: available → "Price on request" + ENQUIRE; reserved → "Reserved" (no ENQUIRE); sold → "Sold" with a small dot, no ENQUIRE. Sold works stay visible but sort after available works within their group.
- The layout rules in this brief (grouping by format, equal heights, pairs, Baila 2 above Baila 1 via order) must work automatically for any new artwork.
- When content is published in Sanity, the site **rebuilds automatically** (Sanity webhook → Netlify/Vercel build hook) so pages stay static and SEO-friendly. Publishing to live should take a few minutes at most.
- Image handling: the owner uploads one large photo; the site generates all sizes. Add a field hint: "Upload a straight, cropped photo of the painting only, at least 2000 px on the long side."
- Write a short Dutch manual `HANDLEIDING-CMS.md`: how to log in, add a painting, add an artist, mark as sold, edit About/Contact, and how long until it is live.

## SEO and AI visibility (required)

- Unique `<title>` and meta description per page. Example home: "Daily Dose Gallery — Contemporary paintings in Blaricum, the Netherlands". Mention Blaricum and Het Gooi in the home and contact descriptions for local search.
- Canonical URL, Open Graph and Twitter Card tags (share image: a painting).
- Semantic HTML: one h1 per page, logical h2/h3, `<address>` for the address, real `<img>` with width, height and descriptive alt text.
- Schema.org JSON-LD:
  - `ArtGallery` (also `LocalBusiness`): name, url, email, address, geo-free postal address, `openingHoursSpecification` (Tu, Th 10:00–16:00), `identifier` KvK 56314205.
  - `Person` for Julián Villafañe (artist page).
  - `VisualArtwork` for each painting: name, creator, artMedium "Oil on canvas", artform "Painting", width and height in cm, image.
  - `BreadcrumbList` on sub-pages.
- `sitemap.xml` and `robots.txt` allowing all crawlers, explicitly including Googlebot, Bingbot, GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot and Google-Extended.
- `llms.txt` in the root: a short plain-text description of the gallery (philosophy from the About text), location, opening hours, contact, and the artist with a list of works and their URLs.
- Performance: Lighthouse 95+ on mobile for Performance, Accessibility, Best practices and SEO. Lazy-load images below the fold; preload the hero.

## Legal / footer

Footer on every page: DAILY DOSE GALLERY · Instagram · hello@dailydosegallery.com · Privacy · Meentweg 37 B, Blaricum · KvK 56314205 · BTW NL852070019B01 · © year.
Privacy page: placeholder layout; the owner supplies the final text.
Newsletter form: build the UI and leave a clearly marked integration point (e.g. for Mailchimp or Laposta). No cookies or tracking unless asked.

## Done when

- All pages exist with the content from `content/en.md`.
- `view-source` of every page shows the full text, title, description and JSON-LD.
- The site matches the layout rules above at 375px, 768px and 1440px.
- sitemap.xml, robots.txt and llms.txt are generated (and regenerated on every CMS publish).
- The owner can add a new painting in Sanity Studio and see it live on the correct place of the Art and Artist pages without help.
- HANDLEIDING-CMS.md is written in Dutch.
