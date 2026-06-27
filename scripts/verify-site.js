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

for (const aiDiscoveryFile of ['llms.txt', 'llms-full.txt']) {
  if (!fs.existsSync(path.join(root, aiDiscoveryFile))) {
    fail(`${aiDiscoveryFile} should be published for AI discovery`);
  }
}

for (const requiredIntentPage of ['rensheng-xuanze.html', 'xuanze.html']) {
  if (!fs.existsSync(path.join(root, requiredIntentPage))) {
    fail(`${requiredIntentPage} should exist as a high-intent search landing page`);
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
  const jsonLdBlocks = Array.from(
    content.matchAll(/<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi),
  );
  for (let index = 0; index < jsonLdBlocks.length; index++) {
    try {
      JSON.parse(jsonLdBlocks[index][1].trim());
    } catch (error) {
      fail(`${file} has invalid JSON-LD block ${index + 1}: ${error.message}`);
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
    const expectedPath = file === 'index.html' ? '/' : `/${file.replace(/\.html$/, '')}`;
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
for (const requiredUrl of [
  `${publicDomain}/llms.txt`,
  `${publicDomain}/llms-full.txt`,
  `${publicDomain}/rensheng-xuanze`,
  `${publicDomain}/xuanze`,
]) {
  if (!locs.includes(requiredUrl)) {
    fail(`sitemap.xml should include required URL: ${requiredUrl}`);
  }
}
for (const loc of locs) {
  if (!loc.startsWith(`${publicDomain}/`)) {
    fail(`sitemap URL uses wrong domain: ${loc}`);
  }
  const pathname = new URL(loc).pathname;
  const relativePath = pathname === '/' ? 'index.html' : pathname.replace(/^\//, '');
  const mappedPath = fs.existsSync(path.join(root, relativePath))
    ? relativePath
    : `${relativePath}.html`;
  if (mappedPath !== 'index.html' && !fs.existsSync(path.join(root, mappedPath))) {
    fail(`sitemap URL does not map to a published file: ${loc}`);
  }
}

for (const file of htmlFiles) {
  const content = read(file);
  const canonical = content.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i);
  if (canonical && !locs.includes(canonical[1])) {
    fail(`${file} canonical URL is missing from sitemap.xml: ${canonical[1]}`);
  }
}

const robots = read('robots.txt');
if (!robots.includes(`Sitemap: ${publicDomain}/sitemap.xml`)) {
  fail('robots.txt must point to the daxuanze.com sitemap');
}
if (!robots.includes('Content-Signal: search=yes, ai-input=yes, ai-train=no')) {
  fail('robots.txt should allow AI answer grounding while reserving training rights');
}
for (const bot of ['Baiduspider', 'Googlebot', 'Google-Extended', 'Bytespider', 'OAI-SearchBot']) {
  if (!robots.includes(`User-agent: ${bot}`)) {
    fail(`robots.txt should explicitly include ${bot}`);
  }
}
if (/choicealgorithm\.com|login\.html/i.test(robots)) {
  fail('robots.txt contains stale domain or removed login page');
}

for (const file of htmlFiles) {
  const content = read(file);
  for (const href of ['/llms.txt', '/llms-full.txt']) {
    if (!content.includes(`href="${href}"`)) {
      fail(`${file} should link to ${href}`);
    }
  }
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
