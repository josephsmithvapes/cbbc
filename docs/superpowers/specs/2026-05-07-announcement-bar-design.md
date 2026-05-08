# Announcement Bar — Design Spec
**Date:** 2026-05-07

## Summary

A single slim strip placed directly below the fixed nav bar that implicitly describes what BCCB offers. Uses the Cinzel display font with `·` separators, condensed to one line on desktop and two short lines on mobile.

## Placement

- Fixed nav (`top-bar`) sits at the top
- Announcement bar renders immediately after the nav, before `#live` section
- It is **not** fixed — it scrolls with the page
- On mobile the bar is visible above the live hero

## Content

```
Premium Cold Brew · Transparency in Every Cup · Weekly · Monthly · Single
```

- `Weekly · Monthly · Single` renders in gold (`var(--gold)`)
- The rest renders at ~55% cream opacity
- Copy is final — no CMS or dynamic content needed

## Visual Spec

| Property | Value |
|---|---|
| Font | `var(--font-display)` (Cinzel) |
| Font size | `10.5px` |
| Letter spacing | `0.08em` |
| Text color | `rgba(242,237,224,.55)` |
| Gold color | `var(--gold)` — `#c9a84c` |
| Background | transparent (inherits `var(--ink)`) |
| Border bottom | `1px solid rgba(201,168,76,.08)` |
| Padding | `10px 24px` |
| Alignment | centered |

## Responsive

- **Desktop:** single line, no wrapping needed at typical viewport widths
- **Mobile (≤768px):** padding reduced to `10px 16px`, font stays the same, text wraps naturally to 2 lines — no special treatment needed

## Implementation

Single HTML element added to `index.html` directly after the `<nav class="top-bar">` closing tag:

```html
<div class="announce-bar">
  Premium Cold Brew · Transparency in Every Cup ·
  <span class="announce-tiers">Weekly · Monthly · Single</span>
</div>
```

Two CSS rules added to the global stylesheet:

```css
.announce-bar {
  text-align: center;
  padding: 10px 24px;
  border-bottom: 1px solid rgba(201,168,76,.08);
  font-family: var(--font-display);
  font-size: 10.5px;
  letter-spacing: .08em;
  color: rgba(242,237,224,.55);
  line-height: 1.65;
}
.announce-tiers { color: var(--gold); }
```

Mobile override inside the existing `@media (max-width: 768px)` block:

```css
.announce-bar { padding: 10px 16px; }
```

## Out of Scope

- No animation or ticker behaviour
- No close/dismiss button
- No link on the tier names (handled by nav tabs)
