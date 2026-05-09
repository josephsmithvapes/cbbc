# Surgical Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor cbbc-live into professionally structured React code — fix a real security vulnerability (client-side admin password), extract shared style tokens, convert to CSS Modules, rename components to match their actual purpose, and add Vitest unit tests for pure utility functions.

**Architecture:** The app is a Vite + React 19 project that mounts two React roots into a static HTML landing page. `App` → `WaitlistSection` + `BrewStageDisplay` + `BrewTelemetry` is the public view; `AdminPanel` (localhost-only, DEV-gated) is for operator control. Supabase provides real-time data and will now also provide authentication for admin.

**Tech Stack:** React 19, Vite 8, Supabase JS v2, Vitest, jsdom

---

## File Map

### New files
| Path | Purpose |
|---|---|
| `src/theme.js` | Shared color tokens for JSX inline use |
| `src/lib/utils.js` | Pure utility functions extracted from components |
| `src/lib/__tests__/utils.test.js` | Vitest unit tests |
| `src/components/WaitlistSection.jsx` | Replaces FirstBatch.jsx |
| `src/components/WaitlistSection.module.css` | CSS module for WaitlistSection |
| `src/components/BrewStageDisplay.jsx` | Replaces LiveBatch.jsx |
| `src/components/BrewStageDisplay.module.css` | CSS module for BrewStageDisplay |
| `src/components/BrewTelemetry.jsx` | Replaces BrewMonitor.jsx |
| `src/components/BrewTelemetry.module.css` | CSS module for BrewTelemetry |
| `src/components/BrewProgressBar.jsx` | Replaces BrewFlow.jsx |
| `src/components/ProductInfoPanels.jsx` | Replaces src/BrewPanels.jsx (moved) |
| `src/components/ProductInfoPanels.module.css` | CSS module for ProductInfoPanels |
| `src/components/BatchDetails.jsx` | Replaces BatchProof.jsx |
| `src/components/BatchDetails.module.css` | CSS module for BatchDetails |
| `src/pages/AdminPanel.module.css` | CSS module for AdminPanel (if needed) |

### Modified files
| Path | Change |
|---|---|
| `vite.config.js` | Add `test: { environment: 'jsdom' }` |
| `package.json` | Add vitest + jsdom, add `test` script |
| `src/lib/hooks.js` | Add `useAuth` hook, remove inline utils |
| `src/pages/AdminPanel.jsx` | Replace password auth with Supabase Auth, DEV-only note |
| `src/App.jsx` | Update imports, add `import.meta.env.DEV` guard for admin |
| `src/main.jsx` | Update imports to new component names |
| `.env` | Remove `VITE_ADMIN_PASS` line |

### Deleted files
`src/components/FirstBatch.jsx`, `src/components/LiveBatch.jsx`, `src/components/BrewMonitor.jsx`, `src/components/BrewFlow.jsx`, `src/components/BatchProof.jsx`, `src/BrewPanels.jsx`

---

## CSS Module Pattern

**How CSS Modules work in Vite:** Write normal CSS in `.module.css` with your class names. Import as `import styles from './Foo.module.css'`. Use `className={styles.wrap}` in JSX. Vite generates scoped output like `Foo_wrap_abc123` — no global conflicts.

**Class name convention in this plan:** Strip the component prefix, convert to camelCase.
- `.fb-stage-title` → `.stageTitle`
- `.bm-chart-wrap` → `.chartWrap`
- `.bp-bean-g` → `.beanG`

**CSS content:** For each component, the CSS module content is the existing `css` template string from the current file, with:
1. Class names renamed per the mapping table in each task
2. `@keyframes` names renamed to camelCase (Vite scopes them locally)
3. The hardcoded hex values stay as-is (CSS can't import JS)

**Combining classes (e.g. modifier pattern):**
```jsx
// Instead of className="lb-display dim"
className={[styles.display, isDim && styles.dim].filter(Boolean).join(' ')}
```

**Note on `BrewProgressBar`:** This component uses only inline styles (no CSS string). It needs no `.module.css` file.

---

## Task 1: Install Vitest and configure

**Files:**
- Modify: `package.json`
- Modify: `vite.config.js`

- [ ] **Step 1: Install dependencies**

```bash
cd /Users/madsens/Downloads/cbbc-live
npm install --save-dev vitest jsdom
```

- [ ] **Step 2: Add test script to package.json**

In `package.json`, add `"test": "vitest"` to the `scripts` block:

```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "lint": "eslint .",
  "preview": "vite preview",
  "test": "vitest",
  "predeploy": "npm run build",
  "deploy": "gh-pages -d dist"
},
```

- [ ] **Step 3: Add test config to vite.config.js**

Replace the contents of `vite.config.js` with:

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',
  test: {
    environment: 'jsdom',
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('react') || id.includes('react-dom')) return 'react'
          if (id.includes('@supabase')) return 'supabase'
        },
      },
    },
  },
})
```

- [ ] **Step 4: Verify Vitest runs**

```bash
npx vitest --run 2>&1 | head -20
```

Expected: "No test files found" or similar (no errors about missing config).

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json vite.config.js
git commit -m "chore: add Vitest with jsdom test environment"
```

---

## Task 2: Create utils.js and write unit tests

**Files:**
- Create: `src/lib/utils.js`
- Create: `src/lib/__tests__/utils.test.js`

These functions are currently defined inline inside `LiveBatch.jsx` (`fmt`, `calcRemaining`) and `hooks.js` (`toTempF`). Extracting them makes them testable.

- [ ] **Step 1: Write the failing tests first**

Create `src/lib/__tests__/utils.test.js`:

```js
import { describe, it, expect } from 'vitest'
import { fmt, calcRemaining, toTempF, STEEP_HOURS } from '../utils'

describe('fmt', () => {
  it('returns --:--:-- for null', () => {
    expect(fmt(null)).toBe('--:--:--')
  })
  it('returns --:--:-- for undefined', () => {
    expect(fmt(undefined)).toBe('--:--:--')
  })
  it('formats zero as 00:00:00', () => {
    expect(fmt(0)).toBe('00:00:00')
  })
  it('formats 1 hour as 01:00:00', () => {
    expect(fmt(3_600_000)).toBe('01:00:00')
  })
  it('formats mixed h/m/s with padding', () => {
    expect(fmt(3_661_000)).toBe('01:01:01')
  })
  it('pads single-digit seconds', () => {
    expect(fmt(65_000)).toBe('00:01:05')
  })
})

describe('toTempF', () => {
  it('converts 0°C → 32°F', () => {
    expect(toTempF([{ temp_c: 0 }])).toEqual([{ temp_f: 32 }])
  })
  it('converts 100°C → 212°F', () => {
    expect(toTempF([{ temp_c: 100 }])).toEqual([{ temp_f: 212 }])
  })
  it('handles multiple rows', () => {
    expect(toTempF([{ temp_c: 0 }, { temp_c: 100 }])).toEqual([
      { temp_f: 32 },
      { temp_f: 212 },
    ])
  })
  it('returns empty array for empty input', () => {
    expect(toTempF([])).toEqual([])
  })
})

describe('calcRemaining', () => {
  it('returns null for null steepStart', () => {
    expect(calcRemaining(null)).toBeNull()
  })
  it('returns null for empty string steepStart', () => {
    expect(calcRemaining('')).toBeNull()
  })
  it('returns null for undefined steepStart', () => {
    expect(calcRemaining(undefined)).toBeNull()
  })
  it('returns 0 when steep period has fully elapsed', () => {
    const longAgo = new Date(Date.now() - (STEEP_HOURS + 1) * 3_600_000).toISOString()
    expect(calcRemaining(longAgo)).toBe(0)
  })
  it('returns positive ms when steep is still in progress', () => {
    const justStarted = new Date().toISOString()
    const result = calcRemaining(justStarted)
    expect(result).toBeGreaterThan(0)
    expect(result).toBeLessThanOrEqual(STEEP_HOURS * 3_600_000)
  })
})
```

- [ ] **Step 2: Run tests — expect all to fail**

```bash
npx vitest --run src/lib/__tests__/utils.test.js 2>&1
```

Expected: All tests fail with "Cannot find module '../utils'".

- [ ] **Step 3: Create src/lib/utils.js**

```js
export const STEEP_HOURS = 20

export function fmt(ms) {
  if (ms === null || ms === undefined) return '--:--:--'
  const h = Math.floor(ms / 3_600_000)
  const m = Math.floor((ms % 3_600_000) / 60_000)
  const s = Math.floor((ms % 60_000) / 1_000)
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function calcRemaining(steepStart) {
  if (!steepStart) return null
  const end = new Date(steepStart).getTime() + STEEP_HOURS * 3_600_000
  const diff = end - Date.now()
  return diff > 0 ? diff : 0
}

export function toTempF(rows) {
  return rows.map(r => ({ temp_f: r.temp_c * 9 / 5 + 32 }))
}
```

- [ ] **Step 4: Run tests — expect all to pass**

```bash
npx vitest --run src/lib/__tests__/utils.test.js 2>&1
```

Expected: All 13 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/lib/utils.js src/lib/__tests__/utils.test.js
git commit -m "feat: extract utility functions with Vitest unit tests"
```

---

## Task 3: Create theme.js

**Files:**
- Create: `src/theme.js`

Used by JSX only (SVG inline colors, dynamic inline styles). CSS module files hardcode hex values directly since CSS cannot import JS.

- [ ] **Step 1: Create src/theme.js**

```js
export const INK       = '#161108'
export const GOLD      = '#c9a84c'
export const CREAM     = '#f2ede0'
export const RULE      = 'rgba(201,168,76,.15)'
export const GOLD_GRAD = 'linear-gradient(135deg, #f0d878 0%, #c9a84c 55%, #9a7020 100%)'
```

- [ ] **Step 2: Commit**

```bash
git add src/theme.js
git commit -m "chore: add shared theme color tokens"
```

---

## Task 4: Add useAuth hook to hooks.js

**Files:**
- Modify: `src/lib/hooks.js`

Also update `toTempF` to import from utils instead of being defined inline.

- [ ] **Step 1: Update src/lib/hooks.js**

Replace the full contents with:

```js
import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import { toTempF, STEEP_HOURS } from './utils'

let _channelId = 0
const uid = () => `${++_channelId}-${Date.now()}`

export function useAuth() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  return { session, loading }
}

export function useBatchState() {
  const [data, setData] = useState(null)

  useEffect(() => {
    supabase.from('batch_state').select('*').eq('id', 1).single()
      .then(({ data }) => { if (data) setData(data) })

    const ch = supabase.channel(`batch-state-${uid()}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'batch_state' },
        ({ new: row }) => setData(row))
      .subscribe()

    return () => supabase.removeChannel(ch)
  }, [])

  return data
}

export function useBrewState() {
  const [data, setData] = useState(null)

  useEffect(() => {
    supabase.from('brew_state').select('*').eq('id', 1).single()
      .then(({ data }) => { if (data) setData(data) })

    const ch = supabase.channel(`brew-state-${uid()}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'brew_state' },
        ({ new: row }) => setData(row))
      .subscribe()

    return () => supabase.removeChannel(ch)
  }, [])

  return data
}

export function useWaitlistCount() {
  const [count, setCount] = useState(null)

  useEffect(() => {
    supabase.from('waitlist_entries').select('id', { count: 'exact' }).limit(0)
      .then(({ count: c }) => { if (c != null) setCount(c) })
  }, [])

  return count
}

export function useTemperatureReadings(limit = 120) {
  const [readings, setReadings] = useState([])

  useEffect(() => {
    supabase.from('temperature_readings')
      .select('temp_c, recorded_at')
      .order('recorded_at', { ascending: false })
      .limit(limit)
      .then(({ data }) => {
        if (data?.length) setReadings(toTempF(data.reverse()))
      })

    const ch = supabase.channel(`temperature-readings-${uid()}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'temperature_readings' },
        ({ new: row }) => setReadings(prev => [...prev.slice(-(limit - 1)), toTempF([row])[0]]))
      .subscribe()

    return () => supabase.removeChannel(ch)
  }, [limit])

  return readings
}
```

- [ ] **Step 2: Run tests to confirm nothing broke**

```bash
npx vitest --run 2>&1
```

Expected: All 13 tests still pass.

- [ ] **Step 3: Commit**

```bash
git add src/lib/hooks.js
git commit -m "feat: add useAuth hook, import toTempF from utils"
```

---

## Task 5: Convert WaitlistSection (was FirstBatch)

**Files:**
- Create: `src/components/WaitlistSection.jsx`
- Create: `src/components/WaitlistSection.module.css`

**Class name mapping** (old `fb-*` → camelCase module):

| Old class | Module class |
|---|---|
| `.fb-wrap` | `.wrap` |
| `.fb-header` | `.header` |
| `.fb-label` | `.label` |
| `.fb-maiden` | `.maiden` |
| `.fb-badge` | `.badge` |
| `.fb-body` | `.body` |
| `.fb-cityscape` | `.cityscape` |
| `.fb-inner` | `.inner` |
| `.fb-stage-title` | `.stageTitle` |
| `.fb-display` | `.display` |
| `.fb-display.dim` | `.display.dim` |
| `.fb-sub` | `.sub` |
| `.fb-count-label` | `.countLabel` |
| `.fb-meter-bar` | `.meterBar` |
| `.fb-meter-fill` | `.meterFill` |
| `@keyframes fb-float` | `@keyframes animFloat` |
| `.fb-anim-float` | `.animFloat` |

- [ ] **Step 1: Create WaitlistSection.module.css**

Copy the CSS string from `src/components/FirstBatch.jsx` (the `css` template literal content, everything between the backticks). Paste into `src/components/WaitlistSection.module.css`, then rename all class names per the table above. Remove the surrounding backtick template literal — this is a plain CSS file.

The resulting file should start like:
```css
.wrap {
  width: 100%;
  border-bottom: 1px solid rgba(201,168,76,.15);
  background: #161108;
}
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 24px;
  border-bottom: 1px solid rgba(201,168,76,.15);
  background: #161108;
  position: relative;
  z-index: 1;
}
/* ... continue for all classes ... */
```

- [ ] **Step 2: Create src/components/WaitlistSection.jsx**

```jsx
import { useWaitlistCount, useBatchState } from '../lib/hooks'
import { CREAM, GOLD } from '../theme'
import styles from './WaitlistSection.module.css'

const BATCH_TARGET_DEFAULT = 25

export default function WaitlistSection() {
  const count      = useWaitlistCount()
  const batchState = useBatchState()
  const target     = batchState?.batch_target ?? BATCH_TARGET_DEFAULT

  const pct    = count != null ? Math.min(100, (count / target) * 100) : 0
  const needed = count != null ? Math.max(0, target - count) : null

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <span className={styles.label}><span className={styles.maiden}>Maiden</span> Batch</span>
        <span className={styles.badge}>BATCH #01 · OPEN</span>
      </div>
      <div className={styles.body}>
        <div className={styles.cityscape} aria-hidden="true" />
        <div className={styles.inner}>
          <div style={{ height: 110, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg className={styles.animFloat} width="56" height="100" viewBox="0 0 56 100" fill="none">
              <path d="M8 28 L28 10 L48 28 L48 88 Q48 94 28 94 Q8 94 8 88 Z"
                stroke={CREAM} strokeWidth="2" fill={CREAM} fillOpacity=".04" strokeLinejoin="round" opacity=".3"/>
              <path d="M20 20 L28 10 L36 20" stroke={CREAM} strokeWidth="1.5" fill="none" opacity=".2" strokeLinejoin="round"/>
              <line x1="18" y1="52" x2="38" y2="52" stroke={CREAM} strokeWidth="1" opacity=".08"/>
              <line x1="18" y1="62" x2="38" y2="62" stroke={CREAM} strokeWidth="1" opacity=".08"/>
              <line x1="18" y1="72" x2="38" y2="72" stroke={CREAM} strokeWidth="1" opacity=".06"/>
              <text x="28" y="44" textAnchor="middle"
                fontFamily="'Cinzel',serif" fontSize="5.5" fontWeight="700"
                fill={CREAM} opacity=".15" letterSpacing="1.5">BCCB</text>
            </svg>
          </div>
          <div className={styles.stageTitle}>
            Join the <span style={{ color: GOLD }}>Maiden</span> Batch now!
          </div>
          {count != null ? (
            <>
              <div className={styles.display}>
                {count} <span style={{ fontSize: '0.38em', opacity: .4, WebkitTextFillColor: CREAM }}>/ {target}</span>
              </div>
              <div className={styles.countLabel}>Free shipping on all Maiden batch orders.</div>
              <div className={styles.meterBar}>
                <div className={styles.meterFill} style={{ width: `${pct}%` }} />
              </div>
              <div className={styles.sub}>
                {needed > 0
                  ? `${needed} more and we brew batch #01`
                  : "Batch #01 confirmed — we're brewing"}
              </div>
            </>
          ) : (
            <>
              <div className={[styles.display, styles.dim].join(' ')}>BATCH #01<br/>COMING SOON</div>
              <div className={styles.sub}>Small batch · cold brewed · Los Angeles</div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Verify no build errors**

```bash
npx vite build 2>&1 | tail -20
```

Note: App.jsx still imports FirstBatch at this point — that's fine, build errors here would indicate a CSS module syntax issue.

- [ ] **Step 4: Commit**

```bash
git add src/components/WaitlistSection.jsx src/components/WaitlistSection.module.css
git commit -m "feat: rename FirstBatch → WaitlistSection, convert to CSS Module"
```

---

## Task 6: Convert BrewStageDisplay (was LiveBatch)

**Files:**
- Create: `src/components/BrewStageDisplay.jsx`
- Create: `src/components/BrewStageDisplay.module.css`

**Class name mapping** (old `lb-*` → camelCase module):

| Old class | Module class |
|---|---|
| `.lb-wrap` | `.wrap` |
| `.lb-body` | `.body` |
| `.lb-inner` | `.inner` |
| `.lb-stage-title` | `.stageTitle` |
| `.lb-display` | `.display` |
| `.lb-display.dim` | `.display.dim` |
| `.lb-sub` | `.sub` |
| `.lb-batch-tag` | `.batchTag` |
| `.lb-svg-wrap` | `.svgWrap` |
| `@keyframes lb-shudder` | `@keyframes shudder` |
| `.lb-anim-shudder` | `.animShudder` |
| `.lb-jar-fill` | `.jarFill` |
| `@keyframes lb-liq-wave` | `@keyframes liqWave` |
| `@keyframes lb-ice1` | `@keyframes ice1Anim` |
| `@keyframes lb-ice2` | `@keyframes ice2Anim` |
| `@keyframes lb-ice3` | `@keyframes ice3Anim` |
| `.lb-ice1` | `.ice1` |
| `.lb-ice2` | `.ice2` |
| `.lb-ice3` | `.ice3` |

- [ ] **Step 1: Create BrewStageDisplay.module.css**

Copy the CSS string from `src/components/LiveBatch.jsx`, paste into `src/components/BrewStageDisplay.module.css`, and rename all classes per the mapping table above. The `@keyframes` names must also be renamed — Vite scopes them locally in CSS Modules.

- [ ] **Step 2: Create src/components/BrewStageDisplay.jsx**

`fmt`, `calcRemaining`, and `STEEP_HOURS` are now imported from `src/lib/utils.js` instead of being defined locally.

```jsx
import { useState, useEffect } from 'react'
import { useBatchState } from '../lib/hooks'
import { CREAM, GOLD } from '../theme'
import { fmt, calcRemaining, STEEP_HOURS } from '../lib/utils'
import styles from './BrewStageDisplay.module.css'

function useCountdown(steepStart) {
  const [remaining, setRemaining] = useState(() => calcRemaining(steepStart))
  useEffect(() => {
    if (!steepStart) {
      const id = setTimeout(() => setRemaining(null), 0)
      return () => clearTimeout(id)
    }
    const id = setInterval(() => setRemaining(calcRemaining(steepStart)), 1000)
    return () => clearInterval(id)
  }, [steepStart])
  return remaining
}

function GrindingStage({ batchNum }) {
  return (
    <div className={styles.body}>
      <div className={styles.inner}>
        <div className={styles.svgWrap}>
          <svg className={styles.animShudder} width="52" height="100" viewBox="0 0 52 100" fill="none">
            <line x1="26" y1="4" x2="44" y2="4" stroke={GOLD} strokeWidth="2.5" strokeLinecap="round"/>
            <circle cx="44" cy="4" r="4" fill={GOLD} opacity=".8"/>
            <circle cx="26" cy="4" r="3.5" stroke={GOLD} strokeWidth="2" fill="none" opacity=".9"/>
            <line x1="26" y1="7" x2="26" y2="18" stroke={GOLD} strokeWidth="2" strokeLinecap="round"/>
            <path d="M14 18 L10 34 L42 34 L38 18 Z"
              stroke={GOLD} strokeWidth="1.8" fill={GOLD} fillOpacity=".12" strokeLinejoin="round"/>
            <rect x="10" y="34" width="32" height="42" rx="3"
              stroke={GOLD} strokeWidth="2" fill={GOLD} fillOpacity=".08"/>
            <rect x="16" y="40" width="20" height="14" rx="2"
              stroke={GOLD} strokeWidth="1.2" fill={GOLD} fillOpacity=".1" opacity=".6"/>
            <rect x="8" y="76" width="36" height="18" rx="2"
              stroke={GOLD} strokeWidth="1.8" fill="none" opacity=".7"/>
            <line x1="20" y1="85" x2="32" y2="85" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round" opacity=".4"/>
          </svg>
        </div>
        <div className={styles.stageTitle}>GRINDING</div>
        <div className={styles.display}>BATCH<br/>#{String(batchNum).padStart(2,'0')}</div>
        <div className={styles.sub}>Coarse ground · Fresh every time</div>
      </div>
    </div>
  )
}

function SteepingStage({ batchNum, remaining }) {
  const pct = remaining !== null
    ? Math.max(0, Math.min(1, remaining / (STEEP_HOURS * 3_600_000)))
    : 1
  const fillHeight = 80
  const fillY = 18 + fillHeight * (1 - pct)

  return (
    <div className={styles.body}>
      <div className={styles.inner}>
        <div className={styles.svgWrap}>
          <svg width="72" height="110" viewBox="0 0 72 110" fill="none">
            <defs>
              <clipPath id="lb-jar-clip">
                <rect x="8" y="18" width="56" height="80" rx="4"/>
              </clipPath>
            </defs>
            <rect x="4" y="6" width="64" height="14" rx="3" stroke={CREAM} strokeWidth="2" fill="none" opacity=".45"/>
            <rect x="8" y="18" width="56" height="80" rx="4" stroke={CREAM} strokeWidth="2" fill="none" opacity=".45"/>
            <rect
              className={styles.jarFill}
              x="9" y={fillY}
              width="54" height={98 - fillY}
              rx="3"
              fill={CREAM} fillOpacity=".06"
              clipPath="url(#lb-jar-clip)"
            />
            <rect x="9" y={Math.min(96, fillY + 1)} width="54" height="3"
              fill={GOLD} fillOpacity=".5"
              clipPath="url(#lb-jar-clip)"
            />
          </svg>
        </div>
        <div className={styles.stageTitle}>STEEPING</div>
        <div className={styles.display}>{fmt(remaining)}</div>
        <div className={styles.sub}>20 hours · Cold water · No shortcuts</div>
        {batchNum > 0 && <div className={styles.batchTag}>Batch #{String(batchNum).padStart(2,'0')}</div>}
      </div>
    </div>
  )
}

function ReadyStage({ batchNum }) {
  return (
    <div className={styles.body}>
      <div className={styles.inner}>
        <div className={styles.svgWrap}>
          <svg width="64" height="100" viewBox="0 0 64 100" fill="none">
            <defs>
              <clipPath id="lb-cup-clip">
                <path d="M6 6L58 6L50 92Q50 96 32 96Q14 96 14 92Z"/>
              </clipPath>
            </defs>
            <path d="M6 6L58 6L50 92Q50 96 32 96Q14 96 14 92Z"
              stroke={CREAM} strokeWidth="2" fill="none" strokeLinejoin="round" opacity=".45"/>
            <line x1="6" y1="6" x2="58" y2="6" stroke={GOLD} strokeWidth="3" strokeLinecap="round"/>
            <rect x="7" y="44" width="54" height="54" fill={CREAM} fillOpacity=".04" clipPath="url(#lb-cup-clip)"/>
            <line x1="14" y1="44" x2="52" y2="44" stroke={CREAM} strokeWidth="1"
              strokeDasharray="4 3" opacity=".12" strokeLinecap="round"/>
            <g className={styles.ice1}>
              <rect x="14" y="50" width="18" height="15" rx="3"
                stroke={CREAM} strokeWidth="1.6" strokeOpacity=".2" fill={CREAM} fillOpacity=".06"/>
            </g>
            <g className={styles.ice2}>
              <rect x="36" y="55" width="13" height="12" rx="2.5"
                stroke={CREAM} strokeWidth="1.4" strokeOpacity=".16" fill={CREAM} fillOpacity=".04"/>
            </g>
            <g className={styles.ice3}>
              <rect x="12" y="66" width="10" height="10" rx="2"
                stroke={CREAM} strokeWidth="1.3" strokeOpacity=".14" fill={CREAM} fillOpacity=".03"/>
            </g>
            <line x1="46" y1="4" x2="42" y2="96" stroke={GOLD} strokeWidth="2.5" strokeLinecap="round" opacity=".7"/>
          </svg>
        </div>
        <div className={styles.stageTitle}>READY</div>
        <div className={styles.display}>BATCH<br/>#{String(batchNum).padStart(2,'0')}</div>
        <div className={styles.sub}>Bold · Cold · Never bitter · Los Angeles</div>
      </div>
    </div>
  )
}

export default function BrewStageDisplay() {
  const batch     = useBatchState()
  const remaining = useCountdown(batch?.stage === 'steeping' ? batch.steep_start : null)

  const stage    = batch?.stage ?? 'idle'
  const batchNum = batch?.batch_number ?? 0
  const isActive = stage === 'grinding' || stage === 'steeping' || stage === 'ready'

  if (!isActive) return null

  return (
    <div className={styles.wrap}>
      {stage === 'grinding' && <GrindingStage batchNum={batchNum} />}
      {stage === 'steeping' && <SteepingStage batchNum={batchNum} remaining={remaining} />}
      {stage === 'ready'    && <ReadyStage batchNum={batchNum} />}
    </div>
  )
}
```

- [ ] **Step 3: Verify build**

```bash
npx vite build 2>&1 | tail -10
```

Expected: Build succeeds (or fails only because App.jsx still imports old names).

- [ ] **Step 4: Commit**

```bash
git add src/components/BrewStageDisplay.jsx src/components/BrewStageDisplay.module.css
git commit -m "feat: rename LiveBatch → BrewStageDisplay, convert to CSS Module"
```

---

## Task 7: Convert BrewTelemetry (was BrewMonitor)

**Files:**
- Create: `src/components/BrewTelemetry.jsx`
- Create: `src/components/BrewTelemetry.module.css`

**Class name mapping** (old `bm-*` → camelCase module):

| Old class | Module class |
|---|---|
| `.bm-wrap` | `.wrap` |
| `.bm-header` | `.header` |
| `.bm-label` | `.label` |
| `.bm-batch-tag` | `.batchTag` |
| `.bm-body` | `.body` |
| `.bm-status-row` | `.statusRow` |
| `.bm-dot` | `.dot` |
| `.bm-dot.live` | `.dot.live` |
| `@keyframes bm-pulse` | `@keyframes pulse` |
| `.bm-status-text` | `.statusText` |
| `.bm-status-text.idle` | `.statusText.idle` |
| `.bm-countdown` | `.countdown` |
| `.bm-grid` | `.grid` |
| `.bm-metric` | `.metric` |
| `.bm-metric-label` | `.metricLabel` |
| `.bm-metric-value` | `.metricValue` |
| `.bm-metric-unit` | `.metricUnit` |
| `.bm-progress-bar` | `.progressBar` |
| `.bm-progress-fill` | `.progressFill` |
| `.bm-footer` | `.footer` |
| `.bm-connecting` | `.connecting` |
| `.bm-chart-wrap` | `.chartWrap` |
| `.bm-chart-header` | `.chartHeader` |
| `.bm-chart-empty` | `.chartEmpty` |

- [ ] **Step 1: Create BrewTelemetry.module.css**

Read the full `src/components/BrewMonitor.jsx`. Copy its `css` template literal content into `src/components/BrewTelemetry.module.css`, renaming all classes and `@keyframes` names per the table above.

- [ ] **Step 2: Create src/components/BrewTelemetry.jsx**

Read the full `src/components/BrewMonitor.jsx`. Create `src/components/BrewTelemetry.jsx` with these changes:
1. Change `import` to use `useBrewState, useTemperatureReadings` from `'../lib/hooks'`
2. Add `import { CREAM, GOLD, GOLD_GRAD } from '../theme'`
3. Add `import { fmt } from '../lib/utils'`
4. Add `import styles from './BrewTelemetry.module.css'`
5. Remove the `const INK`, `const GOLD`, `const CREAM`, `const RULE`, `const GOLD_GRAD` constant declarations
6. Remove the `const css` template string
7. Remove `<style>{css}</style>` from JSX
8. Replace all `className="bm-*"` with `className={styles.xxx}` per the mapping table
9. For compound classes like `className="bm-dot live"`: use `className={[styles.dot, isLive && styles.live].filter(Boolean).join(' ')}`
10. Rename the exported function from `BrewMonitor` to `BrewTelemetry`
11. Remove the locally-defined `fmt` function (now imported from utils)
12. Keep the `TempChart` sub-component (it stays inside this file)

- [ ] **Step 3: Verify build**

```bash
npx vite build 2>&1 | tail -10
```

- [ ] **Step 4: Commit**

```bash
git add src/components/BrewTelemetry.jsx src/components/BrewTelemetry.module.css
git commit -m "feat: rename BrewMonitor → BrewTelemetry, convert to CSS Module"
```

---

## Task 8: Convert BrewProgressBar (was BrewFlow)

**Files:**
- Create: `src/components/BrewProgressBar.jsx`

`BrewFlow` uses only inline styles — no `css` template string. No CSS module file is needed. This task is a rename + theme import only.

- [ ] **Step 1: Create src/components/BrewProgressBar.jsx**

```jsx
import { useBatchState } from '../lib/hooks'
import { GOLD, CREAM } from '../theme'

const STEPS = [
  {
    key: 'grinding',
    label: 'GRIND',
    icon: (active) => (
      <svg width="16" height="20" viewBox="0 0 40 52" fill="none">
        <ellipse cx="20" cy="30" rx="10" ry="15"
          stroke={active ? GOLD : CREAM} strokeWidth="2"
          fill={active ? GOLD : 'none'} fillOpacity={active ? .15 : 0}
          opacity={active ? 1 : .35}/>
        <path d="M20 15C16 22 16 38 20 45"
          stroke={active ? GOLD : CREAM} strokeWidth="1.2"
          strokeLinecap="round" opacity={active ? .6 : .25}/>
        <line x1="2" y1="27" x2="7" y2="27"
          stroke={active ? GOLD : CREAM} strokeWidth="1.8"
          strokeLinecap="round" opacity={active ? .9 : .3}/>
        <line x1="2" y1="32" x2="9" y2="32"
          stroke={active ? GOLD : CREAM} strokeWidth="1.8"
          strokeLinecap="round" opacity={active ? .6 : .2}/>
      </svg>
    ),
  },
  {
    key: 'steeping',
    label: 'STEEP',
    icon: (active) => (
      <svg width="16" height="20" viewBox="0 0 40 52" fill="none">
        <rect x="8" y="6" width="24" height="7" rx="2"
          stroke={active ? GOLD : CREAM} strokeWidth="1.8" fill="none"
          opacity={active ? 1 : .35}/>
        <rect x="10" y="12" width="20" height="28" rx="2"
          stroke={active ? GOLD : CREAM} strokeWidth="1.8" fill="none"
          opacity={active ? 1 : .35}/>
        <rect x="11" y="28" width="18" height="11" rx="1"
          fill={active ? GOLD : CREAM} fillOpacity={active ? .3 : .1}/>
      </svg>
    ),
  },
  {
    key: 'ready',
    label: 'READY',
    icon: (active) => (
      <svg width="14" height="20" viewBox="0 0 36 52" fill="none">
        <path d="M4 4L32 4L28 46Q28 49 18 49Q8 49 8 46Z"
          stroke={active ? GOLD : CREAM} strokeWidth="1.8" fill="none"
          strokeLinejoin="round" opacity={active ? 1 : .35}/>
        <line x1="4" y1="4" x2="32" y2="4"
          stroke={active ? GOLD : CREAM} strokeWidth="2.5"
          strokeLinecap="round" opacity={active ? 1 : .35}/>
        <rect x="5" y="24" width="26" height="24"
          fill={active ? GOLD : CREAM} fillOpacity={active ? .15 : .05}
          clipPath="url(#cup-c)"/>
        <defs>
          <clipPath id="cup-c">
            <path d="M4 4L32 4L28 46Q28 49 18 49Q8 49 8 46Z"/>
          </clipPath>
        </defs>
      </svg>
    ),
  },
]

const STAGE_INDEX = { idle: -1, grinding: 0, steeping: 1, ready: 2 }

export default function BrewProgressBar() {
  const batch   = useBatchState()
  const stage   = batch?.stage ?? 'idle'
  const current = STAGE_INDEX[stage] ?? -1

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 0,
      marginLeft: 'auto',
      marginRight: '12px',
    }}>
      {STEPS.map((step, i) => {
        const active = i === current
        const done   = i < current

        return (
          <div key={step.key} style={{ display: 'flex', alignItems: 'center' }}>
            {i > 0 && (
              <div style={{
                width: 20, height: 1,
                background: done || active ? GOLD : CREAM,
                opacity: done ? .5 : active ? .4 : .15,
                margin: '0 2px',
              }}/>
            )}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              padding: '0 6px',
              position: 'relative',
            }}>
              {active && (
                <div style={{
                  position: 'absolute',
                  inset: '-3px',
                  border: `1px solid ${GOLD}`,
                  borderRadius: 3,
                  opacity: .3,
                  pointerEvents: 'none',
                }}/>
              )}
              {step.icon(active || done)}
              <span style={{
                fontFamily: "var(--font-brand, 'Cinzel', serif)",
                fontSize: '0.5625rem',
                letterSpacing: '.2em',
                color: active ? GOLD : done ? GOLD : CREAM,
                opacity: active ? 1 : done ? .5 : .25,
                lineHeight: 1,
                whiteSpace: 'nowrap',
              }}>
                {done ? '✓' : step.label}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/BrewProgressBar.jsx
git commit -m "feat: rename BrewFlow → BrewProgressBar, import theme tokens"
```

---

## Task 9: Convert ProductInfoPanels (was BrewPanels)

**Files:**
- Create: `src/components/ProductInfoPanels.jsx` (moved from `src/BrewPanels.jsx`)
- Create: `src/components/ProductInfoPanels.module.css`

**Class name mapping** (old `bp-*` → camelCase module — note: BrewPanels used `INK = "#f2ede0"` which is actually CREAM, use theme values):

| Old class | Module class |
|---|---|
| `.bp-section` | `.section` |
| `.bp-panels` | `.panels` |
| `.bp-panel` | `.panel` |
| `.bp-icon` | `.icon` |
| `.bp-fleur` | `.fleur` |
| `.bp-step` | `.step` |
| `.bp-title` | `.title` |
| `.bp-desc` | `.desc` |
| `@keyframes bp-shudder` | `@keyframes shudder` |
| `.bp-bean-g` | `.beanG` |
| `@keyframes bp-crack` | `@keyframes crack` |
| `.bp-c1` | `.c1` |
| `.bp-c2` | `.c2` |
| `.bp-c3` | `.c3` |
| `@keyframes bp-liq` | `@keyframes liq` |
| `.bp-liq` | `.liq` |
| `@keyframes fi` | `@keyframes iceFloat1` |
| `@keyframes f2` | `@keyframes iceFloat2` |
| `@keyframes f3` | `@keyframes iceFloat3` |
| `.bp-i1` | `.i1` |
| `.bp-i2` | `.i2` |
| `.bp-i3` | `.i3` |
| `.bp-strip` | `.strip` |
| `.bp-strip span` | `.strip span` |
| `.bp-dot` | `.dot` |

- [ ] **Step 1: Create ProductInfoPanels.module.css**

Copy the CSS string from `src/BrewPanels.jsx`, paste into `src/components/ProductInfoPanels.module.css`, rename classes and `@keyframes` per the table above. Note: the original file has `@keyframes fi`, `@keyframes f2`, `@keyframes f3` — rename these to the longer `iceFloat1`, `iceFloat2`, `iceFloat3` names and update the animation references in the `.i1`, `.i2`, `.i3` classes.

- [ ] **Step 2: Create src/components/ProductInfoPanels.jsx**

Read the full `src/BrewPanels.jsx`. Create `src/components/ProductInfoPanels.jsx` with these changes:
1. Add `import { GOLD, CREAM } from '../theme'` (note: the original uses `INK = "#f2ede0"` which is actually CREAM and `GOLD = "#c9a84c"` — replace those with theme imports)
2. Add `import styles from './ProductInfoPanels.module.css'`
3. Remove the `const css` template string, the `const INK` and `const GOLD` local declarations
4. Remove `<style>{css}</style>` from JSX
5. Replace all `className="bp-*"` with `className={styles.xxx}` per the mapping table
6. Replace `{INK}` SVG attributes with `{CREAM}` (they're the same value, just misnamed in the original)
7. Rename the exported function from `BrewPanels` to `ProductInfoPanels`

- [ ] **Step 3: Commit**

```bash
git add src/components/ProductInfoPanels.jsx src/components/ProductInfoPanels.module.css
git commit -m "feat: rename BrewPanels → ProductInfoPanels, move to components/, convert to CSS Module"
```

---

## Task 10: Convert BatchDetails (was BatchProof)

**Files:**
- Create: `src/components/BatchDetails.jsx`
- Create: `src/components/BatchDetails.module.css`

- [ ] **Step 1: Read the full file**

Read `src/components/BatchProof.jsx` (652 lines). Note all CSS class names starting with `bp-` — these are separate from the BrewPanels `bp-` classes; with CSS Modules the namespace collision disappears.

- [ ] **Step 2: Build the class name mapping table**

After reading the file, list every `.bp-*` class and its camelCase replacement. Follow the same pattern: strip the `bp-` prefix, convert to camelCase. For example: `.bp-proof-wrap` → `.proofWrap`, `.bp-bottle` → `.bottle`.

- [ ] **Step 3: Create BatchDetails.module.css**

Copy the `css` template string content into `src/components/BatchDetails.module.css`, rename all classes and `@keyframes` per your mapping table.

- [ ] **Step 4: Create src/components/BatchDetails.jsx**

1. Add `import { INK, GOLD, CREAM, RULE, GOLD_GRAD } from '../theme'`
2. Add `import styles from './BatchDetails.module.css'`
3. Remove the local `const INK`, `const GOLD`, `const CREAM`, `const RULE`, `const GOLD_GRAD` declarations
4. Remove the `const css` template string and `<style>{css}</style>` from JSX
5. Replace all `className="bp-*"` with `className={styles.xxx}` per your mapping table
6. Rename exported function from `BatchProof` to `BatchDetails`

- [ ] **Step 5: Verify build**

```bash
npx vite build 2>&1 | tail -10
```

- [ ] **Step 6: Commit**

```bash
git add src/components/BatchDetails.jsx src/components/BatchDetails.module.css
git commit -m "feat: rename BatchProof → BatchDetails, convert to CSS Module"
```

---

## Task 11: Update AdminPanel with Supabase Auth

**Files:**
- Modify: `src/pages/AdminPanel.jsx`

Replace the client-side `sessionStorage` + `VITE_ADMIN_PASS` password check with Supabase Auth. The admin panel runs localhost-only (enforced in App.jsx in the next task).

- [ ] **Step 1: Replace the auth logic in AdminPanel.jsx**

Make these targeted changes to `src/pages/AdminPanel.jsx`:

**Remove line 4:**
```js
const PASS  = import.meta.env.VITE_ADMIN_PASS
```

**Replace the import line** (line 1) to add `useAuth`:
```js
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/hooks'
```

**Replace the `authed` state declaration** (line 137):
```js
const { session, loading } = useAuth()
```

And remove these state declarations that were used for the old auth:
```js
// Remove:
const [authed, setAuthed] = useState(() => sessionStorage.getItem('cbbc_admin') === '1')
const [pw, setPw]         = useState('')
const [pwErr, setPwErr]   = useState(false)

// Replace with:
const [email, setEmail] = useState('')
const [pw, setPw]       = useState('')
const [pwErr, setPwErr] = useState(false)
const [authLoading, setAuthLoading] = useState(false)
```

**Replace the `login` function:**
```js
async function login(e) {
  e.preventDefault()
  setAuthLoading(true)
  setPwErr(false)
  const { error } = await supabase.auth.signInWithPassword({ email, password: pw })
  if (error) { setPwErr(true); setPw(''); setTimeout(() => setPwErr(false), 1600) }
  setAuthLoading(false)
}
```

**Replace the `logout` function:**
```js
async function logout() {
  await supabase.auth.signOut()
}
```

**Replace both `useEffect` dependency arrays** from `[authed]` to `[session]`:
```js
useEffect(() => { ... }, [session])
```

**Replace the login screen JSX** (the `if (!authed) return (...)` block) with:
```jsx
if (loading) return null

if (!session) return (
  <div style={{ position:'fixed', inset:0, background:INK, display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999 }}>
    <form onSubmit={login} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:24, padding:48, border:'1px solid rgba(201,168,76,.2)', maxWidth:360, width:'90%' }}>
      <div style={{ color:GOLD, fontSize:'var(--t-micro,.625rem)', letterSpacing:'.4em', opacity:.7, fontFamily:"'Cinzel',serif" }}>BOLD CREW COLD BREW</div>
      <div style={{ color:CREAM, fontSize:'1.6rem', letterSpacing:'.1em', fontFamily:"'Alfa Slab One',serif" }}>ADMIN</div>
      <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email" autoFocus
        style={{ ...FIELD, textAlign:'center' }} />
      <input type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder="password"
        style={{ ...FIELD, border:`2px solid ${pwErr ? '#c0392b' : 'rgba(201,168,76,.3)'}`, textAlign:'center' }} />
      {pwErr && <div style={{ color:'#c0392b', fontSize:'var(--t-micro,.625rem)', letterSpacing:'.15em', marginTop:-12, fontFamily:"'Cinzel',serif" }}>INCORRECT CREDENTIALS</div>}
      <button type="submit" disabled={authLoading}
        style={{ width:'100%', padding:'14px', background:GOLD, border:'none', cursor:'pointer', fontFamily:"'Alfa Slab One',serif", fontSize:'1rem', letterSpacing:'.06em', color:INK, opacity: authLoading ? .5 : 1 }}>
        {authLoading ? '...' : 'ENTER'}
      </button>
    </form>
  </div>
)
```

**Replace all references to `authed` in remaining code** with `session` (there are two `useEffect` deps and one `isBrewing` / `current` derivation block — `authed` is only used in effects and the guard above, which you've already replaced).

- [ ] **Step 2: Verify the file compiles**

```bash
npx vite build 2>&1 | tail -10
```

Expected: Build succeeds (AdminPanel is still imported in App.jsx without the DEV guard yet).

- [ ] **Step 3: Commit**

```bash
git add src/pages/AdminPanel.jsx
git commit -m "feat: replace client-side password auth with Supabase Auth in AdminPanel"
```

---

## Task 12: Update App.jsx, main.jsx, and delete old files

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/main.jsx`
- Delete: `src/components/FirstBatch.jsx`, `src/components/LiveBatch.jsx`, `src/components/BrewMonitor.jsx`, `src/components/BrewFlow.jsx`, `src/components/BatchProof.jsx`, `src/BrewPanels.jsx`

- [ ] **Step 1: Update src/App.jsx**

Replace the full contents with:

```jsx
import { lazy, Suspense } from 'react'
import WaitlistSection from './components/WaitlistSection'
import BrewStageDisplay from './components/BrewStageDisplay'
import BrewTelemetry from './components/BrewTelemetry'

const AdminPanel = lazy(() => import('./pages/AdminPanel'))

export default function App() {
  const isAdmin = import.meta.env.DEV &&
    new URLSearchParams(window.location.search).has('admin')

  if (isAdmin) return <Suspense fallback={null}><AdminPanel /></Suspense>

  return (
    <>
      <WaitlistSection />
      <BrewStageDisplay />
      <BrewTelemetry />
    </>
  )
}
```

- [ ] **Step 2: Update src/main.jsx**

Replace the full contents with:

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import BatchDetails from './components/BatchDetails.jsx'

createRoot(document.getElementById('brew-mount')).render(
  <StrictMode><App /></StrictMode>
)

const batchEl = document.getElementById('batch-mount')
if (batchEl) {
  createRoot(batchEl).render(
    <StrictMode><BatchDetails /></StrictMode>
  )
}
```

- [ ] **Step 3: Delete old component files**

```bash
git rm src/components/FirstBatch.jsx \
       src/components/LiveBatch.jsx \
       src/components/BrewMonitor.jsx \
       src/components/BrewFlow.jsx \
       src/components/BatchProof.jsx \
       src/BrewPanels.jsx
```

- [ ] **Step 4: Build and verify no errors**

```bash
npx vite build 2>&1
```

Expected: Clean build, no "Cannot find module" errors.

- [ ] **Step 5: Run tests**

```bash
npx vitest --run 2>&1
```

Expected: All 13 tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/App.jsx src/main.jsx
git commit -m "feat: update App/main imports, add DEV guard for AdminPanel, delete old component files"
```

---

## Task 13: Remove VITE_ADMIN_PASS from .env

**Files:**
- Modify: `.env`

- [ ] **Step 1: Remove the VITE_ADMIN_PASS line from .env**

Open `.env`. Delete the line:
```
VITE_ADMIN_PASS=...
```

Save the file. The `.env` should now contain only:
```
VITE_SUPABASE_URL=https://qmzgnbcahcpmntbnmikq.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_DygPmf-waUWGClCpRyxspw_2022kbOy
```

- [ ] **Step 2: Set up admin user in Supabase (manual step)**

Go to your Supabase project dashboard → Authentication → Users → "Invite user". Enter your admin email. You will receive an email to set your password. This is a one-time setup step and creates the credentials you will use on `localhost` with the new AdminPanel login screen.

- [ ] **Step 3: Verify build (no references to removed env var)**

```bash
grep -r 'VITE_ADMIN_PASS' src/ && echo "FOUND - fix it" || echo "Clean"
```

Expected: "Clean"

```bash
npx vite build 2>&1 | tail -10
```

Expected: Clean build.

- [ ] **Step 4: Run all tests one final time**

```bash
npx vitest --run 2>&1
```

Expected: All 13 tests pass.

- [ ] **Step 5: Commit**

```bash
git add .env
git commit -m "security: remove VITE_ADMIN_PASS, admin auth now handled by Supabase Auth"
```

---

## Done

At this point:
- All 13 Vitest unit tests pass
- Production build is clean
- `AdminPanel` is tree-shaken out of production builds (DEV guard in App.jsx)
- `VITE_ADMIN_PASS` is gone; admin login uses Supabase Auth
- All components use CSS Modules with shared `theme.js` tokens
- All components have been renamed to match their actual purpose
- Old files are deleted
