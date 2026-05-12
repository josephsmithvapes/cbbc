# Mobile Blueprint Spine — Design Spec
**Date:** 2026-05-11
**Status:** Approved

## Summary

Add a vertical blueprint-style spine to the mobile page (≤960px only) that runs the full height of the page from nav to footer. The spine carries three spinning drip-drop SVG icons at varying sizes as decorative landmarks. No JS, no scroll listeners, respects `prefers-reduced-motion`.

---

## Visual Design

**Spine line:** A 1px dashed gold vertical rule, `position: fixed`, left edge (16px from viewport left). Implemented as a `repeating-linear-gradient` on a `::before` pseudo-element or a dedicated `<div>`. Fades in from the top and out at the bottom via a CSS mask.

**Color:** `rgba(201, 168, 76, 0.5)` — matches the existing `--gold` token used throughout the hero SVG.

**Section marks:** At each section boundary, a small circle node (8px, `border: 1.5px solid rgba(201,168,76,0.65)`) sits centered on the spine with a 10px horizontal tick extending right, followed by a `§N · LABEL` text label (6px, letter-spacing 0.18em). These are placed inline in the markup at the top of each section and are `aria-hidden="true"`.

**Drip icons:** Three inline SVG drip-drop shapes, spinning via CSS `animation: rotate`, placed at section boundaries along the spine:

| Position | Size | Speed | Direction |
|---|---|---|---|
| Hero → Waitlist boundary | 26px | 20s | clockwise |
| Telemetry → Archive boundary | 16px | 12s | counter-clockwise |
| Archive → Story boundary | 10px | 8s | clockwise |

All three are `aria-hidden="true"` and `position: absolute` centered on the spine x-axis.

---

## Scope

The spine covers the full page — both the React-mounted sections (`brew-mount`) and the static HTML sections (story, merch, capture, invest, footer). This means changes touch both `index.html` and the React component tree.

**Sections and their marks:**

| Mark | Location | File |
|---|---|---|
| `LIVE BREW` | Top of HeroSection | `HeroSection.jsx` |
| `§01 · RESERVE` | Top of WaitlistSection | `WaitlistSection.jsx` |
| `§02 · STAGE` | Top of BrewStageDisplay | `BrewStageDisplay.jsx` |
| `§03 · TELEMETRY` | Top of BrewTelemetry | `BrewTelemetry.jsx` |
| `§04 · ARCHIVE` | `#batches` section | `App.jsx` |
| `§05 · STORY` | `.story` section | `index.html` |
| `§06 · MERCH` | `.merch` section | `index.html` |
| `§07 · INVEST` | `#invest` div | `index.html` |
| `EOF` | Footer | `index.html` |

---

## Implementation

### 1. Spine element — `index.html`

Add a single `<div class="blueprint-spine" aria-hidden="true"></div>` as the first child of `<body>`. All spine positioning lives in CSS, injected as an inline `<style>` block in `index.html` (where the rest of the page CSS already lives).

```css
@media (max-width: 960px) {
  .blueprint-spine {
    position: fixed;
    left: 16px;
    top: 0; bottom: 0;
    width: 1px;
    background: repeating-linear-gradient(
      to bottom,
      rgba(201,168,76,0.5) 0px, rgba(201,168,76,0.5) 4px,
      transparent 4px, transparent 9px
    );
    -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 5%, black 95%, transparent 100%);
    mask-image: linear-gradient(to bottom, transparent 0%, black 5%, black 95%, transparent 100%);
    pointer-events: none;
    z-index: 50;
  }
}
```

### 2. Drip icons — inline SVG

Three drip SVGs placed at section boundaries in the markup. Each is `position: absolute; left: 16px; transform: translateX(-50%); z-index: 51; pointer-events: none; aria-hidden: true`.

The drip path: `M cx cy C cx cy cx cy cx cy Z` — a teardrop shape with a crosshair inside for the large size.

CSS for spin animation (added to the same `@media` block):

```css
@media (max-width: 960px) {
  @keyframes blueprint-spin { to { transform: translateX(-50%) rotate(360deg); } }
  @keyframes blueprint-spin-ccw { to { transform: translateX(-50%) rotate(-360deg); } }
  @media (prefers-reduced-motion: reduce) {
    .bp-drip { animation: none !important; }
  }
  .bp-drip { position: absolute; left: 16px; transform: translateX(-50%); z-index: 51; pointer-events: none; }
  .bp-drip-cw  { animation: blueprint-spin     var(--bp-dur, 18s) linear infinite; }
  .bp-drip-ccw { animation: blueprint-spin-ccw var(--bp-dur, 18s) linear infinite; }
}
```

Placement in markup:
- **Large drip (26px, 20s CW):** At the top of `WaitlistSection.jsx` return, before the section's first element
- **Medium drip (16px, 12s CCW):** At the top of `BrewTelemetry.jsx` return, before the section's first element
- **Small drip (10px, 8s CW):** In `index.html`, just before the `.story` section

### 3. Section marks

Each section mark is:
```html
<div class="bp-mark" aria-hidden="true">
  <span class="bp-node"></span>
  <span class="bp-tick"></span>
  <span class="bp-label">§01 · RESERVE</span>
</div>
```

CSS:
```css
@media (max-width: 960px) {
  .bp-mark {
    position: absolute; left: 0; top: 16px;
    display: flex; align-items: center;
    pointer-events: none;
  }
  .bp-node {
    width: 8px; height: 8px; border-radius: 50%;
    border: 1.5px solid rgba(201,168,76,0.65);
    background: var(--dark, #0d0a05);
    margin-left: 12px; flex-shrink: 0;
  }
  .bp-tick { width: 10px; height: 1px; background: rgba(201,168,76,0.4); flex-shrink: 0; }
  .bp-label {
    font-family: var(--font-brand); font-size: 6px;
    color: rgba(201,168,76,0.55); letter-spacing: 0.18em;
    text-transform: uppercase; white-space: nowrap;
  }
}
```

Each React section that receives a mark needs `position: relative` on its root element and `padding-left: 28px` on mobile to make room for the spine + mark.

### 4. Mobile padding

All sections need left breathing room on mobile so content doesn't sit under the spine. Wherever a section doesn't already have adequate left padding on mobile, add `padding-left: 28px` inside the `@media (max-width: 960px)` block.

---

## Accessibility

- Spine div, all drip icons, all section marks: `aria-hidden="true"`
- No focus management changes
- `prefers-reduced-motion: reduce` stops all CSS animations instantly
- Section headings retain full semantic structure — the decorative marks are purely visual

## Performance

- Spine: one CSS `position: fixed` element, composited, zero paint cost after first frame
- Drip animations: CSS `transform: rotate` — compositor thread only, no layout/paint
- Three small inline SVGs (~150 bytes each), no network requests
- Zero JS
- No effect on desktop Lighthouse score (entire feature gated by `@media (max-width: 960px)`)
