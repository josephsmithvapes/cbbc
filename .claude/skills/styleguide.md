---
name: styleguide
description: CBBC design system — typography, color, spacing, and component rules. Reference this before writing any CSS or JSX styles.
---

# CBBC Design System

## Typography

Two brand fonts — use nothing else without explicit approval.

| Role | Font | Usage |
|------|------|-------|
| **Display** | `'Alfa Slab One', serif` | Headlines, CTA buttons, large numerals |
| **Brand serif** | `'Cinzel', serif` | Logo, section labels, step counters, decorative caps |
| **Body / UI** | `system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif` | Body copy, form fields, captions, notes |

### CSS custom properties (defined in `:root`)

```css
--font-display: 'Alfa Slab One', serif;
--font-brand:   'Cinzel', serif;
--font-body:    system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
```

### Type scale

```
Display XL  : clamp(5rem, 16vw, 13rem)  line-height .85   letter-spacing -.02em
Display MD  : clamp(.9rem, 3vw, 1.4rem) line-height 1     letter-spacing .15em   (Cinzel)
Label / Cap : .55rem – .7rem            line-height 1.7   letter-spacing .12–.25em
Body        : .85rem – .95rem           line-height 1.9   letter-spacing .02em
Note / Fine : .52rem – .62rem           line-height 1.6   letter-spacing .14–.18em
```

### Rules
- Never use Oswald, Roboto Slab, or any other third-party font.
- All `letter-spacing` values use `em` units so they scale with font size.
- Decorative elements (⚜) always use `var(--font-brand)` or inherit from a Cinzel parent.

---

## Color

```css
--ink:   #0f0c06;   /* near-black — text, borders, backgrounds */
--cream: #f2ede0;   /* warm off-white — page background, input fill */
--gold:  #c9a84c;   /* brand gold — accents, hover states, strip */
```

### Usage rules
- **Ink** is the default for all text, borders, and dark fills.
- **Cream** is the page background; never use pure white as a surface.
- **Gold** is reserved for brand accents: logo, hover states, separator stripes, gradient text on panel titles.
- Opacity variants (`rgba(15,12,6, X)`) are preferred over grey tones:
  - `.42` — secondary body text
  - `.28` — captions / step counters
  - `.2`  — muted / decorative
  - `.14` — divider lines

### Gold gradient (panel titles)
```css
background: linear-gradient(135deg, #f0d878 0%, #c9a84c 55%, #9a7020 100%);
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
background-clip: text;
```

---

## Spacing

Base unit: **8px**

| Token | Value | Usage |
|-------|-------|-------|
| `--space-xs` | 8px  | Icon gaps, tight inline spacing |
| `--space-sm` | 16px | Component internal padding |
| `--space-md` | 24px | Between related elements |
| `--space-lg` | 48px | Between sections / grid gaps |
| `--space-xl` | 64px | Page edge padding (desktop) |

---

## Borders & Rules

- **Heavy rule**: `6px solid var(--ink)` — section dividers, outer borders
- **Mid rule**: `3px solid var(--ink)` — form inputs, buttons
- **Thin rule**: `1px solid rgba(15,12,6,.1)` — internal panel separators
- `border-radius: 0` everywhere — the brand is sharp-edged, not rounded.

---

## Layout

- Fixed right stripe: `64px` wide, `var(--gold)` background, hidden on mobile.
- Content max-width: `520px` per column inside `.mid` grid.
- Desktop main padding: `52px 64px`.
- Mobile breakpoint: `max-width: 700px` — stripe hidden, padding reduces to `28px 20px`.

---

## Animation

| Name | Duration | Easing | Usage |
|------|----------|--------|-------|
| `slide-up` | 0.5s | ease | Entrance for headline, rules, mid, bottom |
| `bp-shudder` | 3s | ease-in-out | Bean grind illustration loop |
| `bp-liq` | 3.5s | ease-in-out | Liquid fill in steep illustration |
| `bp-crack` | 3s | ease-in-out | Crack lines during grind |
| `fi / f2 / f3` | 2–3s | ease-in-out | Ice cube float in serve illustration |

Stagger entrance delays by `0.1s` per element.

---

## Component Patterns

### Buttons
```css
font-family: var(--font-display);
font-size: 1rem;
padding: 16px 24px;
border: 3px solid var(--ink);
background: var(--ink);
color: var(--cream);
border-radius: 0;
/* Hover */
background: var(--gold); border-color: var(--gold); color: var(--ink);
```

### Form inputs
```css
font-family: var(--font-body);
font-size: .95rem;
padding: 16px 18px;
border: 3px solid var(--ink); border-right: none;
background: var(--cream);
border-radius: 0;
```

### Panel step labels
```css
font-family: var(--font-brand);
font-size: .38rem;
letter-spacing: .25em;
color: var(--ink);
opacity: .28;
text-transform: uppercase;
```

### Panel titles
```css
font-family: var(--font-brand);
font-size: clamp(.7rem, 3vw, 1.1rem);
letter-spacing: .15em;
font-weight: 700;
/* Apply gold gradient — see Color section */
```

### Panel descriptions
```css
font-family: var(--font-body);
font-size: clamp(.48rem, 1.8vw, .62rem);
color: var(--ink);
opacity: .42;
line-height: 1.6;
```

---

## Checklist — before submitting styles

- [ ] Only `var(--font-display)`, `var(--font-brand)`, or `var(--font-body)` used
- [ ] Colors reference `var(--ink)`, `var(--cream)`, or `var(--gold)` — no raw hex except in SVGs
- [ ] `border-radius: 0` on all interactive elements
- [ ] Spacing uses multiples of 8px
- [ ] Mobile breakpoint (`max-width: 700px`) handled
- [ ] No new Google Fonts imports — both brand fonts already loaded in `index.html`
