import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { INK, GOLD, CREAM, GOLD_GRAD } from '../theme'
import styles from './BatchDetails.module.css'

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
  if (!data || data.length < 2) return <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ width: '100%', height: 130, display: 'block' }}></svg>

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

function BrewCard({ brew, onPlayBatch, onEnter, onLeave }) {
  const { meta } = brew
  const isL = brew.isLoading
  return (
    <div 
      className={styles.card} 
      onMouseEnter={onEnter} 
      onMouseLeave={onLeave} 
      onClick={() => meta?.id && onPlayBatch?.(meta.id)} 
      style={{ cursor: onPlayBatch ? 'pointer' : 'default' }} 
      title={onPlayBatch ? "Play replay" : ""}
    >
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
        <MiniChart data={brew.chartData} gradId={brew.id.slice(0, 8)} />
      </div>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statVal}>{isL ? '--' : `${brew.tempMin.toFixed(1)}°F`}</span>
          <span className={styles.statLbl}>Low</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statVal}>{isL ? '--' : `${brew.tempMax.toFixed(1)}°F`}</span>
          <span className={styles.statLbl}>High</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statVal}>{isL ? '--' : `${brew.tempAvg.toFixed(1)}°F`}</span>
          <span className={styles.statLbl}>Avg</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statVal}>{isL ? '--' : brew.points.toLocaleString()}</span>
          <span className={styles.statLbl}>Readings</span>
        </div>
      </div>

      {meta?.tasting_notes && (
        <div className={styles.tasting}>
          {meta.tasting_notes}
        </div>
      )}
    </div>
  )
}

export default function BatchDetails({ onPlayBatch }) {
  const [brews, setBrews] = useState(null)
  const [metaList, setMetaList] = useState(null)
  const carouselRef = useRef(null)
  const velRef = useRef(0)
  const isDraggingRef = useRef(false)
  const dragStartXRef = useRef(0)
  const scrollStartRef = useRef(0)
  const lastXRef = useRef(0)
  const lastTimeRef = useRef(0)
  const rafRef = useRef(null)
  const sectionRef = useRef(null)
  const [isVisible, setIsVisible] = useState(false)

  // Defer heavy fetching until the section approaches the viewport
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true)
        observer.disconnect()
      }
    }, { rootMargin: '400px' })
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

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

  // 1. Fetch Metadata immediately
  useEffect(() => {
    async function fetchMeta() {
      const { data: batchMeta, error } = await supabase.from('batches')
        .select('*')
        .not('steep_end', 'is', null)
        .order('steep_start', { ascending: false })
        .limit(12)

      if (error || !batchMeta?.length) { 
        setBrews([])
        return 
      }
      setMetaList(batchMeta)

      const initial = batchMeta.map(meta => {
        const t0 = new Date(meta.steep_start).getTime()
        const t1 = new Date(meta.steep_end).getTime()
        return {
          id: meta.id || `batch-${meta.batch_number}-${t0}`,
          date: new Date(meta.steep_start),
          duration: (t1 - t0) / 1000,
          meta,
          chartData: [],
          isLoading: true
        }
      })
      
      initial.sort((a, b) => a.date - b.date)
      setBrews(initial)
    }
    fetchMeta()
  }, [])

  // 2. Fetch Heavy Data when visible
  useEffect(() => {
    if (!isVisible || !metaList) return

    async function fetchHeavy() {
      const batchPromises = metaList.map(async (meta) => {
        const { data: readings } = await supabase.from('temperature_readings')
          .select('temp_c, recorded_at')
          .gte('recorded_at', meta.steep_start)
          .lte('recorded_at', meta.steep_end)
          .order('recorded_at', { ascending: true })
          .limit(1000) // Hard cap to prevent API limits draining

        if (!readings || readings.length < 2) return null

        const t0 = new Date(meta.steep_start).getTime()
        const t1 = new Date(meta.steep_end).getTime()
          const temps_f = readings.map(r => r.temp_c * 9 / 5 + 32)
          const avg = temps_f.reduce((a, b) => a + b, 0) / temps_f.length

          return {
            id: meta.id || `batch-${meta.batch_number}-${t0}`,
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
            isLoading: false
          }
      })

      const processed = (await Promise.all(batchPromises)).filter(Boolean)
      
      // Sort chronologically for the carousel (oldest first, matching original behavior)
      processed.sort((a, b) => a.date - b.date)

      setBrews(processed)
    }
    fetchHeavy()
  }, [isVisible, metaList])

  return (
    <section className={styles.section} ref={sectionRef}>
      <div className={styles.inner}>
        <div className={styles.headerLayout}>
          <div className={styles.headerText}>
            <div className={styles.eyebrow}>Full Batch Transparency · Bean to Bottle</div>
            <h2 className={styles.headline}>We <span className={styles.goldText}>Show</span><br/>Our <span className={styles.goldText}>Work.</span></h2>
            <p className={styles.body}>

              We built live telemetry into every brew — temperature logged every few seconds,
              steep duration tracked to the minute, yield measured start to finish.
              Every batch we've ever made is published here, in full.
            </p>
            <div className={styles.pillrow}>
              <span className={styles.pill}>Live Sensor Data</span>
              <span className={styles.pill}>DS18B20 · ESP32</span>
              <span className={styles.pill}>Temperature Curves</span>
              <span className={styles.pill}>Steep Duration</span>
              <span className={styles.pill}>Yield Tracked</span>
            </div>
          </div>

          {/* Small Batch Rig schematic — traced from blueprint plate 001 */}
          <div className={styles.headerIcon} aria-hidden="true">
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
                fontSize="4" fill={CREAM} opacity=".18" letterSpacing=".3">WROOM-32</text>
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

      {brews === null && (
        <div className={styles.empty} role="status">
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
            Loading batch data…
          </span>
        </div>
      )}
      {brews?.length === 0 && <div className={styles.empty}>No batches recorded yet.</div>}
      {brews?.length > 0 && (
        <div
          className={styles.carousel}
          ref={carouselRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className={styles.track}>
            {brews.map(brew => (
              <BrewCard
                key={brew.id}
                brew={brew}
                onPlayBatch={onPlayBatch}
                onEnter={() => {}}
                onLeave={() => {}}
              />
            ))}
          </div>
        </div>
      )}

      <div className={styles.caption}>
        Real sensor data · DS18B20 thermometer · ESP32 telemetry · Logged every batch · Los Angeles
      </div>
    </section>
  )
}
