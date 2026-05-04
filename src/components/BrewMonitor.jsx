import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

function TempChart({ points }) {
  const W = 600, H = 72
  if (points.length < 2) {
    return (
      <div className="bm-chart-empty">Awaiting telemetry…</div>
    )
  }
  const temps = points.map(p => p.temp_f)
  const lo = Math.min(...temps), hi = Math.max(...temps)
  const range = hi - lo || 0.5
  const PAD = 6
  const toX = i => ((i / (points.length - 1)) * W).toFixed(1)
  const toY = t => (H - PAD - ((t - lo) / range) * (H - PAD * 2)).toFixed(1)

  const linePts = points.map((p, i) => `${toX(i)},${toY(p.temp_f)}`).join(' ')
  const areaD = [
    `M ${toX(0)},${toY(points[0].temp_f)}`,
    ...points.slice(1).map((p, i) => `L ${toX(i + 1)},${toY(p.temp_f)}`),
    `L ${W},${H} L 0,${H} Z`
  ].join(' ')

  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none"
      style={{ width: '100%', height: H, display: 'block' }}>
      <defs>
        <linearGradient id="bm-tg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c9a84c" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#c9a84c" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill="url(#bm-tg)" />
      <polyline points={linePts} fill="none" stroke="#c9a84c"
        strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}

const INK   = '#161108'
const GOLD  = '#c9a84c'
const CREAM = '#f2ede0'
const RULE  = 'rgba(201,168,76,.15)'
const GOLD_GRAD = `linear-gradient(135deg, #f0d878 0%, ${GOLD} 55%, #9a7020 100%)`

const css = `
  .bm-wrap {
    width: 100%;
    background: ${INK};
    border-bottom: 1px solid ${RULE};
    font-family: var(--font-brand, 'Space Grotesk', sans-serif);
  }
  .bm-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 24px;
    border-bottom: 1px solid ${RULE};
  }
  .bm-label {
    font-size: var(--t-label, 0.6875rem);
    letter-spacing: .32em;
    color: ${CREAM};
    opacity: .28;
    text-transform: uppercase;
  }
  .bm-batch-tag {
    font-size: var(--t-label, 0.6875rem);
    letter-spacing: .28em;
    color: ${GOLD};
    text-transform: uppercase;
  }

  .bm-body {
    padding: 32px 24px 36px;
  }

  .bm-status-row {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 24px;
  }
  .bm-dot {
    width: 7px; height: 7px;
    border-radius: 50%;
    flex-shrink: 0;
    background: ${GOLD};
  }
  .bm-dot.live { animation: bm-pulse 1.4s ease-in-out infinite; }
  @keyframes bm-pulse {
    0%,100% { opacity:1; transform:scale(1); }
    50%      { opacity:.35; transform:scale(.65); }
  }
  .bm-status-text {
    font-size: var(--t-label, 0.6875rem);
    letter-spacing: .28em;
    text-transform: uppercase;
    color: ${GOLD};
  }
  .bm-status-text.idle { color: ${CREAM}; opacity: .3; }

  .bm-countdown {
    font-family: var(--font-display, 'Alfa Slab One', serif);
    font-size: clamp(2.8rem, 9vw, 6rem);
    line-height: 1;
    letter-spacing: .04em;
    background: ${GOLD_GRAD};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 8px;
  }

  .bm-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1px;
    background: ${RULE};
    border: 1px solid ${RULE};
    margin-bottom: 20px;
    margin-top: 24px;
  }
  .bm-metric {
    background: ${INK};
    padding: 14px 16px;
  }
  .bm-metric-label {
    font-size: var(--t-micro, 0.625rem);
    letter-spacing: .2em;
    text-transform: uppercase;
    color: ${CREAM};
    opacity: .3;
    margin-bottom: 4px;
  }
  .bm-metric-value {
    font-family: var(--font-display, 'Alfa Slab One', serif);
    font-size: clamp(1.4rem, 4vw, 2rem);
    background: ${GOLD_GRAD};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    line-height: 1.1;
  }
  .bm-metric-unit {
    font-family: var(--font-brand, 'Space Grotesk', sans-serif);
    font-size: var(--t-micro, 0.625rem);
    letter-spacing: .14em;
    color: ${CREAM};
    opacity: .22;
    display: block;
    margin-top: 2px;
  }

  .bm-progress-bar {
    height: 2px;
    background: rgba(201,168,76,.12);
    border-radius: 1px;
    overflow: hidden;
    margin-bottom: 12px;
  }
  .bm-progress-fill {
    height: 100%;
    background: ${GOLD_GRAD};
    border-radius: 1px;
    transition: width 1s linear;
  }

  .bm-footer {
    display: flex;
    justify-content: space-between;
    font-size: var(--t-micro, 0.625rem);
    letter-spacing: .16em;
    text-transform: uppercase;
    color: ${CREAM};
    opacity: .18;
  }

  .bm-connecting {
    padding: 52px 24px;
    text-align: center;
    font-size: var(--t-small, 0.8125rem);
    letter-spacing: .2em;
    text-transform: uppercase;
    color: ${CREAM};
    opacity: .2;
  }

  .bm-chart-wrap {
    margin: 4px 0 16px;
    border: 1px solid rgba(201,168,76,.1);
    overflow: hidden;
  }
  .bm-chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px 10px 4px;
    border-bottom: 1px solid rgba(201,168,76,.07);
  }
  .bm-chart-empty {
    height: 72px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--t-micro, 0.625rem);
    letter-spacing: .2em;
    text-transform: uppercase;
    color: ${CREAM};
    opacity: .15;
  }

  @media (max-width: 600px) {
    .bm-grid { grid-template-columns: repeat(2, 1fr); }
    .bm-body { padding: 24px 16px 28px; }
  }
`

function fmtDuration(s) {
  if (s == null || s < 0) return '--:--:--'
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`
}

function fmtTemp(v) { return v == null ? '--' : v.toFixed(1) }
function fmtMass(v) { return v == null ? '--' : Math.round(v).toString() }

const STATUS_LABELS = {
  IDLE: 'STANDBY',
  BREWING: 'BREWING · LIVE',
  READY: 'BATCH READY',
  POURING: 'POURING',
  COMPLETE: 'COMPLETE',
}

export default function BrewMonitor() {
  const [state, setState] = useState(null)
  const [tick, setTick] = useState(0)
  const [telemetry, setTelemetry] = useState([])

  useEffect(() => {
    supabase.from('brew_state').select('*').eq('id', 1).single()
      .then(({ data }) => { if (data) setState(data) })

    const channel = supabase.channel('brew_monitor')
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'brew_state'
      }, ({ new: row }) => {
        setState(row)
        setTick(0)
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  useEffect(() => {
    supabase.from('temperature_readings')
      .select('temp_c, recorded_at')
      .order('recorded_at', { ascending: false })
      .limit(120)
      .then(({ data }) => {
        if (data?.length) {
          setTelemetry(data.reverse().map(r => ({ temp_f: r.temp_c * 9 / 5 + 32 })))
        }
      })

    const ch = supabase.channel('bm_telemetry')
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'temperature_readings'
      }, ({ new: row }) => {
        setTelemetry(prev => [...prev.slice(-119), { temp_f: row.temp_c * 9 / 5 + 32 }])
      })
      .subscribe()

    return () => supabase.removeChannel(ch)
  }, [])

  // smooth client-side tick between 5s server pushes
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000)
    return () => clearInterval(id)
  }, [])

  if (!state) {
    return (
      <>
        <style>{css}</style>
        <div className="bm-wrap">
          <div className="bm-connecting">Connecting to brew rig…</div>
        </div>
      </>
    )
  }

  const elapsed    = (state.elapsed_seconds ?? 0) + tick
  const target     = state.target_duration_seconds ?? 72000
  const remaining  = Math.max(0, target - elapsed)
  const progress   = Math.min(100, (elapsed / target) * 100)
  const yieldDelta = ((state.current_weight_g ?? 0) - (state.initial_weight_g ?? 0))
  const isLive     = state.status === 'BREWING' || state.status === 'POURING'
  const statusLabel = STATUS_LABELS[state.status] ?? state.status

  return (
    <>
      <style>{css}</style>
      <div className="bm-wrap">
        <div className="bm-header">
          <span className="bm-label">Brew Monitor · Lot</span>
          {state.batch_number > 0 && (
            <span className="bm-batch-tag">Batch #{String(state.batch_number).padStart(2,'0')}</span>
          )}
        </div>

        <div className="bm-body">
          <div className="bm-status-row">
            <span className={`bm-dot${isLive ? ' live' : ''}`}
              style={{ background: isLive || state.status === 'READY' ? GOLD : CREAM,
                       opacity: state.status === 'IDLE' ? .2 : 1 }}/>
            <span className={`bm-status-text${state.status === 'IDLE' ? ' idle' : ''}`}>
              {statusLabel}
            </span>
          </div>

          <div className="bm-countdown">
            {state.status === 'BREWING'
              ? fmtDuration(remaining)
              : state.status === 'IDLE'
              ? 'STANDBY'
              : state.status === 'READY' || state.status === 'COMPLETE'
              ? 'READY'
              : fmtDuration(remaining)}
          </div>

          <div className="bm-grid">
            <div className="bm-metric">
              <div className="bm-metric-label">Temperature</div>
              <div className="bm-metric-value">{fmtTemp(state.current_temp_f)}</div>
              <span className="bm-metric-unit">°F</span>
            </div>
            <div className="bm-metric">
              <div className="bm-metric-label">Mass</div>
              <div className="bm-metric-value">{fmtMass(state.current_weight_g)}</div>
              <span className="bm-metric-unit">g</span>
            </div>
            <div className="bm-metric">
              <div className="bm-metric-label">Yield Δ</div>
              <div className="bm-metric-value">{fmtMass(yieldDelta)}</div>
              <span className="bm-metric-unit">g absorbed</span>
            </div>
          </div>

          <div className="bm-chart-wrap">
            <div className="bm-chart-header">
              <span className="bm-label">Temp · Live</span>
              <span className="bm-label" style={{ opacity: .45 }}>
                {fmtTemp(state.current_temp_f)}°F
              </span>
            </div>
            <TempChart points={telemetry} />
          </div>

          <div className="bm-progress-bar">
            <div className="bm-progress-fill" style={{ width: `${progress}%` }}/>
          </div>

          <div className="bm-footer">
            <span>Last push · {new Date(state.last_update).toLocaleTimeString()}</span>
            <span>20h steep · BCCB Lab · LA</span>
          </div>
        </div>
      </div>
    </>
  )
}
