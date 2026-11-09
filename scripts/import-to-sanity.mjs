/**
 * One-time import of the starting content into Sanity:
 * content/works.json, content/site.json and the photos in images/.
 *
 * Usage:
 *   SANITY_STUDIO_PROJECT_ID=xxxx SANITY_AUTH_TOKEN=<editor token> npm run import
 *
 * Documents get fixed ids (artwork-<slug>, artist-<slug>, home, about, ...).
 * Existing documents are left alone, so running it again never overwrites
 * what the owner changed in the Studio. Add --force to replace them anyway.
 */
import { createClient } from "@sanity/client";
import { createReadStream, existsSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";
import { randomUUID } from "node:crypto";

const root = new URL("..", import.meta.url).pathname;
const projectId = process.env.SANITY_STUDIO_PROJECT_ID;
const token = process.env.SANITY_AUTH_TOKEN;
const dataset = process.env.SANITY_STUDIO_DATASET ?? "production";
const force = process.argv.includes("--force");

if (!projectId || !token) {
  console.error("Set SANITY_STUDIO_PROJECT_ID and SANITY_AUTH_TOKEN first.");
  process.exit(1);
}

const client = createClient({ projectId, dataset, token, apiVersion: "2025-01-01", useCdn: false });
const works = JSON.parse(readFileSync(join(root, "content/works.json"), "utf8"));
const site = JSON.parse(readFileSync(join(root, "content/site.json"), "utf8"));

const key = () => randomUUID().replace(/-/g, "").slice(0, 12);
const ref = (id) => ({ _type: "reference", _ref: id });
const block = (text) => ({
  _type: "block",
  _key: key(),
  style: "normal",
  markDefs: [],
  children: [{ _type: "span", _key: key(), text, marks: [] }],
});

async function upload(path) {
  const file = join(root, path);
  if (!existsSync(file)) {
    console.warn(`  ! missing ${path}`);
    return undefined;
  }
  const asset = await client.assets.upload("image", createReadStream(file), { filename: basename(file) });
  return { _type: "image", asset: ref(asset._id) };
}

function findImage(folder, slug) {
  for (const ext of ["png", "jpg", "jpeg", "webp"]) {
    const path = `images/${folder}/${slug}.${ext}`;
    if (existsSync(join(root, path))) return path;
  }
  return undefined;
}

async function save(doc) {
  const exists = await client.getDocument(doc._id);
  if (exists && !force) {
    console.log(`  = ${doc._id} exists, skipped`);
    return;
  }
  await client.createOrReplace(doc);
  console.log(`  + ${doc._id}`);
}

const partner = (slug) => {
  for (const [a, b] of site.works.pairs) {
    if (a === slug) return b;
    if (b === slug) return a;
  }
  return undefined;
};

console.log(`Importing into ${projectId}/${dataset}${force ? " (force)" : ""}`);

const a = works.artist;
const artistId = `artist-${a.slug}`;
const portraitPath = findImage("artists", a.slug);
await save({
  _id: artistId,
  _type: "artist",
  name: a.name,
  slug: { _type: "slug", current: a.slug },
  origin: a.origin,
  selfTaught: a.self_taught,
  bio: site.artist.bio.map(block),
  exhibitions: site.artist.exhibitions.map((e) => ({ _key: key(), _type: "exhibition", ...e })),
  ...(site.artist.quote ? { quote: site.artist.quote } : {}),
  order: 1,
  ...(portraitPath ? { portrait: await upload(portraitPath) } : {}),
});

for (const w of works.works) {
  const [heightCm, widthCm] = w.size_cm.split("×").map((n) => Number(n.trim()));
  const imagePath = findImage("works", w.slug);
  const pair = partner(w.slug);
  await save({
    _id: `artwork-${w.slug}`,
    _type: "artwork",
    title: w.title,
    slug: { _type: "slug", current: w.slug },
    artist: ref(artistId),
    medium: w.medium,
    heightCm,
    widthCm,
    format: "auto",
    status: w.status,
    featuredOnHome: site.works.featuredOnHome.includes(w.slug),
    order: site.works.order[w.slug] ?? 10,
    ...(w.year ? { year: w.year } : {}),
    ...(pair ? { pairWith: { ...ref(`artwork-${pair}`), _weak: true } } : {}),
    ...(imagePath ? { image: await upload(imagePath) } : {}),
  });
}

const g = site.gallery;
await save({ _id: "gallery", _type: "gallery", ...g });
await save({
  _id: "home",
  _type: "home",
  heroArtwork: ref(`artwork-${site.home.heroArtwork}`),
  heroLabel: site.home.heroLabel,
});
await save({
  _id: "about",
  _type: "about",
  sections: site.about.sections.map((s) => ({ _key: key(), _type: "section", ...s })),
  image: ref(`artwork-${site.about.image}`),
  closing: site.about.closing,
});
const photos = [];
for (const p of site.contact.spacePhotos) {
  const img = await upload(p.file);
  if (img) photos.push({ ...img, _key: key(), alt: p.alt, caption: p.caption });
}
const { spacePhotos: _ignored, ...contactTexts } = site.contact;
await save({ _id: "contact", _type: "contact", ...contactTexts, spacePhotos: photos });
// Privacy statement: headings, paragraphs and bullet lists; email addresses as links.
const richBlock = ({ type, text }) => {
  const markDefs = [];
  const children = [];
  let last = 0;
  for (const m of text.matchAll(/[\w.+-]+@[\w-]+(\.[\w-]+)+/g)) {
    if (m.index > last) children.push({ _type: "span", _key: key(), text: text.slice(last, m.index), marks: [] });
    const linkKey = key();
    markDefs.push({ _type: "link", _key: linkKey, href: `mailto:${m[0]}` });
    children.push({ _type: "span", _key: key(), text: m[0], marks: [linkKey] });
    last = m.index + m[0].length;
  }
  if (last < text.length) children.push({ _type: "span", _key: key(), text: text.slice(last), marks: [] });
  return {
    _type: "block",
    _key: key(),
    style: type === "h2" ? "h2" : "normal",
    ...(type === "li" ? { listItem: "bullet", level: 1 } : {}),
    markDefs,
    children,
  };
};
await save({ _id: "privacy", _type: "privacy", body: (site.privacy ?? []).map(richBlock) });

console.log("Done. Open /studio to check, then publish anything to trigger a site build.");
