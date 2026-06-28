const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const publicDomain = 'https://daxuanze.com';

function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

function readCanonicalUrls() {
  if (fs.existsSync(path.join(root, 'urls.txt'))) {
    return {
      source: 'urls.txt',
      urls: read('urls.txt')
        .split(/\r?\n/)
        .map((url) => url.trim())
        .filter((url) => url.startsWith(`${publicDomain}/`)),
    };
  }
  const sitemap = read('sitemap.xml');
  return {
    source: 'sitemap.xml',
    urls: Array.from(sitemap.matchAll(/<loc>(.*?)<\/loc>/g))
      .map((match) => match[1])
      .filter((url) => url.startsWith(`${publicDomain}/`)),
  };
}

async function main() {
  if (typeof fetch !== 'function') {
    throw new Error('Node.js 18 or newer is required because this script uses global fetch.');
  }

  const endpoint = process.env.BAIDU_PUSH_ENDPOINT;
  if (!endpoint) {
    throw new Error(
      'Missing BAIDU_PUSH_ENDPOINT. Set it to the Baidu Search Resource Platform API URL, for example: http://data.zz.baidu.com/urls?site=https://daxuanze.com&token=YOUR_TOKEN',
    );
  }

  const { source, urls } = readCanonicalUrls();

  if (!urls.length) {
    throw new Error('No canonical URLs found in urls.txt or sitemap.xml');
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'content-type': 'text/plain; charset=utf-8' },
    body: urls.join('\n'),
  });

  const body = await response.text();
  console.log(`Baidu endpoint: ${endpoint.replace(/token=[^&]+/i, 'token=***')}`);
  console.log(`URL source: ${source}`);
  console.log(`Submitted URLs: ${urls.length}`);
  console.log(`Response status: ${response.status} ${response.statusText}`);
  if (body.trim()) console.log(body.trim());

  if (!response.ok) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
