/**
 * Reads all content from Sanity at build time. The site stays fully static:
 * a publish in Sanity triggers a new Netlify build through a webhook.
 *
 * Environment variables (Netlify → Site configuration → Environment variables):
 *   SANITY_PROJECT_ID   the project id from sanity.io/manage
 *   SANITY_DATASET      usually "production"
 */
import { createClient } from "@sanity/client";
import { toHTML } from "@portabletext/to-html";
import type { Artist, Artwork, Content, Img } from "./types";

const projectId = import.meta.env.SANITY_PROJECT_ID ?? process.env.SANITY_PROJECT_ID;
const dataset = import.meta.env.SANITY_DATASET ?? process.env.SANITY_DATASET ?? "production";

export function sanityConfigured(): boolean {
  return Boolean(projectId);
}

interface SanityImage {
  url: string;
  width: number;
  height: number;
  hotspot?: { x: number; y: number } | null;
}

const imageFields = `{
  "url": asset->url,
  "width": asset->metadata.dimensions.width,
  "height": asset->metadata.dimensions.height,
  hotspot
}`;

const query = `{
  "gallery": *[_id == "gallery"][0],
  "artists": *[_type == "artist" && defined(slug.current)]{
    name, "slug": slug.current, origin, selfTaught, bio, quote, order,
    exhibitions[]{title, period},
    "portrait": portrait${imageFields}
  },
  "artworks": *[_type == "artwork" && defined(slug.current) && defined(image.asset)]{
    title, "slug": slug.current, "artistSlug": artist->slug.current, year, medium,
    heightCm, widthCm, format, status, featuredOnHome, order,
    "pairWith": pairWith->slug.current,
    "image": image${imageFields}
  },
  "home": *[_id == "home"][0]{ heroLabel, "heroSlug": heroArtwork->slug.current },
  "about": *[_id == "about"][0]{ sections[]{statement, paragraphs}, "imageSlug": image->slug.current, closing },
  "contact": *[_id == "contact"][0]{
    appointmentLabel, appointmentStatement, appointmentText, buttonLabel,
    spacePhotos[]{ alt, caption, "image": @${imageFields} }
  },
  "privacy": *[_id == "privacy"][0]{ body }
}`;

function img(i: SanityImage | null | undefined): Img | undefined {
  if (!i?.url) return undefined;
  return { src: `${i.url}?auto=format`, width: i.width, height: i.height };
}

function focus(i: SanityImage | null | undefined): string | undefined {
  const h = i?.hotspot;
  return h ? `${Math.round(h.x * 100)}% ${Math.round(h.y * 100)}%` : undefined;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export async function sanityContent(): Promise<Content> {
  const client = createClient({ projectId, dataset, apiVersion: "2025-01-01", useCdn: false });
  const data: any = await client.fetch(query);
  const g = data.gallery ?? {};

  const artists: Artist[] = (data.artists ?? []).map((a: any) => ({
    slug: a.slug,
    name: a.name,
    origin: a.origin ?? "",
    selfTaught: Boolean(a.selfTaught),
    portrait: img(a.portrait),
    bioHtml: a.bio ? toHTML(a.bio) : "",
    exhibitions: a.exhibitions ?? [],
    quote: a.quote || undefined,
    order: a.order ?? 99,
  }));

  const artworks: Artwork[] = (data.artworks ?? [])
    .filter((w: any) => w.artistSlug && w.heightCm && w.widthCm)
    .map((w: any) => ({
      slug: w.slug,
      title: w.title,
      artistSlug: w.artistSlug,
      year: w.year ?? undefined,
      medium: w.medium || "Oil on canvas",
      heightCm: w.heightCm,
      widthCm: w.widthCm,
      format: w.format && w.format !== "auto" ? w.format : undefined,
      status: w.status ?? "available",
      featuredOnHome: Boolean(w.featuredOnHome),
      pairWith: w.pairWith ?? undefined,
      order: w.order ?? 99,
      image: img(w.image) as Img,
      focus: focus(w.image),
      placeholder: false,
    }));

  return {
    gallery: {
      name: g.name ?? "Daily Dose Gallery",
      url: "https://www.dailydosegallery.com",
      email: g.email,
      street: g.street,
      postalCode: g.postalCode,
      city: g.city,
      country: g.country ?? "The Netherlands",
      countryCode: "NL",
      openingHours: g.openingHours,
      openingDays: g.openingDays ?? [],
      opens: g.opens,
      closes: g.closes,
      kvk: g.kvk,
      btw: g.btw,
      instagram: g.instagram || undefined,
    },
    artists,
    artworks,
    pages: {
      hero: {
        artworkSlug: data.home?.heroSlug ?? artworks[0]?.slug ?? "",
        label: data.home?.heroLabel ?? "Featured artist",
      },
      about: {
        sections: data.about?.sections ?? [],
        imageSlug: data.about?.imageSlug ?? undefined,
        closing: data.about?.closing ?? "",
      },
      contact: {
        appointmentLabel: data.contact?.appointmentLabel ?? "By appointment",
        appointmentStatement: data.contact?.appointmentStatement ?? "",
        appointmentText: data.contact?.appointmentText ?? "",
        buttonLabel: data.contact?.buttonLabel ?? "Send an email",
        spacePhotos: (data.contact?.spacePhotos ?? [])
          .map((s: any) => ({ image: img(s.image), alt: s.alt ?? "", caption: s.caption ?? "" }))
          .filter((s: any) => s.image),
      },
      privacyHtml: data.privacy?.body ? toHTML(data.privacy.body) : undefined,
    },
  };
}
