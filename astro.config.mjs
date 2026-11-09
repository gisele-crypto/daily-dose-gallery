import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://www.dailydosegallery.com",
  trailingSlash: "always",
  build: { format: "directory" },
  // Photos uploaded in Sanity are fetched and resized at build time.
  image: { domains: ["cdn.sanity.io"] },
});
