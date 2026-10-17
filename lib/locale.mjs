export function homeLocale(url, cookie = "", country = "") {
  const explicit = url.searchParams.get("lang");
  const saved = cookie.match(/(?:^|;\s*)dx_lang=(en|zh)(?:;|$)/)?.[1];
  const language = ["en", "zh"].includes(explicit)
    ? explicit
    : saved || (country === "CN" ? "zh" : "en");
  return {
    language,
    redirect:
      url.pathname === "/" && language === "zh" ? `/zh${url.search}` : null,
    cookie: ["en", "zh"].includes(explicit)
      ? `dx_lang=${explicit}; Path=/; Max-Age=31536000; Secure; SameSite=Lax`
      : null,
  };
}
