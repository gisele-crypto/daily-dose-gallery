import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { nlNLLocale } from "@sanity/locale-nl-nl";
import { schemaTypes, singletons } from "./studio/schemas";

const singletonTypes = new Set(singletons.map((s) => s.type));

export default defineConfig({
  name: "daily-dose-gallery",
  title: "Daily Dose Gallery",
  basePath: "/studio",
  projectId: process.env.SANITY_STUDIO_PROJECT_ID ?? "missing-project-id",
  dataset: process.env.SANITY_STUDIO_DATASET ?? "production",
  plugins: [
    nlNLLocale(),
    structureTool({
      title: "Inhoud",
      structure: (S) =>
        S.list()
          .title("Inhoud")
          .items([
            S.documentTypeListItem("artwork").title("Kunstwerken"),
            S.documentTypeListItem("artist").title("Kunstenaars"),
            S.divider(),
            ...singletons.map((s) =>
              S.listItem()
                .title(s.title)
                .id(s.id)
                .child(S.document().schemaType(s.type).documentId(s.id).title(s.title)),
            ),
          ]),
    }),
  ],
  schema: {
    types: schemaTypes,
    // Pages and settings exist once: no "new" button for them.
    templates: (templates) => templates.filter((t) => !singletonTypes.has(t.schemaType)),
  },
  document: {
    actions: (actions, { schemaType }) =>
      singletonTypes.has(schemaType)
        ? actions.filter((a) => !["duplicate", "delete", "unpublish"].includes(a.action ?? ""))
        : actions,
  },
});
