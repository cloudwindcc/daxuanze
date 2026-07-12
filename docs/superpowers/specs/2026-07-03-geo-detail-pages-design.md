# GEO Detail Pages Design

## Goal

Use the `yaojingang/yao-geo-skills` page-audit and page-blueprint method to improve Daxuanze's AI extractability for generated Q&A and case detail pages.

## Scope

- Enhance generated `/wenda/*` pages with direct-answer, fact-card, citation, source-ledger, and usage-boundary modules.
- Enhance generated `/anli/*` pages with scenario, question, analysis, recommendation, citable lesson, source-ledger, and usage-boundary modules.
- Keep existing canonical URLs, sitemap structure, feeds, corpora, and discovery files intact.
- Add a reusable verification script that checks representative generated pages and JSON-LD for GEO modules.

## Design

The implementation stays in `scripts/build-ai-assets.js` because the detail pages are generated from `ai-answers.json` and `choice-cases.json`. This gives one controlled change that covers all generated detail pages.

Each detail page should expose the same information in three forms:

- Visible HTML modules with stable section IDs and `data-geo-block` attributes.
- Machine-readable JSON-LD that references the canonical source, page URL, entity keywords, publication date, update date, and extractable page parts.
- Existing plain-text, JSON, NDJSON, JSON-LD, feed, sitemap, and site-index outputs.

## Acceptance

- `npm run verify:geo` fails before implementation and passes after implementation.
- `npm run build` regenerates pages without errors.
- `npm run verify` passes local HTML and sitemap checks.
- `npm run check:discovery` passes public discovery checks.
