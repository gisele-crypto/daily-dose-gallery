/**
 * Content access for all pages. Reads from Sanity when SANITY_STUDIO_PROJECT_ID is
 * set (see src/lib/sanity.ts), otherwise from the local starting content.
 * Pages only use the functions below, so the source can change without
 * touching the layout.
 */
import { localContent } from "../data/local";
import { sanityContent, sanityConfigured } from "./sanity";
import type { Artist, Artwork, Content, Format } from "./types";

let cache: Promise<Content> | undefined;

export function getContent(): Promise<Content> {
  cache ??= sanityConfigured()
    ? sanityContent().then((content) => {
        // Safety net while setting up: an empty Sanity project (before the
        // first import) keeps the current content online.
        if (content.artworks.length === 0) {
          console.warn("[content] Sanity has no artworks yet: using local content.");
          return localContent();
        }
        return content;
      })
    : Promise.resolve(localContent());
  return cache;
}

export function formatOf(work: Artwork): Format {
  if (work.format) return work.format;
  const ratio = work.widthCm / work.heightCm;
  if (ratio > 1.1) return "landscape";
  if (ratio < 0.9) return "tall";
  return "square";
}

export function sizeLabel(work: Artwork): string {
  return `${work.heightCm} × ${work.widthCm} cm`;
}

export function artistUrl(artist: Pick<Artist, "slug">): string {
  return `/artist/${artist.slug}/`;
}

export function artistOf(content: Content, work: Artwork): Artist {
  const artist = content.artists.find((a) => a.slug === work.artistSlug);
  if (!artist) throw new Error(`Unknown artist ${work.artistSlug} for ${work.slug}`);
  return artist;
}

export function findArtwork(content: Content, slug: string | undefined): Artwork | undefined {
  return content.artworks.find((w) => w.slug === slug);
}

export function sortedArtists(content: Content): Artist[] {
  return [...content.artists].sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
}

export function enquiryHref(content: Content, work: Artwork): string {
  const subject = `Enquiry: ${work.title} by ${artistOf(content, work).name}`;
  return `mailto:${content.gallery.email}?subject=${encodeURIComponent(subject)}`;
}

export function imageRatio(work: Artwork): number {
  return work.image.width / work.image.height;
}

const statusRank = { available: 0, reserved: 1, sold: 2 } as const;

/** Units of one or two works; a pair always forms one unit (side by side). */
export type Unit = Artwork[];

export interface Group {
  format: Format;
  units: Unit[];
}

/**
 * Groups works by format (square, tall, landscape) in that order. Within a
 * group: available first, then reserved, then sold; then by order and title.
 * A work with a "pair with" partner in the same group is placed next to it.
 */
export function groupWorks(works: Artwork[]): Group[] {
  const formats: Format[] = ["square", "tall", "landscape"];
  return formats
    .map((format) => {
      const list = works
        .filter((w) => formatOf(w) === format)
        .sort(
          (a, b) =>
            statusRank[a.status] - statusRank[b.status] ||
            a.order - b.order ||
            a.title.localeCompare(b.title),
        );
      const used = new Set<string>();
      const units: Unit[] = [];
      for (const work of list) {
        if (used.has(work.slug)) continue;
        used.add(work.slug);
        const partner = list.find((w) => w.slug === work.pairWith && !used.has(w.slug));
        if (partner) {
          used.add(partner.slug);
          units.push([work, partner]);
        } else {
          units.push([work]);
        }
      }
      return { format, units };
    })
    .filter((g) => g.units.length > 0);
}
