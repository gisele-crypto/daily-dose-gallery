import { defineArrayMember, defineField, defineType } from "sanity";
import { simpleText } from "./artist";

const days = [
  { title: "Maandag", value: "Monday" },
  { title: "Dinsdag", value: "Tuesday" },
  { title: "Woensdag", value: "Wednesday" },
  { title: "Donderdag", value: "Thursday" },
  { title: "Vrijdag", value: "Friday" },
  { title: "Zaterdag", value: "Saturday" },
  { title: "Zondag", value: "Sunday" },
];

export const gallery = defineType({
  name: "gallery",
  title: "Galeriegegevens",
  type: "document",
  description: "Gebruikt in de footer, op de contactpagina en voor Google.",
  fields: [
    defineField({ name: "name", title: "Naam", type: "string", validation: (r) => r.required() }),
    defineField({ name: "email", title: "E-mailadres", type: "string", validation: (r) => r.required().email() }),
    defineField({ name: "street", title: "Straat en huisnummer", type: "string", validation: (r) => r.required() }),
    defineField({ name: "postalCode", title: "Postcode", type: "string", validation: (r) => r.required() }),
    defineField({ name: "city", title: "Plaats", type: "string", validation: (r) => r.required() }),
    defineField({ name: "country", title: "Land (Engels)", type: "string", initialValue: "The Netherlands" }),
    defineField({
      name: "openingHours",
      title: "Openingstijden (tekst op de site, Engels)",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "openingDays",
      title: "Open op (voor Google)",
      type: "array",
      of: [{ type: "string" }],
      options: { list: days, layout: "grid" },
    }),
    defineField({ name: "opens", title: "Open vanaf (bijv. 10:00)", type: "string" }),
    defineField({ name: "closes", title: "Open tot (bijv. 16:00)", type: "string" }),
    defineField({ name: "kvk", title: "KvK-nummer", type: "string" }),
    defineField({ name: "btw", title: "Btw-nummer", type: "string" }),
    defineField({
      name: "instagram",
      title: "Instagram (volledige link)",
      description: "Bijvoorbeeld https://www.instagram.com/dailydose.gallery/ — leeg laten verbergt de link.",
      type: "url",
    }),
  ],
  preview: { prepare: () => ({ title: "Galeriegegevens" }) },
});

export const home = defineType({
  name: "home",
  title: "Homepage",
  type: "document",
  fields: [
    defineField({
      name: "heroArtwork",
      title: "Grote afbeelding bovenaan",
      description:
        "Het werk dat breed bovenaan staat. Het middelpunt van de uitsnede stel je in bij de foto van dat werk (het rondje, 'hotspot').",
      type: "reference",
      to: [{ type: "artwork" }],
      validation: (r) => r.required(),
    }),
    defineField({
      name: "heroLabel",
      title: "Label boven de naam",
      type: "string",
      initialValue: "Featured artist",
    }),
  ],
  preview: { prepare: () => ({ title: "Homepage" }) },
});

export const about = defineType({
  name: "about",
  title: "About",
  type: "document",
  fields: [
    defineField({
      name: "sections",
      title: "Blokken",
      description: "Het eerste blok staat ook (ingekort) op de homepage. De afbeelding komt na het eerste blok.",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "section",
          fields: [
            defineField({ name: "statement", title: "Grote zin", type: "string" }),
            defineField({
              name: "paragraphs",
              title: "Alinea's",
              type: "array",
              of: [{ type: "text", rows: 3 }],
            }),
          ],
          preview: { select: { title: "statement" } },
        }),
      ],
    }),
    defineField({
      name: "image",
      title: "Afbeelding",
      description: "Een werk uit de collectie, met bijschrift.",
      type: "reference",
      to: [{ type: "artwork" }],
    }),
    defineField({ name: "closing", title: "Slotregel", type: "string", initialValue: "Take it daily." }),
  ],
  preview: { prepare: () => ({ title: "About" }) },
});

export const contact = defineType({
  name: "contact",
  title: "Contact",
  type: "document",
  fields: [
    defineField({
      name: "spacePhotos",
      title: "Foto's van de ruimte",
      description: "Twee foto's naast elkaar, liefst minstens 1600 px breed.",
      type: "array",
      of: [
        defineArrayMember({
          type: "image",
          options: { hotspot: true },
          fields: [
            defineField({
              name: "alt",
              title: "Beschrijving (Engels, voor blinden en Google)",
              type: "string",
              validation: (r) => r.required(),
            }),
            defineField({ name: "caption", title: "Bijschrift (bijv. Ground floor)", type: "string" }),
          ],
        }),
      ],
    }),
    defineField({ name: "appointmentLabel", title: "Label", type: "string", initialValue: "By appointment" }),
    defineField({ name: "appointmentStatement", title: "Grote zin", type: "string" }),
    defineField({ name: "appointmentText", title: "Tekst", type: "text", rows: 4 }),
    defineField({ name: "buttonLabel", title: "Tekst op de knop", type: "string", initialValue: "Send an email" }),
  ],
  preview: { prepare: () => ({ title: "Contact" }) },
});

export const privacy = defineType({
  name: "privacy",
  title: "Privacyverklaring",
  type: "document",
  fields: [
    defineField({
      name: "body",
      title: "Tekst (Engels)",
      description: "Zolang dit leeg is, staat er een korte tijdelijke tekst op de site.",
      type: "array",
      of: [
        ...simpleText,
      ],
    }),
  ],
  preview: { prepare: () => ({ title: "Privacyverklaring" }) },
});
