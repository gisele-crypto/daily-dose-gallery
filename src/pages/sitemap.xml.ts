import type { APIRoute } from "astro";
import { artistUrl, getContent } from "../lib/content";
import { absoluteUrl } from "../lib/seo";

export const GET: APIRoute = async () => {
  const content = await getContent();
  const paths = [
    "/",
    "/art/",
    ...content.artists.map((a) => artistUrl(a)),
    "/about/",
    "/contact/",
    "/privacy/",
  ];
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths.map((p) => `  <url><loc>${absoluteUrl(p)}</loc></url>`).join("\n")}
</urlset>
`;
  return new Response(body, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
};
