// Bilingual routing policy (scheme A): English lives at the root paths,
// Chinese lives under /zh/. Visitors whose resolved language is Chinese are
// redirected to the /zh/ counterpart of any page; visitors whose resolved
// language is English are redirected back from /zh/ pages to the root.
// Resolution order: ?lang= (explicit, persisted in a cookie) > dx_lang
// cookie > country (CN -> zh, everything else -> en).

function normalizePath(pathname) {
  if (pathname === "/index" || pathname === "/index.html") return "/";
  if (pathname === "/zh.html") return "/zh";
  return pathname;
}

export function isPagePath(pathname) {
  const normalized = normalizePath(pathname);
  const base = normalized.startsWith("/zh/")
    ? normalized.slice(3)
    : normalized === "/zh"
      ? "/"
      : normalized;
  if (base === "/404" || base === "/404.html") return false;
  if (
    base.startsWith("/asset/") ||
    base.startsWith("/.well-known/") ||
    base.startsWith("/api/") ||
    base.startsWith("/admin/")
  )
    return false;
  if (base === "/") return true;
  const last = base.replace(/\/+$/, "").split("/").pop() || "";
  return !last.includes(".") || last.endsWith(".html");
}

export function counterpartPath(pathname, language) {
  const normalized = normalizePath(pathname);
  const isZh = normalized === "/zh" || normalized.startsWith("/zh/");
  const base = isZh ? normalized.slice(3) || "/" : normalized;
  if (language === "zh" && !isZh)
    return base === "/" ? "/zh" : `/zh${base}`;
  if (language === "en" && isZh) return base;
  return null;
}

export function pageLocale(url, cookie = "", country = "") {
  const explicit = url.searchParams.get("lang");
  const saved = cookie.match(/(?:^|;\s*)dx_lang=(en|zh)(?:;|$)/)?.[1];
  const language = ["en", "zh"].includes(explicit)
    ? explicit
    : saved || (country === "CN" ? "zh" : "en");
  const isPage = isPagePath(url.pathname);
  const target = isPage ? counterpartPath(url.pathname, language) : null;
  return {
    language,
    isPage,
    redirect: target ? `${target}${url.search}` : null,
    cookie: ["en", "zh"].includes(explicit)
      ? `dx_lang=${explicit}; Path=/; Max-Age=31536000; Secure; SameSite=Lax`
      : null,
  };
}

// Backwards-compatible name: the policy used to apply to the homepage only.
export function homeLocale(url, cookie = "", country = "") {
  return pageLocale(url, cookie, country);
}
