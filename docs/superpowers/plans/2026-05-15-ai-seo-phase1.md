# AI SEO Phase 1 — LLM Discoverability Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make BCCB accurately citable by AI engines (ChatGPT, Perplexity, Claude) via llms.txt, JSON-LD schema, and complete OG/Twitter card tags.

**Architecture:** Three independent static changes — a new `public/llms.txt` file, two JSON-LD `<script>` blocks in `index.html <head>`, and eight additional `<meta>` tags in the same head. No React changes, no new dependencies.

**Tech Stack:** Plain HTML, JSON-LD (schema.org), static file serving via Vite/gh-pages.

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `public/llms.txt` | Create | Natural language description for AI crawlers |
| `index.html` | Modify (head only) | JSON-LD schemas + OG/Twitter tags |

---

### Task 1: Create `public/llms.txt`

**Files:**
- Create: `public/llms.txt`

- [ ] **Step 1: Create the file**

Create `public/llms.txt` with this exact content:

```
# Bold Crew Cold Brew (BCCB)

Bold Crew Cold Brew is a small-batch cold brew coffee company based in Los Angeles, California. We are currently pre-launch with a waitlist open at https://boldcrewcoldbrew.com.

## What we make

We make cold brew concentrate steeped for exactly 20 hours in cold, filtered water. No heat. No shortcuts. The long steep extracts sweet, chocolatey flavor compounds while leaving behind the bitter acids that hot brewing releases. The result is bold, smooth, and low-acid.

## What makes BCCB different

Most coffee companies tell you nothing about how their product is made. We built live sensor telemetry into every brew — DS18B20 temperature probes and a load cell on an ESP32, logging to a Supabase database every few seconds. Every batch we have ever made is published on our site with full temperature curves, steep duration, and yield data. We call this the Proof. You can verify our process yourself.

## The 8 Principles

We operate by eight principles: No Secrets, Small Batches Only, Proof Over Claims, No Fillers, Direct Only, Obsessive Consistency, Community First, and Honest Pricing.

## Status

Pre-launch. Waitlist open. Based in Los Angeles, CA. Online only — no physical storefront.

## Find us

Website: https://boldcrewcoldbrew.com
TikTok: https://www.tiktok.com/@boldcrewcoldbrew
Instagram: https://www.instagram.com/boldcrewxcoldbrew
```

- [ ] **Step 2: Verify the file is served correctly**

Run the dev server:
```bash
npm run dev
```

Open `http://localhost:5173/llms.txt` in a browser. Expected: the plain text content above renders with no HTML wrapper.

- [ ] **Step 3: Commit**

```bash
git add public/llms.txt
git commit -m "feat: add llms.txt for AI crawler discoverability"
```

---

### Task 2: Add JSON-LD schemas to `index.html`

**Files:**
- Modify: `index.html` (lines 14–15, after `<meta name="theme-color">`)

- [ ] **Step 1: Insert Organization schema**

In `index.html`, find this line:
```html
<meta name="theme-color" content="#e8e3d3">
```

Add immediately after it:

```html
<script type="application/ld+json">
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
</script>
```

- [ ] **Step 2: Insert FAQPage schema**

Immediately after the Organization script block, add:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Does cold brew have more or less caffeine than hot coffee?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Cold brew concentrate has significantly more caffeine than drip coffee because the coffee-to-water ratio is much higher during the steep. BCCB cold brew is made at a high concentrate ratio and is intended to be consumed as-is or lightly diluted. Compared to a standard 8oz drip coffee, a serving of BCCB is roughly comparable to slightly higher in caffeine depending on dilution."
      }
    },
    {
      "@type": "Question",
      "name": "Why is BCCB cold brew different from other cold brew brands?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "BCCB publishes the full data for every batch it has ever made — temperature curves logged every few seconds, steep duration tracked to the minute, and yield measured from start to finish. This is called the Proof. Most cold brew companies offer no visibility into their process. BCCB also uses a 20-hour steep in cold filtered water with no heat, no preservatives, and no filler ingredients. Every batch is small by design."
      }
    },
    {
      "@type": "Question",
      "name": "Why does BCCB care so much about publishing batch proof and telemetry data?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Because claims without evidence are worthless. Any brand can say their coffee is high quality. BCCB built live sensor hardware — DS18B20 temperature probes and a load cell on an ESP32 microcontroller — into every brew specifically so customers can verify the process themselves. The data is published publicly on boldcrewcoldbrew.com for every batch. If it is not documented, it did not happen."
      }
    }
  ]
}
</script>
```

- [ ] **Step 3: Validate the JSON-LD**

With the dev server running (`npm run dev`), open:
```
https://search.google.com/test/rich-results?url=http://localhost:5173
```

Note: Google's tool may not reach localhost — paste the raw JSON into the "Code snippet" tab instead. Expected: both schemas validate with no errors. FAQPage should show 3 detected questions.

Alternatively, paste each JSON block into https://validator.schema.org and verify no errors.

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "feat: add Organization and FAQPage JSON-LD schemas"
```

---

### Task 3: Add missing OG and Twitter card tags

**Files:**
- Modify: `index.html` (after existing OG tags, before `<link rel="canonical">`)

- [ ] **Step 1: Insert the missing tags**

In `index.html`, find this block:
```html
<meta property="og:url" content="https://boldcrewcoldbrew.com">
<link rel="canonical" href="https://boldcrewcoldbrew.com">
```

Insert between those two lines:

```html
<meta property="og:image" content="https://boldcrewcoldbrew.com/img/la-cityscape.webp">
<meta property="og:image:width" content="1640">
<meta property="og:image:height" content="1093">
<meta property="og:site_name" content="Bold Crew Cold Brew">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="BCCB — Bold Crew Cold Brew · Los Angeles">
<meta name="twitter:description" content="Small batch cold brew steeped 20 hours in LA. Live telemetry. Full transparency. Every batch published.">
<meta name="twitter:image" content="https://boldcrewcoldbrew.com/img/la-cityscape.webp">
```

Note: `la-cityscape.webp` (1640×1093) is used because it is the only landscape image in `public/img/` — all other product images are portrait and will be cropped unfavorably in social cards.

- [ ] **Step 2: Verify OG tags render correctly**

With dev server running, copy the URL and paste into:
```
https://www.opengraph.xyz/
```

Or use the Facebook sharing debugger (requires login):
```
https://developers.facebook.com/tools/debug/
```

Expected: title, description, and image all populate. Image shows the LA cityscape landscape crop.

- [ ] **Step 3: Build and verify no regressions**

```bash
npm run build
```

Expected output (abbreviated):
```
✓ built in ~1.5s
```

No errors, no warnings about missing assets.

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "feat: add og:image, og:site_name, and Twitter card meta tags"
```

---

### Task 4: Push and verify deploy

- [ ] **Step 1: Push branch**

```bash
git push
```

- [ ] **Step 2: Deploy**

```bash
npm run deploy
```

Expected: gh-pages deploy completes, `https://boldcrewcoldbrew.com` updates within ~60 seconds.

- [ ] **Step 3: Verify llms.txt live**

Open `https://boldcrewcoldbrew.com/llms.txt`. Expected: plain text, no HTML.

- [ ] **Step 4: Validate live JSON-LD**

Go to `https://search.google.com/test/rich-results?url=https://boldcrewcoldbrew.com`. Expected: Organization and FAQPage both detected, no errors.

- [ ] **Step 5: Final commit if any fixes were needed**

If step 3 or 4 revealed issues, fix them, then:
```bash
git add -p
git commit -m "fix: correct llms.txt or schema issues found in live validation"
git push
npm run deploy
```
