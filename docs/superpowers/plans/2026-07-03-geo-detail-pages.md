# GEO Detail Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve generated Daxuanze Q&A and case detail pages so AI crawlers and retrieval systems can extract direct answers, facts, citations, and source boundaries more reliably.

**Architecture:** Keep generation centralized in `scripts/build-ai-assets.js`; add one verifier in `scripts/verify-geo-modules.js`; add CSS only for the new semantic modules. Existing static output remains generated from the current JSON corpora.

**Tech Stack:** Node.js scripts, static HTML, JSON-LD, shared CSS.

---

### Task 1: Add GEO Module Verifier

**Files:**
- Create: `scripts/verify-geo-modules.js`
- Modify: `package.json`

- [ ] Add a Node verifier that checks representative generated pages for `data-geo-block` markers, source ledgers, boundaries, and JSON-LD links.
- [ ] Add `verify:geo` to `package.json`.
- [ ] Run `npm run verify:geo`; expected result before implementation is failure because the modules do not exist yet.

### Task 2: Enhance Generated Detail Templates

**Files:**
- Modify: `scripts/build-ai-assets.js`
- Modify: `asset/site-style.css`

- [ ] Add reusable helpers for GEO source rows, boundary text, and page-part JSON-LD.
- [ ] Update Q&A detail JSON-LD and HTML to expose direct answer, fact card, source ledger, and usage boundary.
- [ ] Update case detail JSON-LD and HTML to expose structured case summary, decision facts, source ledger, and usage boundary.
- [ ] Add lightweight CSS for `.dx-geo-*` modules without changing the existing visual system.

### Task 3: Rebuild And Verify

**Files:**
- Generated: `wenda/*.html`
- Generated: `anli/*.html`

- [ ] Run `npm run build`.
- [ ] Run `npm run verify:geo`.
- [ ] Run `npm run verify`.
- [ ] Run `npm run check:discovery`.
- [ ] Inspect `git diff --stat` and confirm the changes are scoped to GEO detail-page output and supporting scripts/styles/docs.
