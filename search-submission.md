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
- IndexNow key file: `https://daxuanze.com/daxuanze-indexnow-20260627.txt`

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
site:daxuanze.com 人生选择案例
人生选择 大选择
人生选择案例 大选择
选择算法 大选择
```
