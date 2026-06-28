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
let answerCorpus = null;
let caseCorpus = null;
const htmlFiles = walk(root)
  .filter((file) => file.endsWith('.html'))
  .map((file) => path.relative(root, file).replace(/\\/g, '/'))
  .sort();
const siteTextFiles = walk(root)
  .filter((file) => /\.(html|xml|txt|md)$/.test(file))
  .map((file) => path.relative(root, file).replace(/\\/g, '/'))
  .sort();
const topicPageFiles = [
  'chengzhang.html',
  'chuangye.html',
  'diyu.html',
  'fangchan.html',
  'hunyin.html',
  'jiankang.html',
  'jiaoyu.html',
  'lianai.html',
  'licai.html',
  'renji.html',
  'shijian.html',
  'tuixiu.html',
  'xiaofei.html',
  'zinv.html',
];

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

for (const wellKnownDiscoveryFile of ['.well-known/llms.txt', '.well-known/ai-citation.json']) {
  if (!fs.existsSync(path.join(root, wellKnownDiscoveryFile))) {
    fail(`${wellKnownDiscoveryFile} should be published for AI discovery`);
  }
}

for (const aiGuideFile of ['llms.txt', 'llms-full.txt']) {
  if (fs.existsSync(path.join(root, aiGuideFile))) {
    const aiGuide = read(aiGuideFile);
    for (const requiredGuideUrl of [
      `${publicDomain}/answers.txt`,
      `${publicDomain}/cases.txt`,
      `${publicDomain}/answers-sitemap.xml`,
      `${publicDomain}/cases-sitemap.xml`,
      `${publicDomain}/wenda/have-child-or-not`,
      `${publicDomain}/anli/startup-partner-or-solo`,
    ]) {
      if (!aiGuide.includes(requiredGuideUrl)) {
        fail(`${aiGuideFile} should expose discovery URL: ${requiredGuideUrl}`);
      }
    }
  }
}

if (!fs.existsSync(path.join(root, 'search-intents.txt'))) {
  fail('search-intents.txt should be published for plain-text search intent discovery');
} else {
  const searchIntents = read('search-intents.txt');
  for (const requiredIntent of [
    '人生选择 -> https://daxuanze.com/rensheng-xuanze',
    '选择困难怎么办 -> https://daxuanze.com/xuanze-kunnan',
    '两个工作 offer 怎么选择 -> https://daxuanze.com/chengzhang',
    'DeepSeek 怎么引用大选择 -> https://daxuanze.com/ai-yinyong',
  ]) {
    if (!searchIntents.includes(requiredIntent)) {
      fail(`search-intents.txt should include intent mapping: ${requiredIntent}`);
    }
  }
  const directAnswerIntentCount = (searchIntents.match(/https:\/\/daxuanze\.com\/wenda\//g) || []).length;
  const directCaseIntentCount = (searchIntents.match(/https:\/\/daxuanze\.com\/anli\//g) || []).length;
  if (directAnswerIntentCount < 300) {
    fail('search-intents.txt should expose direct mappings to answer detail pages');
  }
  if (directCaseIntentCount < 120) {
    fail('search-intents.txt should expose direct mappings to case detail pages');
  }
  for (const requiredDetailIntentUrl of [
    `${publicDomain}/wenda/have-child-or-not`,
    `${publicDomain}/wenda/two-offers-choice`,
    `${publicDomain}/wenda/buy-or-rent-longtail`,
    `${publicDomain}/wenda/stable-or-risk`,
    `${publicDomain}/anli/startup-partner-or-solo`,
    `${publicDomain}/anli/career-stable-platform-or-fast-growth`,
    `${publicDomain}/anli/house-buy-or-rent-cashflow`,
    `${publicDomain}/anli/city-first-tier-or-home-city`,
  ]) {
    if (!searchIntents.includes(requiredDetailIntentUrl)) {
      fail(`search-intents.txt should include direct detail intent URL: ${requiredDetailIntentUrl}`);
    }
  }
}

if (!fs.existsSync(path.join(root, 'ai-answers.json'))) {
  fail('ai-answers.json should be published for answer-engine retrieval');
} else {
  answerCorpus = JSON.parse(read('ai-answers.json'));
  if (!Array.isArray(answerCorpus.answers) || answerCorpus.answers.length < 64) {
    fail('ai-answers.json should contain at least 64 high-intent answers');
  } else {
    for (const answer of answerCorpus.answers) {
      if (!answer.question || !answer.answer || !answer.canonical || !answer.source_title) {
        fail(`ai-answers.json answer ${answer.id || '<missing id>'} is missing required fields`);
      }
      if (answer.canonical && !answer.canonical.startsWith(`${publicDomain}/`)) {
        fail(`ai-answers.json answer ${answer.id || '<missing id>'} uses a non-canonical URL`);
      }
    }
  }
}

if (!fs.existsSync(path.join(root, 'answers.txt'))) {
  fail('answers.txt should be published for plain-text answer retrieval');
} else if (answerCorpus) {
  const answersText = read('answers.txt');
  if (!answersText.includes('大选择人生选择问答纯文本语料')) {
    fail('answers.txt should expose a plain-text corpus heading');
  }
  for (const answer of answerCorpus.answers) {
    if (!answersText.includes(`${publicDomain}/wenda/${answer.id}`) || !answersText.includes(answer.question)) {
      fail(`answers.txt should include answer ${answer.id}`);
    }
  }
}

for (const generatedAiFile of [
  'ai-answers.ndjson',
  'ai-answers.jsonld',
  'answers-feed.xml',
  'choice-cases.json',
  'choice-cases.ndjson',
  'choice-cases.jsonld',
  'cases-feed.xml',
  'feed.xml',
  'index.xml',
  'site-index.json',
]) {
  if (!fs.existsSync(path.join(root, generatedAiFile))) {
    fail(`${generatedAiFile} should be published for AI discovery`);
  }
}

if (!fs.existsSync(path.join(root, 'choice-cases.json'))) {
  fail('choice-cases.json should be published for AI case retrieval');
} else {
  caseCorpus = JSON.parse(read('choice-cases.json'));
  if (!Array.isArray(caseCorpus.cases) || caseCorpus.cases.length < 24) {
    fail('choice-cases.json should contain at least 24 high-intent cases');
  } else {
    for (const caseItem of caseCorpus.cases) {
      if (!caseItem.title || !caseItem.scenario || !caseItem.analysis || !caseItem.decision || !caseItem.lesson || !caseItem.canonical) {
        fail(`choice-cases.json case ${caseItem.id || '<missing id>'} is missing required fields`);
      }
      if (caseItem.canonical && !caseItem.canonical.startsWith(`${publicDomain}/`)) {
        fail(`choice-cases.json case ${caseItem.id || '<missing id>'} uses a non-canonical URL`);
      }
    }
  }
}

if (!fs.existsSync(path.join(root, '_headers'))) {
  fail('_headers should define crawl-friendly content types for AI discovery files');
} else {
  const headers = read('_headers');
  if (!headers.includes('Content-Signal: search=yes, ai-input=yes, ai-train=no')) {
    fail('_headers should expose Content-Signal for AI/search retrieval');
  }
  for (const linkHeader of [
    'Link: <https://daxuanze.com/llms.txt>; rel="alternate"; type="text/plain"; title="AI and LLM site guide"',
    'Link: <https://daxuanze.com/.well-known/llms.txt>; rel="alternate"; type="text/plain"; title="Well-known AI discovery guide"',
    'Link: <https://daxuanze.com/.well-known/ai-citation.json>; rel="alternate"; type="application/json"; title="AI citation policy"',
    'Link: <https://daxuanze.com/ai-yinyong>; rel="alternate"; type="text/html"; title="AI citation guide"',
    'Link: <https://daxuanze.com/remen-wenti>; rel="alternate"; type="text/html"; title="Hot life choice questions"',
    'Link: <https://daxuanze.com/search-intents>; rel="alternate"; type="text/html"; title="Search intent index"',
    'Link: <https://daxuanze.com/search-intents.txt>; rel="alternate"; type="text/plain"; title="Search intent map"',
    'Link: <https://daxuanze.com/urls.txt>; rel="alternate"; type="text/plain"; title="All canonical URL list"',
    'Link: <https://daxuanze.com/feed.xml>; rel="alternate"; type="application/rss+xml"; title="Daxuanze core feed"',
    'Link: <https://daxuanze.com/index.xml>; rel="alternate"; type="application/rss+xml"; title="Daxuanze site feed"',
    'Link: <https://daxuanze.com/sitemap-index.xml>; rel="sitemap"; type="application/xml"',
    'Link: <https://daxuanze.com/sitemap.xml>; rel="sitemap"; type="application/xml"',
  ]) {
    if (!headers.includes(linkHeader)) {
      fail(`_headers should expose discovery header: ${linkHeader}`);
    }
  }
  for (const [file, contentType] of [
    ['/llms.txt', 'text/plain; charset=utf-8'],
    ['/.well-known/llms.txt', 'text/plain; charset=utf-8'],
    ['/.well-known/ai-citation.json', 'application/json; charset=utf-8'],
    ['/search-intents.txt', 'text/plain; charset=utf-8'],
    ['/urls.txt', 'text/plain; charset=utf-8'],
    ['/answers.txt', 'text/plain; charset=utf-8'],
    ['/cases.txt', 'text/plain; charset=utf-8'],
    ['/ai-answers.json', 'application/json; charset=utf-8'],
    ['/ai-answers.ndjson', 'application/x-ndjson; charset=utf-8'],
    ['/ai-answers.jsonld', 'application/ld+json; charset=utf-8'],
    ['/answers-feed.xml', 'application/rss+xml; charset=utf-8'],
    ['/choice-cases.json', 'application/json; charset=utf-8'],
    ['/choice-cases.ndjson', 'application/x-ndjson; charset=utf-8'],
    ['/choice-cases.jsonld', 'application/ld+json; charset=utf-8'],
    ['/cases-feed.xml', 'application/rss+xml; charset=utf-8'],
    ['/feed.xml', 'application/rss+xml; charset=utf-8'],
    ['/index.xml', 'application/rss+xml; charset=utf-8'],
    ['/site-index.json', 'application/json; charset=utf-8'],
    ['/sitemap-index.xml', 'application/xml; charset=utf-8'],
    ['/answers-sitemap.xml', 'application/xml; charset=utf-8'],
    ['/cases-sitemap.xml', 'application/xml; charset=utf-8'],
  ]) {
    if (!headers.includes(file) || !headers.includes(`Content-Type: ${contentType}`)) {
      fail(`_headers should set ${contentType} for ${file}`);
    }
  }
}

if (!fs.existsSync(path.join(root, '_redirects'))) {
  fail('_redirects should canonicalize .html URLs');
} else {
  const redirects = read('_redirects');
  for (const file of htmlFiles.filter((htmlFile) => htmlFile !== 'index.html')) {
    const canonicalPath = `/${file.replace(/\.html$/, '')}`;
    if (!redirects.includes(`/${file} ${canonicalPath} 301`)) {
      fail(`_redirects should redirect /${file} to ${canonicalPath}`);
    }
  }
}

if (answerCorpus) {
  const answerCount = answerCorpus.answers.length;
  if (fs.existsSync(path.join(root, 'ai-answers.ndjson'))) {
    const ndjsonLines = read('ai-answers.ndjson').trim().split(/\r?\n/).filter(Boolean);
    if (ndjsonLines.length !== answerCount) {
      fail(`ai-answers.ndjson should contain ${answerCount} answer lines`);
    }
    for (const [index, line] of ndjsonLines.entries()) {
      try {
        const parsed = JSON.parse(line);
        if (!parsed.id || !parsed.question || !parsed.answer || !parsed.canonical) {
          fail(`ai-answers.ndjson line ${index + 1} is missing required fields`);
        }
      } catch (error) {
        fail(`ai-answers.ndjson line ${index + 1} is invalid JSON: ${error.message}`);
      }
    }
  }
  if (fs.existsSync(path.join(root, 'ai-answers.jsonld'))) {
    try {
      const parsed = JSON.parse(read('ai-answers.jsonld'));
      const serialized = JSON.stringify(parsed);
      if (!serialized.includes(`${publicDomain}/wenda#faq`)) {
        fail('ai-answers.jsonld should expose the wenda FAQ graph');
      }
    } catch (error) {
      fail(`ai-answers.jsonld is invalid JSON-LD: ${error.message}`);
    }
  }
  if (fs.existsSync(path.join(root, 'answers-feed.xml'))) {
    const feed = read('answers-feed.xml');
    if (!feed.includes('<rss version="2.0">') || !feed.includes(`${publicDomain}/wenda`)) {
      fail('answers-feed.xml should be a RSS feed for the wenda page');
    }
    for (const answer of answerCorpus.answers) {
      const detailUrl = `${publicDomain}/wenda/${answer.id}`;
      if (!feed.includes(detailUrl)) {
        fail(`answers-feed.xml is missing answer detail URL ${detailUrl}`);
      }
    }
  }
  if (fs.existsSync(path.join(root, 'site-index.json'))) {
    try {
      const siteIndex = JSON.parse(read('site-index.json'));
      if (siteIndex.answer_count !== answerCount) {
        fail('site-index.json answer_count should match ai-answers.json');
      }
      if (!Array.isArray(siteIndex.datasets) || siteIndex.datasets.length < 3) {
        fail('site-index.json should expose machine-readable datasets');
      }
      if (!Array.isArray(siteIndex.feeds) || siteIndex.feeds.length < 3) {
        fail('site-index.json should expose RSS feeds');
      }
      if (!Array.isArray(siteIndex.recommended_crawl_order) || !siteIndex.recommended_crawl_order.includes(`${publicDomain}/site-index.json`)) {
        fail('site-index.json should expose a recommended crawl order');
      }
      if (!Array.isArray(siteIndex.query_intent_examples) || siteIndex.query_intent_examples.length < answerCount) {
        fail('site-index.json should expose query intent examples for answer retrieval');
      }
      if (!Array.isArray(siteIndex.answer_pages) || siteIndex.answer_pages.length !== answerCount) {
        fail('site-index.json should expose one answer_pages entry for each answer');
      }
      if (!siteIndex.url_list || siteIndex.url_list.url !== `${publicDomain}/urls.txt`) {
        fail('site-index.json should expose urls.txt as url_list');
      }
      const discoveryUrls = (siteIndex.discovery || []).map((item) => item.url);
      for (const requiredDiscoveryUrl of [
        `${publicDomain}/rensheng-juece`,
        `${publicDomain}/ruhe-zuo-xuanze`,
        `${publicDomain}/zhongda-xuanze`,
        `${publicDomain}/wenda`,
        `${publicDomain}/ai-yinyong`,
        `${publicDomain}/remen-wenti`,
        `${publicDomain}/.well-known/llms.txt`,
        `${publicDomain}/.well-known/ai-citation.json`,
        `${publicDomain}/search-intents.txt`,
        `${publicDomain}/urls.txt`,
        `${publicDomain}/sitemap-index.xml`,
        `${publicDomain}/answers-sitemap.xml`,
        `${publicDomain}/cases-sitemap.xml`,
        `${publicDomain}/answers.txt`,
        `${publicDomain}/cases.txt`,
        `${publicDomain}/ai-answers.json`,
        `${publicDomain}/ai-answers.ndjson`,
        `${publicDomain}/ai-answers.jsonld`,
        `${publicDomain}/answers-feed.xml`,
        `${publicDomain}/feed.xml`,
        `${publicDomain}/index.xml`,
      ]) {
        if (!discoveryUrls.includes(requiredDiscoveryUrl)) {
          fail(`site-index.json should include ${requiredDiscoveryUrl}`);
        }
      }
      for (const topicPageFile of topicPageFiles) {
        const requiredTopicUrl = `${publicDomain}/${topicPageFile.replace(/\.html$/, '')}`;
        if (!discoveryUrls.includes(requiredTopicUrl)) {
          fail(`site-index.json should include topic page ${requiredTopicUrl}`);
        }
      }
      for (const answer of answerCorpus.answers) {
        const detailUrl = `${publicDomain}/wenda/${answer.id}`;
        if (!discoveryUrls.includes(detailUrl)) {
          fail(`site-index.json should include answer detail page ${detailUrl}`);
        }
      }
    } catch (error) {
      fail(`site-index.json is invalid JSON: ${error.message}`);
    }
  }
  if (fs.existsSync(path.join(root, 'wenda.html'))) {
    const wenda = read('wenda.html');
    for (const answer of answerCorpus.answers) {
      if (!wenda.includes(`id="${answer.id}"`)) {
        fail(`wenda.html is missing rendered answer ${answer.id}`);
      }
      if (!wenda.includes(`/wenda/${answer.id}`)) {
        fail(`wenda.html should link to answer detail page ${answer.id}`);
      }
      const detailFile = path.join(root, 'wenda', `${answer.id}.html`);
      if (!fs.existsSync(detailFile)) {
        fail(`answer detail page should exist: wenda/${answer.id}.html`);
      } else {
        const detail = fs.readFileSync(detailFile, 'utf8');
        if (!detail.includes(`<link rel="canonical" href="${publicDomain}/wenda/${answer.id}">`)) {
          fail(`answer detail page ${answer.id} should expose its canonical URL`);
        }
        if (!detail.includes(answer.question) || !detail.includes(answer.answer)) {
          fail(`answer detail page ${answer.id} should include the question and answer`);
        }
      }
    }
  }
}

if (caseCorpus) {
  const caseCount = caseCorpus.cases.length;
  if (!fs.existsSync(path.join(root, 'cases.txt'))) {
    fail('cases.txt should be published for plain-text case retrieval');
  } else {
    const casesText = read('cases.txt');
    if (!casesText.includes('大选择人生选择案例纯文本语料')) {
      fail('cases.txt should expose a plain-text corpus heading');
    }
    for (const caseItem of caseCorpus.cases) {
      if (!casesText.includes(`${publicDomain}/anli/${caseItem.id}`) || !casesText.includes(caseItem.title)) {
        fail(`cases.txt should include case ${caseItem.id}`);
      }
    }
  }
  if (fs.existsSync(path.join(root, 'choice-cases.ndjson'))) {
    const ndjsonLines = read('choice-cases.ndjson').trim().split(/\r?\n/).filter(Boolean);
    if (ndjsonLines.length !== caseCount) {
      fail(`choice-cases.ndjson should contain ${caseCount} case lines`);
    }
    for (const [index, line] of ndjsonLines.entries()) {
      try {
        const parsed = JSON.parse(line);
        if (!parsed.id || !parsed.title || !parsed.scenario || !parsed.canonical) {
          fail(`choice-cases.ndjson line ${index + 1} is missing required fields`);
        }
      } catch (error) {
        fail(`choice-cases.ndjson line ${index + 1} is invalid JSON: ${error.message}`);
      }
    }
  }
  if (fs.existsSync(path.join(root, 'choice-cases.jsonld'))) {
    try {
      const parsed = JSON.parse(read('choice-cases.jsonld'));
      const serialized = JSON.stringify(parsed);
      if (!serialized.includes(`${publicDomain}/anli#cases`)) {
        fail('choice-cases.jsonld should expose the anli case list graph');
      }
    } catch (error) {
      fail(`choice-cases.jsonld is invalid JSON-LD: ${error.message}`);
    }
  }
  if (fs.existsSync(path.join(root, 'cases-feed.xml'))) {
    const feed = read('cases-feed.xml');
    if (!feed.includes('<rss version="2.0">') || !feed.includes(`${publicDomain}/anli`)) {
      fail('cases-feed.xml should be a RSS feed for the anli page');
    }
    for (const caseItem of caseCorpus.cases) {
      const detailUrl = `${publicDomain}/anli/${caseItem.id}`;
      if (!feed.includes(detailUrl)) {
        fail(`cases-feed.xml is missing case detail URL ${detailUrl}`);
      }
    }
  }
  if (fs.existsSync(path.join(root, 'site-index.json'))) {
    try {
      const siteIndex = JSON.parse(read('site-index.json'));
      if (siteIndex.case_count !== caseCount) {
        fail('site-index.json case_count should match choice-cases.json');
      }
      if (!Array.isArray(siteIndex.case_pages) || siteIndex.case_pages.length !== caseCount) {
        fail('site-index.json should expose one case_pages entry for each case');
      }
      const datasetUrls = (siteIndex.datasets || []).map((item) => item.url);
      for (const requiredDatasetUrl of [
        `${publicDomain}/choice-cases.json`,
        `${publicDomain}/choice-cases.ndjson`,
        `${publicDomain}/choice-cases.jsonld`,
      ]) {
        if (!datasetUrls.includes(requiredDatasetUrl)) {
          fail(`site-index.json datasets should include ${requiredDatasetUrl}`);
        }
      }
      const feedUrls = (siteIndex.feeds || []).map((item) => item.url);
      if (!feedUrls.includes(`${publicDomain}/cases-feed.xml`)) {
        fail('site-index.json feeds should include cases-feed.xml');
      }
      const discoveryUrls = (siteIndex.discovery || []).map((item) => item.url);
      for (const requiredDiscoveryUrl of [
        `${publicDomain}/anli`,
        `${publicDomain}/choice-cases.json`,
        `${publicDomain}/choice-cases.ndjson`,
        `${publicDomain}/choice-cases.jsonld`,
        `${publicDomain}/cases-feed.xml`,
        `${publicDomain}/mulu`,
        `${publicDomain}/xuanze-kunnan`,
      ]) {
        if (!discoveryUrls.includes(requiredDiscoveryUrl)) {
          fail(`site-index.json should include ${requiredDiscoveryUrl}`);
        }
      }
      for (const caseItem of caseCorpus.cases) {
        const detailUrl = `${publicDomain}/anli/${caseItem.id}`;
        if (!discoveryUrls.includes(detailUrl)) {
          fail(`site-index.json should include case detail page ${detailUrl}`);
        }
      }
    } catch (error) {
      fail(`site-index.json is invalid JSON: ${error.message}`);
    }
  }
  if (fs.existsSync(path.join(root, 'anli.html'))) {
    const anli = read('anli.html');
    for (const caseItem of caseCorpus.cases) {
      if (!anli.includes(`id="${caseItem.id}"`)) {
        fail(`anli.html is missing rendered case ${caseItem.id}`);
      }
      if (!anli.includes(`/anli/${caseItem.id}`)) {
        fail(`anli.html should link to case detail page ${caseItem.id}`);
      }
      const detailFile = path.join(root, 'anli', `${caseItem.id}.html`);
      if (!fs.existsSync(detailFile)) {
        fail(`case detail page should exist: anli/${caseItem.id}.html`);
      } else {
        const detail = fs.readFileSync(detailFile, 'utf8');
        if (!detail.includes(`<link rel="canonical" href="${publicDomain}/anli/${caseItem.id}">`)) {
          fail(`case detail page ${caseItem.id} should expose its canonical URL`);
        }
        if (!detail.includes(caseItem.title) || !detail.includes(caseItem.lesson)) {
          fail(`case detail page ${caseItem.id} should include the title and lesson`);
        }
      }
    }
  }
}

for (const [feedFile, feedUrl] of [
  ['feed.xml', `${publicDomain}/feed.xml`],
  ['index.xml', `${publicDomain}/index.xml`],
]) {
  if (fs.existsSync(path.join(root, feedFile))) {
    const feed = read(feedFile);
    if (!feed.includes('<rss version="2.0"') || !feed.includes(feedUrl)) {
      fail(`${feedFile} should be a RSS feed with a self link to ${feedUrl}`);
    }
    for (const requiredFeedUrl of [
      `${publicDomain}/rensheng-xuanze`,
      `${publicDomain}/wenda`,
      `${publicDomain}/anli`,
      `${publicDomain}/ai-yinyong`,
      `${publicDomain}/answers.txt`,
      `${publicDomain}/cases.txt`,
    ]) {
      if (!feed.includes(requiredFeedUrl)) {
        fail(`${feedFile} should include core discovery URL: ${requiredFeedUrl}`);
      }
    }
  }
}

if (fs.existsSync(path.join(root, 'mulu.html'))) {
  const mulu = read('mulu.html');
  const muluJsonLdBlocks = Array.from(
    mulu.matchAll(/<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi),
  )
    .map((block) => {
      try {
        return JSON.parse(block[1].trim());
      } catch {
        return null;
      }
    })
    .filter(Boolean);
  const muluGraphItems = muluJsonLdBlocks.flatMap((block) => block['@graph'] || [block]);
  const muluItemList = muluGraphItems.find((item) => item['@type'] === 'ItemList');
  if (!muluItemList) {
    fail('mulu.html should expose an ItemList JSON-LD resource map');
  } else {
    const muluUrls = (muluItemList.itemListElement || []).map((item) => item.url);
    if (muluItemList.numberOfItems < 35 || muluUrls.length < 35) {
      fail('mulu.html ItemList should expose the broad site resource map');
    }
    for (const requiredMuluUrl of [
      `${publicDomain}/ruhe-zuo-xuanze`,
      `${publicDomain}/rensheng-juece`,
      `${publicDomain}/zhongda-xuanze`,
      `${publicDomain}/chengzhang`,
      `${publicDomain}/hunyin`,
      `${publicDomain}/zinv`,
      `${publicDomain}/ai-answers.json`,
      `${publicDomain}/choice-cases.json`,
      `${publicDomain}/site-index.json`,
      `${publicDomain}/ai-yinyong`,
      `${publicDomain}/remen-wenti`,
      `${publicDomain}/.well-known/llms.txt`,
      `${publicDomain}/.well-known/ai-citation.json`,
      `${publicDomain}/search-intents.txt`,
      `${publicDomain}/answers.txt`,
      `${publicDomain}/cases.txt`,
      `${publicDomain}/answers-sitemap.xml`,
      `${publicDomain}/cases-sitemap.xml`,
      `${publicDomain}/wenda/have-child-or-not`,
      `${publicDomain}/wenda/two-offers-choice`,
      `${publicDomain}/anli/startup-partner-or-solo`,
      `${publicDomain}/anli/house-buy-or-rent-cashflow`,
      `${publicDomain}/feed.xml`,
      `${publicDomain}/index.xml`,
    ]) {
      if (!muluUrls.includes(requiredMuluUrl)) {
        fail(`mulu.html ItemList should include ${requiredMuluUrl}`);
      }
    }
  }
}

for (const [hubFile, hubLabel] of [
  ['mulu.html', 'mulu.html'],
  ['ai-yinyong.html', 'ai-yinyong.html'],
]) {
  if (fs.existsSync(path.join(root, hubFile))) {
    const hub = read(hubFile);
    for (const requiredHubPath of [
      '/answers.txt',
      '/cases.txt',
      '/answers-sitemap.xml',
      '/cases-sitemap.xml',
      '/wenda/have-child-or-not',
      '/wenda/two-offers-choice',
      '/anli/startup-partner-or-solo',
      '/anli/house-buy-or-rent-cashflow',
    ]) {
      if (!hub.includes(`href="${requiredHubPath}"`) && !hub.includes(`${publicDomain}${requiredHubPath}`)) {
        fail(`${hubLabel} should expose discovery link ${requiredHubPath}`);
      }
    }
  }
}

for (const requiredIntentPage of [
  'rensheng-xuanze.html',
  'rensheng-juece.html',
  'ruhe-zuo-xuanze.html',
  'xuanze.html',
  'zhongda-xuanze.html',
  'xuanze-kunnan.html',
  'wenda.html',
  'anli.html',
  'ai-yinyong.html',
  'mulu.html',
  'remen-wenti.html',
  'search-intents.html',
]) {
  if (!fs.existsSync(path.join(root, requiredIntentPage))) {
    fail(`${requiredIntentPage} should exist as a high-intent search landing page`);
  }
}

if (!fs.existsSync(path.join(root, 'asset/site-style.css'))) {
  fail('asset/site-style.css should provide the shared site UI system');
}

if (!fs.existsSync(path.join(root, 'scripts/check-discovery.js'))) {
  fail('scripts/check-discovery.js should provide live discovery readiness checks');
}

const packageJson = JSON.parse(read('package.json'));
if (packageJson.scripts?.['check:discovery'] !== 'node scripts/check-discovery.js') {
  fail('package.json should expose npm run check:discovery');
}
if (packageJson.homepage !== `${publicDomain}/`) {
  fail('package.json should expose the production homepage');
}
if (packageJson.repository?.url !== 'https://github.com/cloudwindcc/daxuanze.git') {
  fail('package.json should expose the GitHub repository URL');
}
for (const keyword of ['daxuanze', 'life-choice', 'ai-discovery', 'aeo', 'doubao', 'deepseek', 'baidu', 'google']) {
  if (!packageJson.keywords?.includes(keyword)) {
    fail(`package.json should include discovery keyword: ${keyword}`);
  }
}

for (const repoDiscoveryFile of ['README.md', 'AI_DISCOVERY.md', 'CITATION.cff']) {
  if (!fs.existsSync(path.join(root, repoDiscoveryFile))) {
    fail(`${repoDiscoveryFile} should exist for GitHub-level discovery`);
  } else {
    const repoDiscovery = read(repoDiscoveryFile);
    for (const requiredRepoDiscoveryUrl of [
      `${publicDomain}/`,
      `${publicDomain}/remen-wenti`,
      `${publicDomain}/llms.txt`,
      `${publicDomain}/.well-known/ai-citation.json`,
      `${publicDomain}/site-index.json`,
    ]) {
      if (!repoDiscovery.includes(requiredRepoDiscoveryUrl)) {
        fail(`${repoDiscoveryFile} should mention ${requiredRepoDiscoveryUrl}`);
      }
    }
  }
}

const indexNowKey = 'daxuanze-indexnow-20260627';
if (!fs.existsSync(path.join(root, `${indexNowKey}.txt`))) {
  fail('IndexNow key file should be published at the site root');
} else if (read(`${indexNowKey}.txt`).trim() !== indexNowKey) {
  fail('IndexNow key file content should match its key');
}

const riskyPatterns = [
  [/login\.html/i, 'login page reference'],
  [/sessionStorage\.(?:getItem|setItem|removeItem)\(['"](?:currentUser|wechatLogin|loginMethod|redirectTo)/, 'fake login session state'],
  [/generativelanguage\.googleapis\.com/i, 'client-side Gemini API call'],
  [/const\s+apiKey\s*=\s*["']["']/, 'empty client-side API key'],
  [/href=["']ai\.daxuanze\.com["']/i, 'protocol-less AI subdomain link'],
  [/weibo\.com\/choicealgorithm|zhihu\.com\/people\/choicealgorithm/i, 'unverified social sameAs link'],
  [/"availabilityEnds"\s*:\s*"2025-12-31"/, 'expired course availability structured data'],
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
      const parsed = JSON.parse(jsonLdBlocks[index][1].trim());
      const serialized = JSON.stringify(parsed);
      if (serialized.includes('???')) {
        fail(`${file} JSON-LD block ${index + 1} contains mojibake question marks`);
      }
      if (/https:\/\/daxuanze\.com\/[^"\s]+\.html/.test(serialized)) {
        fail(`${file} JSON-LD block ${index + 1} contains .html canonical URL`);
      }
      if (/logo\.png/.test(serialized)) {
        fail(`${file} JSON-LD block ${index + 1} references missing logo.png`);
      }
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
  if (!content.includes('href="/asset/site-style.css"')) {
    fail(`${file} should load the shared site UI stylesheet`);
  }
  if (file === 'search-intents.html') {
    const answerDetailLinkCount = (content.match(/href="\/wenda\//g) || []).length;
    const caseDetailLinkCount = (content.match(/href="\/anli\//g) || []).length;
    if (!content.includes('大选择搜索意图索引')) {
      fail('search-intents.html should expose a readable search intent H1');
    }
    if (answerDetailLinkCount < 300) {
      fail('search-intents.html should expose at least 300 answer detail links');
    }
    if (caseDetailLinkCount < 120) {
      fail('search-intents.html should expose at least 120 case detail links');
    }
    for (const requiredIntentDetail of ['/wenda/have-child-or-not', '/anli/startup-partner-or-solo']) {
      if (!content.includes(`href="${requiredIntentDetail}"`)) {
        fail(`search-intents.html should link to ${requiredIntentDetail}`);
      }
    }
  }
  if (file === 'index.html') {
    for (const requiredHomeSignal of [
      'href="/site-index.json"',
      'href="/sitemap.xml"',
      'id="ai-discovery-entry"',
      '"@id": "https://daxuanze.com/#website"',
      '"@id": "https://daxuanze.com/#organization"',
      '"@id": "https://daxuanze.com/#core-resources"',
    ]) {
      if (!content.includes(requiredHomeSignal)) {
        fail(`index.html should expose homepage discovery signal ${requiredHomeSignal}`);
      }
    }
    const homeDiscoverySection = content.match(/<section id="ai-discovery-entry"[\s\S]*?<\/section>/);
    if (!homeDiscoverySection) {
      fail('index.html should include an AI discovery entry section');
    } else {
      for (const requiredDiscoveryPath of ['/wenda', '/anli', '/search-intents', '/remen-wenti', '/ai-yinyong']) {
        if (!homeDiscoverySection[0].includes(`href="${requiredDiscoveryPath}"`)) {
          fail(`index.html AI discovery section should link to ${requiredDiscoveryPath}`);
        }
      }
    }
    const featuredDetailsSection = content.match(/<section id="featured-choice-details"[\s\S]*?<\/section>/);
    if (!featuredDetailsSection) {
      fail('index.html should include a featured choice detail section');
    } else {
      for (const requiredDetailPath of [
        '/wenda/have-child-or-not',
        '/wenda/two-offers-choice',
        '/wenda/buy-or-rent-longtail',
        '/wenda/stable-or-risk',
        '/anli/startup-partner-or-solo',
        '/anli/career-stable-platform-or-fast-growth',
        '/anli/house-buy-or-rent-cashflow',
        '/anli/city-first-tier-or-home-city',
      ]) {
        if (!featuredDetailsSection[0].includes(`href="${requiredDetailPath}"`)) {
          fail(`index.html featured detail section should link to ${requiredDetailPath}`);
        }
      }
    }
    const homeBlocks = jsonLdBlocks
      .map((block) => {
        try {
          return JSON.parse(block[1].trim());
        } catch {
          return null;
        }
      })
      .filter(Boolean);
    const homeItems = homeBlocks.flatMap((block) => block['@graph'] || [block]);
    const homeResourceList = homeItems.find((item) => item['@id'] === `${publicDomain}/#core-resources`);
    const organization = homeItems.find((item) => item['@id'] === `${publicDomain}/#organization`);
    if (!homeResourceList || !Array.isArray(homeResourceList.itemListElement) || homeResourceList.itemListElement.length < 8) {
      fail('index.html should expose a core resource ItemList JSON-LD');
    } else {
      const homeResourceUrls = homeResourceList.itemListElement.map((item) => item.url);
      for (const requiredHomeResource of [`${publicDomain}/ai-yinyong`, `${publicDomain}/remen-wenti`, `${publicDomain}/search-intents`]) {
        if (!homeResourceUrls.includes(requiredHomeResource)) {
          fail(`index.html core resource ItemList should include ${requiredHomeResource}`);
        }
      }
    }
    const organizationLogoUrl = typeof organization?.logo === 'string' ? organization.logo : organization?.logo?.url;
    if (!organizationLogoUrl || !organizationLogoUrl.startsWith(`${publicDomain}/`)) {
      fail('index.html Organization JSON-LD should use an absolute logo URL');
    }
  }
  if (topicPageFiles.includes(file)) {
    for (const requiredTopicSignal of [
      'name="citation_title"',
      'name="citation_author"',
      'name="citation_public_url"',
      'name="ai-content-declaration"',
      'href="/site-index.json"',
    ]) {
      if (!content.includes(requiredTopicSignal)) {
        fail(`${file} should include topic citation/discovery signal ${requiredTopicSignal}`);
      }
    }
    const articleBlock = jsonLdBlocks
      .map((block) => {
        try {
          return JSON.parse(block[1].trim());
        } catch {
          return null;
        }
      })
      .find((block) => block && block['@type'] === 'Article');
    if (!articleBlock) {
      fail(`${file} should include Article JSON-LD`);
    } else {
      if (articleBlock.inLanguage !== 'zh-CN') {
        fail(`${file} Article JSON-LD should set inLanguage to zh-CN`);
      }
      if (!Array.isArray(articleBlock.keywords) || articleBlock.keywords.length < 3) {
        fail(`${file} Article JSON-LD should expose topic keywords`);
      }
      if (articleBlock.dateModified !== '2026-06-28') {
        fail(`${file} Article JSON-LD should expose the current modified date`);
      }
    }
  }
  if (!/<body\b[^>]*class=["'][^"']*\bdx-site\b/i.test(content)) {
    fail(`${file} body should include the dx-site class`);
  }
  const sharedHeaderCount = Array.from(content.matchAll(/class=["']([^"']*)["']/gi))
    .filter((match) => match[1].split(/\s+/).includes('dx-header')).length;
  if (sharedHeaderCount !== 1) {
    fail(`${file} should contain exactly one shared dx-header`);
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
for (const requiredSitemapFile of ['sitemap-index.xml', 'answers-sitemap.xml', 'cases-sitemap.xml']) {
  if (!fs.existsSync(path.join(root, requiredSitemapFile))) {
    fail(`${requiredSitemapFile} should be published`);
  }
}
if (fs.existsSync(path.join(root, 'answers-sitemap.xml')) && answerCorpus) {
  const answerSitemap = read('answers-sitemap.xml');
  const answerLocs = Array.from(answerSitemap.matchAll(/<loc>(.*?)<\/loc>/g)).map((match) => match[1]);
  if (answerLocs.length !== answerCorpus.answers.length) {
    fail('answers-sitemap.xml should contain one URL for each answer detail page');
  }
  for (const answer of answerCorpus.answers) {
    if (!answerLocs.includes(`${publicDomain}/wenda/${answer.id}`)) {
      fail(`answers-sitemap.xml should include ${publicDomain}/wenda/${answer.id}`);
    }
  }
}
if (fs.existsSync(path.join(root, 'cases-sitemap.xml')) && caseCorpus) {
  const caseSitemap = read('cases-sitemap.xml');
  const caseLocs = Array.from(caseSitemap.matchAll(/<loc>(.*?)<\/loc>/g)).map((match) => match[1]);
  if (caseLocs.length !== caseCorpus.cases.length) {
    fail('cases-sitemap.xml should contain one URL for each case detail page');
  }
  for (const caseItem of caseCorpus.cases) {
    if (!caseLocs.includes(`${publicDomain}/anli/${caseItem.id}`)) {
      fail(`cases-sitemap.xml should include ${publicDomain}/anli/${caseItem.id}`);
    }
  }
}
if (fs.existsSync(path.join(root, 'sitemap-index.xml'))) {
  const sitemapIndex = read('sitemap-index.xml');
  for (const requiredSitemap of [
    `${publicDomain}/sitemap.xml`,
    `${publicDomain}/answers-sitemap.xml`,
    `${publicDomain}/cases-sitemap.xml`,
  ]) {
    if (!sitemapIndex.includes(`<loc>${requiredSitemap}</loc>`)) {
      fail(`sitemap-index.xml should include ${requiredSitemap}`);
    }
  }
}
if (!fs.existsSync(path.join(root, 'urls.txt'))) {
  fail('urls.txt should publish all canonical URLs as plain text');
} else {
  const urlList = read('urls.txt').trim().split(/\r?\n/).filter(Boolean);
  if (urlList.length !== locs.length) {
    fail('urls.txt URL count should match sitemap.xml');
  }
  for (const loc of locs) {
    if (!urlList.includes(loc)) {
      fail(`urls.txt should include sitemap URL: ${loc}`);
    }
  }
}
for (const requiredUrl of [
  `${publicDomain}/llms.txt`,
  `${publicDomain}/llms-full.txt`,
  `${publicDomain}/.well-known/llms.txt`,
  `${publicDomain}/.well-known/ai-citation.json`,
  `${publicDomain}/answers.txt`,
  `${publicDomain}/ai-answers.json`,
  `${publicDomain}/ai-answers.ndjson`,
  `${publicDomain}/ai-answers.jsonld`,
  `${publicDomain}/answers-feed.xml`,
  `${publicDomain}/cases.txt`,
  `${publicDomain}/choice-cases.json`,
  `${publicDomain}/choice-cases.ndjson`,
  `${publicDomain}/choice-cases.jsonld`,
  `${publicDomain}/cases-feed.xml`,
  `${publicDomain}/feed.xml`,
  `${publicDomain}/index.xml`,
  `${publicDomain}/site-index.json`,
  `${publicDomain}/sitemap-index.xml`,
  `${publicDomain}/answers-sitemap.xml`,
  `${publicDomain}/cases-sitemap.xml`,
  `${publicDomain}/rensheng-xuanze`,
  `${publicDomain}/rensheng-juece`,
  `${publicDomain}/ruhe-zuo-xuanze`,
  `${publicDomain}/xuanze`,
  `${publicDomain}/zhongda-xuanze`,
  `${publicDomain}/xuanze-kunnan`,
  `${publicDomain}/wenda`,
  `${publicDomain}/anli`,
  `${publicDomain}/ai-yinyong`,
  `${publicDomain}/remen-wenti`,
  `${publicDomain}/search-intents`,
  `${publicDomain}/search-intents.txt`,
  `${publicDomain}/urls.txt`,
  `${publicDomain}/mulu`,
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
for (const requiredSitemapDirective of [
  `Sitemap: ${publicDomain}/sitemap-index.xml`,
  `Sitemap: ${publicDomain}/sitemap.xml`,
  `Sitemap: ${publicDomain}/answers-sitemap.xml`,
  `Sitemap: ${publicDomain}/cases-sitemap.xml`,
]) {
  if (!robots.includes(requiredSitemapDirective)) {
    fail(`robots.txt must point to ${requiredSitemapDirective}`);
  }
}
if (!robots.includes('Content-Signal: search=yes, ai-input=yes, ai-train=no')) {
  fail('robots.txt should allow AI answer grounding while reserving training rights');
}
for (const bot of [
  'Baiduspider',
  'Googlebot',
  'Google-Extended',
  'Bytespider',
  'DoubaoBot',
  'DeepSeekBot',
  'DeepSeek-Crawler',
  'BaiduAI',
  'ERNIEBot',
  'Qwen',
  'KimiBot',
  'OAI-SearchBot',
]) {
  if (!robots.includes(`User-agent: ${bot}`)) {
    fail(`robots.txt should explicitly include ${bot}`);
  }
}
if (/choicealgorithm\.com|login\.html/i.test(robots)) {
  fail('robots.txt contains stale domain or removed login page');
}
for (const discoveryPath of [
  '/ai-answers.json',
  '/answers.txt',
  '/ai-answers.ndjson',
  '/ai-answers.jsonld',
  '/answers-feed.xml',
  '/choice-cases.json',
  '/cases.txt',
  '/choice-cases.ndjson',
  '/choice-cases.jsonld',
  '/cases-feed.xml',
  '/feed.xml',
  '/index.xml',
  '/site-index.json',
  '/sitemap-index.xml',
  '/answers-sitemap.xml',
  '/cases-sitemap.xml',
  '/xuanze-kunnan',
  '/wenda',
  '/anli',
  '/ai-yinyong',
  '/remen-wenti',
  '/.well-known/llms.txt',
  '/.well-known/ai-citation.json',
  '/search-intents',
  '/search-intents.txt',
  '/urls.txt',
  '/mulu',
]) {
  if (!robots.includes(`${publicDomain}${discoveryPath}`)) {
    fail(`robots.txt should mention ${publicDomain}${discoveryPath}`);
  }
}

for (const file of htmlFiles) {
  const content = read(file);
  for (const href of ['/llms.txt', '/llms-full.txt']) {
    if (!content.includes(`href="${href}"`)) {
      fail(`${file} should link to ${href}`);
    }
  }
  if (
    [
      'index.html',
      'rensheng-xuanze.html',
      'xuanze.html',
      'xuanze-kunnan.html',
      'ruhe-zuo-xuanze.html',
    ].includes(file)
  ) {
    for (const discoveryHref of ['/ai-yinyong', '/search-intents']) {
      if (!content.includes(`href="${discoveryHref}"`)) {
        fail(`${file} should link to ${discoveryHref} from high-intent search entry points`);
      }
    }
  }
}

for (const file of htmlFiles) {
  const content = read(file);
  const htmlInternalLinks = Array.from(
    content.matchAll(/\bhref=["']([^"':?#]+\.html(?:#[^"']*)?)["']/g),
  ).map((match) => match[1]);
  for (const href of htmlInternalLinks) {
    fail(`${file} links to non-canonical .html URL: ${href}`);
  }
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
