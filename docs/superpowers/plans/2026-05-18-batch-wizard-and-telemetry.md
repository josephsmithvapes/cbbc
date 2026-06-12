# Batch Wizard, Telemetry Timer, and Batch Card Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the admin stage grid with a wizard-style batch flow, permanently link temperature readings to batches via `batch_id` FK at publish time, filter the public carousel to published-only batches, and enforce one visible countdown at a time.

**Architecture:** DB migrations add `published` and `batch_id` FK. The admin wizard drives the batch lifecycle (pre-brew → grinding → steeping → post-batch → publish), claiming readings via a one-time UPDATE at publish. The public site queries `published = true` batches and reads by `batch_id`. `App.jsx` passes a `suppressCountdown` prop to `BrewTelemetry` so BrewStageDisplay and BrewTelemetry never both show a countdown.

**Tech Stack:** React 18, Vite, Vitest, custom PostgREST client (`src/lib/supabase.js`), Supabase backend.

---

## File Map

| File | Change |
|------|--------|
| `src/pages/AdminPanel.jsx` | Major refactor — wizard replaces stage grid |
| `src/components/BatchDetails.jsx` | Query: `published=true` + `batch_id` FK lookup; sort newest-first; no-data card; replay indicator; live lockout |
| `src/components/BrewTelemetry.jsx` | Add `suppressCountdown` prop; fix replay timer leak |
| `src/App.jsx` | Derive `suppressCountdown` from `batch_state`; reset `requestedBatchId` on live transition |
| `src/lib/utils.js` | Add `buildClaimParams` validation helper |
| `src/lib/__tests__/utils.test.js` | Tests for new utilities |

---

## Task 1: Database Migrations

Run these in the Supabase SQL editor (Dashboard → SQL Editor → New Query).

**Files:** None (SQL only)

- [ ] **Step 1: Add columns to `batches`**

```sql
ALTER TABLE batches ADD COLUMN IF NOT EXISTS published boolean DEFAULT false;
ALTER TABLE batches ADD COLUMN IF NOT EXISTS yield_g integer;
ALTER TABLE batches ADD COLUMN IF NOT EXISTS start_weight_g integer;
```

Expected: Query runs with no error. All existing rows now have `published = false`.

- [ ] **Step 2: Add `batch_id` FK to `temperature_readings`**

```sql
ALTER TABLE temperature_readings
  ADD COLUMN IF NOT EXISTS batch_id uuid REFERENCES batches(id);
```

Expected: Query runs with no error. All existing rows have `batch_id = null`.

- [ ] **Step 3: Verify**

```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name IN ('batches', 'temperature_readings')
  AND column_name IN ('published', 'yield_g', 'start_weight_g', 'batch_id')
ORDER BY table_name, column_name;
```

Expected: 4 rows returned — `batch_id` (uuid, YES, null), `published` (boolean, YES, false), `start_weight_g` (integer, YES, null), `yield_g` (integer, YES, null).

---

## Task 2: Claim utilities + tests

Extractable, testable logic for counting and claiming readings. Lives in `src/lib/utils.js` alongside existing helpers.

**Files:**
- Modify: `src/lib/utils.js`
- Modify: `src/lib/__tests__/utils.test.js`

- [ ] **Step 1: Write the failing tests**

Add to the bottom of `src/lib/__tests__/utils.test.js`:

```js
import { buildClaimParams } from '../utils'

describe('buildClaimParams', () => {
  it('returns filter params for the reading claim window', () => {
    const result = buildClaimParams('batch-uuid-123', '2026-05-01T08:00:00Z', '2026-05-02T04:00:00Z')
    expect(result).toEqual({
      batchId: 'batch-uuid-123',
      steepStart: '2026-05-01T08:00:00Z',
      steepEnd: '2026-05-02T04:00:00Z',
    })
  })

  it('throws if batchId is missing', () => {
    expect(() => buildClaimParams(null, '2026-05-01T08:00:00Z', '2026-05-02T04:00:00Z'))
      .toThrow('batchId required')
  })

  it('throws if steepStart is missing', () => {
    expect(() => buildClaimParams('id', null, '2026-05-02T04:00:00Z'))
      .toThrow('steepStart required')
  })

  it('throws if steepEnd is missing', () => {
    expect(() => buildClaimParams('id', '2026-05-01T08:00:00Z', null))
      .toThrow('steepEnd required')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run src/lib/__tests__/utils.test.js
```

Expected: 4 failures — `buildClaimParams is not a function`

- [ ] **Step 3: Add `buildClaimParams` to `src/lib/utils.js`**

Add at the bottom of the file:

```js
export function buildClaimParams(batchId, steepStart, steepEnd) {
  if (!batchId) throw new Error('batchId required')
  if (!steepStart) throw new Error('steepStart required')
  if (!steepEnd) throw new Error('steepEnd required')
  return { batchId, steepStart, steepEnd }
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run src/lib/__tests__/utils.test.js
```

Expected: All tests pass (previously passing tests still pass, 4 new tests pass).

- [ ] **Step 5: Commit**

```bash
git add src/lib/utils.js src/lib/__tests__/utils.test.js
git commit -m "feat: add buildClaimParams utility with tests"
```

---

## Task 3: Fix replay timer leak in `BrewTelemetry`

The bug: when `requestedBatchId` changes, the async fetch runs and sets new `replayData`. The old `setInterval` (tied to old `replayData`) keeps ticking until React runs the cleanup on the next render cycle — causing a brief double-tick. Fix: clear `replayData` to `null` synchronously at the top of the fetch effect.

**Files:**
- Modify: `src/components/BrewTelemetry.jsx`

- [ ] **Step 1: Apply the fix**

In `src/components/BrewTelemetry.jsx`, locate `useReplayBatch` and find the first `useEffect` (the fetch effect). Replace the entire first `useEffect` inside `useReplayBatch`:

```js
// Before (line ~108):
useEffect(() => {
  if (!isActive) {
    setReplayData(null)
    return
  }

  let running = true
  async function fetchBatch() {
    // ...existing fetch logic...
  }
  fetchBatch()
  return () => { running = false }
}, [isActive, requestedBatchId])

// After — add setReplayData(null) as the FIRST line when active too:
useEffect(() => {
  if (!isActive) {
    setReplayData(null)
    return
  }
  setReplayData(null) // stop old timer before async fetch resolves

  let running = true
  async function fetchBatch() {
    // ...existing fetch logic unchanged...
    let batches = cachedBatchesList
    if (!batches) {
      const { data } = await supabase.from('batches')
        .select('*')
        .not('steep_end', 'is', null)
      if (data && data.length > 0) {
        cachedBatchesList = data
        batches = data
      }
    }

    if (!batches || !batches.length) {
      batches = [{
        id: 'mock-batch',
        batch_number: 1,
        name: 'Simulator',
        steep_start: new Date(Date.now() - 72000000).toISOString(),
        steep_end: new Date().toISOString()
      }]
    }

    if (!batches || !batches.length || !running) return

    const targetBatch = requestedBatchId
      ? batches.find(b => b.id === requestedBatchId) || batches[0]
      : batches[Math.floor(Math.random() * batches.length)]

    let processedReadings = cachedReadingsMap.get(targetBatch.id)
    if (!processedReadings) {
      const { data: readings, error } = await supabase.from('temperature_readings')
        .select('temp_c, recorded_at')
        .eq('batch_id', targetBatch.id)
        .order('recorded_at', { ascending: true })

      if (error || !readings || readings.length < 2) {
        processedReadings = Array.from({ length: 120 }).map((_, i) => ({
          temp_f: 36 + (Math.sin(i / 10) * 0.5) + (i / 120) * 4
        }))
      } else {
        processedReadings = thin(readings, 120).map(r => ({ temp_f: r.temp_c * 9 / 5 + 32 }))
      }
      cachedReadingsMap.set(targetBatch.id, processedReadings)
    }

    if (!running) return

    const durationS = Math.max(1, Math.floor(
      (new Date(targetBatch.steep_end) - new Date(targetBatch.steep_start)) / 1000
    )) || 72000

    setReplayData({ batch: targetBatch, readings: processedReadings, durationS })
    setTick(0)
  }
  fetchBatch()
  return () => { running = false }
}, [isActive, requestedBatchId])
```

Note: the readings query changed from time-range to `eq('batch_id', targetBatch.id)` — this is the FK lookup.

- [ ] **Step 2: Verify dev server starts cleanly**

```bash
npm run dev
```

Expected: No console errors on load. Open `http://localhost:5173`, click a batch card — confirm only one countdown ticks (no double-counting visible in the network tab timers).

- [ ] **Step 3: Commit**

```bash
git add src/components/BrewTelemetry.jsx
git commit -m "fix: clear replayData before async fetch to prevent timer overlap"
```

---

## Task 4: Add `suppressCountdown` prop to `BrewTelemetry` + wire in `App`

During a live brew, `BrewStageDisplay` shows the countdown. `BrewTelemetry` must hide its own countdown in that state.

**Files:**
- Modify: `src/components/BrewTelemetry.jsx`
- Modify: `src/App.jsx`

- [ ] **Step 1: Add `suppressCountdown` prop to `BrewTelemetry`**

In `src/components/BrewTelemetry.jsx`, change the component signature and hide the countdown block when suppressed:

```js
// Change signature (line ~196):
export default function BrewTelemetry({ requestedBatchId, suppressCountdown }) {
```

Then find the countdown block inside the `countdownRow` div (around line ~282). Wrap it:

```jsx
<div className={styles.countdownRow}>
  <div>
    <div className={styles.statusRow}>
      <span className={[styles.dot, isLive && styles.live].filter(Boolean).join(' ')}
        style={{ background: isLive || state.status === 'READY' ? GOLD : isReplay ? CREAM : CREAM,
                 opacity: state.status === 'IDLE' ? .2 : 1 }}/>
      <span className={[styles.statusText, (isIdle || isReplay) && styles.idle].filter(Boolean).join(' ')}>
        {statusLabel}{isReplay && state.batch_name ? ` · ${state.batch_name.toUpperCase()}` : ''}
      </span>
    </div>
    {!suppressCountdown && (
      <div className={styles.countdown}>
        {state.status === 'BREWING' || state.status === 'REPLAY'
          ? fmtDuration(remaining)
          : state.status === 'IDLE'
          ? 'STANDBY'
          : state.status === 'READY' || state.status === 'COMPLETE'
          ? 'READY'
          : fmtDuration(remaining)}
      </div>
    )}
  </div>
</div>
```

- [ ] **Step 2: Update `App.jsx` to derive `suppressCountdown` and pass it**

Replace the entire contents of `src/App.jsx`:

```jsx
import { lazy, Suspense, useState } from 'react'
import { useBatchState } from './lib/hooks'

const BrewStageDisplay = lazy(() => import('./components/BrewStageDisplay'))
const BrewTelemetry    = lazy(() => import('./components/BrewTelemetry'))
const BatchDetails     = lazy(() => import('./components/BatchDetails'))
const AdminPanel       = lazy(() => import('./pages/AdminPanel'))

export default function App() {
  const isAdmin = import.meta.env.DEV &&
    new URLSearchParams(window.location.search).has('admin')

  const [requestedBatchId, setRequestedBatchId] = useState(null)
  const batchState = useBatchState()
  const liveStage = batchState?.stage ?? 'idle'

  // BrewStageDisplay owns the countdown during any active live stage
  const suppressCountdown = liveStage === 'grinding' || liveStage === 'steeping' || liveStage === 'ready'

  if (isAdmin) {
    return (
      <Suspense fallback={null}>
        <AdminPanel />
      </Suspense>
    )
  }

  // Reset replay when a live brew starts so it doesn't auto-restart when brew ends
  useEffect(() => {
    if (suppressCountdown) setRequestedBatchId(null)
  }, [suppressCountdown])

  return (
    <Suspense fallback={null}>
      <BrewStageDisplay />
      <BrewTelemetry
        requestedBatchId={requestedBatchId}
        suppressCountdown={suppressCountdown}
      />
      <section id="batches" aria-label="Past batches">
        <BatchDetails
          onPlayBatch={(id) => {
            setRequestedBatchId(prev => prev === id ? null : id)
            document
              .getElementById('telemetry')
              ?.scrollIntoView({ behavior: 'smooth' })
          }}
          activeReplayId={requestedBatchId}
          isLiveBrew={suppressCountdown}
        />
      </section>
    </Suspense>
  )
}
```

Note: `onPlayBatch` now toggles — clicking the same card deselects it (returns to IDLE). Two new props passed to `BatchDetails`: `activeReplayId` and `isLiveBrew`.

- [ ] **Step 3: Verify**

```bash
npm run dev
```

Open `http://localhost:5173`. No console errors. Click a batch card — one timer only in `BrewTelemetry`. Click same card again — telemetry returns to STANDBY.

- [ ] **Step 4: Commit**

```bash
git add src/components/BrewTelemetry.jsx src/App.jsx
git commit -m "feat: add suppressCountdown prop, toggle-deselect replay on card click"
```

---

## Task 5: `BatchDetails` — published filter, `batch_id` FK lookup, newest-first

**Files:**
- Modify: `src/components/BatchDetails.jsx`

- [ ] **Step 1: Update `fetchMeta` query to filter by `published = true`**

In `src/components/BatchDetails.jsx`, find `fetchMeta` (around line ~220). Replace the query:

```js
async function fetchMeta() {
  const { data: batchMeta, error } = await supabase.from('batches')
    .select('*')
    .eq('published', true)
    .order('steep_start', { ascending: false })
    .limit(24)

  if (error) {
    console.error('[BatchDetails] batches fetch error:', error)
    setBrews([])
    return
  }
  if (!batchMeta?.length) {
    setBrews([])
    return
  }
  setMetaList(batchMeta)

  const initial = batchMeta.map(meta => {
    const t0 = new Date(meta.steep_start).getTime()
    const t1 = new Date(meta.steep_end).getTime()
    return {
      id: meta.id,
      date: new Date(meta.steep_start),
      duration: (t1 - t0) / 1000,
      meta,
      chartData: [],
      isLoading: true,
      hasData: false,
    }
  })
  // Order is already newest-first from the query — don't re-sort
  setBrews(initial)
}
```

- [ ] **Step 2: Update `fetchHeavy` to use `batch_id` FK lookup and remove the null filter**

Replace the entire `fetchHeavy` function inside the second `useEffect`:

```js
async function fetchHeavy() {
  const batchPromises = metaList.map(async (meta) => {
    const { data: readings } = await supabase.from('temperature_readings')
      .select('temp_c, recorded_at')
      .eq('batch_id', meta.id)
      .order('recorded_at', { ascending: true })
      .limit(1000)

    const t0 = new Date(meta.steep_start).getTime()
    const t1 = new Date(meta.steep_end).getTime()

    if (!readings || readings.length < 2) {
      // No sensor data — still show the card
      return {
        id: meta.id,
        date: new Date(meta.steep_start),
        duration: (t1 - t0) / 1000,
        tempMin: null,
        tempMax: null,
        tempAvg: null,
        points: 0,
        meta,
        chartData: [],
        isLoading: false,
        hasData: false,
      }
    }

    const temps_f = readings.map(r => r.temp_c * 9 / 5 + 32)
    const avg = temps_f.reduce((a, b) => a + b, 0) / temps_f.length

    return {
      id: meta.id,
      date: new Date(meta.steep_start),
      duration: (t1 - t0) / 1000,
      tempMin: Math.min(...temps_f),
      tempMax: Math.max(...temps_f),
      tempAvg: avg,
      points: readings.length,
      meta,
      chartData: thin(readings.map(r => ({
        temp_f: r.temp_c * 9 / 5 + 32,
        elapsed_s: (new Date(r.recorded_at).getTime() - t0) / 1000,
      })), 200),
      isLoading: false,
      hasData: true,
    }
  })

  const processed = await Promise.all(batchPromises)
  // Order preserved from fetchMeta (newest-first) — don't re-sort
  setBrews(processed)
}
```

- [ ] **Step 3: Update `BrewCard` to handle `hasData = false`**

Replace the `BrewCard` component:

```jsx
function BrewCard({ brew, onPlayBatch, onEnter, onLeave, isActive, isLiveBrew }) {
  const { meta } = brew
  const isL = brew.isLoading

  return (
    <div
      className={styles.card}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onClick={() => {
        if (isLiveBrew) return
        meta?.id && onPlayBatch?.(meta.id)
      }}
      style={{
        cursor: isLiveBrew ? 'not-allowed' : onPlayBatch ? 'pointer' : 'default',
        opacity: isLiveBrew ? 0.4 : 1,
        border: isActive ? '1px solid rgba(201,168,76,.8)' : undefined,
        transition: 'opacity .2s, border-color .2s',
      }}
      title={isLiveBrew ? 'Live brew in progress' : onPlayBatch ? 'Play replay' : ''}
    >
      {isActive && (
        <div style={{
          position: 'absolute', top: 8, right: 10,
          fontSize: '0.5625rem', letterSpacing: '.12em',
          color: '#c9a84c', opacity: .85, textTransform: 'uppercase',
        }}>
          ▶ Replaying
        </div>
      )}

      <div className={styles.cardHeader}>
        <div>
          {meta?.name
            ? <div className={styles.name}>{meta.name}</div>
            : <div className={styles.date}>{fmtDate(brew.date)}</div>
          }
          {meta?.name && <div className={styles.date} style={{ marginTop: 2 }}>{fmtDate(brew.date)}</div>}
        </div>
        <span className={styles.duration}>{fmtHM(brew.duration)}</span>
      </div>

      {meta && (meta.origin || meta.roast || meta.process) && (
        <div className={styles.metaRow}>
          {[meta.origin, meta.roast, meta.process].filter(Boolean).join(' · ')}
        </div>
      )}

      <div className={styles.chart}>
        {brew.hasData
          ? <MiniChart data={brew.chartData} gradId={brew.id.slice(0, 8)} />
          : (
            <svg viewBox="0 0 600 130" preserveAspectRatio="none" style={{ width: '100%', height: 130, display: 'block' }}>
              <text x="300" y="72" textAnchor="middle" fill="rgba(232,220,200,.2)"
                fontFamily="var(--font-brand,'Space Grotesk',sans-serif)" fontSize="11" letterSpacing=".1em">
                — No sensor data —
              </text>
            </svg>
          )
        }
      </div>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statVal}>{isL || !brew.hasData ? '--' : `${brew.tempMin.toFixed(1)}°F`}</span>
          <span className={styles.statLbl}>Low</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statVal}>{isL || !brew.hasData ? '--' : `${brew.tempMax.toFixed(1)}°F`}</span>
          <span className={styles.statLbl}>High</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statVal}>{isL || !brew.hasData ? '--' : `${brew.tempAvg.toFixed(1)}°F`}</span>
          <span className={styles.statLbl}>Avg</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statVal}>{isL ? '--' : brew.points.toLocaleString()}</span>
          <span className={styles.statLbl}>Readings</span>
        </div>
      </div>

      {meta?.tasting_notes && (
        <div className={styles.tasting}>{meta.tasting_notes}</div>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Update `BatchDetails` default export to accept and pass new props**

Change the component signature and the `BrewCard` call site:

```js
// Signature (line ~138):
export default function BatchDetails({ onPlayBatch, activeReplayId, isLiveBrew }) {
```

And in the carousel map:

```jsx
{brews.map(brew => (
  <BrewCard
    key={brew.id}
    brew={brew}
    onPlayBatch={onPlayBatch}
    onEnter={() => {}}
    onLeave={() => {}}
    isActive={brew.id === activeReplayId}
    isLiveBrew={isLiveBrew}
  />
))}
```

- [ ] **Step 5: Verify**

```bash
npm run dev
```

Open `http://localhost:5173`. Batch carousel should show only published batches. Check newest is leftmost. Check that a card without sensor data renders with "— No sensor data —" instead of stats. Clicking a card should highlight it with gold border and "▶ Replaying" label.

- [ ] **Step 6: Commit**

```bash
git add src/components/BatchDetails.jsx
git commit -m "feat: filter published batches, batch_id FK lookup, newest-first, replay indicator"
```

---

## Task 6: Admin wizard — wizard state machine + Screen 1 (pre-brew form)

This is the largest change. We replace the stage grid section of `AdminPanel.jsx` with a wizard. The wizard screen is driven by `batch?.stage` from the existing `batch_state` poll. Local state handles the grinding popup and grinding timer.

**Files:**
- Modify: `src/pages/AdminPanel.jsx`

- [ ] **Step 1: Add wizard state variables**

In `AdminPanel`, after the existing `useState` declarations (around line ~153), add:

```js
const [grindTimeLeft, setGrindTimeLeft] = useState(15 * 60) // seconds, 15min
const [grindTimerActive, setGrindTimerActive] = useState(false)
const [showGrindPopup, setShowGrindPopup] = useState(false)
const [showPostBatch, setShowPostBatch] = useState(false)
const [postBatchForm, setPostBatchForm] = useState({ yield_g: '', start_weight_g: '' })
const [reviewData, setReviewData] = useState(null) // { readingsCount }
const [showReview, setShowReview] = useState(false)
```

- [ ] **Step 2: Add grinding countdown timer effect**

Add a new `useEffect` after the existing ones (after line ~181):

```js
useEffect(() => {
  if (!grindTimerActive) return
  if (grindTimeLeft <= 0) {
    setGrindTimerActive(false)
    setShowGrindPopup(true)
    return
  }
  const id = setInterval(() => setGrindTimeLeft(t => {
    if (t <= 1) { clearInterval(id); setGrindTimerActive(false); setShowGrindPopup(true); return 0 }
    return t - 1
  }), 1000)
  return () => clearInterval(id)
}, [grindTimerActive, grindTimeLeft])
```

- [ ] **Step 3: Add `startGrinding` function**

Add after `saveBatchTarget` function:

```js
async function startGrinding() {
  if (!form.name?.trim()) { flash_('✗ NAME REQUIRED'); return }
  setSaving(true)
  const newBatchNum = (batch?.batch_number ?? 0) + 1
  const now = new Date().toISOString()

  const { data: nb, error } = await supabase.from('batches').insert({
    batch_number: newBatchNum,
    name: form.name.trim(),
    origin: form.origin || null,
    roast: form.roast || null,
    process: form.process || null,
    grind_notes: form.grind_notes || null,
    tasting_notes: form.tasting_notes || null,
    published: false,
    steep_start: null,
  }).select().single()

  if (error || !nb) { flash_('✗ ERROR'); setSaving(false); return }

  setActiveBatch(nb)

  await supabase.from('batch_state').update({
    stage: 'grinding',
    batch_number: newBatchNum,
    steep_start: null,
    updated_at: now,
  }).eq('id', 1)

  await supabase.from('brew_state').update({ status: 'BREWING' }).eq('id', 1)

  setBatch(prev => ({ ...prev, stage: 'grinding', batch_number: newBatchNum }))
  setGrindTimeLeft(15 * 60)
  setGrindTimerActive(true)
  setSaving(false)
}
```

- [ ] **Step 4: Replace the stage grid section with the wizard renderer**

Remove the entire `{/* ── stage buttons ── */}` div block (lines ~382–396) and the `{/* ── new batch metadata form ── */}` div block (lines ~368–379). Replace both with:

```jsx
{/* ── wizard ── */}
<div style={{ padding: '28px 24px', borderBottom: '1px solid rgba(201,168,76,.1)', maxWidth: 520, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
  {renderWizard()}
</div>
```

- [ ] **Step 5: Add `renderWizard` function**

Add before the `return` statement of `AdminPanel`:

```js
function renderWizard() {
  const stage = batch?.stage ?? 'idle'

  // Screen 1 — pre-brew form
  if (stage === 'idle') {
    return (
      <div>
        <div style={{ color: GOLD, fontSize: 'var(--t-micro,.625rem)', letterSpacing: '.3em', opacity: .4, marginBottom: 20, textAlign: 'center' }}>
          NEW BATCH
        </div>
        <MetaFields form={form} set={setForm} />
        <button onClick={startGrinding} disabled={saving}
          style={{ marginTop: 20, width: '100%', padding: '18px', background: GOLD, border: 'none', cursor: saving ? 'not-allowed' : 'pointer', fontFamily: "'Alfa Slab One',serif", fontSize: '1.1rem', letterSpacing: '.04em', color: INK, opacity: saving ? .5 : 1 }}>
          START GRINDING
        </button>
      </div>
    )
  }

  // Screen 2 — grinding countdown
  if (stage === 'grinding') {
    const m = Math.floor(grindTimeLeft / 60)
    const s = grindTimeLeft % 60
    const display = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    return (
      <div style={{ textAlign: 'center', position: 'relative' }}>
        <div style={{ color: GOLD, fontSize: 'var(--t-micro,.625rem)', letterSpacing: '.3em', opacity: .4, marginBottom: 16 }}>
          GRINDING · BATCH #{String(batch?.batch_number ?? 0).padStart(2, '0')}
        </div>
        {activeBatch?.name && (
          <div style={{ color: CREAM, fontFamily: "'Alfa Slab One',serif", fontSize: '1.1rem', letterSpacing: '.04em', opacity: .7, marginBottom: 20 }}>
            {activeBatch.name}
          </div>
        )}
        <div style={{ fontFamily: "'Alfa Slab One',serif", fontSize: 'clamp(3rem,12vw,5rem)', color: GOLD, letterSpacing: '.04em', lineHeight: 1 }}>
          {display}
        </div>
        <div style={{ color: CREAM, fontSize: 'var(--t-micro,.625rem)', letterSpacing: '.2em', opacity: .3, marginTop: 12 }}>
          COARSE GRIND · 15 MIN MEASURE
        </div>
        {!grindTimerActive && grindTimeLeft === 15 * 60 && (
          <button onClick={() => setGrindTimerActive(true)} disabled={saving}
            style={{ marginTop: 24, padding: '12px 28px', background: 'transparent', border: `1px solid ${GOLD}`, color: GOLD, cursor: 'pointer', fontFamily: "'Cinzel',serif", fontSize: 'var(--t-micro,.625rem)', letterSpacing: '.25em' }}>
            START TIMER
          </button>
        )}

        {/* Grinding popup */}
        {showGrindPopup && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(13,11,8,.96)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, flexDirection: 'column', gap: 32, padding: 32 }}>
            <div style={{ color: GOLD, fontFamily: "'Alfa Slab One',serif", fontSize: 'clamp(1.5rem,6vw,2.5rem)', letterSpacing: '.04em', textAlign: 'center' }}>
              Grind looks good?
            </div>
            <div style={{ color: CREAM, opacity: .5, fontSize: 'var(--t-body,.875rem)', letterSpacing: '.08em', fontFamily: "'Cinzel',serif", textAlign: 'center' }}>
              Ready to start the 20-hour steep.
            </div>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
              <button onClick={beginSteep} disabled={saving}
                style={{ padding: '18px 36px', background: GOLD, border: 'none', cursor: 'pointer', fontFamily: "'Alfa Slab One',serif", fontSize: '1rem', color: INK, opacity: saving ? .5 : 1 }}>
                BEGIN STEEP
              </button>
              <button onClick={() => { setShowGrindPopup(false); setGrindTimeLeft(15 * 60); setGrindTimerActive(false) }}
                style={{ padding: '18px 28px', background: 'transparent', border: `1px solid rgba(201,168,76,.3)`, color: CREAM, cursor: 'pointer', fontFamily: "'Cinzel',serif", fontSize: 'var(--t-micro,.625rem)', letterSpacing: '.2em', opacity: .6 }}>
                NOT YET — KEEP GRINDING
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Screen 3 — steeping (placeholder, expanded in Task 8)
  if (stage === 'steeping') {
    return (
      <div style={{ textAlign: 'center' }}>
        <div style={{ color: GOLD, fontSize: 'var(--t-micro,.625rem)', letterSpacing: '.3em', opacity: .4, marginBottom: 12 }}>STEEPING</div>
        <div style={{ color: CREAM, opacity: .4, fontSize: 'var(--t-micro,.625rem)', letterSpacing: '.2em' }}>Full screen in next task</div>
      </div>
    )
  }

  // Screen 4+ (placeholder, expanded in Tasks 9–10)
  return (
    <div style={{ textAlign: 'center', color: CREAM, opacity: .3, fontSize: 'var(--t-micro,.625rem)', letterSpacing: '.2em' }}>
      {stage.toUpperCase()}
    </div>
  )
}
```

- [ ] **Step 6: Verify**

```bash
npm run dev
```

Open `http://localhost:5173?admin`, log in. Confirm:
- Screen 1 shows the pre-brew form with START GRINDING button
- Clicking START GRINDING (with a name filled in) creates a batch record in Supabase and transitions to Screen 2
- Screen 2 shows 15:00 countdown with START TIMER button
- Clicking START TIMER counts down
- At 0:00 the grinding popup appears
- "NOT YET" resets timer to 15:00

- [ ] **Step 7: Commit**

```bash
git add src/pages/AdminPanel.jsx
git commit -m "feat: admin wizard Screen 1 and grinding phase with popup"
```

---

## Task 7: Admin wizard — `beginSteep` + Screen 3 (steeping phase)

**Files:**
- Modify: `src/pages/AdminPanel.jsx`

- [ ] **Step 1: Add `beginSteep` function**

Add after `startGrinding`:

```js
async function beginSteep() {
  if (!activeBatch) { flash_('✗ NO ACTIVE BATCH'); return }
  setSaving(true)
  const now = new Date().toISOString()

  await Promise.all([
    supabase.from('batches').update({ steep_start: now }).eq('id', activeBatch.id),
    supabase.from('batch_state').update({ stage: 'steeping', steep_start: now, updated_at: now }).eq('id', 1),
    supabase.from('brew_state').update({ status: 'BREWING' }).eq('id', 1),
  ])

  setActiveBatch(prev => ({ ...prev, steep_start: now }))
  setBatch(prev => ({ ...prev, stage: 'steeping', steep_start: now }))
  setShowGrindPopup(false)
  setSaving(false)
}
```

- [ ] **Step 2: Add `markReady` function**

```js
async function markReady() {
  if (!activeBatch) return
  setSaving(true)
  const now = new Date().toISOString()

  await Promise.all([
    supabase.from('batches').update({ steep_end: now }).eq('id', activeBatch.id),
    supabase.from('batch_state').update({ stage: 'ready', updated_at: now }).eq('id', 1),
    supabase.from('brew_state').update({ status: 'READY' }).eq('id', 1),
  ])

  setActiveBatch(prev => ({ ...prev, steep_end: now }))
  setBatch(prev => ({ ...prev, stage: 'ready' }))
  setShowPostBatch(true)
  setSaving(false)
}
```

- [ ] **Step 3: Replace the steeping placeholder in `renderWizard`**

Replace the `if (stage === 'steeping')` block:

```js
if (stage === 'steeping') {
  const steepStart = activeBatch?.steep_start || batch?.steep_start
  const elapsed = steepStart
    ? Math.floor((Date.now() - new Date(steepStart).getTime()) / 1000)
    : 0
  const elapsedH = Math.floor(elapsed / 3600)
  const elapsedM = Math.floor((elapsed % 3600) / 60)

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ color: GOLD, fontSize: 'var(--t-micro,.625rem)', letterSpacing: '.3em', opacity: .4, marginBottom: 12 }}>
        STEEPING · BATCH #{String(batch?.batch_number ?? 0).padStart(2, '0')}
      </div>
      {activeBatch?.name && (
        <div style={{ color: CREAM, fontFamily: "'Alfa Slab One',serif", fontSize: '1rem', letterSpacing: '.04em', opacity: .7, marginBottom: 16 }}>
          {activeBatch.name}
        </div>
      )}
      <div style={{ fontFamily: "'Alfa Slab One',serif", fontSize: 'clamp(2.5rem,10vw,4rem)', color: CREAM, letterSpacing: '.04em', lineHeight: 1, opacity: .85 }}>
        {String(elapsedH).padStart(2, '0')}:{String(elapsedM).padStart(2, '0')}
      </div>
      <div style={{ color: CREAM, fontSize: 'var(--t-micro,.625rem)', letterSpacing: '.18em', opacity: .3, marginTop: 8 }}>
        ELAPSED · TARGET 20:00
      </div>
      {activeBatch?.origin && (
        <div style={{ color: CREAM, opacity: .35, fontSize: 'var(--t-micro,.625rem)', letterSpacing: '.15em', marginTop: 16 }}>
          {[activeBatch.origin, activeBatch.roast, activeBatch.process].filter(Boolean).join(' · ')}
        </div>
      )}
      <button onClick={markReady} disabled={saving}
        style={{ marginTop: 28, width: '100%', padding: '16px', background: 'transparent', border: `2px solid ${GOLD}`, color: GOLD, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: "'Alfa Slab One',serif", fontSize: '.95rem', letterSpacing: '.04em', opacity: saving ? .5 : 1 }}>
        MARK AS READY
      </button>
    </div>
  )
}
```

Note: the elapsed counter is a static snapshot on render — it will update when the poll fires every 5s. This is intentional; the admin doesn't need a live 1s tick.

- [ ] **Step 4: Verify**

```bash
npm run dev
```

Open `?admin`. Start a batch through grinding → confirm popup → click BEGIN STEEP. Screen 3 should show elapsed counter and MARK AS READY button. Clicking MARK AS READY should close and show the next placeholder stage.

- [ ] **Step 5: Commit**

```bash
git add src/pages/AdminPanel.jsx
git commit -m "feat: admin wizard Screen 3 steeping phase, beginSteep and markReady"
```

---

## Task 8: Admin wizard — post-batch popup + Screen 4 (review & publish)

**Files:**
- Modify: `src/pages/AdminPanel.jsx`
- Modify: `src/lib/utils.js` (use `buildClaimParams`)

- [ ] **Step 1: Add `loadReviewData` function**

This runs a COUNT pre-flight before showing Screen 4:

```js
async function loadReviewData() {
  if (!activeBatch?.steep_start || !activeBatch?.steep_end) {
    setReviewData({ readingsCount: 0 })
    setShowReview(true)
    return
  }
  const { count } = await supabase.from('temperature_readings')
    .select('recorded_at', { count: 'exact' })
    .gte('recorded_at', activeBatch.steep_start)
    .lte('recorded_at', activeBatch.steep_end)
    .is('batch_id', null)
  setReviewData({ readingsCount: count ?? 0 })
  setShowReview(true)
}
```

- [ ] **Step 2: Add `publishBatch` function**

```js
async function publishBatch() {
  if (!activeBatch) return
  setSaving(true)

  // Claim readings in the steep window
  if (activeBatch.steep_start && activeBatch.steep_end) {
    await supabase.from('temperature_readings')
      .gte('recorded_at', activeBatch.steep_start)
      .lte('recorded_at', activeBatch.steep_end)
      .is('batch_id', null)
      .update({ batch_id: activeBatch.id })
  }

  // Save post-batch fields + mark published
  const updates = {
    published: true,
    tasting_notes: form.tasting_notes || activeBatch.tasting_notes || null,
  }
  if (postBatchForm.yield_g) updates.yield_g = parseInt(postBatchForm.yield_g)
  if (postBatchForm.start_weight_g) updates.start_weight_g = parseInt(postBatchForm.start_weight_g)

  await supabase.from('batches').update(updates).eq('id', activeBatch.id)

  // Reset admin to idle
  await supabase.from('batch_state').update({ stage: 'idle', steep_start: null, updated_at: new Date().toISOString() }).eq('id', 1)
  await supabase.from('brew_state').update({ status: 'IDLE' }).eq('id', 1)

  setBatch(prev => ({ ...prev, stage: 'idle' }))
  setActiveBatch(null)
  setForm(EMPTY_FORM)
  setShowPostBatch(false)
  setShowReview(false)
  setReviewData(null)
  setPostBatchForm({ yield_g: '', start_weight_g: '' })
  loadPastBatches()
  flash_('✓ PUBLISHED')
  setSaving(false)
}
```

- [ ] **Step 3: Add post-batch popup + review screen to `renderWizard`**

Replace the final `return` fallback in `renderWizard` (the one that currently returns the stage placeholder for 'ready'):

```js
if (stage === 'ready' || showReview) {
  // Screen 4 — Review & publish
  if (showReview && reviewData) {
    const dur = activeBatch?.steep_start && activeBatch?.steep_end
      ? fmtDur(activeBatch.steep_start, activeBatch.steep_end)
      : '—'
    return (
      <div>
        <div style={{ color: GOLD, fontSize: 'var(--t-micro,.625rem)', letterSpacing: '.3em', opacity: .4, marginBottom: 20, textAlign: 'center' }}>
          REVIEW & PUBLISH
        </div>
        <div style={{ border: '1px solid rgba(201,168,76,.2)', padding: '16px 18px', marginBottom: 16, background: 'rgba(201,168,76,.03)' }}>
          <div style={{ color: CREAM, fontFamily: "'Alfa Slab One',serif", fontSize: '1rem', opacity: .85 }}>{activeBatch?.name || 'Unnamed'}</div>
          <div style={{ color: CREAM, fontSize: 'var(--t-micro,.625rem)', letterSpacing: '.15em', opacity: .3, marginTop: 4 }}>
            {fmtDate(activeBatch?.steep_start)} · {dur}
          </div>
          {(activeBatch?.origin || activeBatch?.roast) && (
            <div style={{ color: CREAM, fontSize: 'var(--t-micro,.625rem)', letterSpacing: '.12em', opacity: .25, marginTop: 3 }}>
              {[activeBatch?.origin, activeBatch?.roast, activeBatch?.process].filter(Boolean).join(' · ')}
            </div>
          )}
        </div>
        <div style={{ padding: '10px 14px', background: reviewData.readingsCount > 0 ? 'rgba(80,200,120,.07)' : 'rgba(220,80,60,.07)', border: `1px solid ${reviewData.readingsCount > 0 ? 'rgba(80,200,120,.2)' : 'rgba(220,80,60,.2)'}`, marginBottom: 20, fontSize: 'var(--t-micro,.625rem)', letterSpacing: '.12em', color: reviewData.readingsCount > 0 ? '#80e8a0' : '#f08070' }}>
          {reviewData.readingsCount > 0
            ? `✓ ${reviewData.readingsCount.toLocaleString()} sensor readings will be linked`
            : '⚠ No sensor readings found in this window — card will publish without a chart'}
        </div>
        <button onClick={publishBatch} disabled={saving}
          style={{ width: '100%', padding: '18px', background: GOLD, border: 'none', cursor: saving ? 'not-allowed' : 'pointer', fontFamily: "'Alfa Slab One',serif", fontSize: '1rem', color: INK, opacity: saving ? .5 : 1 }}>
          PUBLISH TO SITE
        </button>
        <button onClick={() => { setShowReview(false) }} disabled={saving}
          style={{ width: '100%', marginTop: 10, padding: '12px', background: 'transparent', border: '1px solid rgba(201,168,76,.2)', color: CREAM, cursor: 'pointer', fontFamily: "'Cinzel',serif", fontSize: 'var(--t-micro,.625rem)', letterSpacing: '.2em', opacity: .5 }}>
          BACK
        </button>
      </div>
    )
  }

  // Post-batch popup
  return (
    <div>
      <div style={{ color: GOLD, fontSize: 'var(--t-micro,.625rem)', letterSpacing: '.3em', opacity: .4, marginBottom: 20, textAlign: 'center' }}>
        BATCH READY · ADD FINAL DETAILS
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div>
          <label style={LABEL_STYLE}>Start Weight (g)</label>
          <input type="number" style={FIELD} placeholder="e.g. 1893"
            value={postBatchForm.start_weight_g}
            onChange={e => setPostBatchForm(f => ({ ...f, start_weight_g: e.target.value }))} />
        </div>
        <div>
          <label style={LABEL_STYLE}>Yield Weight (g)</label>
          <input type="number" style={FIELD} placeholder="e.g. 40"
            value={postBatchForm.yield_g}
            onChange={e => setPostBatchForm(f => ({ ...f, yield_g: e.target.value }))} />
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={LABEL_STYLE}>Final Tasting Notes</label>
          <input style={FIELD} placeholder="Chocolate, low acid, smooth finish"
            value={form.tasting_notes}
            onChange={e => setForm(f => ({ ...f, tasting_notes: e.target.value }))} />
        </div>
      </div>
      <button onClick={loadReviewData} disabled={saving}
        style={{ marginTop: 20, width: '100%', padding: '16px', background: GOLD, border: 'none', cursor: saving ? 'not-allowed' : 'pointer', fontFamily: "'Alfa Slab One',serif", fontSize: '.95rem', color: INK, opacity: saving ? .5 : 1 }}>
        REVIEW & PUBLISH
      </button>
    </div>
  )
}

return null
```

- [ ] **Step 4: Verify full wizard flow**

```bash
npm run dev
```

Walk through the full flow:
1. Screen 1: fill in a test batch name → START GRINDING
2. Screen 2: START TIMER → wait for popup (or click in DevTools to trigger `setShowGrindPopup(true)` manually)
3. Popup → BEGIN STEEP
4. Screen 3: MARK AS READY
5. Post-batch form: fill in weights → REVIEW & PUBLISH
6. Screen 4: confirm reading count shown → PUBLISH TO SITE

After publish: check Supabase `batches` table — `published = true`. Check `temperature_readings` — rows in the steep window now have `batch_id` set. Check public site — new card appears.

- [ ] **Step 5: Commit**

```bash
git add src/pages/AdminPanel.jsx
git commit -m "feat: admin wizard post-batch popup, review screen, publish with claim UPDATE"
```

---

## Task 9: Retroactive `+ ADD` — claim on save + `published = true`

**Files:**
- Modify: `src/pages/AdminPanel.jsx`

- [ ] **Step 1: Update `addBatch` to run claim UPDATE and set `published = true`**

Find the `addBatch` function (around line ~277) and replace it:

```js
async function addBatch() {
  if (!addForm.steep_start) { flash_('✗ NEED START DATE'); return }
  setSaving(true)

  const steepStartISO = toISO(addForm.steep_start)
  const steepEndISO = toISO(addForm.steep_end) || null

  // Pre-flight count
  let readingsCount = 0
  if (steepStartISO && steepEndISO) {
    const { count } = await supabase.from('temperature_readings')
      .select('recorded_at', { count: 'exact' })
      .gte('recorded_at', steepStartISO)
      .lte('recorded_at', steepEndISO)
      .is('batch_id', null)
    readingsCount = count ?? 0
  }

  if (steepEndISO && readingsCount === 0) {
    const ok = window.confirm('No sensor readings found in this time window — the card will publish without a temperature chart. Proceed?')
    if (!ok) { setSaving(false); return }
  }

  const { data: nb, error } = await supabase.from('batches').insert({
    name: addForm.name || null,
    origin: addForm.origin || null,
    roast: addForm.roast || null,
    process: addForm.process || null,
    grind_notes: addForm.grind_notes || null,
    tasting_notes: addForm.tasting_notes || null,
    steep_start: steepStartISO,
    steep_end: steepEndISO,
    published: true,
  }).select().single()

  if (error || !nb) { flash_('✗ ERROR'); setSaving(false); return }

  // Claim readings in the window
  if (steepStartISO && steepEndISO && readingsCount > 0) {
    await supabase.from('temperature_readings')
      .gte('recorded_at', steepStartISO)
      .lte('recorded_at', steepEndISO)
      .is('batch_id', null)
      .update({ batch_id: nb.id })
  }

  flash_(`✓ PUBLISHED · ${readingsCount.toLocaleString()} readings linked`)
  setIsAdding(false)
  setAddForm(EMPTY_FORM)
  loadPastBatches()
  setSaving(false)
}
```

- [ ] **Step 2: Verify retroactive add**

```bash
npm run dev
```

Open `?admin` → Past Batches → `+ ADD`. Enter the steep start and end times for your existing unlinked batch. Hit SAVE BATCH. Confirm the reading count appears in the flash message. Check the public site — card appears with temperature chart populated.

- [ ] **Step 3: Commit**

```bash
git add src/pages/AdminPanel.jsx
git commit -m "feat: retroactive add claims temperature readings and publishes immediately"
```

---

## Task 10: Restore `batch_state` on reload + sync `activeBatch` 

On page reload during an active batch, the wizard screen derives from `batch?.stage` (already polled). But `activeBatch` state is empty until the existing `useEffect` loads it. The existing load logic (line ~168–181) already handles this — it queries `batches WHERE steep_end IS NULL`. One change needed: after reload in grinding state, the grinding timer starts paused (user must tap START TIMER again). This is correct and intentional per the spec.

**Files:**
- Modify: `src/pages/AdminPanel.jsx`

- [ ] **Step 1: On reload into `ready` state, auto-show post-batch popup**

The existing `useEffect` that loads `activeBatch` (around line ~168) fires after login. Add a side effect:

```js
useEffect(() => {
  if (!session) return
  supabase.from('batches').select('*').is('steep_end', null)
    .order('steep_start', { ascending: false }).limit(1).single()
    .then(({ data }) => {
      if (data) {
        setActiveBatch(data)
        setForm({
          name: data.name ?? '', origin: data.origin ?? '', roast: data.roast ?? 'Light',
          process: data.process ?? 'Washed', grind_notes: data.grind_notes ?? '',
          tasting_notes: data.tasting_notes ?? '', steep_start: '', steep_end: '',
        })
      }
    })
  // If we reload mid-batch, also check for a closed batch that hasn't been published yet
  supabase.from('batches').select('*')
    .eq('published', false)
    .not('steep_end', 'is', null)
    .order('steep_start', { ascending: false }).limit(1).single()
    .then(({ data }) => {
      if (data) setShowPostBatch(true)
    })
  loadPastBatches()
}, [userId])
```

- [ ] **Step 2: Verify reload recovery**

```bash
npm run dev
```

Start a batch through to STEEPING. Reload the page. Confirm the wizard shows Screen 3 (steeping) with the correct batch name. Start through to READY, reload — confirm post-batch popup appears.

- [ ] **Step 3: Commit**

```bash
git add src/pages/AdminPanel.jsx
git commit -m "fix: restore post-batch popup on reload after batch marked ready"
```

---

## Task 11: Run all tests + final check

- [ ] **Step 1: Run test suite**

```bash
npx vitest run
```

Expected: All tests pass. Note the exact passing count.

- [ ] **Step 2: Build for production**

```bash
npm run build
```

Expected: Build completes with no errors. Note any warnings.

- [ ] **Step 3: Smoke-test the build**

```bash
npm run preview
```

Open `http://localhost:4173`. Verify:
- Batch carousel shows only published batches, newest first
- Cards with no sensor data show "— No sensor data —" in chart area
- Clicking a card shows gold border + "▶ Replaying" label
- Clicking same card again returns to STANDBY
- No double-countdown visible in any state

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "chore: production build verified, batch wizard complete"
```
