import type { APIRoute } from "astro";
import { absoluteUrl } from "../lib/seo";

// All crawlers are welcome, including search and AI crawlers by name.
const bots = [
  "Googlebot",
  "Bingbot",
  "GPTBot",
  "OAI-SearchBot",
  "ClaudeBot",
  "PerplexityBot",
  "Google-Extended",
];

export const GET: APIRoute = () => {
  const body = [
    ...bots.flatMap((bot) => [`User-agent: ${bot}`, "Allow: /", ""]),
    "User-agent: *",
    "Allow: /",
    "Disallow: /studio/",
    "",
    `Sitemap: ${absoluteUrl("/sitemap.xml")}`,
    "",
  ].join("\n");
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
