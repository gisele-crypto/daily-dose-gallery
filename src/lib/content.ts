import { artists, artworks, gallery } from "../data/local";
import type { Artist, Artwork, Format } from "./types";

export { gallery };

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

export function artistOf(work: Artwork): Artist {
  const artist = artists.find((a) => a.slug === work.artistSlug);
  if (!artist) throw new Error(`Unknown artist ${work.artistSlug}`);
  return artist;
}

export function artistUrl(artist: Artist): string {
  return `/artist/${artist.slug}/`;
}

export function getArtworks(): Artwork[] {
  return artworks;
}

export function getArtwork(slug: string): Artwork {
  const work = artworks.find((w) => w.slug === slug);
  if (!work) throw new Error(`Unknown artwork ${slug}`);
  return work;
}

export function getFeaturedArtist(): Artist {
  const first = artists[0];
  if (!first) throw new Error("No artists");
  return first;
}

export function enquiryHref(work: Artwork): string {
  const subject = `Enquiry: ${work.title} by ${artistOf(work).name}`;
  return `mailto:${gallery.email}?subject=${encodeURIComponent(subject)}`;
}
