/** Simple text blocks (content/site.json) to HTML: h2, p and bullet lists. */
export interface TextBlock {
  type: "h2" | "p" | "li";
  text: string;
}

const escape = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Escapes the text and turns email addresses into mailto links. */
function inline(text: string): string {
  return escape(text).replace(
    /[\w.+-]+@[\w-]+(\.[\w-]+)+/g,
    (email) => `<a href="mailto:${email}">${email}</a>`,
  );
}

export function blocksToHtml(blocks: TextBlock[]): string {
  let html = "";
  let inList = false;
  for (const b of blocks) {
    if (b.type === "li" && !inList) {
      html += "<ul>";
      inList = true;
    }
    if (b.type !== "li" && inList) {
      html += "</ul>";
      inList = false;
    }
    html += `<${b.type}>${inline(b.text)}</${b.type}>`;
  }
  return inList ? `${html}</ul>` : html;
}
