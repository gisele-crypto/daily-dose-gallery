/**
 * Newsletter signup → Laposta (POST /api/subscribe).
 *
 * Default (free Laposta account, no confirmation email): the address is added
 * as active at once, with options[ignore_doubleoptin]=true. Someone who
 * unsubscribed earlier and signs up again is reactivated (options[upsert]).
 * Consent: the line under the form ("By subscribing you agree to receive our
 * newsletter. Unsubscribe at any time.") and submitting it; every newsletter
 * from Laposta carries an unsubscribe link.
 *
 * With a paid account the list's double opt-in can be used instead: set
 * LAPOSTA_DOUBLE_OPTIN=true. Laposta then sends a confirmation email and the
 * site says "Check your inbox to confirm."
 *
 * Netlify environment variables (never in code):
 *   LAPOSTA_API_KEY        API key from Laposta (Account → Koppelingen → API)
 *   LAPOSTA_LIST_ID        id of the newsletter list
 *   LAPOSTA_DOUBLE_OPTIN   optional, "true" to use the list's double opt-in
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
  const page = body.ok
    ? body.confirm
      ? "/newsletter/confirm/"
      : "/newsletter/thank-you/"
    : `/newsletter/error/?reason=${body.reason}`;
  return new Response(null, { status: 303, headers: { Location: page } });
}

export default async function handler(req, context) {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: { Allow: "POST" } });
  }

  const env = (name) => globalThis.Netlify?.env.get(name) ?? process.env[name];
  const doubleOptIn = env("LAPOSTA_DOUBLE_OPTIN") === "true";
  const done = { ok: true, confirm: doubleOptIn };

  let form;
  try {
    form = await req.formData();
  } catch {
    return result(req, 400, { ok: false, reason: "invalid" });
  }

  // Honeypot: real visitors never fill this hidden field.
  if (String(form.get("website") ?? "").trim() !== "") {
    return result(req, 200, done);
  }

  const email = String(form.get("email") ?? "").trim().toLowerCase();
  if (!EMAIL.test(email) || email.length > 254) {
    return result(req, 400, { ok: false, reason: "invalid" });
  }

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
  if (!doubleOptIn) {
    // Free account: no confirmation email, so the subscriber is active at once.
    body.set("options[ignore_doubleoptin]", "true");
    // Re-subscribing after unsubscribing makes the address active again.
    body.set("options[upsert]", "true");
  }

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

  if (response.ok) {
    // Logged without the address, so the state can be checked in Netlify's
    // function log: "active" (or "unconfirmed" with double opt-in).
    const data = await response.json().catch(() => ({}));
    console.log("[subscribe] Laposta member state:", data?.member?.state ?? "unknown");
    return result(req, 200, done);
  }

  const data = await response.json().catch(() => ({}));
  const err = data?.error ?? {};
  // 204: address already on the list. Answer the same as a new signup, so the
  // form never reveals who is subscribed.
  if (err.code === 204) return result(req, 200, done);
  if (err.parameter === "email") return result(req, 400, { ok: false, reason: "invalid" });

  console.error("[subscribe] Laposta error", response.status, err.code, err.message);
  return result(req, 502, { ok: false, reason: "unavailable" });
}

export const config = { path: "/api/subscribe" };
