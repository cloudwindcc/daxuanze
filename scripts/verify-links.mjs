import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "parse5";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const origin = "https://daxuanze.com";
const documents = new Map();
const failures = new Set();
const redirects = new Map(
  fs
    .readFileSync(path.join(root, "_redirects"), "utf8")
    .split(/\r?\n/)
    .map((line) => line.trim().split(/\s+/))
    .filter(([from, to]) => from?.startsWith("/") && to)
    .map(([from, to]) => [from, to]),
);

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (
      entry.name.startsWith(".") ||
      ["node_modules", "test-results", "playwright-report"].includes(entry.name)
    )
      return [];
    const full = path.join(directory, entry.name);
    return entry.isDirectory()
      ? walk(full)
      : full.endsWith(".html")
        ? [full]
        : [];
  });
}

function visit(node, callback) {
  if (node.tagName)
    callback(
      node,
      Object.fromEntries(node.attrs.map((attr) => [attr.name, attr.value])),
    );
  for (const child of node.childNodes || []) visit(child, callback);
}

for (const file of walk(root)) {
  const relative = path.relative(root, file).replaceAll("\\", "/");
  const url = new URL(
    relative === "index.html" ? "/" : `/${relative.replace(/\.html$/, "")}`,
    origin,
  );
  const ids = new Set();
  const links = [];
  visit(parse(fs.readFileSync(file, "utf8")), (node, attributes) => {
    if (attributes.id) {
      if (ids.has(attributes.id))
        failures.add(`${relative}: duplicate id #${attributes.id}`);
      ids.add(attributes.id);
    }
    for (const name of ["href", "src"]) {
      if (attributes[name])
        links.push({ value: attributes[name], fragment: node.tagName === "a" });
    }
  });
  documents.set(file, { relative, url, ids, links });
}

let count = 0;
for (const { relative, url, links } of documents.values()) {
  for (const { value, fragment } of links) {
    if (/^(mailto:|tel:|javascript:|data:)/i.test(value)) continue;
    let target;
    try {
      target = new URL(value, url);
    } catch {
      failures.add(`${relative}: invalid URL ${value}`);
      continue;
    }
    if (target.origin !== origin) continue;
    count++;
    const seen = new Set();
    while (redirects.has(target.pathname)) {
      if (seen.has(target.pathname)) {
        failures.add(`${relative}: redirect loop at ${value}`);
        break;
      }
      seen.add(target.pathname);
      const redirected = new URL(redirects.get(target.pathname), origin);
      if (!redirected.hash) redirected.hash = target.hash;
      target = redirected;
    }
    let pathname;
    try {
      pathname = decodeURIComponent(target.pathname);
    } catch {
      failures.add(`${relative}: invalid path ${value}`);
      continue;
    }
    let file = path.resolve(root, pathname.replace(/^\//, "") || "index.html");
    if (!file.startsWith(`${root}${path.sep}`)) {
      failures.add(`${relative}: path outside site ${value}`);
      continue;
    }
    if (!path.extname(file)) file += ".html";
    if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {
      failures.add(`${relative}: missing target ${value}`);
    } else if (fragment && target.hash && documents.has(file)) {
      let id;
      try {
        id = decodeURIComponent(target.hash.slice(1));
      } catch {
        id = target.hash.slice(1);
      }
      if (!documents.get(file).ids.has(id))
        failures.add(`${relative}: missing fragment ${value}`);
    }
  }
}

if (failures.size) {
  console.error(
    `Link verification failed with ${failures.size} issue(s):\n${Array.from(failures, (failure) => `- ${failure}`).join("\n")}`,
  );
  process.exitCode = 1;
} else {
  console.log(
    `Link verification passed for ${documents.size} pages and ${count} internal references.`,
  );
}
