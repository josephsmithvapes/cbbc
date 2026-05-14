# BCCB Styling Consistency, Accessibility & Performance Design
**Date:** 2026-05-13  
**Status:** Approved for implementation

---

## Problem

The new `index.html` (manifesto-based) and the three React components (`BrewStageDisplay`, `BrewTelemetry`, `BatchDetails`) use two incompatible visual systems:

| | HTML (manifesto) | React components |
|---|---|---|
| Background | `#e8e3d3` paper | `#161108` dark |
| Accent | `#c8421f` red | `#c9a84c` gold |
| Font (labels) | JetBrains Mono | Space Grotesk / DM Mono |
| Font (prose) | Inter Tight | Space Grotesk |
| CSS vars | `--f-display`, `--f-mono` | `--font-display`, `--font-brand` |

CSS variable names don't match, so fonts don't bridge. Hardcoded hex values in CSS modules mean bridging via variable aliases alone won't work.

---

## Decisions

### Palette
- **Primary background:** `#e8e3d3` (paper) — section bodies
- **Secondary background:** `#efeadb` (paper-soft) — data cells, card insets
- **Ink:** `#0d0a05` — headings, body text, borders
- **Red:** `#c8421f` — live status dot, progress bar, active states, eyebrows
- **Sepia:** `#7a4f28` — data values (big numbers: temp, mass, yield, duration, chart lines)
- **Fade:** `rgba(13,10,5,.42)` — label keys, meta text
- **Rule:** `rgba(13,10,5,.14)` — dividers, cell borders

### Typography
- **Display / numbers:** Alfa Slab One (unchanged everywhere)
- **Labels, eyebrows, data keys, meta:** Space Grotesk 500
- **Body prose:** Space Grotesk 400
- **Signatures:** Caveat (unchanged, only in #updates)
- **Remove:** JetBrains Mono, Inter Tight, DM Mono — consolidate to Space Grotesk only

### Email Capture
- Inline form in `#updates` (already exists)
- Sticky bar: slides up from bottom after user scrolls past `.commitments` section; dismissible; respects `localStorage` (7-day cooldown after dismiss)

---

## Scope

### 1. `index.html` — CSS token cleanup
- Update `:root` to define unified tokens used by both HTML and React via CSS vars:
  ```css
  --font-display: 'Alfa Slab One', serif;
  --font-brand:   'Space Grotesk', sans-serif;
  --t-micro:  0.625rem;
  --t-label:  0.6875rem;
  --t-small:  0.8125rem;
  --t-body:   0.9375rem;
  --nav-h:    56px;
  --ink:      #0d0a05;
  --paper:    #e8e3d3;
  --paper-soft: #efeadb;
  --red:      #c8421f;
  --sepia:    #7a4f28;
  --fade:     rgba(13,10,5,.42);
  --rule:     rgba(13,10,5,.14);
  ```
- Replace Google Fonts link — load only `Alfa Slab One`, `Space Grotesk` (400, 500, 700), `Caveat` (400, 700)
- Add `font-display: swap` to all `@font-face` declarations
- Update all inline `--f-display`, `--f-mono`, `--f-sans` references to the new var names
- Add sticky bar HTML + styles + JS (see below)

### 2. `BrewTelemetry.module.css` — full palette rewrite
Replace every hardcoded dark/gold value:
- `background: #161108` → `var(--paper-soft)` for `.wrap`, `.body`, `.metric`
- `color: #c9a84c` (gold) → `var(--sepia)` for `.countdown`, `.metricValue`, `.statusText`
- `color: #f2ede0` (cream) → `var(--ink)` for text
- `rgba(201,168,76,…)` borders/rules → `var(--rule)`
- Progress fill gradient → solid `var(--red)`
- `.dot.live` → `background: var(--red)`, pulse animation unchanged
- `.statusText.idle` → `color: var(--fade)`
- Chart border → `rgba(13,10,5,.1)`
- Spinner → `color: var(--sepia)`

### 3. `BrewStageDisplay.module.css` — full palette rewrite
- `.wrap`, `.body` background → `var(--paper-soft)`
- `.display` (gold gradient large text) → `color: var(--sepia)`, remove gradient
- `.display.dim` → `color: var(--fade)`
- `.stageTitle` → `color: var(--ink)`, opacity removed
- `.sub`, `.batchTag` → `color: var(--fade)`
- Border → `var(--rule)`
- Animation keyframes unchanged

### 4. `BatchDetails.module.css` — full palette rewrite
- `.section` background → `var(--paper)`, remove radial-gradient dot pattern
- `.section` borders → `var(--rule)`
- `.eyebrow` → `color: var(--red)`, remove opacity
- `.headline` → `color: var(--ink)`
- `.goldText` (gradient) → `color: var(--sepia)`, remove gradient/clip
- `.body` prose → `color: var(--ink)`, remove opacity
- `.pill` → `color: var(--sepia)`, `border-color: rgba(122,79,40,.25)`
- `.card` background → `var(--paper-soft)`, border → `var(--rule)`
- `.card:hover` → `background: #e8e3d3`
- `.cardHeader` border → `var(--rule)`
- `.date` → `color: var(--fade)`, remove opacity
- `.duration`, `.name` → `color: var(--sepia)`, remove gradient/clip
- `.metaRow` → `color: var(--fade)`
- `.tasting` → `color: var(--ink)`, opacity → .55
- `.stat` border → `var(--rule)`
- `.statVal` → `color: var(--sepia)`, remove gradient/clip
- `.statLbl` → `color: var(--fade)`, remove opacity
- `.spinner` → `color: var(--sepia)`
- `.empty` → `color: var(--fade)`
- Chart area fill → `rgba(122,79,40,.12)`; chart line → `var(--sepia)`

### 5. `theme.js` — update exported constants
```js
export const INK    = '#0d0a05'
export const PAPER  = '#e8e3d3'
export const SEPIA  = '#7a4f28'
export const RED    = '#c8421f'
export const RULE   = 'rgba(13,10,5,.14)'
export const CREAM  = '#e8e3d3'   // alias kept for any remaining references
export const GOLD   = '#7a4f28'   // alias → sepia, avoids touching JSX
export const GOLD_GRAD = '#7a4f28' // remove gradient, plain sepia
```
Keeping `GOLD` and `GOLD_GRAD` as aliases means JSX files need no changes — they already reference these constants inline.

### 6. Sticky email bar
HTML added to `index.html` before `</body>`:
```html
<div class="sticky-bar" id="sticky-bar" aria-label="Email signup" role="complementary">
  <span class="sticky-bar-label">Get the dispatch.</span>
  <form class="sticky-bar-form" id="sticky-form" novalidate>
    <label for="sticky-email" class="visually-hidden">Email address</label>
    <input type="email" id="sticky-email" class="sticky-bar-input" placeholder="you@domain" autocomplete="email" required>
    <button type="submit" class="sticky-bar-btn">WITNESS →</button>
  </form>
  <button class="sticky-bar-dismiss" aria-label="Dismiss" onclick="dismissStickyBar()">×</button>
</div>
```

CSS: slides up from `translateY(100%)` to `translateY(0)` on scroll trigger. Paper background, ink border-top, red submit button. Respects `prefers-reduced-motion`.

JS trigger: `IntersectionObserver` on `.commitments` section — bar appears when commitments scroll out of view. Dismiss writes timestamp to `localStorage`; suppressed for 7 days after dismiss. Form submits to Buttondown (same action as main form).

### 7. Accessibility
- All interactive elements have visible `:focus-visible` outline (`2px solid var(--red)`, `outline-offset: 3px`)
- Sticky bar and story toggle buttons have `aria-expanded` and `aria-controls`
- Color contrast: sepia `#7a4f28` on paper `#e8e3d3` = 4.6:1 (passes AA for large text / UI components); ink `#0d0a05` on paper = 17.5:1 (passes AAA)
- Red `#c8421f` on paper = 3.8:1 — fails AA for body text (<18px normal / <14px bold). **Known brand trade-off:** red is used for eyebrow labels (9–11px, uppercase, widely-spaced) and live status indicators. These are accepted as brand-intentional decorative elements. Red is never used for body prose or the primary body text color.
- `prefers-reduced-motion`: all animations and transitions wrapped in `@media` check
- Remove `opacity` on text elements that reduce contrast below 4.5:1 — use explicit low-contrast colors instead so screen readers and tools can measure accurately

### 8. Performance
- Consolidate Google Fonts request to one URL covering only the three fonts in use: Alfa Slab One, Space Grotesk (400,500,700), Caveat (400,700)
- Add `font-display: swap` (already present on self-hosted fonts; add to Google Fonts via `&display=swap`)
- Remove unused `preload` hints in `index.html` for fonts no longer loaded (JetBrains Mono, Inter Tight, DM Mono woff2 files)
- Remove unused `preconnect` to `fonts.gstatic.com` if no longer using Google Fonts for those faces

---

## Out of Scope
- Routing changes
- React component logic / data fetching
- `HeroSection.jsx` and `WaitlistSection.jsx` (removed from App, not restyled)
- Image optimization
- PWA / service worker

---

## File Checklist
- `index.html`
- `src/theme.js`
- `src/components/BrewTelemetry.module.css`
- `src/components/BrewStageDisplay.module.css`
- `src/components/BatchDetails.module.css`
