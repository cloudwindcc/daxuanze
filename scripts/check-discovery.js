const publicDomain = (process.env.DISCOVERY_PUBLIC_DOMAIN || 'https://daxuanze.com').replace(/\/$/, '');

const requiredPages = [
  {
    path: '/',
    markers: ['大选择', 'id="ai-discovery-entry"', '/llms.txt', '/site-index.json', '/ai-yinyong', '/search-intents'],
  },
  {
    path: '/mulu',
    markers: ['站点目录', '/search-intents.txt', '/ai-yinyong'],
  },
  {
    path: '/ai-yinyong',
    markers: ['AI 引用', '/answers.txt', '/cases.txt'],
  },
  {
    path: '/search-intents',
    markers: ['大选择搜索意图索引', '/wenda/have-child-or-not', '/anli/startup-partner-or-solo'],
  },
  {
    path: '/wenda/have-child-or-not',
    markers: ['要不要生孩子', '大选择问答'],
  },
  {
    path: '/anli/startup-partner-or-solo',
    markers: ['创业合伙前先谈退出和分工', '大选择案例'],
  },
  {
    path: '/llms.txt',
    markers: [`${publicDomain}/wenda/have-child-or-not`, `${publicDomain}/anli/startup-partner-or-solo`],
  },
  {
    path: '/llms-full.txt',
    markers: ['大选择', `${publicDomain}/answers.txt`, `${publicDomain}/cases.txt`],
  },
  {
    path: '/robots.txt',
    markers: [
      'User-agent: Baiduspider',
      'User-agent: Googlebot',
      'User-agent: DoubaoBot',
      'User-agent: DeepSeekBot',
      'Content-Signal: search=yes, ai-input=yes, ai-train=no',
      `${publicDomain}/search-intents`,
    ],
  },
  {
    path: '/sitemap.xml',
    markers: [`${publicDomain}/search-intents`, `${publicDomain}/wenda/have-child-or-not`, `${publicDomain}/anli/startup-partner-or-solo`],
  },
  {
    path: '/urls.txt',
    markers: [`${publicDomain}/search-intents`, `${publicDomain}/wenda/have-child-or-not`, `${publicDomain}/anli/startup-partner-or-solo`],
  },
  {
    path: '/site-index.json',
    markers: [`${publicDomain}/search-intents`, `${publicDomain}/ai-answers.json`, `${publicDomain}/choice-cases.json`],
  },
];

function fail(message) {
  failures.push(message);
}

async function fetchText(path) {
  const url = `${publicDomain}${path}`;
  const response = await fetch(url, {
    headers: {
      'user-agent': 'DaxuanzeDiscoveryCheck/1.0 (+https://daxuanze.com/)',
    },
  });
  const text = await response.text();
  return { url, response, text };
}

function count(text, pattern) {
  const matches = text.match(pattern);
  return matches ? matches.length : 0;
}

const failures = [];

async function main() {
  if (typeof fetch !== 'function') {
    throw new Error('Node.js 18 or newer is required because this script uses global fetch.');
  }

  console.log(`Discovery target: ${publicDomain}`);

  for (const page of requiredPages) {
    const { url, response, text } = await fetchText(page.path);
    console.log(`${response.status} ${url}`);
    if (!response.ok) {
      fail(`${url} returned ${response.status}`);
      continue;
    }
    const robotsHeader = response.headers.get('x-robots-tag') || '';
    if (/noindex/i.test(robotsHeader)) {
      fail(`${url} sends x-robots-tag noindex`);
    }
    for (const marker of page.markers) {
      if (!text.includes(marker)) {
        fail(`${url} missing marker: ${marker}`);
      }
    }

    if (page.path === '/search-intents') {
      const answerLinks = count(text, /href="\/wenda\//g);
      const caseLinks = count(text, /href="\/anli\//g);
      console.log(`  search-intents links: wenda=${answerLinks}, anli=${caseLinks}`);
      if (answerLinks < 300) fail('/search-intents should expose at least 300 answer detail links');
      if (caseLinks < 120) fail('/search-intents should expose at least 120 case detail links');
    }

    if (page.path === '/sitemap.xml') {
      const locs = count(text, /<loc>/g);
      console.log(`  sitemap loc count: ${locs}`);
      if (locs < 139) fail('/sitemap.xml should expose at least 139 URLs');
    }
  }

  if (failures.length) {
    console.error(`Discovery readiness failed with ${failures.length} issue(s):`);
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }

  console.log('Discovery readiness passed.');
  console.log('Note: this proves crawl/citation readiness, not actual search ranking or AI citation.');
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
