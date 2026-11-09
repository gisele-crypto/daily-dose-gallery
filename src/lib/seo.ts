import { gallery } from "./content";

export interface Crumb {
  name: string;
  path: string;
}

export function absoluteUrl(path: string): string {
  return new URL(path, gallery.url).href;
}

export function galleryJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": ["ArtGallery", "LocalBusiness"],
    "@id": `${gallery.url}/#gallery`,
    name: gallery.name,
    url: `${gallery.url}/`,
    email: gallery.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: gallery.street,
      postalCode: gallery.postalCode,
      addressLocality: gallery.city,
      addressCountry: gallery.countryCode,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: gallery.openingDays.map((d) => `https://schema.org/${d}`),
        opens: gallery.opens,
        closes: gallery.closes,
      },
    ],
    identifier: {
      "@type": "PropertyValue",
      propertyID: "KvK",
      value: gallery.kvk,
    },
    vatID: gallery.btw,
    sameAs: [gallery.instagram],
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
