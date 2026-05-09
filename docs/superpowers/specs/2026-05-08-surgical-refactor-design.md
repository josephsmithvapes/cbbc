# Design: Surgical Refactor — cbbc-live

**Date:** 2026-05-08
**Scope:** Security fix, naming, CSS Modules, Vitest unit tests. No appearance or functionality changes.

---

## 1. Component Renames

| Old name | New name | Reason |
|---|---|---|
| `FirstBatch` | `WaitlistSection` | Shows waitlist signup + progress toward maiden batch |
| `LiveBatch` | `BrewStageDisplay` | Shows current brew stage: grinding / steeping / ready |
| `BrewMonitor` | `BrewTelemetry` | Temperature chart + brew telemetry metrics |
| `BrewFlow` | `BrewProgressBar` | Step-by-step progress indicator (grind → steep → ready) |
| `BrewPanels` | `ProductInfoPanels` | Three product info/story panels |
| `BatchProof` | `BatchDetails` | Displays batch metadata (origin, roast, tasting notes) |
| `AdminPanel` | `AdminPanel` | Keep — already clear |

File moves:
- `src/BrewPanels.jsx` → `src/components/ProductInfoPanels.jsx`
- All other component files renamed in-place within `src/components/`

---

## 2. Security

**Problem:** `VITE_ADMIN_PASS` is bundled into the client JS. The `?admin` URL param exposes the admin panel on the public site.

**Solution:**
- `AdminPanel` is only rendered when `import.meta.env.DEV === true` in `App.jsx`. It is tree-shaken out of production builds entirely — never ships to boldcrewcoldbrew.com.
- Remove `VITE_ADMIN_PASS` from `.env` and `AdminPanel.jsx`.
- Replace the client-side password check with Supabase Auth (`supabase.auth.signInWithPassword`).
- Add a `useAuth` hook to `src/lib/hooks.js` that wraps `supabase.auth.getSession()` + `onAuthStateChange`.
- Admin user is created once in the Supabase dashboard (Authentication → Users → Invite user). No password in code or `.env`.
- The `?admin` URL param remains as the dev-only trigger in `App.jsx`.

---

## 3. Styling — CSS Modules + Shared Theme

**Problem:** Same 5 color constants (`INK`, `GOLD`, `CREAM`, `RULE`, `GOLD_GRAD`) duplicated in every component file. Each component injects a `<style>` tag at runtime.

**Solution:**

**`src/theme.js`** — used in JSX only (SVG inline colors, dynamic inline styles):
```js
export const INK       = '#161108'
export const GOLD      = '#c9a84c'
export const CREAM     = '#f2ede0'
export const RULE      = 'rgba(201,168,76,.15)'
export const GOLD_GRAD = 'linear-gradient(135deg, #f0d878 0%, #c9a84c 55%, #9a7020 100%)'
```

CSS module files hardcode hex values directly — CSS cannot import JS variables. The hex values are already present verbatim in the current CSS template strings, so no values change.

Each component gets a `.module.css` file containing its existing CSS verbatim (class names unchanged). The inline `<style>` tag and `const css` string are removed from the JSX. Components import styles via:
```js
import styles from './WaitlistSection.module.css'
// usage: className={styles.wrap}
```

CSS custom properties from the host HTML page (`--font-brand`, `--font-display`, `--t-label`, etc.) remain referenced in CSS module files unchanged.

**Note:** CSS Modules scope class names at build time. Since the existing class names are only used within their own component, scoping causes no conflicts. The compiled output is equivalent to the current injected styles.

---

## 4. Tests — Vitest Unit Tests

**Setup:**
- Add `vitest` and `jsdom` to `devDependencies`
- Add `"test": "vitest"` to `package.json` scripts
- Configure `vite.config.js` to include `test: { environment: 'jsdom' }`

**Test file:** `src/lib/__tests__/utils.test.js`

Covers the pure utility functions extracted from component files:
- `fmt(ms)` — formats milliseconds as `HH:MM:SS`
- `toTempF(rows)` — converts `temp_c` rows to `temp_f`
- `calcRemaining(steepStart)` — countdown from steep start timestamp

These functions are moved to `src/lib/utils.js` and imported by the components that need them, making them independently testable.

---

## 5. File Structure After Refactor

```
src/
  theme.js                          ← NEW: shared color tokens
  lib/
    supabase.js                     ← unchanged
    hooks.js                        ← add useAuth hook, remove inline utils
    utils.js                        ← NEW: fmt, toTempF, calcRemaining
    __tests__/
      utils.test.js                 ← NEW: Vitest unit tests
  components/
    WaitlistSection.jsx             ← was FirstBatch.jsx
    WaitlistSection.module.css      ← NEW
    BrewStageDisplay.jsx            ← was LiveBatch.jsx
    BrewStageDisplay.module.css     ← NEW
    BrewTelemetry.jsx               ← was BrewMonitor.jsx
    BrewTelemetry.module.css        ← NEW
    BrewProgressBar.jsx             ← was BrewFlow.jsx
    BrewProgressBar.module.css      ← NEW
    ProductInfoPanels.jsx           ← was src/BrewPanels.jsx
    ProductInfoPanels.module.css    ← NEW
    BatchDetails.jsx                ← was BatchProof.jsx
    BatchDetails.module.css         ← NEW
  pages/
    AdminPanel.jsx                  ← updated: Supabase Auth login
    AdminPanel.module.css           ← NEW
  App.jsx                           ← updated: DEV guard, new import names
  main.jsx                          ← updated: new import names
```

---

## 6. Out of Scope

- No routing library (React Router) — the `?admin` dev pattern is sufficient for localhost-only use
- No component rendering tests — Supabase mocking adds complexity without proportional value
- No appearance changes — all CSS values, animations, and layout are preserved verbatim
- No new features
