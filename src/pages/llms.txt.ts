import type { APIRoute } from "astro";
import { artistUrl, getContent, groupWorks, sizeLabel, sortedArtists } from "../lib/content";
import { absoluteUrl, stripHtml } from "../lib/seo";

export const GET: APIRoute = async () => {
  const content = await getContent();
  const { gallery, pages } = content;
  const lines: string[] = [
    `# ${gallery.name}`,
    "",
    `> A gallery for contemporary paintings in ${gallery.city}, Het Gooi, the Netherlands. Paintings are sold online and in the gallery space. Prices on request.`,
    "",
    ...pages.about.sections.flatMap((s) => [`${s.statement} ${s.paragraphs.join(" ")}`, ""]),
    "## Visit and contact",
    "",
    `- Address: ${gallery.street}, ${gallery.postalCode} ${gallery.city}, ${gallery.country}`,
    `- Opening hours: ${gallery.openingHours}`,
    `- Email: ${gallery.email}`,
    `- Website: ${absoluteUrl("/")}`,
    `- KvK: ${gallery.kvk}`,
    "",
    "## Pages",
    "",
    `- [Art](${absoluteUrl("/art/")}): all works`,
    `- [About](${absoluteUrl("/about/")}): the gallery's philosophy`,
    `- [Contact](${absoluteUrl("/contact/")}): address, opening hours, appointments`,
    "",
  ];
  for (const artist of sortedArtists(content)) {
    const url = absoluteUrl(artistUrl(artist));
    lines.push(`## Artist: ${artist.name}`, "", `[${artist.name}](${url})`, "");
    if (artist.origin) lines.push(`${artist.origin}${artist.selfTaught ? " · Self-taught" : ""}`, "");
    lines.push(stripHtml(artist.bioHtml), "", "### Works", "");
    // Same order as on the site: by format group, then status and order.
    const works = groupWorks(content.artworks.filter((x) => x.artistSlug === artist.slug));
    for (const w of works.flatMap((g) => g.units.flat())) {
      const status = w.status === "available" ? "price on request" : w.status;
      lines.push(`- [${w.title}](${url}#${w.slug}): ${w.medium}, ${sizeLabel(w)}, ${status}`);
    }
    lines.push("");
  }
  return new Response(lines.join("\n"), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
