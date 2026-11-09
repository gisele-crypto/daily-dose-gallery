import { defineField, defineType } from "sanity";

export const PHOTO_HINT =
  "Upload een rechte, bijgesneden foto van alleen het schilderij, minstens 2000 px aan de lange kant. (Upload a straight, cropped photo of the painting only, at least 2000 px on the long side.)";

const statusLabels: Record<string, string> = {
  available: "Beschikbaar",
  reserved: "Gereserveerd",
  sold: "Verkocht",
};

export const artwork = defineType({
  name: "artwork",
  title: "Kunstwerk",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Titel",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "slug",
      title: "Webadres",
      description: "Wordt automatisch gemaakt uit de titel: klik op 'Generate'.",
      type: "slug",
      options: { source: "title", maxLength: 80 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "artist",
      title: "Kunstenaar",
      type: "reference",
      to: [{ type: "artist" }],
      validation: (r) => r.required(),
    }),
    defineField({
      name: "image",
      title: "Foto",
      description: PHOTO_HINT,
      type: "image",
      options: { hotspot: true },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "heightCm",
      title: "Hoogte (cm)",
      type: "number",
      validation: (r) => r.required().positive(),
    }),
    defineField({
      name: "widthCm",
      title: "Breedte (cm)",
      type: "number",
      validation: (r) => r.required().positive(),
    }),
    defineField({
      name: "format",
      title: "Vorm",
      description:
        "Bepaalt in welke groep het werk op de site staat. 'Automatisch' kiest zelf uit hoogte en breedte.",
      type: "string",
      initialValue: "auto",
      options: {
        layout: "radio",
        list: [
          { title: "Automatisch (uit hoogte en breedte)", value: "auto" },
          { title: "Vierkant", value: "square" },
          { title: "Staand (hoog en smal)", value: "tall" },
          { title: "Liggend", value: "landscape" },
        ],
      },
    }),
    defineField({
      name: "medium",
      title: "Techniek",
      description: "In het Engels, zoals het op de site staat.",
      type: "string",
      initialValue: "Oil on canvas",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "year",
      title: "Jaar (optioneel)",
      type: "number",
    }),
    defineField({
      name: "status",
      title: "Status",
      description:
        "Beschikbaar: 'Price on request' en ENQUIRE. Gereserveerd: 'Reserved'. Verkocht: 'Sold', het werk blijft zichtbaar maar komt achteraan in zijn groep.",
      type: "string",
      initialValue: "available",
      options: {
        layout: "radio",
        list: Object.entries(statusLabels).map(([value, title]) => ({ title, value })),
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "featuredOnHome",
      title: "Tonen op de homepage",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "pairWith",
      title: "Hoort bij (paar)",
      description:
        "Kies het werk waarmee dit een paar vormt. Ze staan dan altijd naast elkaar, ook op een telefoon. Vul het bij beide werken in.",
      type: "reference",
      to: [{ type: "artwork" }],
      options: {
        filter: ({ document }) => ({
          filter: "_id != $id && !(_id in path('drafts.**'))",
          params: { id: (document._id ?? "").replace(/^drafts\./, "") },
        }),
      },
    }),
    defineField({
      name: "order",
      title: "Volgorde binnen de groep",
      description: "Lager nummer staat eerder (links of bovenaan).",
      type: "number",
      initialValue: 10,
    }),
  ],
  orderings: [
    {
      title: "Volgorde",
      name: "order",
      by: [
        { field: "order", direction: "asc" },
        { field: "title", direction: "asc" },
      ],
    },
    { title: "Titel", name: "title", by: [{ field: "title", direction: "asc" }] },
  ],
  preview: {
    select: { title: "title", status: "status", h: "heightCm", w: "widthCm", media: "image" },
    prepare({ title, status, h, w, media }) {
      const size = h && w ? `${h} × ${w} cm` : "";
      return {
        title,
        subtitle: [statusLabels[status as string] ?? "", size].filter(Boolean).join(" · "),
        media,
      };
    },
  },
});
