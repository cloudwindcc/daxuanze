const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const port = Number(process.env.PORT || 3000);
const localeModule = import('../lib/locale.mjs');
const types = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".json": "application/json",
  ".jsonld": "application/ld+json",
  ".xml": "application/xml",
  ".txt": "text/plain",
  ".ndjson": "application/x-ndjson",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".svg": "image/svg+xml",
};
const redirects = new Map(
  fs
    .readFileSync(path.join(root, "_redirects"), "utf8")
    .split(/\r?\n/)
    .map((line) => line.trim().split(/\s+/))
    .filter(
      ([from, to, status]) => from?.startsWith("/") && to && status === "301",
    )
    .map(([from, to]) => [from, to]),
);

http
  .createServer(async (req, res) => {
    if (!["GET", "HEAD"].includes(req.method)) {
      res.writeHead(405, { Allow: "GET, HEAD" }).end();
      return;
    }
    let url;
    let pathname;
    try {
      url = new URL(req.url, "http://localhost");
      pathname = decodeURIComponent(url.pathname);
    } catch {
      res.writeHead(400).end();
      return;
    }
    if (redirects.has(pathname)) {
      const destination = redirects.get(pathname);
      const [target, hash] = destination.split("#");
      res
        .writeHead(301, {
          Location: `${target}${url.search}${hash ? `#${hash}` : ""}`,
        })
        .end();
      return;
    }

    const localeHeaders = {};
    if (['/', '/zh'].includes(pathname)) {
      const { homeLocale } = await localeModule;
      const policy = homeLocale(url, req.headers.cookie || '', process.env.PREVIEW_COUNTRY || '');
      localeHeaders['Cache-Control'] = 'private, no-store';
      localeHeaders['Content-Language'] = pathname === '/zh' || policy.redirect ? 'zh-CN' : 'en';
      localeHeaders.Vary = 'Cookie, CF-IPCountry';
      if (policy.cookie) localeHeaders['Set-Cookie'] = policy.cookie;
      if (policy.redirect) {
        res.writeHead(302, { ...localeHeaders, Location: policy.redirect }).end();
        return;
      }
    }
    // Serve public assets only; never expose the repository or development files.
    const segments = pathname.split("/").filter(Boolean);
    const blocked =
      pathname.includes("\\") ||
      pathname.includes("\0") ||
      ["package.json", "package-lock.json", "playwright.config.js"].includes(
        segments[0]?.toLowerCase(),
      ) ||
      segments.some(
        (segment) => segment.startsWith(".") && segment !== ".well-known",
      ) ||
      (segments.length > 1 &&
        !["asset", "wenda", "anli", ".well-known"].includes(segments[0]));
    const relative =
      pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
    let file = path.resolve(root, relative);
    const withinRoot = file.startsWith(`${root}${path.sep}`);
    if (!path.extname(file)) file += ".html";
    const exists =
      !blocked &&
      withinRoot &&
      types[path.extname(file)] &&
      fs.existsSync(file) &&
      fs.statSync(file).isFile();
    if (!exists) file = path.join(root, "404.html");
    const extension = path.extname(file);
    const content = fs.readFileSync(file);
    res.writeHead(exists ? 200 : 404, {
      "Content-Type": `${types[extension]}${[".png", ".ico"].includes(extension) ? "" : "; charset=utf-8"}`,
      "Content-Length": content.length,
      "Cache-Control": "no-cache",
      "X-Content-Type-Options": "nosniff",
      ...localeHeaders,
    });
    res.end(req.method === "HEAD" ? undefined : content);
  })
  .listen(port, "127.0.0.1", () =>
    console.log(`Preview: http://127.0.0.1:${port}`),
  );
