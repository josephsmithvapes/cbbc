# AI SEO Phase 1 — LLM Discoverability

**Date:** 2026-05-15
**Status:** Approved
**Approach:** Static inline (Option A)

## Goal

Make BCCB accurately citable by AI engines (ChatGPT, Perplexity, Claude, Gemini) when users ask about cold brew in LA, batch transparency, or the BCCB brand. No new dependencies. Ships as a single PR touching `index.html` and one new static file.

---

## Scope

Three deliverables:

1. `public/llms.txt` — natural language description for AI crawlers
2. JSON-LD schemas in `index.html <head>` — Organization + FAQPage
3. Missing OG/Twitter card tags in `index.html <head>`

Out of scope: Product schema (no price/availability yet), LocalBusiness schema (no physical address), dynamic/React-injected schema, new routes or pages.

---

## 1. `public/llms.txt`

File served at `https://boldcrewcoldbrew.com/llms.txt`.

Content covers:
- What BCCB is (small batch cold brew, Los Angeles, online only)
- The 20-hour cold steep process and why it matters
- The transparency/proof angle — live brew telemetry, every batch published
- Current status: pre-launch, waitlist open
- Social profiles: TikTok @boldcrewcoldbrew, Instagram @boldcrewxcoldbrew
- Domain: boldcrewcoldbrew.com

Written in plain prose, not structured data. Tone matches the brand — direct, no fluff.

---

## 2. JSON-LD Schemas

Two `<script type="application/ld+json">` blocks added to `<head>` in `index.html`.

### Organization

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Bold Crew Cold Brew",
  "alternateName": "BCCB",
  "url": "https://boldcrewcoldbrew.com",
  "logo": "https://boldcrewcoldbrew.com/img/bottle-bccb.webp",
  "description": "Small batch cold brew steeped 20 hours in Los Angeles. Every batch tracked with live temperature and weight telemetry. Full transparency — no secrets.",
  "foundingLocation": {
    "@type": "Place",
    "name": "Los Angeles, California"
  },
  "sameAs": [
    "https://www.tiktok.com/@boldcrewcoldbrew",
    "https://www.instagram.com/boldcrewxcoldbrew"
  ]
}
```

### FAQPage

Three question/answer pairs targeting the three most-asked questions:

1. **Caffeine vs. hot coffee** — cold brew concentrate is higher caffeine than drip because the coffee-to-water ratio is much higher; diluted to serve it's roughly comparable or slightly higher
2. **What makes BCCB different** — 20-hour steep, live sensor telemetry on every batch, full batch history published publicly, small batch with no filler
3. **Why does the "proof" matter** — most coffee companies offer no visibility into how their product is made; BCCB publishes temperature curves, steep duration, and yield for every batch so customers can verify the process themselves

---

## 3. Missing OG / Twitter Card Tags

Added alongside existing OG tags in `index.html <head>`:

```html
<meta property="og:image" content="https://boldcrewcoldbrew.com/img/bottle-bccb.webp">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:site_name" content="Bold Crew Cold Brew">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="BCCB — Bold Crew Cold Brew · Los Angeles">
<meta name="twitter:description" content="Small batch cold brew steeped 20 hours in LA. Live telemetry. Full transparency. Every batch published.">
<meta name="twitter:image" content="https://boldcrewcoldbrew.com/img/bottle-bccb.webp">
```

Note: `og:image` dimensions are approximate — verify `bottle-bccb.webp` actual dimensions before shipping. Ideal OG image is 1200×630. If the image is portrait, a cropped/padded version may be needed.

---

## Files Changed

| File | Change |
|------|--------|
| `public/llms.txt` | New file |
| `index.html` | Add 2 JSON-LD blocks + 8 meta tags |

No React component changes. No new dependencies. No build configuration changes.

---

## Success Criteria

- `https://boldcrewcoldbrew.com/llms.txt` returns 200 with correct content
- JSON-LD validates cleanly in [Google Rich Results Test](https://search.google.com/test/rich-results)
- OG tags render correctly in [OpenGraph debugger](https://www.opengraph.xyz/)
- Perplexity/ChatGPT accurately describe BCCB within ~2 weeks of deploy (crawl lag)
