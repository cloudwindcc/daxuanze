const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const publicDomain = 'https://daxuanze.com';
const host = process.env.INDEXNOW_HOST || 'daxuanze.com';
const key = process.env.INDEXNOW_KEY || 'daxuanze-indexnow-20260627';
const keyLocation =
  process.env.INDEXNOW_KEY_LOCATION || `${publicDomain}/${key}.txt`;
const endpoint = process.env.INDEXNOW_ENDPOINT || 'https://api.indexnow.org/indexnow';

function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

async function main() {
  if (typeof fetch !== 'function') {
    throw new Error('Node.js 18 or newer is required because this script uses global fetch.');
  }

  const keyFile = path.join(root, `${key}.txt`);
  if (!fs.existsSync(keyFile)) {
    throw new Error(`Missing IndexNow key file: ${key}.txt`);
  }

  const keyFileContent = fs.readFileSync(keyFile, 'utf8').trim();
  if (keyFileContent !== key) {
    throw new Error(`IndexNow key file content must exactly match ${key}`);
  }

  const sitemap = read('sitemap.xml');
  const urlList = Array.from(sitemap.matchAll(/<loc>(.*?)<\/loc>/g))
    .map((match) => match[1])
    .filter((url) => url.startsWith(`${publicDomain}/`));

  if (!urlList.length) {
    throw new Error('No canonical URLs found in sitemap.xml');
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'content-type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      host,
      key,
      keyLocation,
      urlList,
    }),
  });

  const body = await response.text();
  console.log(`IndexNow endpoint: ${endpoint}`);
  console.log(`Submitted URLs: ${urlList.length}`);
  console.log(`Response status: ${response.status} ${response.statusText}`);
  if (body.trim()) console.log(body.trim());

  if (![200, 202].includes(response.status)) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
