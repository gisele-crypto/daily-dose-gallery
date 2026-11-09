/**
 * Local content, taken from content/en.md and content/works.json.
 *
 * This is the starting data. In the next step it is imported into Sanity and
 * src/lib/content.ts reads from Sanity instead; the shapes below stay the same.
 */
import type { ImageMetadata } from "astro";
import type { Artist, Artwork, Gallery } from "../lib/types";
import works from "../../content/works.json";

const images = import.meta.glob<{ default: ImageMetadata }>("../assets/works/*.{webp,png,jpg}", {
  eager: true,
});

function imageFor(slug: string): { image: ImageMetadata; placeholder: boolean } {
  for (const [path, mod] of Object.entries(images)) {
    const file = path.split("/").pop() ?? "";
    if (file.startsWith(`${slug}.`)) {
      return { image: mod.default, placeholder: file.includes(".placeholder.") };
    }
  }
  throw new Error(`No image for ${slug}`);
}

export const gallery: Gallery = {
  name: "Daily Dose Gallery",
  url: "https://www.dailydosegallery.com",
  email: "hello@dailydosegallery.com",
  street: "Meentweg 37 B",
  postalCode: "1261 XS",
  city: "Blaricum",
  country: "The Netherlands",
  countryCode: "NL",
  openingHours: "Tuesday & Thursday, 10:00–16:00. Other days by appointment.",
  openingDays: ["Tuesday", "Thursday"],
  opens: "10:00",
  closes: "16:00",
  kvk: "56314205",
  btw: "NL852070019B01",
  // To be confirmed by the owner.
  instagram: "https://www.instagram.com/dailydose.gallery/",
};

export const artists: Artist[] = [
  {
    slug: works.artist.slug,
    name: works.artist.name,
    origin: works.artist.origin,
    selfTaught: works.artist.self_taught,
  },
];

// Display order within each format group (Baila 2 above Baila 1, the pair at the end).
const order: Record<string, number> = {
  distance: 1,
  "el-mayamero": 2,
  "father-mother": 1,
  school: 2,
  "way-home": 3,
  waiting: 4,
  "family-games": 5,
  "baila-2": 1,
  "baila-1": 2,
};

const pairs: Record<string, string> = { waiting: "family-games", "family-games": "waiting" };
const featuredOnHome = ["father-mother", "school", "waiting", "el-mayamero"];

export const artworks: Artwork[] = works.works.map((w) => {
  const [heightCm, widthCm] = w.size_cm.split("×").map((n) => Number(n.trim())) as [number, number];
  return {
    slug: w.slug,
    title: w.title,
    artistSlug: works.artist.slug,
    year: w.year ?? undefined,
    medium: w.medium,
    heightCm,
    widthCm,
    status: w.status as Artwork["status"],
    featuredOnHome: featuredOnHome.includes(w.slug),
    pairWith: pairs[w.slug],
    order: order[w.slug] ?? 99,
    ...imageFor(w.slug),
  };
});
