/**
 * Builds Sanity Studio into dist/studio so it is served at /studio on the
 * same Netlify site. Skipped (with a note) while no Sanity project is set.
 */
import { execSync } from "node:child_process";

if (!process.env.SANITY_STUDIO_PROJECT_ID) {
  console.log("[studio] SANITY_STUDIO_PROJECT_ID not set: Studio not built.");
  process.exit(0);
}
execSync("npx sanity build dist/studio -y", { stdio: "inherit" });
