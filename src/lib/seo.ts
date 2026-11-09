import { getImage } from "astro:assets";
import { artistOf, artistUrl, sizeLabel } from "./content";
import { srcProps } from "./image";
import type { Artist, Artwork, Content, Gallery, Img } from "./types";

export const SITE = "https://www.dailydosegallery.com";

export interface Crumb {
  name: string;
  path: string;
}

export function absoluteUrl(path: string): string {
  return new URL(path, SITE).href;
}

/** A 1200 px wide version of an image, as an absolute URL (share images, JSON-LD). */
export async function shareImageUrl(img: Img, crop = false): Promise<string> {
  const out = await getImage({
    ...srcProps(img),
    ...(crop ? { width: 1200, height: 630, fit: "cover" as const } : { width: Math.min(1200, img.width) }),
    format: "jpg",
  });
  return absoluteUrl(out.src);
}

export function galleryJsonLd(g: Gallery) {
  return {
    "@context": "https://schema.org",
    "@type": ["ArtGallery", "LocalBusiness"],
    "@id": `${SITE}/#gallery`,
    name: g.name,
    url: `${SITE}/`,
    email: g.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: g.street,
      postalCode: g.postalCode,
      addressLocality: g.city,
      addressCountry: g.countryCode,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: g.openingDays.map((d) => `https://schema.org/${d}`),
        opens: g.opens,
        closes: g.closes,
      },
    ],
    identifier: { "@type": "PropertyValue", propertyID: "KvK", value: g.kvk },
    vatID: g.btw,
    ...(g.instagram ? { sameAs: [g.instagram] } : {}),
  };
}

export function personJsonLd(artist: Artist, bioText: string, image?: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${absoluteUrl(artistUrl(artist))}#person`,
    name: artist.name,
    url: absoluteUrl(artistUrl(artist)),
    jobTitle: "Painter",
    description: bioText,
    ...(image ? { image } : {}),
  };
}

export async function artworkJsonLd(content: Content, work: Artwork) {
  const artist = artistOf(content, work);
  const cm = (value: number) => ({ "@type": "QuantitativeValue", value, unitCode: "CMT" });
  return {
    "@context": "https://schema.org",
    "@type": "VisualArtwork",
    name: work.title,
    url: `${absoluteUrl(artistUrl(artist))}#${work.slug}`,
    creator: { "@type": "Person", "@id": `${absoluteUrl(artistUrl(artist))}#person`, name: artist.name },
    artMedium: work.medium,
    artform: "Painting",
    artworkSurface: "Canvas",
    height: cm(work.heightCm),
    width: cm(work.widthCm),
    description: `${work.title} by ${artist.name}. ${work.medium}, ${sizeLabel(work)}.`,
    ...(work.year ? { dateCreated: String(work.year) } : {}),
    ...(work.placeholder ? {} : { image: await shareImageUrl(work.image) }),
    offers:
      work.status === "available"
        ? {
            "@type": "Offer",
            availability: "https://schema.org/InStock",
            seller: { "@id": `${SITE}/#gallery` },
          }
        : undefined,
  };
}

export function breadcrumbJsonLd(crumbs: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: absoluteUrl(c.path),
    })),
  };
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}
