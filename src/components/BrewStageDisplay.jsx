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
