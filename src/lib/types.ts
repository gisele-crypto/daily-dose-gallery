import type { ImageMetadata } from "astro";

export type Status = "available" | "reserved" | "sold";
export type Format = "square" | "tall" | "landscape";

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
  instagram: string;
}

export interface Artist {
  slug: string;
  name: string;
  origin: string;
  selfTaught: boolean;
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
  image: ImageMetadata;
  /** True while the real photo is not yet supplied. */
  placeholder: boolean;
}
