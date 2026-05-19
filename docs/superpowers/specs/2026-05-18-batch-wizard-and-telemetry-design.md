# Batch Wizard, Telemetry Timer, and Batch Card Design
**Date:** 2026-05-18  
**Status:** Approved  

---

## Problem Summary

Three connected issues:

1. **Batch cards show incomplete data** — only batches with ≥2 temperature readings appear on the public site. The `fetchHeavy` function filters out all others silently. The real cause is that the public site should only ever show batches the brewer explicitly published — not all DB rows.

2. **Multiple timers on screen** — `BrewStageDisplay` and `BrewTelemetry` each run independent countdown intervals. Clicking a batch card to start a replay can briefly spawn two overlapping intervals. The rule should be: one countdown visible at a time.

3. **No connected batch submission workflow** — the admin stage buttons (GRINDING → STEEPING → READY) create batch records but feel disconnected from the physical brew process. After completing a brew, there's no clear path to publishing the data to the site. Temperature readings are logged by the ESP32 but linked to batches only via time-range query on every page load, which is fragile and provides no feedback.

---

## Decisions

- **Approach B**: Wizard-style admin flow replacing the stage grid.
- **Published flag**: Only explicitly published batches appear on the public site.
- **Batch_id FK on temperature_readings**: Readings are permanently claimed at publish time via a one-time UPDATE. ESP32 firmware is unchanged.
- **Time window used once**: At PUBLISH, the wizard claims all `temperature_readings` in the `steep_start → steep_end` window. Public site queries by `batch_id`, not by time range.
- **One timer rule**: Only one countdown is visible on screen at any moment.

---

## Data Model Changes

### `batches` table — new columns

```sql
ALTER TABLE batches ADD COLUMN published boolean DEFAULT false;
ALTER TABLE batches ADD COLUMN yield_g integer;
ALTER TABLE batches ADD COLUMN start_weight_g integer;
```

- `published = false` by default — all existing rows stay hidden from the public site
- `yield_g` and `start_weight_g` are filled in the post-batch popup
- The admin panel shows all batches regardless of `published` state

### `temperature_readings` table — new column

```sql
ALTER TABLE temperature_readings ADD COLUMN batch_id uuid REFERENCES batches(id);
```

- Nullable — readings with `batch_id IS NULL` are unclaimed (ESP32 running with no active batch)
- Set once at PUBLISH time via:

```sql
UPDATE temperature_readings
SET batch_id = :batch_id
WHERE recorded_at BETWEEN :steep_start AND :steep_end
AND batch_id IS NULL
```

- ESP32 firmware: **unchanged**

---

## Admin Wizard — Screen by Screen

Replaces the current 4-button stage grid. Accessible at `localhost:PORT?admin` (dev only, by design).

### Screen 1 — Pre-brew details
Shown when no batch is active. Fields (all optional except name):
- Batch name *(required — used as human-readable identifier)*
- Origin, Roast (select), Process (select)
- Grind notes, Tasting notes

**CTA:** `START GRINDING` → creates batch record in `batches` table (`published = false`, `steep_start = null` — not yet set), writes `batch_number + 1` to `batch_state`, transitions to Screen 2.

### Screen 2 — Grinding phase
- 15-minute countdown timer (full-screen, large display)
- Batch name and number shown
- When timer hits 0:00 → **Grinding popup** appears automatically

**Grinding popup** (full-screen overlay):
> "Grind looks good? Ready to start steeping."  
> [ BEGIN STEEP ] [ NOT YET — keep grinding ]

- "BEGIN STEEP" → sets `batch_state.stage = steeping`, `batch_state.steep_start = now`, AND `batches.steep_start = now` on the active batch record — this timestamp defines the start of the readings claim window. Transitions to Screen 3.
- "NOT YET" → resets the 15-min timer, popup closes

### Screen 3 — Steeping phase
- Elapsed time counter (counting up from steep start)
- Current temperature from ESP32 (live poll of `brew_state`)
- Batch metadata summary (name, origin, roast)
- `MARK AS READY` button — available at any time

**`MARK AS READY`** → sets `batch_state.stage = ready`, `batches.steep_end = now` → opens Post-batch popup.

**Post-batch popup** (sheet from bottom):
Fields:
- Start weight (g)
- Yield weight (g) 
- Final tasting notes (pre-filled from Screen 1, editable)

**CTA:** `REVIEW & PUBLISH` → transitions to Screen 4.

### Screen 4 — Review & Publish
- Preview of the batch card exactly as it will appear on the public site
- Summary: date, duration, temp stats (computed from a pre-flight COUNT query on the time window — readings are not yet claimed at this point)
- "Readings found in window: 1,847 · 19h 58m" — confirmation the time window matched data. If 0 readings found, shows a warning before allowing publish.
- **`PUBLISH TO SITE`** button — runs in this order:
  1. Runs the claim UPDATE on `temperature_readings`
  2. Sets `batches.published = true`
  3. Sets `batch_state.stage = idle`
  4. Card immediately appears on public site

---

## Retroactive Batch Submission (`+ ADD`)

No UX change to the existing form. Behavior change:

- On save: runs the same claim UPDATE (`temperature_readings` within the entered time window)
- Sets `published = true` automatically
- If no readings are found in the window: shows a warning "No sensor data found in this window — batch will publish without a temperature chart. Proceed?" with confirm/cancel.

This is the path for adding batches where the ESP32 ran but the wizard wasn't used.

---

## Public Site — `BatchDetails` Changes

### Query
```js
// Before
supabase.from('batches')
  .not('steep_end', 'is', null)
  .order('steep_start', { ascending: false })
  .limit(12)

// After
supabase.from('batches')
  .eq('published', true)
  .order('steep_start', { ascending: false })
  .limit(12)
```

### Temperature readings query
```js
// Before — time-range query on every load
supabase.from('temperature_readings')
  .gte('recorded_at', meta.steep_start)
  .lte('recorded_at', meta.steep_end)

// After — FK lookup
supabase.from('temperature_readings')
  .eq('batch_id', meta.id)
```

### Batch card without sensor data
If a published batch has no linked readings (`batch_id` lookup returns 0 rows):
- Chart area: empty SVG with a centered "— No sensor data —" label at 30% opacity
- Stats: all show `—`
- Card still renders and is clickable (clicking deselects / does nothing for replay)

### Sort order
Changed from `ascending: true` to `ascending: false` — newest batch is leftmost in carousel.

### Active replay indicator
- When a card is the currently replaying batch: gold border pulse animation + `▶ REPLAYING` label in top-right corner
- Clicking the active card again → deselects → returns telemetry panel to IDLE
- During a live brew (`brew_state.status = BREWING`): all cards get `opacity: 0.4`, cursor becomes `not-allowed`, hover shows tooltip "Live brew in progress"

---

## Timer Architecture — One Countdown at a Time

### Rule
Only one countdown is ever visible on screen simultaneously.

### Mode table

| Mode | BrewStageDisplay | BrewTelemetry countdown |
|------|-----------------|------------------------|
| IDLE | hidden | hidden — shows "STANDBY" |
| GRINDING | grinding animation (no countdown) | hidden via `suppressCountdown` prop |
| STEEPING (live) | ✓ countdown jar visible | hidden — shows live temp + chart only |
| READY | ready animation | hidden |
| REPLAY | hidden | ✓ replay countdown — only timer on screen |

### `suppressCountdown` prop
`BrewTelemetry` receives a boolean `suppressCountdown` prop from `App`. When true, the countdown text is replaced with the status label only. Computed in `App`:

```js
const suppressCountdown = !!(liveStage === 'grinding' || liveStage === 'steeping' || liveStage === 'ready')
```

Where `liveStage` comes from polling `batch_state`.

### Replay timer leak fix
In `useReplayBatch`, clear `replayData` to `null` synchronously when `requestedBatchId` changes — before the async fetch resolves. This stops the old `setInterval` before the new one starts:

```js
useEffect(() => {
  if (!isActive) { setReplayData(null); return }
  setReplayData(null) // ← stop old timer immediately
  let running = true
  async function fetchBatch() { /* ... */ }
  fetchBatch()
  return () => { running = false }
}, [isActive, requestedBatchId])
```

---

## State Machine — Public Site Telemetry Panel

Four explicit modes with all transitions defined:

```
IDLE ──(user clicks card)──→ REPLAY(batch X)
REPLAY(X) ──(clicks different card)──→ REPLAY(batch Y)
REPLAY(X) ──(clicks same card again)──→ IDLE
REPLAY(X) ──(brew_state = BREWING)──→ LIVE  [replay cancelled silently]
IDLE ──(brew_state = BREWING)──→ LIVE
LIVE ──(brew_state = COMPLETE/IDLE)──→ IDLE  [does NOT restore prior replay]
```

`requestedBatchId` is reset to `null` whenever transitioning to LIVE, so replay does not auto-restart when the brew ends.

---

## Out of Scope

- Push/SMS notifications for the grinding→steeping transition (deferred to later)
- ESP32 firmware changes of any kind
- Making the admin accessible in production (currently dev-only by design)
- Automatic detection of unclaimed ESP32 sessions (retroactive `+ ADD` covers this manually)
