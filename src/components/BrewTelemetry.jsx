import { useEffect, useState } from 'react'
import { useBrewState, useTemperatureReadings } from '../lib/hooks'
import { supabase } from '../lib/supabase'
import { toTempF } from '../lib/utils'
import { CREAM, GOLD, GOLD_GRAD, RULE } from '../theme'
import styles from './BrewTelemetry.module.css'

const REPLAY_MASS_G    = 1893  // 2qt water
const REPLAY_YIELD_G   = 40    // ~20% of 200g coffee absorbed

function TempChart({ points, progress = 100 }) {
  const W = 600, H = 72
  if (points.length < 2) {
    return (
      <div className={styles.chartLoading} role="status">
        <svg
          className={styles.spinner}
          aria-hidden="true"
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
          <line x1="4" y1="6" x2="20" y2="6" />
          <line x1="4" y1="18" x2="20" y2="18" />
          <path d="M12 10v4" />
          <path d="M10 14h4" />
        </svg>
        <span style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)' }}>
          Awaiting telemetry…
        </span>
      </div>
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
        <clipPath id="chart-clip">
          <rect x="0" y="0" width={`${progress}%`} height="100%" />
        </clipPath>
      </defs>
      <path d={areaD} fill="url(#bm-tg)" clipPath={progress < 100 ? "url(#chart-clip)" : undefined} />
      {progress < 100 && (
        <polyline points={linePts} fill="none" stroke="#c9a84c" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" opacity="0.25" strokeDasharray="4 4" />
      )}
      <polyline points={linePts} fill="none" stroke="#c9a84c" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" clipPath={progress < 100 ? "url(#chart-clip)" : undefined} />
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
  REPLAY: 'HISTORICAL BATCH · REPLAY',
}

function thin(arr, max = 120) {
  if (!arr || arr.length <= max) return arr || []
  const step = Math.ceil(arr.length / max)
  return arr.filter((_, i) => i % step === 0 || i === arr.length - 1)
}

let cachedBatchesList = null
const cachedReadingsMap = new Map()

function useReplayBatch(isActive, requestedBatchId) {
  const [replayData, setReplayData] = useState(null)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    if (!isActive) {
      setReplayData(null)
      return
    }

    setReplayData(null)
    let running = true
    async function fetchBatch() {
      // 1. Get completed batches (from cache or DB)
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

      // If no batches exist, fallback to a mock so the UI never hangs
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

      // 2. Get readings for this batch (from cache or DB)
      let processedReadings = cachedReadingsMap.get(targetBatch.id)
      
      if (!processedReadings) {
        const { data: readings, error } = await supabase.from('temperature_readings')
          .select('temp_c, recorded_at')
          .eq('batch_id', targetBatch.id)
          .order('recorded_at', { ascending: true })

        if (error || !readings || readings.length < 2) {
          processedReadings = []
        } else {
          processedReadings = thin(readings, 120).map(r => ({ temp_f: r.temp_c * 9 / 5 + 32 }))
        }
        cachedReadingsMap.set(targetBatch.id, processedReadings)
      }
      
      if (!running) return

      const durationS = (targetBatch.steep_start && targetBatch.steep_end)
        ? Math.max(1, Math.floor((new Date(targetBatch.steep_end) - new Date(targetBatch.steep_start)) / 1000))
        : 72000

      setReplayData({
        batch: targetBatch,
        readings: processedReadings,
        durationS,
        noData: processedReadings.length === 0,
      })
      setTick(0)
    }
    fetchBatch()
    return () => { running = false }
  }, [isActive, requestedBatchId])

  // Playback timer
  useEffect(() => {
    if (!replayData) return
    const timer = setInterval(() => {
      setTick(t => {
        if (t >= replayData.durationS) return 0 // loop when finished
        return t + 1
      })
    }, 1000) // 1:1 real-time playback
    return () => clearInterval(timer)
  }, [replayData])

  return { replayData, tick }
}

export default function BrewTelemetry({ requestedBatchId, suppressCountdown }) {
  const liveState     = useBrewState()
  const liveTelemetry = useTemperatureReadings(120)
  const [liveTick, setLiveTick] = useState(0)
  const [showNote, setShowNote] = useState(false)

  const isLiveActive = liveState && (liveState.status === 'BREWING' || liveState.status === 'POURING')
  const { replayData, tick: replayTick } = useReplayBatch(!isLiveActive, requestedBatchId)

  // Reset tick on each server push to restart smooth interpolation
  useEffect(() => { setLiveTick(0) }, [liveState])

  // smooth client-side tick between 5s server pushes
  useEffect(() => {
    if (!isLiveActive) return
    const id = setInterval(() => setLiveTick(t => t + 1), 1000)
    return () => clearInterval(id)
  }, [isLiveActive])

  const currentReadingIdx = replayData 
    ? Math.floor((replayTick / replayData.durationS) * Math.max(0, replayData.readings.length - 1))
    : 0

  // Generate a mock state object to fool the component into rendering smoothly during replay
  const state = isLiveActive ? liveState : replayData ? {
    batch_number: replayData.batch.batch_number,
    batch_name: replayData.batch.name,
    status: 'REPLAY',
    elapsed_seconds: replayTick,
    target_duration_seconds: replayData.durationS,
    current_weight_g: REPLAY_MASS_G + (REPLAY_YIELD_G * (replayTick / replayData.durationS)),
    initial_weight_g: REPLAY_MASS_G,
    current_temp_f: replayData.readings.length > 0 ? (replayData.readings[currentReadingIdx]?.temp_f ?? null) : null,
    last_update: new Date().toISOString()
  } : {
    batch_number: 0,
    batch_name: '',
    status: 'IDLE',
    elapsed_seconds: 0,
    target_duration_seconds: 72000,
    current_weight_g: null,
    initial_weight_g: null,
    current_temp_f: null,
    last_update: new Date().toISOString()
  }

  const telemetry = isLiveActive ? liveTelemetry : replayData ? replayData.readings : []
  const tick = isLiveActive ? liveTick : 0

  const elapsed    = (state.elapsed_seconds ?? 0) + tick
  const target     = state.target_duration_seconds ?? 72000
  const remaining  = Math.max(0, target - elapsed)
  const progress   = Math.min(100, (elapsed / target) * 100)
  const yieldDelta = ((state.current_weight_g ?? 0) - (state.initial_weight_g ?? 0))
  const isLive     = state.status === 'BREWING' || state.status === 'POURING'
  const isReplay   = state.status === 'REPLAY'
  const isIdle     = state.status === 'IDLE'
  const statusLabel = STATUS_LABELS[state.status] ?? state.status

  return (
    <div id="telemetry" className={styles.wrap}>
      <div className={styles.header}>
        <div>
          <span className={styles.label} style={isReplay ? { color: GOLD, opacity: .75 } : undefined}>
            {isLive ? 'Live Cold Steep · In Progress' : isReplay ? 'Past Batch · Replay' : 'Batch Monitor'}
          </span>
          {isLive && (
            <span className={styles.headerSub}>20h steep · DS18B20 temp probe · Los Angeles</span>
          )}
        </div>
        {state.batch_number > 0 && (
          <span className={styles.batchTag}>Batch #{String(state.batch_number).padStart(2,'0')}</span>
        )}
      </div>

      <div className={styles.body}>
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
            <span className={styles.label}>Temp · {isLive ? 'Live' : 'Replay'}</span>
            <span className={styles.label} style={{ opacity: .45 }}>
              {fmtTemp(state.current_temp_f)}°F
            </span>
          </div>
        <TempChart points={telemetry} progress={isLiveActive ? 100 : progress} />
        </div>

        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${progress}%` }}/>
        </div>

        <div style={{ marginTop: '16px', borderTop: `1px solid ${RULE || 'rgba(201,168,76,.15)'}`, paddingTop: '16px' }}>
          <button onClick={() => setShowNote(!showNote)} style={{ background: 'none', border: 'none', color: GOLD, opacity: .7, fontFamily: "var(--font-brand, 'DM Mono', monospace)", fontSize: '0.625rem', letterSpacing: '.1em', textTransform: 'uppercase', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', padding: 0 }}>
            {showNote ? '− Hide Process Note' : '+ What is steeping?'}
          </button>
          
          {showNote && (
            <div style={{ marginTop: '12px', fontSize: '0.8125rem', color: CREAM, opacity: .88, lineHeight: 1.6, fontFamily: "var(--font-body, 'DM Mono', monospace)" }}>
              <p style={{ marginBottom: '8px' }}>
                <strong style={{ color: GOLD, fontWeight: 500 }}>The 20-Hour Cold Steep:</strong> Instead of using heat to quickly extract flavor (which releases bitter acids and oils), we immerse coarse-ground coffee in cold, filtered water for exactly 20 hours. The slow extraction pulls out sweet, chocolatey compounds while leaving harsh bitterness behind.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.07)', margin: '14px 0' }}>
                <div style={{ background: '#0d0b08', padding: '10px 14px' }}>
                  <div style={{ fontSize: '0.5625rem', letterSpacing: '.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,.35)', marginBottom: 4 }}>Hot Brew · pH</div>
                  <div style={{ fontFamily: "var(--font-display, 'Alfa Slab One', serif)", fontSize: '1.5rem', color: 'rgba(255,255,255,.4)', lineHeight: 1 }}>5.0</div>
                  <div style={{ fontSize: '0.5625rem', letterSpacing: '.12em', color: 'rgba(255,255,255,.22)', marginTop: 3 }}>High acid</div>
                </div>
                <div style={{ background: '#0d0b08', padding: '10px 14px' }}>
                  <div style={{ fontSize: '0.5625rem', letterSpacing: '.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,.35)', marginBottom: 4 }}>Cold Brew · pH</div>
                  <div style={{ fontFamily: "var(--font-display, 'Alfa Slab One', serif)", fontSize: '1.5rem', color: GOLD, lineHeight: 1 }}>6.5</div>
                  <div style={{ fontSize: '0.5625rem', letterSpacing: '.12em', color: 'rgba(255,255,255,.22)', marginTop: 3 }}>~65% less acidic</div>
                </div>
              </div>
              <p style={{ opacity: .7, fontSize: '0.75rem' }}>
                Higher pH = less acid. Cold brew sits close to neutral (7.0) making it significantly easier on your stomach and teeth than hot-brewed coffee.
              </p>
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <span>Last push · {new Date(state.last_update).toLocaleTimeString()}</span>
          <span>20h steep · BCCB Lab · LA</span>
        </div>
      </div>
    </div>
  )
}
