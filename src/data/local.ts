/**
 * Local starting content, from content/en.md, content/works.json and images/.
 *
 * Used when no Sanity project is configured, and as the source for the first
 * import into Sanity (scripts/import-to-sanity.mjs). Images are looked up by
 * slug in images/works/ (any of .png .jpg .jpeg .webp); a missing photo shows
 * a neutral placeholder until it is added.
 */
import type { ImageMetadata } from "astro";
import type { Content, Format, Img } from "../lib/types";
import works from "../../content/works.json";

type Mod = { default: ImageMetadata };
const workImages = import.meta.glob<Mod>("../../images/works/*.{png,jpg,jpeg,webp}", { eager: true });
const artistImages = import.meta.glob<Mod>("../../images/artists/*.{png,jpg,jpeg,webp}", { eager: true });
const spaceImages = import.meta.glob<Mod>("../../images/space/*.{png,jpg,jpeg,webp}", { eager: true });
const placeholders = import.meta.glob<Mod>("../assets/placeholders/*.png", { eager: true });

function find(mods: Record<string, Mod>, name: string): ImageMetadata | undefined {
  for (const [path, mod] of Object.entries(mods)) {
    const file = (path.split("/").pop() ?? "").replace(/\.[a-z]+$/i, "");
    if (file === name) return mod.default;
  }
  return undefined;
}

function placeholder(kind: Format | "portrait"): ImageMetadata {
  const img = find(placeholders, kind);
  if (!img) throw new Error(`Missing placeholder ${kind}`);
  return img;
}

function parseSize(size: string): [number, number] {
  const [h, w] = size.split("×").map((n) => Number(n.trim()));
  return [h ?? 0, w ?? 0];
}

// Order within each format group: Baila 2 above Baila 1, the pair at the end.
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

const p = (s: string) => `<p>${s}</p>`;

export function localContent(): Content {
  const artist = works.artist;
  const portrait = find(artistImages, artist.slug);
  // All photos in images/space/, in file-name order.
  const knownSpace: Record<string, { alt: string; caption: string }> = {
    "ground-floor": {
      alt: "The ground floor of Daily Dose Gallery, a white space with a glass facade and a concrete wall",
      caption: "Ground floor",
    },
    "upper-floor": {
      alt: "The upper floor of Daily Dose Gallery, with a glass wall overlooking the garden",
      caption: "Upper floor",
    },
  };
  const spacePhotos = Object.entries(spaceImages)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([path, mod]) => {
      const name = (path.split("/").pop() ?? "").replace(/\.[a-z]+$/i, "");
      const known = knownSpace[name];
      const image: Img = mod.default;
      return {
        image,
        alt: known?.alt ?? "The gallery space of Daily Dose Gallery at Meentweg 37 B, Blaricum",
        caption: known?.caption ?? "",
      };
    });

  return {
    gallery: {
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
    },
    artists: [
      {
        slug: artist.slug,
        name: artist.name,
        origin: artist.origin,
        selfTaught: artist.self_taught,
        portrait,
        bioHtml: [
          "Son of a painter and a puppeteer, Julián Villafañe grew up in a world of stories, puppets, colour and poetry. That world lives on in every canvas he paints: full of mystery, magic and life.",
          "Self-taught and driven by instinct, he has been exhibiting since the mid-1990s, from art fairs across Venezuela to Nuestra América Gallery at the Consulate of Venezuela in New York.",
        ]
          .map(p)
          .join(""),
        exhibitions: [
          { title: "Nuestra América Gallery, Consulate of Venezuela, New York", period: "2008" },
          { title: "National art fairs, Venezuela", period: "Since the mid-1990s" },
        ],
        quote: undefined,
        order: 1,
      },
    ],
    artworks: works.works.map((w) => {
      const [heightCm, widthCm] = parseSize(w.size_cm);
      const found = find(workImages, w.slug);
      return {
        slug: w.slug,
        title: w.title,
        artistSlug: artist.slug,
        year: w.year ?? undefined,
        medium: w.medium,
        heightCm,
        widthCm,
        format: w.format as Format,
        status: w.status as "available",
        featuredOnHome: featuredOnHome.includes(w.slug),
        pairWith: pairs[w.slug],
        order: order[w.slug] ?? 99,
        image: found ?? placeholder(w.format as Format),
        placeholder: !found,
      };
    }),
    pages: {
      hero: { artworkSlug: "distance", label: "Featured artist" },
      about: {
        sections: [
          {
            statement: "Art is a daily dose.",
            paragraphs: [
              "Daily Dose Gallery is built on one belief: art belongs in everyday life. Every morning, every evening, every time you walk past it.",
              "We choose work that does something to you. Work that lifts you, calms you and makes you feel alive. A painting on your wall is a dose of joy you take every single day.",
            ],
          },
          {
            statement: "Art changes a room. And the person in it.",
            paragraphs: [
              "A painting brings warmth to a wall and life to a space. It gives your home character, a heart and a story of its own.",
              "It works on you, too. Colour lifts your mood. A moment of looking slows you down and lets you breathe. Every day you see something new in it, and every day it feels a little more yours.",
              "Hang it where you start your day. Where you come home. Where you rest. That is where it does its work.",
              "Online, and at home in Blaricum. Easy to discover. Easy to live with.",
            ],
          },
        ],
        imageSlug: "baila-2",
        closing: "Take it daily.",
      },
      contact: {
        appointmentLabel: "By appointment",
        appointmentStatement: "Come and see the work in person.",
        appointmentText:
          "Every painting looks different in real life. Visit us on Tuesday or Thursday, or send us an email to arrange another day. We look forward to welcoming you.",
        buttonLabel: "Send an email",
        spacePhotos,
      },
    },
  };
}
