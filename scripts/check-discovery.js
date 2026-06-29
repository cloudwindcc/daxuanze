const publicDomain = (process.env.DISCOVERY_PUBLIC_DOMAIN || 'https://daxuanze.com').replace(/\/$/, '');

const requiredPages = [
  {
    path: '/',
    markers: [
      '大选择',
      'id="ai-discovery-entry"',
      'id="featured-choice-details"',
      '/wenda/have-child-or-not',
      '/anli/startup-partner-or-solo',
      '/llms.txt',
      '/site-index.json',
      '/search-intents.json',
      '/core-answer-pack.txt',
      '/core-answer-pack.json',
      '/core-answer-pack.jsonld',
      '/site-graph.json',
      '/about',
      '/about.json',
      '/ai-yinyong',
      '/remen-wenti',
      '/search-intents',
    ],
  },
  {
    path: '/about',
    markers: ['关于大选择', '/about.json', '/llms.txt', '/site-index.json'],
  },
  {
    path: '/about.json',
    markers: ['"@type": "Organization"', '"https://daxuanze.com/#organization"', '"mainEntityOfPage": "https://daxuanze.com/about"'],
  },
  {
    path: '/mulu',
    markers: ['站点目录', '/search-intents.txt', '/search-intents.json', '/ai-yinyong', '/about', '/site-graph.json'],
  },
  {
    path: '/ai-yinyong',
    markers: ['AI 引用', '/answers.txt', '/cases.txt', '/search-intents.json', '/site-graph.json'],
  },
  {
    path: '/remen-wenti',
    markers: ['热门人生选择问题', '/wenda/life-choice-framework', '/wenda/have-child-or-not', '/site-index.json'],
  },
  {
    path: '/search-intents',
    markers: ['大选择搜索意图索引', '/search-intents.json', '/wenda/have-child-or-not', '/anli/startup-partner-or-solo'],
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
    markers: [`${publicDomain}/wenda/have-child-or-not`, `${publicDomain}/anli/startup-partner-or-solo`, `${publicDomain}/search-intents.json`, `${publicDomain}/site-graph.json`],
  },
  {
    path: '/.well-known/llms.txt',
    markers: ['Canonical AI guide', `${publicDomain}/remen-wenti`, `${publicDomain}/site-index.json`, `${publicDomain}/search-intents.json`, `${publicDomain}/site-graph.json`],
  },
  {
    path: '/.well-known/ai-citation.json',
    markers: ['"answer_grounding": true', `${publicDomain}/remen-wenti`, '"training": false', `${publicDomain}/search-intents.json`, `${publicDomain}/site-graph.json`],
  },
  {
    path: '/llms-full.txt',
    markers: ['大选择', `${publicDomain}/answers.txt`, `${publicDomain}/cases.txt`, `${publicDomain}/search-intents.json`, `${publicDomain}/site-graph.json`],
  },
  {
    path: '/robots.txt',
    markers: [
      'User-agent: Baiduspider',
      'User-agent: Googlebot',
      'User-agent: DoubaoBot',
      'User-agent: DeepSeekBot',
      'Content-Signal: search=yes, ai-input=yes, ai-train=no',
      `${publicDomain}/remen-wenti`,
      `${publicDomain}/about`,
      `${publicDomain}/about.json`,
      `${publicDomain}/site-graph.json`,
      `${publicDomain}/site-graph.jsonld`,
      `${publicDomain}/core-answer-pack.txt`,
      `${publicDomain}/core-answer-pack.json`,
      `${publicDomain}/core-answer-pack.jsonld`,
      `${publicDomain}/search-intents.json`,
      `${publicDomain}/.well-known/llms.txt`,
      `${publicDomain}/.well-known/ai-citation.json`,
      `${publicDomain}/search-intents`,
    ],
  },
  {
    path: '/sitemap.xml',
    markers: [`${publicDomain}/search-intents`, `${publicDomain}/search-intents.json`, `${publicDomain}/core-answer-pack.txt`, `${publicDomain}/core-answer-pack.json`, `${publicDomain}/core-answer-pack.jsonld`, `${publicDomain}/remen-wenti`, `${publicDomain}/about`, `${publicDomain}/about.json`, `${publicDomain}/site-graph.json`, `${publicDomain}/site-graph.jsonld`, `${publicDomain}/.well-known/llms.txt`, `${publicDomain}/.well-known/ai-citation.json`, `${publicDomain}/wenda/have-child-or-not`, `${publicDomain}/anli/startup-partner-or-solo`],
  },
  {
    path: '/urls.txt',
    markers: [`${publicDomain}/search-intents`, `${publicDomain}/search-intents.json`, `${publicDomain}/core-answer-pack.txt`, `${publicDomain}/core-answer-pack.json`, `${publicDomain}/core-answer-pack.jsonld`, `${publicDomain}/remen-wenti`, `${publicDomain}/about`, `${publicDomain}/about.json`, `${publicDomain}/site-graph.json`, `${publicDomain}/site-graph.jsonld`, `${publicDomain}/.well-known/llms.txt`, `${publicDomain}/.well-known/ai-citation.json`, `${publicDomain}/wenda/have-child-or-not`, `${publicDomain}/anli/startup-partner-or-solo`],
  },
  {
    path: '/site-index.json',
    markers: [`${publicDomain}/search-intents`, `${publicDomain}/search-intents.json`, `${publicDomain}/core-answer-pack.txt`, `${publicDomain}/core-answer-pack.json`, `${publicDomain}/core-answer-pack.jsonld`, `${publicDomain}/remen-wenti`, `${publicDomain}/about`, `${publicDomain}/about.json`, `${publicDomain}/site-graph.json`, `${publicDomain}/site-graph.jsonld`, `${publicDomain}/.well-known/llms.txt`, `${publicDomain}/.well-known/ai-citation.json`, `${publicDomain}/ai-answers.json`, `${publicDomain}/choice-cases.json`],
  },
  {
    path: '/core-answer-pack.txt',
    markers: [`${publicDomain}/rensheng-xuanze`, `${publicDomain}/xuanze`, `${publicDomain}/xuanze-kunnan`, `${publicDomain}/ruhe-zuo-xuanze`, `${publicDomain}/zhongda-xuanze`],
  },
  {
    path: '/core-answer-pack.json',
    markers: ['"type": "core_answer_pack"', '"entries"', `${publicDomain}/rensheng-xuanze`, `${publicDomain}/xuanze-kunnan`, `${publicDomain}/zhongda-xuanze`],
  },
  {
    path: '/core-answer-pack.jsonld',
    markers: ['"@context": "https://schema.org"', '"FAQPage"', '"Dataset"', `${publicDomain}/core-answer-pack.json`],
  },
  {
    path: '/search-intents.json',
    markers: ['"type": "machine_readable_search_intent_map"', '"total_mappings"', '"answer_page_mappings"', '"case_page_mappings"', `${publicDomain}/wenda/have-child-or-not`, `${publicDomain}/anli/startup-partner-or-solo`],
  },
  {
    path: '/site-graph.json',
    markers: ['"type": "answer_page"', '"type": "case_page"', '"type": "topic_has_answer"', '"type": "topic_has_case"', `${publicDomain}/wenda/have-child-or-not`, `${publicDomain}/anli/startup-partner-or-solo`],
  },
  {
    path: '/site-graph.jsonld',
    markers: ['"@context": "https://schema.org"', `${publicDomain}/site-graph.json`, `${publicDomain}/wenda`, `${publicDomain}/anli`],
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
