import { homeLocale } from "../lib/locale.mjs";

export async function onRequest(context) {
  const { request } = context;
  if (!["GET", "HEAD"].includes(request.method)) return context.next();
  const url = new URL(request.url);
  const policy = homeLocale(
    url,
    request.headers.get("Cookie") || "",
    request.cf?.country || "",
  );
  const original = policy.redirect ? null : await context.next();
  const response = policy.redirect
    ? new Response(null, {
        status: 302,
        headers: { Location: policy.redirect },
      })
    : new Response(original.body, original);
  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("Vary", "Cookie, CF-IPCountry");
  if (policy.cookie) response.headers.append("Set-Cookie", policy.cookie);
  response.headers.set(
    "Content-Language",
    url.pathname.startsWith("/zh") || policy.redirect ? "zh-CN" : "en",
  );
  return response;
}
