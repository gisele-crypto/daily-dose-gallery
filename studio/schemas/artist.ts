import { defineArrayMember, defineField, defineType } from "sanity";

/** Plain paragraphs only: no headings, no italics (house style). */
export const simpleText = [
  defineArrayMember({
    type: "block",
    styles: [{ title: "Gewoon", value: "normal" }],
    lists: [],
    marks: {
      decorators: [{ title: "Vet", value: "strong" }],
      annotations: [
        {
          name: "link",
          type: "object",
          title: "Link",
          fields: [{ name: "href", type: "url", title: "Adres", validation: (r) => r.uri({ scheme: ["http", "https", "mailto"] }) }],
        },
      ],
    },
  }),
];

export const artist = defineType({
  name: "artist",
  title: "Kunstenaar",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Naam", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "slug",
      title: "Webadres",
      description: "Wordt automatisch gemaakt uit de naam: klik op 'Generate'.",
      type: "slug",
      options: { source: "name", maxLength: 80 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "portrait",
      title: "Portret",
      description: "Vierkante foto werkt het best, minstens 1000 × 1000 px.",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "origin",
      title: "Herkomst",
      description: "Korte regel onder de naam, in het Engels. Bijvoorbeeld: Born beneath Pico Bolívar, Venezuela",
      type: "string",
    }),
    defineField({
      name: "selfTaught",
      title: "Autodidact",
      description: "Zet '· Self-taught' achter de herkomst.",
      type: "boolean",
      initialValue: false,
    }),
    defineField({ name: "bio", title: "Biografie (Engels)", type: "array", of: simpleText }),
    defineField({
      name: "exhibitions",
      title: "Tentoonstellingen",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "exhibition",
          fields: [
            defineField({ name: "title", title: "Tentoonstelling", type: "string", validation: (r) => r.required() }),
            defineField({ name: "period", title: "Jaar of periode", type: "string" }),
          ],
          preview: { select: { title: "title", subtitle: "period" } },
        }),
      ],
    }),
    defineField({
      name: "quote",
      title: "Citaat (optioneel)",
      description: "Alleen invullen met een echt citaat van de kunstenaar. Verschijnt dan als 'In their words'.",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "order",
      title: "Volgorde",
      description: "De kunstenaar met het laagste nummer staat achter ARTIST in het menu.",
      type: "number",
      initialValue: 10,
    }),
  ],
  preview: { select: { title: "name", subtitle: "origin", media: "portrait" } },
});
