import { defineCliConfig } from "sanity/cli";

export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID ?? "missing-project-id",
    dataset: process.env.SANITY_STUDIO_DATASET ?? "production",
  },
  project: { basePath: "/studio" },
  // The Studio is built into the website at /studio (see scripts/build-studio.mjs).
  deployment: { autoUpdates: false },
});
