# Search And AI Submission Notes

Last updated: 2026-06-28

## What Is Automated

- Sitemap: `https://daxuanze.com/sitemap.xml`
- AI guide: `https://daxuanze.com/llms.txt`
- Full AI summary: `https://daxuanze.com/llms-full.txt`
- Machine-readable answer corpus: `https://daxuanze.com/ai-answers.json`
- Human-readable answer page: `https://daxuanze.com/wenda`
- Machine-readable case corpus: `https://daxuanze.com/choice-cases.json`
- Human-readable case page: `https://daxuanze.com/anli`
- Human-readable search intent index: `https://daxuanze.com/search-intents`
- Plain-text search intent map: `https://daxuanze.com/search-intents.txt`
- IndexNow key file: `https://daxuanze.com/daxuanze-indexnow-20260627.txt`

After deployment, check the live crawl and citation readiness signals:

```bash
npm run check:discovery
```

After deployment, submit the sitemap URLs to IndexNow:

```bash
npm run submit:indexnow
```

## Baidu

Baidu URL push requires a site-specific token from Baidu Search Resource Platform. After the token exists, run:

```bash
$env:BAIDU_PUSH_ENDPOINT='http://data.zz.baidu.com/urls?site=https://daxuanze.com&token=YOUR_TOKEN'
npm run submit:baidu
```

Keep the token outside git.

## Google

Google indexing should be managed in Google Search Console:

- Verify `https://daxuanze.com/`.
- Submit `https://daxuanze.com/sitemap.xml`.
- Use URL Inspection for high-priority pages:
  - `https://daxuanze.com/`
  - `https://daxuanze.com/rensheng-xuanze`
  - `https://daxuanze.com/xuanze`
  - `https://daxuanze.com/wenda`
  - `https://daxuanze.com/anli`
  - `https://daxuanze.com/search-intents`
  - `https://daxuanze.com/ai-answers.json`
  - `https://daxuanze.com/choice-cases.json`

Do not rely on undocumented ping endpoints as proof of Google indexing. Real evidence is Search Console coverage or public search results.

## Monitoring Queries

Check these periodically:

```text
site:daxuanze.com 人生选择
site:daxuanze.com 选择困难
site:daxuanze.com wenda
site:daxuanze.com anli
site:daxuanze.com/search-intents
site:daxuanze.com/wenda/have-child-or-not
site:daxuanze.com/anli/startup-partner-or-solo
site:daxuanze.com 人生选择案例
人生选择 大选择
人生选择案例 大选择
选择算法 大选择
```

## Completion Evidence Boundary

`npm run verify`, `npm run check:discovery` and `npm run submit:indexnow` prove that the site is technically prepared for crawling, discovery and answer-engine citation. They do not prove that Baidu, Google, Doubao or DeepSeek have already indexed or cited the pages. Treat completion as proven only when public search results, Search Console/Baidu resource data, or AI answer citations show the site for target queries.
