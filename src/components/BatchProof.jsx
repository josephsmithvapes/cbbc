import { useEffect, useRef, useState } from 'react'
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
    border-bottom: 1px solid ${RULE};
    padding: 80px 0 96px;
  }
  .bp-inner {
    max-width: 1040px;
    margin: 0 auto;
    padding: 0 24px;
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
    margin: 0 0 20px;
  }
  .bp-body {
    font-family: var(--font-brand, 'Space Grotesk', sans-serif);
    font-size: clamp(0.875rem, 1.5vw, 1rem);
    line-height: 1.65;
    color: ${CREAM};
    opacity: .45;
    max-width: 560px;
    margin: 0 0 20px;
  }
  .bp-pillrow {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 48px;
  }
  .bp-pill {
    font-family: var(--font-brand, 'Space Grotesk', sans-serif);
    font-size: var(--t-micro, 0.625rem);
    letter-spacing: .26em;
    text-transform: uppercase;
    color: ${GOLD};
    opacity: .6;
    border: 1px solid rgba(201,168,76,.2);
    padding: 5px 12px;
  }
  .bp-header-layout {
    display: flex;
    align-items: center;
    gap: 56px;
  }
  .bp-header-text {
    flex: 1;
    min-width: 0;
  }
  .bp-header-icon {
    flex-shrink: 0;
    opacity: .6;
  }
  @media (max-width: 800px) {
    .bp-header-icon { display: none; }
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
    padding: 0 24px;
    text-align: center;
  }

  /* Carousel */
  .bc-carousel {
    padding: 4px 0 8px;
    overflow-x: auto;
    overflow-y: hidden;
    scrollbar-width: none;
    -ms-overflow-style: none;
    cursor: grab;
    user-select: none;
  }
  .bc-carousel:active {
    cursor: grabbing;
  }
  .bc-carousel::-webkit-scrollbar { display: none; }
  .bc-track {
    display: flex;
    gap: 16px;
    width: max-content;
    min-width: 100%;
    padding: 0 24px;
    justify-content: center;
  }

  /* Card */
  .bc-card {
    background: ${INK};
    width: 440px;
    flex-shrink: 0;
    cursor: default;
    border: 1px solid ${RULE};
    transition: background 0.2s ease;
  }
  .bc-card:hover {
    background: #1c1508;
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
  .bc-name {
    font-family: var(--font-display, 'Alfa Slab One', serif);
    font-size: 1rem;
    background: ${GOLD_GRAD};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    line-height: 1.2;
  }
  .bc-meta-row {
    padding: 7px 20px 9px;
    font-family: var(--font-brand, 'Space Grotesk', sans-serif);
    font-size: var(--t-micro, 0.625rem);
    letter-spacing: .2em;
    text-transform: uppercase;
    color: ${CREAM};
    opacity: .35;
    border-bottom: 1px solid rgba(201,168,76,.08);
  }
  .bc-tasting {
    padding: 10px 20px 14px;
    font-family: var(--font-brand, 'Space Grotesk', sans-serif);
    font-size: var(--t-small, 0.8125rem);
    color: ${CREAM};
    opacity: .35;
    font-style: italic;
    border-top: 1px solid rgba(201,168,76,.06);
    line-height: 1.5;
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
    .bp-section { padding: 56px 0 72px; }
    .bc-card { width: 320px; }
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

function BrewCard({ brew, onEnter, onLeave }) {
  const { meta } = brew
  return (
    <div className="bc-card" onMouseEnter={onEnter} onMouseLeave={onLeave}>
      <div className="bc-card-header">
        <div>
          {meta?.name
            ? <div className="bc-name">{meta.name}</div>
            : <div className="bc-date">{fmtDate(brew.date)}</div>
          }
          {meta?.name && <div className="bc-date" style={{ marginTop: 2 }}>{fmtDate(brew.date)}</div>}
        </div>
        <span className="bc-duration">{fmtHM(brew.duration)}</span>
      </div>

      {meta && (meta.origin || meta.roast || meta.process) && (
        <div className="bc-meta-row">
          {[meta.origin, meta.roast, meta.process].filter(Boolean).join(' · ')}
        </div>
      )}

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

      {meta?.tasting_notes && (
        <div className="bc-tasting">
          {meta.tasting_notes}
        </div>
      )}
    </div>
  )
}

export default function BatchProof() {
  const [brews, setBrews] = useState(null)
  const carouselRef = useRef(null)
  const velRef = useRef(0)
  const isDraggingRef = useRef(false)
  const dragStartXRef = useRef(0)
  const scrollStartRef = useRef(0)
  const lastXRef = useRef(0)
  const lastTimeRef = useRef(0)
  const rafRef = useRef(null)

  // Momentum animation loop
  useEffect(() => {
    let running = true
    const tick = () => {
      if (!running) return
      const el = carouselRef.current
      if (el && !isDraggingRef.current && Math.abs(velRef.current) > 0.5) {
        const maxScroll = el.scrollWidth - el.clientWidth
        if (maxScroll > 0) {
          const next = Math.max(0, Math.min(maxScroll, el.scrollLeft + velRef.current))
          el.scrollLeft = next
          if (next === 0 || next === maxScroll) velRef.current = 0
          else velRef.current *= 0.94
        }
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => { running = false; cancelAnimationFrame(rafRef.current) }
  }, [])

  const startDrag = (clientX) => {
    const el = carouselRef.current
    if (!el) return
    isDraggingRef.current = true
    dragStartXRef.current = clientX
    scrollStartRef.current = el.scrollLeft
    lastXRef.current = clientX
    lastTimeRef.current = Date.now()
    velRef.current = 0
  }

  const moveDrag = (clientX) => {
    if (!isDraggingRef.current) return
    const el = carouselRef.current
    if (!el) return
    el.scrollLeft = scrollStartRef.current - (clientX - dragStartXRef.current)
    const now = Date.now()
    const dt = now - lastTimeRef.current
    if (dt > 0) velRef.current = -(clientX - lastXRef.current) / dt * 16
    lastXRef.current = clientX
    lastTimeRef.current = now
  }

  const endDrag = () => { isDraggingRef.current = false }

  const handleMouseDown = (e) => { e.preventDefault(); startDrag(e.clientX) }
  const handleMouseMove = (e) => { moveDrag(e.clientX) }
  const handleMouseUp   = endDrag
  const handleMouseLeave = endDrag

  const handleTouchStart = (e) => { startDrag(e.touches[0].clientX) }
  const handleTouchMove  = (e) => { e.preventDefault(); moveDrag(e.touches[0].clientX) }
  const handleTouchEnd   = endDrag

  useEffect(() => {
    async function load() {
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

      const GAP_MS = 6 * 60 * 60 * 1000
      const batches = []
      let current = [all[0]]
      for (let i = 1; i < all.length; i++) {
        const gap = new Date(all[i].recorded_at) - new Date(all[i - 1].recorded_at)
        if (gap > GAP_MS) { batches.push(current); current = [] }
        current.push(all[i])
      }
      batches.push(current)

      const { data: batchMeta } = await supabase.from('batches')
        .select('*').order('steep_start', { ascending: true })

      const processed = batches
        .filter(readings => readings.length >= 2)
        .map((readings, idx) => {
          const t0 = new Date(readings[0].recorded_at).getTime()
          const t1 = new Date(readings[readings.length - 1].recorded_at).getTime()
          const temps_f = readings.map(r => r.temp_c * 9 / 5 + 32)
          const avg = temps_f.reduce((a, b) => a + b, 0) / temps_f.length

          const meta = batchMeta?.find(b => {
            const bs = new Date(b.steep_start).getTime()
            return bs >= t0 - 4 * 60 * 60 * 1000 && bs <= t1
          }) ?? null

          return {
            id: `batch-${idx}-${t0}`,
            date: new Date(readings[0].recorded_at),
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
          <div className="bp-header-layout">
            <div className="bp-header-text">
              <div className="bp-eyebrow">Full Batch Transparency · Bean to Bottle</div>
              <h2 className="bp-headline">We Show<br/>Our Work.</h2>
              <p className="bp-body">
                
                We built live telemetry into every brew — temperature logged every few seconds,
                steep duration tracked to the minute, yield measured start to finish.
                Every batch we've ever made is published here, in full.
              </p>
              <div className="bp-pillrow">
                <span className="bp-pill">Live Sensor Data</span>
                <span className="bp-pill">DS18B20 · ESP32</span>
                <span className="bp-pill">Temperature Curves</span>
                <span className="bp-pill">Steep Duration</span>
                <span className="bp-pill">Yield Tracked</span>
              </div>
            </div>

            {/* Small Batch Rig schematic — traced from blueprint plate 001 */}
            <div className="bp-header-icon" aria-hidden="true">
              <svg width="400" height="265" viewBox="0 0 272 178" fill="none">

                {/* ── TAKEYA 2QT (A) ── */}
                {/* Lid button */}
                <rect x="44" y="8" width="14" height="9" rx="2"
                  stroke={CREAM} strokeWidth="1.2" fill="none" opacity=".4"/>
                {/* Lid */}
                <rect x="16" y="16" width="70" height="12" rx="2.5"
                  stroke={CREAM} strokeWidth="1.3" fill={CREAM} fillOpacity=".04" opacity=".5"/>
                {/* Body */}
                <rect x="20" y="27" width="62" height="108" rx="3"
                  stroke={CREAM} strokeWidth="1.4" fill={CREAM} fillOpacity=".03" opacity=".45"/>
                {/* Handle */}
                <path d="M82,46 Q97,46 97,64 Q97,82 82,82"
                  stroke={CREAM} strokeWidth="1.3" fill="none" opacity=".35"/>
                {/* Inner filter/plunger rod */}
                <line x1="36" y1="27" x2="36" y2="134"
                  stroke={CREAM} strokeWidth="1" opacity=".2"/>
                {/* Filter disc */}
                <line x1="22" y1="130" x2="80" y2="130"
                  stroke={CREAM} strokeWidth="1" opacity=".15" strokeDasharray="3 3"/>
                {/* Measurement ticks */}
                {[62, 80, 98, 116].map(y => (
                  <line key={y} x1="20" y1={y} x2="26" y2={y}
                    stroke={CREAM} strokeWidth="1" opacity=".2"/>
                ))}
                {/* DS18B20 probe wire — gold (data element) */}
                <line x1="36" y1="36" x2="62" y2="116"
                  stroke={GOLD} strokeWidth="1.2" opacity=".45" strokeDasharray="3 2"/>
                <circle cx="62" cy="116" r="3"
                  fill={GOLD} fillOpacity=".25" stroke={GOLD} strokeWidth="1.2" opacity=".7"/>


                {/* ── LOAD CELL SANDWICH (C) ── */}
                <rect x="12" y="140" width="80" height="5" rx="1.5"
                  stroke={CREAM} strokeWidth="1.2" fill={CREAM} fillOpacity=".04" opacity=".35"/>
                <rect x="12" y="149" width="80" height="5" rx="1.5"
                  stroke={CREAM} strokeWidth="1.2" fill={CREAM} fillOpacity=".04" opacity=".35"/>
                {/* Centre beam */}
                <circle cx="52" cy="142" r="2"
                  fill={CREAM} fillOpacity=".12" stroke={CREAM} strokeWidth="1" opacity=".25"/>


                {/* ── BREADBOARD · ESP32 + HX711 (D) ── */}
                <rect x="148" y="82" width="108" height="62" rx="2"
                  stroke={CREAM} strokeWidth="1.3" fill={CREAM} fillOpacity=".02" opacity=".4"/>
                {/* ESP32 */}
                <rect x="158" y="92" width="44" height="42" rx="1.5"
                  stroke={CREAM} strokeWidth="1" fill={CREAM} fillOpacity=".04" opacity=".35"/>
                <text x="180" y="111" textAnchor="middle"
                  fontFamily="var(--font-brand,'Space Grotesk',sans-serif)"
                  fontSize="5.5" fill={CREAM} opacity=".28" letterSpacing=".5">ESP32</text>
                <text x="180" y="120" textAnchor="middle"
                  fontFamily="var(--font-brand,'Space Grotesk',sans-serif)"
                  fontSize="4" fill={CREAM} opacity=".18" letterSpacing=".3">NASOM-32</text>
                {/* HX711 */}
                <rect x="208" y="92" width="40" height="42" rx="1.5"
                  stroke={CREAM} strokeWidth="1" fill={CREAM} fillOpacity=".04" opacity=".35"/>
                <text x="228" y="115" textAnchor="middle"
                  fontFamily="var(--font-brand,'Space Grotesk',sans-serif)"
                  fontSize="5.5" fill={CREAM} opacity=".28" letterSpacing=".5">HX711</text>
                {/* USB port */}
                <rect x="141" y="102" width="9" height="10" rx="1"
                  stroke={CREAM} strokeWidth="1" fill="none" opacity=".25"/>


                {/* ── SUPABASE + CBBC UPLINK (E) ── */}
                {/* WiFi arcs */}
                <path d="M192,14 Q202,7 212,14" stroke={GOLD} strokeWidth="1.2" fill="none" opacity=".35" strokeLinecap="round"/>
                <path d="M196,11 Q202,5 208,11" stroke={GOLD} strokeWidth="1" fill="none" opacity=".22" strokeLinecap="round"/>
                <circle cx="202" cy="14" r="1.5" fill={GOLD} opacity=".4"/>
                {/* SUPABASE box */}
                <rect x="178" y="20" width="48" height="16" rx="2"
                  stroke={GOLD} strokeWidth="1" fill={GOLD} fillOpacity=".04" opacity=".55"/>
                <text x="202" y="31" textAnchor="middle"
                  fontFamily="var(--font-brand,'Space Grotesk',sans-serif)"
                  fontSize="5" fill={GOLD} opacity=".55" letterSpacing=".5">DATABASE</text>
                {/* CBBC box */}
                <rect x="232" y="20" width="28" height="16" rx="2"
                  stroke={GOLD} strokeWidth="1" fill={GOLD} fillOpacity=".06" opacity=".6"/>
                <text x="246" y="31" textAnchor="middle"
                  fontFamily="var(--font-brand,'Space Grotesk',sans-serif)"
                  fontSize="5.5" fill={GOLD} opacity=".65" letterSpacing=".5">CBBC</text>


                {/* ── CONNECTION LINES (gold, dashed) ── */}
                {/* Vessel → Breadboard */}
                <line x1="82" y1="90" x2="148" y2="110"
                  stroke={GOLD} strokeWidth="1" opacity=".28" strokeDasharray="5 3"/>
                {/* Load cell → Breadboard */}
                <line x1="92" y1="148" x2="148" y2="130"
                  stroke={GOLD} strokeWidth="1" opacity=".22" strokeDasharray="5 3"/>
                {/* Breadboard → Uplink */}
                <line x1="210" y1="82" x2="204" y2="36"
                  stroke={GOLD} strokeWidth="1" opacity=".3" strokeDasharray="5 3"/>

              </svg>
            </div>
          </div>
        </div>

        {brews === null && <div className="bp-empty">Loading batch data…</div>}
        {brews?.length === 0 && <div className="bp-empty">No batches recorded yet.</div>}
        {brews?.length > 0 && (
          <div
            className="bc-carousel"
            ref={carouselRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className="bc-track">
              {brews.map(brew => (
                <BrewCard
                  key={brew.id}
                  brew={brew}
                  onEnter={() => {}}
                  onLeave={() => {}}
                />
              ))}
            </div>
          </div>
        )}

        <div className="bp-caption">
          Real sensor data · DS18B20 thermometer · ESP32 telemetry · Logged every batch · Los Angeles
        </div>
      </section>
    </>
  )
}
