/**
 * Local starting content: content/site.json (texts), content/works.json
 * (works) and images/. Used when no Sanity project is configured; the same
 * files are imported into Sanity by scripts/import-to-sanity.mjs.
 *
 * Work photos are looked up by slug in images/works/ (.png .jpg .jpeg .webp);
 * a missing photo shows a neutral placeholder until it is added.
 */
import type { ImageMetadata } from "astro";
import type { Content, Format } from "../lib/types";
import works from "../../content/works.json";
import site from "../../content/site.json";
import { blocksToHtml, type TextBlock } from "../lib/richtext";

type Mod = { default: ImageMetadata };
const allImages = import.meta.glob<Mod>("../../images/**/*.{png,jpg,jpeg,webp}", { eager: true });
const placeholders = import.meta.glob<Mod>("../assets/placeholders/*.png", { eager: true });

/** Image by path relative to the repository root, e.g. "images/works/school.png". */
function byPath(path: string): ImageMetadata | undefined {
  return allImages[`../../${path}`]?.default;
}

function bySlug(folder: string, slug: string): ImageMetadata | undefined {
  for (const ext of ["png", "jpg", "jpeg", "webp"]) {
    const img = byPath(`images/${folder}/${slug}.${ext}`);
    if (img) return img;
  }
  return undefined;
}

function placeholder(kind: Format): ImageMetadata {
  const img = placeholders[`../assets/placeholders/${kind}.png`]?.default;
  if (!img) throw new Error(`Missing placeholder ${kind}`);
  return img;
}

function parseSize(size: string): [number, number] {
  const [h, w] = size.split("×").map((n) => Number(n.trim()));
  return [h ?? 0, w ?? 0];
}

function partnerOf(slug: string): string | undefined {
  for (const [a, b] of site.works.pairs) {
    if (a === slug) return b;
    if (b === slug) return a;
  }
  return undefined;
}

export function localContent(): Content {
  const artist = works.artist;
  const order: Record<string, number> = site.works.order;

  return {
    gallery: { ...site.gallery, url: "https://www.dailydosegallery.com", countryCode: "NL" },
    artists: [
      {
        slug: artist.slug,
        name: artist.name,
        origin: artist.origin,
        selfTaught: artist.self_taught,
        portrait: bySlug("artists", artist.slug),
        bioHtml: site.artist.bio.map((p) => `<p>${p}</p>`).join(""),
        exhibitions: site.artist.exhibitions,
        quote: site.artist.quote ?? undefined,
        order: 1,
      },
    ],
    artworks: works.works.map((w) => {
      const [heightCm, widthCm] = parseSize(w.size_cm);
      const found = bySlug("works", w.slug);
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
        featuredOnHome: site.works.featuredOnHome.includes(w.slug),
        pairWith: partnerOf(w.slug),
        order: order[w.slug] ?? 99,
        image: found ?? placeholder(w.format as Format),
        placeholder: !found,
      };
    }),
    pages: {
      hero: { artworkSlug: site.home.heroArtwork, label: site.home.heroLabel },
      about: {
        sections: site.about.sections,
        imageSlug: site.about.image,
        closing: site.about.closing,
      },
      contact: {
        ...site.contact,
        spacePhotos: site.contact.spacePhotos.flatMap((s) => {
          const image = byPath(s.file);
          return image ? [{ image, alt: s.alt, caption: s.caption }] : [];
        }),
      },
      privacyHtml: blocksToHtml(site.privacy as TextBlock[]),
    },
  };
}
