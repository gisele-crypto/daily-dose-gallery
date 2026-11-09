/**
 * Newsletter signup → Laposta (POST /api/subscribe).
 *
 * The email address is added to the Laposta list with the list's own double
 * opt-in: Laposta sends the confirmation email, and the address only becomes
 * active after the subscriber clicks the link (GDPR/AVG). We never pass
 * ignore_doubleoptin.
 *
 * Netlify environment variables (never in code):
 *   LAPOSTA_API_KEY   API key from Laposta (Account → Koppelingen → API)
 *   LAPOSTA_LIST_ID   id of the newsletter list (Lijsten → list → Kenmerken)
 *
 * Responds with JSON when the form is sent by script (Accept: application/json),
 * otherwise redirects to a thank-you or error page (works without JavaScript).
 */

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function result(req, status, body) {
  const wantsJson = (req.headers.get("accept") ?? "").includes("application/json");
  if (wantsJson) {
    return new Response(JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
    });
  }
  const page = body.ok ? "/newsletter/thank-you/" : `/newsletter/error/?reason=${body.reason}`;
  return new Response(null, { status: 303, headers: { Location: page } });
}

export default async function handler(req, context) {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: { Allow: "POST" } });
  }

  let form;
  try {
    form = await req.formData();
  } catch {
    return result(req, 400, { ok: false, reason: "invalid" });
  }

  // Honeypot: real visitors never fill this hidden field.
  if (String(form.get("website") ?? "").trim() !== "") {
    return result(req, 200, { ok: true });
  }

  const email = String(form.get("email") ?? "").trim().toLowerCase();
  if (!EMAIL.test(email) || email.length > 254) {
    return result(req, 400, { ok: false, reason: "invalid" });
  }

  const env = (name) => globalThis.Netlify?.env.get(name) ?? process.env[name];
  const apiKey = env("LAPOSTA_API_KEY");
  const listId = env("LAPOSTA_LIST_ID");
  if (!apiKey || !listId) {
    console.error("[subscribe] LAPOSTA_API_KEY or LAPOSTA_LIST_ID is not set");
    return result(req, 503, { ok: false, reason: "unavailable" });
  }

  const body = new URLSearchParams({
    list_id: listId,
    email,
    ip: context?.ip || req.headers.get("x-nf-client-connection-ip") || "0.0.0.0",
    source_url: req.headers.get("referer") || "https://www.dailydosegallery.com/",
  });

  let response;
  try {
    response = await fetch("https://api.laposta.nl/v2/member", {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${apiKey}:`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });
  } catch (error) {
    console.error("[subscribe] Laposta not reachable", error);
    return result(req, 502, { ok: false, reason: "unavailable" });
  }

  if (response.ok) return result(req, 200, { ok: true });

  const data = await response.json().catch(() => ({}));
  const err = data?.error ?? {};
  // 204: address already on the list. Answer the same as a new signup, so the
  // form never reveals who is subscribed.
  if (err.code === 204) return result(req, 200, { ok: true });
  if (err.parameter === "email") return result(req, 400, { ok: false, reason: "invalid" });

  console.error("[subscribe] Laposta error", response.status, err.code, err.message);
  return result(req, 502, { ok: false, reason: "unavailable" });
}

export const config = { path: "/api/subscribe" };
