import type { ImageMetadata } from "astro";

export type Status = "available" | "reserved" | "sold";
export type Format = "square" | "tall" | "landscape";

/** A local (bundled) image or a remote one (Sanity CDN) with known size. */
export type Img = ImageMetadata | { src: string; width: number; height: number };

export interface Gallery {
  name: string;
  url: string;
  email: string;
  street: string;
  postalCode: string;
  city: string;
  country: string;
  countryCode: string;
  openingHours: string;
  openingDays: string[];
  opens: string;
  closes: string;
  kvk: string;
  btw: string;
  instagram?: string | undefined;
}

export interface Exhibition {
  title: string;
  period: string;
}

export interface Artist {
  slug: string;
  name: string;
  origin: string;
  selfTaught: boolean;
  portrait?: Img | undefined;
  /** Bio as HTML paragraphs. */
  bioHtml: string;
  exhibitions: Exhibition[];
  quote?: string | undefined;
  order: number;
}

export interface Artwork {
  slug: string;
  title: string;
  artistSlug: string;
  year?: number | undefined;
  medium: string;
  heightCm: number;
  widthCm: number;
  /** Manual override; otherwise derived from height and width. */
  format?: Format | undefined;
  status: Status;
  featuredOnHome: boolean;
  pairWith?: string | undefined;
  order: number;
  image: Img;
  /** CSS object-position from the image hotspot, used for the home crop. */
  focus?: string | undefined;
  /** True while the real photo is not yet supplied. */
  placeholder: boolean;
}

export interface AboutSection {
  statement: string;
  paragraphs: string[];
}

export interface Pages {
  hero: { artworkSlug: string; label: string };
  about: {
    sections: AboutSection[];
    imageSlug?: string | undefined;
    closing: string;
  };
  contact: {
    appointmentLabel: string;
    appointmentStatement: string;
    appointmentText: string;
    buttonLabel: string;
    spacePhotos: { image: Img; alt: string; caption: string }[];
  };
  privacyHtml?: string | undefined;
}

export interface Content {
  gallery: Gallery;
  artists: Artist[];
  artworks: Artwork[];
  pages: Pages;
}
