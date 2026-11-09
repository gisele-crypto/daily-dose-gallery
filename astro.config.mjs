import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://www.dailydosegallery.com",
  trailingSlash: "always",
  build: { format: "directory" },
});
