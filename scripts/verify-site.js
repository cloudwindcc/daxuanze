const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const publicDomain = 'https://daxuanze.com';
const requiredStripeButtons = [
  'buy_btn_1RwNsZDsz76jaujRDdtjJLoC',
  'buy_btn_1RwNtODsz76jaujR6S2OFf0n',
  'buy_btn_1RwNtkDsz76jaujR501mTG9c',
];

function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === 'node_modules' || entry.name === '.wrangler') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, files);
    } else {
      files.push(full);
    }
  }
  return files;
}

function fail(message) {
  failures.push(message);
}

const failures = [];
const htmlFiles = walk(root)
  .filter((file) => file.endsWith('.html'))
  .map((file) => path.relative(root, file).replace(/\\/g, '/'))
  .sort();
const siteTextFiles = walk(root)
  .filter((file) => /\.(html|xml|txt|md)$/.test(file))
  .map((file) => path.relative(root, file).replace(/\\/g, '/'))
  .sort();

for (const removedFile of ['login.html', 'decision-tools-backup.html']) {
  if (fs.existsSync(path.join(root, removedFile))) {
    fail(`${removedFile} should not be published`);
  }
}

const riskyPatterns = [
  [/login\.html/i, 'login page reference'],
  [/sessionStorage\.(?:getItem|setItem|removeItem)\(['"](?:currentUser|wechatLogin|loginMethod|redirectTo)/, 'fake login session state'],
  [/generativelanguage\.googleapis\.com/i, 'client-side Gemini API call'],
  [/const\s+apiKey\s*=\s*["']["']/, 'empty client-side API key'],
  [/href=["']ai\.daxuanze\.com["']/i, 'protocol-less AI subdomain link'],
];

for (const file of htmlFiles) {
  const content = read(file);
  for (const [pattern, label] of riskyPatterns) {
    if (pattern.test(content)) {
      fail(`${file} contains ${label}`);
    }
  }
  const canonical = content.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i);
  if (file !== 'index.html' && !canonical) {
    fail(`${file} is missing a canonical URL`);
  }
  if (canonical) {
    const canonicalUrl = canonical[1];
    if (!canonicalUrl.startsWith(`${publicDomain}/`)) {
      fail(`${file} canonical uses wrong domain: ${canonicalUrl}`);
    }
    const canonicalPath = new URL(canonicalUrl).pathname;
    const expectedPath = file === 'index.html' ? '/' : `/${file}`;
    if (canonicalPath !== expectedPath) {
      fail(`${file} canonical should be ${publicDomain}${expectedPath}`);
    }
  }
}

for (const file of siteTextFiles) {
  const content = read(file);
  if (/choicealgorithm\.com|bigchoice\.com/i.test(content)) {
    fail(`${file} contains legacy domain`);
  }
  if (/login\.html/i.test(content)) {
    fail(`${file} references removed login.html`);
  }
}

for (const file of ['index.html', 'zixun.html']) {
  const content = read(file);
  for (const buttonId of requiredStripeButtons) {
    if (!content.includes(buttonId)) {
      fail(`${file} is missing Stripe button ${buttonId}`);
    }
  }
}

const sitemap = read('sitemap.xml');
const locs = Array.from(sitemap.matchAll(/<loc>(.*?)<\/loc>/g)).map((match) => match[1]);
if (!locs.length) fail('sitemap.xml has no URLs');
for (const loc of locs) {
  if (!loc.startsWith(`${publicDomain}/`)) {
    fail(`sitemap URL uses wrong domain: ${loc}`);
  }
  const pathname = new URL(loc).pathname;
  const relativePath = pathname === '/' ? 'index.html' : pathname.replace(/^\//, '');
  if (relativePath !== 'index.html' && !fs.existsSync(path.join(root, relativePath))) {
    fail(`sitemap URL does not map to a published file: ${loc}`);
  }
}

const robots = read('robots.txt');
if (!robots.includes(`Sitemap: ${publicDomain}/sitemap.xml`)) {
  fail('robots.txt must point to the daxuanze.com sitemap');
}
if (/choicealgorithm\.com|login\.html/i.test(robots)) {
  fail('robots.txt contains stale domain or removed login page');
}

for (const file of htmlFiles) {
  const content = read(file);
  const links = Array.from(content.matchAll(/\bhref=["']([^"']+)["']/g)).map((match) => match[1]);
  for (const href of links) {
    if (/^(https?:|mailto:|tel:|#|javascript:)/i.test(href)) continue;
    if (href.startsWith('/')) continue;
    const target = href.split('#')[0].split('?')[0];
    if (!target || target.endsWith('/')) continue;
    if (!fs.existsSync(path.join(root, target))) {
      fail(`${file} links to missing local file: ${href}`);
    }
  }
}

if (failures.length) {
  console.error(`Site verification failed with ${failures.length} issue(s):`);
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`Site verification passed for ${htmlFiles.length} HTML files and ${locs.length} sitemap URLs.`);
