import { useEffect, useState } from 'react'
import { useBrewState, useTemperatureReadings } from '../lib/hooks'
import { CREAM, GOLD, GOLD_GRAD } from '../theme'
import { fmt } from '../lib/utils'
import styles from './BrewTelemetry.module.css'

function TempChart({ points }) {
  const W = 600, H = 72
  if (points.length < 2) {
    return (
      <div className={styles.chartEmpty}>Awaiting telemetry…</div>
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
  IDLE: 'MAIDEN BATCH · OPEN',
  BREWING: 'BREWING · LIVE',
  READY: 'BATCH READY',
  POURING: 'POURING',
  COMPLETE: 'COMPLETE',
}

export default function BrewTelemetry() {
  const state     = useBrewState()
  const telemetry = useTemperatureReadings(120)
  const [tick, setTick] = useState(0)

  // Reset tick on each server push to restart smooth interpolation
  useEffect(() => { setTick(0) }, [state])

  // smooth client-side tick between 5s server pushes
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000)
    return () => clearInterval(id)
  }, [])

  if (!state || (state.status !== 'BREWING' && state.status !== 'POURING')) {
    return null
  }

  const elapsed    = (state.elapsed_seconds ?? 0) + tick
  const target     = state.target_duration_seconds ?? 72000
  const remaining  = Math.max(0, target - elapsed)
  const progress   = Math.min(100, (elapsed / target) * 100)
  const yieldDelta = ((state.current_weight_g ?? 0) - (state.initial_weight_g ?? 0))
  const isLive     = state.status === 'BREWING' || state.status === 'POURING'
  const isIdle     = state.status === 'IDLE'
  const statusLabel = STATUS_LABELS[state.status] ?? state.status

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <span className={styles.label}>Brew Monitor · Lot</span>
        {state.batch_number > 0 && (
          <span className={styles.batchTag}>Batch #{String(state.batch_number).padStart(2,'0')}</span>
        )}
      </div>

      <div className={styles.body}>
        <div className={styles.statusRow}>
          <span className={[styles.dot, isLive && styles.live].filter(Boolean).join(' ')}
            style={{ background: isLive || state.status === 'READY' ? GOLD : CREAM,
                     opacity: state.status === 'IDLE' ? .2 : 1 }}/>
          <span className={[styles.statusText, isIdle && styles.idle].filter(Boolean).join(' ')}>
            {statusLabel}
          </span>
        </div>

        <div className={styles.countdown}>
          {state.status === 'BREWING'
            ? fmtDuration(remaining)
            : state.status === 'IDLE'
            ? 'STANDBY'
            : state.status === 'READY' || state.status === 'COMPLETE'
            ? 'READY'
            : fmtDuration(remaining)}
        </div>

        <div className={styles.grid}>
          <div className={styles.metric}>
            <div className={styles.metricLabel}>Temperature</div>
            <div className={styles.metricValue}>{fmtTemp(state.current_temp_f)}</div>
            <span className={styles.metricUnit}>°F</span>
          </div>
          <div className={styles.metric}>
            <div className={styles.metricLabel}>Mass</div>
            <div className={styles.metricValue}>{fmtMass(state.current_weight_g)}</div>
            <span className={styles.metricUnit}>g</span>
          </div>
          <div className={styles.metric}>
            <div className={styles.metricLabel}>Yield Δ</div>
            <div className={styles.metricValue}>{fmtMass(yieldDelta)}</div>
            <span className={styles.metricUnit}>g absorbed</span>
          </div>
        </div>

        <div className={styles.chartWrap}>
          <div className={styles.chartHeader}>
            <span className={styles.label}>Temp · Live</span>
            <span className={styles.label} style={{ opacity: .45 }}>
              {fmtTemp(state.current_temp_f)}°F
            </span>
          </div>
          <TempChart points={telemetry} />
        </div>

        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${progress}%` }}/>
        </div>

        <div className={styles.footer}>
          <span>Last push · {new Date(state.last_update).toLocaleTimeString()}</span>
          <span>20h steep · BCCB Lab · LA</span>
        </div>
      </div>
    </div>
  )
}
