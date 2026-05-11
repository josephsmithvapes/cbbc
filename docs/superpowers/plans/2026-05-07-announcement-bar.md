# Announcement Bar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a slim announcement bar below the fixed nav that describes BCCB's offer — full copy on desktop, condensed to "Premium Cold Brew · Weekly · Monthly · Single" on mobile.

**Architecture:** Two new CSS classes (`.announce-bar`, `.announce-mid`) added to the global stylesheet in `index.html`, plus one HTML element inserted after the closing `</nav>` tag. The "Transparency in Every Cup" middle span is hidden on mobile via a media query override.

**Tech Stack:** Plain HTML/CSS in `index.html` — no JS, no React component.

---

### Task 1: Add CSS

**Files:**
- Modify: `index.html` — global `<style>` block (ends at line ~745)

- [ ] **Step 1: Add base styles for `.announce-bar` and `.announce-mid`**

Find the `.logo-bc` rule block (around line 113) and add immediately after the closing `}` of the `.nav-fleur` rule:

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

- [ ] **Step 2: Add mobile override**

Inside the existing `@media (max-width: 768px)` block (around line 634), after the `.logo` rule, add:

```css
  .announce-bar { padding: 10px 16px; }
  .announce-mid { display: none; }
```

- [ ] **Step 3: Verify in browser**

Open `http://localhost:5173`. No visual change yet — classes exist but no element uses them.

---

### Task 2: Add HTML element

**Files:**
- Modify: `index.html` — after the closing `</nav>` tag (around line 1360)

- [ ] **Step 1: Insert the announce bar element**

Find:
```html
</nav>
```
(the closing tag of `<nav class="top-bar">`)

Insert immediately after it:
```html
<div class="announce-bar">
  Premium Cold Brew<span class="announce-mid"> · Transparency in Every Cup</span> · <span class="announce-tiers">Weekly · Monthly · Single</span>
</div>
```

- [ ] **Step 2: Verify desktop appearance**

Open `http://localhost:5173` at a viewport wider than 768px. Confirm:
- Slim strip appears between nav and the live hero section
- Full text reads: "Premium Cold Brew · Transparency in Every Cup · Weekly · Monthly · Single"
- "Weekly · Monthly · Single" renders in gold
- Rest of text is muted (semi-transparent cream)
- Border bottom is a faint gold rule

- [ ] **Step 3: Verify mobile appearance**

Resize browser to ≤768px (or use DevTools device emulation). Confirm:
- Strip shows only: "Premium Cold Brew · Weekly · Monthly · Single" on a single line
- "· Transparency in Every Cup" is hidden
- "Weekly · Monthly · Single" still gold

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "Add announcement bar — desktop full copy, mobile condensed"
```
