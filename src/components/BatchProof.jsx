import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const INK       = '#161108'
const GOLD      = '#c9a84c'
const CREAM     = '#f2ede0'
const RULE      = 'rgba(201,168,76,.15)'
const GOLD_GRAD = `linear-gradient(135deg, #f0d878 0%, ${GOLD} 55%, #9a7020 100%)`

const css = `
  .bp-section {
    background: ${INK};
    border-top: 1px solid ${RULE};
    padding: 80px 24px 96px;
  }
  .bp-inner {
    max-width: 1040px;
    margin: 0 auto;
  }
  .bp-eyebrow {
    font-family: var(--font-brand, 'Space Grotesk', sans-serif);
    font-size: var(--t-label, 0.6875rem);
    letter-spacing: .4em;
    text-transform: uppercase;
    color: ${GOLD};
    opacity: .55;
    margin-bottom: 14px;
  }
  .bp-headline {
    font-family: var(--font-display, 'Alfa Slab One', serif);
    font-size: clamp(2rem, 6vw, 3.5rem);
    line-height: 1.05;
    background: ${GOLD_GRAD};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin: 0 0 48px;
  }
  .bp-empty {
    font-family: var(--font-brand, 'Space Grotesk', sans-serif);
    font-size: var(--t-label, 0.6875rem);
    letter-spacing: .22em;
    text-transform: uppercase;
    color: ${CREAM};
    opacity: .18;
    padding: 60px 0;
    text-align: center;
  }
  .bp-caption {
    font-family: var(--font-brand, 'Space Grotesk', sans-serif);
    font-size: var(--t-micro, 0.625rem);
    letter-spacing: .18em;
    text-transform: uppercase;
    color: ${CREAM};
    opacity: .18;
    margin-top: 20px;
  }

  /* Card grid */
  .bc-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(440px, 1fr));
    gap: 1px;
    background: ${RULE};
    border: 1px solid ${RULE};
  }
  .bc-card {
    background: ${INK};
  }
  .bc-card-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    padding: 18px 20px 14px;
    border-bottom: 1px solid rgba(201,168,76,.08);
  }
  .bc-date {
    font-family: var(--font-brand, 'Space Grotesk', sans-serif);
    font-size: var(--t-label, 0.6875rem);
    letter-spacing: .28em;
    text-transform: uppercase;
    color: ${CREAM};
    opacity: .45;
  }
  .bc-duration {
    font-family: var(--font-display, 'Alfa Slab One', serif);
    font-size: 1.15rem;
    background: ${GOLD_GRAD};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: .02em;
  }
  .bc-chart {
    border-bottom: 1px solid rgba(201,168,76,.08);
    overflow: hidden;
    line-height: 0;
  }
  .bc-stats {
    display: flex;
    gap: 0;
  }
  .bc-stat {
    flex: 1;
    padding: 12px 20px 16px;
    border-right: 1px solid rgba(201,168,76,.08);
  }
  .bc-stat:last-child { border-right: none; }
  .bc-stat-val {
    display: block;
    font-family: var(--font-display, 'Alfa Slab One', serif);
    font-size: clamp(1rem, 2.5vw, 1.25rem);
    background: ${GOLD_GRAD};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    line-height: 1.2;
    margin-bottom: 3px;
  }
  .bc-stat-lbl {
    display: block;
    font-family: var(--font-brand, 'Space Grotesk', sans-serif);
    font-size: var(--t-micro, 0.625rem);
    letter-spacing: .2em;
    text-transform: uppercase;
    color: ${CREAM};
    opacity: .28;
  }

  @media (max-width: 640px) {
    .bp-section { padding: 56px 16px 72px; }
    .bc-grid { grid-template-columns: 1fr; }
    .bc-stat { padding: 10px 14px 14px; }
  }
`

function thin(arr, max = 200) {
  if (arr.length <= max) return arr
  const step = Math.ceil(arr.length / max)
  return arr.filter((_, i) => i % step === 0 || i === arr.length - 1)
}

function fmtHM(s) {
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  return `${h}h ${String(m).padStart(2, '0')}m`
}

function fmtDate(d) {
  return d.toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  }).toUpperCase()
}

function MiniChart({ data, gradId }) {
  const W = 600, H = 130
  if (data.length < 2) return null

  const temps = data.map(p => p.temp_f)
  const lo = Math.min(...temps), hi = Math.max(...temps)
  const range = hi - lo || 0.5
  const PAD = 8

  const elapsed = data.map(d => d.elapsed_s)
  const eMin = elapsed[0], eMax = elapsed[elapsed.length - 1]
  const eRange = eMax - eMin || 1

  const toX = e => ((e - eMin) / eRange) * W
  const toY = t => H - PAD - ((t - lo) / range) * (H - PAD * 2)

  const linePts = data.map(d =>
    `${toX(d.elapsed_s).toFixed(1)},${toY(d.temp_f).toFixed(1)}`
  ).join(' ')

  const areaD = [
    `M ${toX(data[0].elapsed_s).toFixed(1)},${toY(data[0].temp_f).toFixed(1)}`,
    ...data.slice(1).map(d => `L ${toX(d.elapsed_s).toFixed(1)},${toY(d.temp_f).toFixed(1)}`),
    `L ${W},${H} L 0,${H} Z`
  ].join(' ')

  // Hour tick marks on x-axis
  const totalHours = eMax / 3600
  const hStep = totalHours > 15 ? 5 : totalHours > 7 ? 2 : 1
  const hTicks = []
  for (let h = 0; h * 3600 <= eMax; h += hStep) hTicks.push(h)

  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none"
      style={{ width: '100%', height: 130, display: 'block' }}>
      <defs>
        <linearGradient id={`mc-${gradId}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={GOLD} stopOpacity="0.18" />
          <stop offset="100%" stopColor={GOLD} stopOpacity="0" />
        </linearGradient>
      </defs>
      {hTicks.map(h => (
        <line key={h}
          x1={toX(h * 3600).toFixed(1)} y1={0}
          x2={toX(h * 3600).toFixed(1)} y2={H}
          stroke="rgba(201,168,76,.06)" strokeWidth="1" />
      ))}
      <path d={areaD} fill={`url(#mc-${gradId})`} />
      <polyline points={linePts} fill="none" stroke={GOLD}
        strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}

function BrewCard({ brew }) {
  return (
    <div className="bc-card">
      <div className="bc-card-header">
        <span className="bc-date">{fmtDate(brew.date)}</span>
        <span className="bc-duration">{fmtHM(brew.duration)}</span>
      </div>
      <div className="bc-chart">
        <MiniChart data={brew.chartData} gradId={brew.id.slice(0, 8)} />
      </div>
      <div className="bc-stats">
        <div className="bc-stat">
          <span className="bc-stat-val">{brew.tempMin.toFixed(1)}°F</span>
          <span className="bc-stat-lbl">Low</span>
        </div>
        <div className="bc-stat">
          <span className="bc-stat-val">{brew.tempMax.toFixed(1)}°F</span>
          <span className="bc-stat-lbl">High</span>
        </div>
        <div className="bc-stat">
          <span className="bc-stat-val">{brew.tempAvg.toFixed(1)}°F</span>
          <span className="bc-stat-lbl">Avg</span>
        </div>
        <div className="bc-stat">
          <span className="bc-stat-val">{brew.points.toLocaleString()}</span>
          <span className="bc-stat-lbl">Readings</span>
        </div>
      </div>
    </div>
  )
}

export default function BatchProof() {
  const [brews, setBrews] = useState(null)

  useEffect(() => {
    async function load() {
      // Paginate all rows 1000 at a time — Supabase caps single responses at 1000
      const all = []
      const PAGE = 1000
      let from = 0
      while (true) {
        const { data } = await supabase.from('temperature_readings')
          .select('brew_id, temp_c, recorded_at')
          .order('recorded_at', { ascending: true })
          .range(from, from + PAGE - 1)
        if (!data?.length) break
        all.push(...data)
        if (data.length < PAGE) break
        from += PAGE
      }

      if (!all.length) { setBrews([]); return }

      // Split into batches by time gap — any gap > 6h = new batch.
      // Within a brew, ESP32 dropouts are typically minutes; between brews is days.
      const GAP_MS = 6 * 60 * 60 * 1000
      const batches = []
      let current = [all[0]]
      for (let i = 1; i < all.length; i++) {
        const gap = new Date(all[i].recorded_at) - new Date(all[i - 1].recorded_at)
        if (gap > GAP_MS) { batches.push(current); current = [] }
        current.push(all[i])
      }
      batches.push(current)

      const processed = batches
        .filter(readings => readings.length >= 2)
        .map((readings, idx) => {
          const t0 = new Date(readings[0].recorded_at).getTime()
          const t1 = new Date(readings[readings.length - 1].recorded_at).getTime()
          const temps_f = readings.map(r => r.temp_c * 9 / 5 + 32)
          const avg = temps_f.reduce((a, b) => a + b, 0) / temps_f.length
          return {
            id: `batch-${idx}-${t0}`,
            date: new Date(readings[0].recorded_at),
            duration: (t1 - t0) / 1000,
            tempMin: Math.min(...temps_f),
            tempMax: Math.max(...temps_f),
            tempAvg: avg,
            points: readings.length,
            chartData: thin(readings.map(r => ({
              temp_f: r.temp_c * 9 / 5 + 32,
              elapsed_s: (new Date(r.recorded_at).getTime() - t0) / 1000,
            })), 200),
          }
        })

      setBrews(processed)
    }
    load()
  }, [])

  return (
    <>
      <style>{css}</style>
      <section className="bp-section">
        <div className="bp-inner">
          <div className="bp-eyebrow">Batch Proof</div>
          <h2 className="bp-headline">Past Batches</h2>

          {brews === null && <div className="bp-empty">Loading batch data…</div>}
          {brews?.length === 0 && <div className="bp-empty">No batches recorded yet.</div>}
          {brews?.length > 0 && (
            <div className="bc-grid">
              {brews.map(brew => <BrewCard key={brew.id} brew={brew} />)}
            </div>
          )}

          <div className="bp-caption">
            Temperature logged via DS18B20 · ESP32 telemetry · Los Angeles
          </div>
        </div>
      </section>
    </>
  )
}
