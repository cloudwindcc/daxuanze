import { pageLocale } from "../lib/locale.mjs";

export async function onRequest(context) {
  const { request } = context;
  if (!["GET", "HEAD"].includes(request.method)) return context.next();
  const url = new URL(request.url);
  const policy = pageLocale(
    url,
    request.headers.get("Cookie") || "",
    request.cf?.country || "",
  );
  if (policy.redirect) {
    const response = new Response(null, {
      status: 302,
      headers: { Location: policy.redirect },
    });
    response.headers.set("Cache-Control", "private, no-store");
    response.headers.set("Vary", "Cookie, CF-IPCountry");
    if (policy.cookie) response.headers.append("Set-Cookie", policy.cookie);
    response.headers.set(
      "Content-Language",
      policy.language === "zh" ? "zh-CN" : "en",
    );
    return response;
  }
  const original = await context.next();
  // Static assets and data files are language-neutral: serve them untouched.
  if (!policy.isPage) return original;
  const response = new Response(original.body, original);
  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("Vary", "Cookie, CF-IPCountry");
  if (policy.cookie) response.headers.append("Set-Cookie", policy.cookie);
  response.headers.set(
    "Content-Language",
    url.pathname === "/zh" ||
      url.pathname === "/zh.html" ||
      url.pathname.startsWith("/zh/")
      ? "zh-CN"
      : "en",
  );
  return response;
}
