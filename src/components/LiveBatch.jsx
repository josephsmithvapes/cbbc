import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const STEEP_HOURS = 20
const INK   = '#161108'
const GOLD  = '#c9a84c'
const CREAM = '#f2ede0'
const RULE  = 'rgba(201,168,76,.15)'

const GOLD_GRAD = `linear-gradient(135deg, #f0d878 0%, ${GOLD} 55%, #9a7020 100%)`

function calcRemaining(steepStart) {
  if (!steepStart) return null
  const end = new Date(steepStart).getTime() + STEEP_HOURS * 3600 * 1000
  const diff = end - Date.now()
  return diff > 0 ? diff : 0
}

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

function fmt(ms) {
  if (ms === null || ms === undefined) return '--:--:--'
  const h = Math.floor(ms / 3600000)
  const m = Math.floor((ms % 3600000) / 60000)
  const s = Math.floor((ms % 60000) / 1000)
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
}

const css = `
  .lb-wrap {
    width: 100%;
    border-bottom: 1px solid ${RULE};
    position: relative;
    overflow: hidden;
    background: ${INK};
  }

  .lb-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 24px;
    border-bottom: 1px solid ${RULE};
    background: ${INK};
  }
  .lb-label {
    font-family: var(--font-brand);
    font-size: var(--t-label, 0.6875rem);
    letter-spacing: .32em;
    color: ${CREAM};
    opacity: .28;
    text-transform: uppercase;
  }
  .lb-badge {
    display: flex;
    align-items: center;
    gap: 7px;
    font-family: var(--font-brand);
    font-size: var(--t-label, 0.6875rem);
    letter-spacing: .28em;
    text-transform: uppercase;
  }
  .lb-dot {
    width: 7px; height: 7px;
    border-radius: 50%;
    flex-shrink: 0;
  }
  .lb-dot.live { animation: lb-pulse 1.4s ease-in-out infinite; }
  @keyframes lb-pulse {
    0%,100% { opacity:1; transform:scale(1); }
    50%      { opacity:.35; transform:scale(.65); }
  }

  /* ── SHARED BODY ── */
  .lb-body {
    min-height: 300px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 52px 64px;
    background: ${INK};
  }
  @media (max-width: 700px) {
    .lb-body { padding: 40px 20px; min-height: 240px; }
  }

  /* ── SHARED INNER LAYOUT (matches steeping) ── */
  .lb-inner {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    text-align: center;
  }

  /* stage title — small caps label above the main display */
  .lb-stage-title {
    font-family: var(--font-display);
    font-size: clamp(1.4rem, 4vw, 2.4rem);
    letter-spacing: .06em;
    color: ${CREAM};
    opacity: .6;
  }

  /* main display — gold gradient, large, like the countdown */
  .lb-display {
    font-family: var(--font-display);
    font-size: clamp(2.8rem, 9vw, 6rem);
    line-height: 1;
    letter-spacing: .04em;
    background: ${GOLD_GRAD};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .lb-display.dim {
    background: none;
    -webkit-text-fill-color: ${CREAM};
    opacity: .12;
    font-size: clamp(2rem, 6vw, 4rem);
  }

  /* sub-label */
  .lb-sub {
    font-family: var(--font-brand);
    font-size: var(--t-small, 0.8125rem);
    letter-spacing: .2em;
    color: ${CREAM};
    opacity: .28;
    text-transform: uppercase;
  }
  .lb-batch-tag {
    font-family: var(--font-brand);
    font-size: var(--t-label, 0.6875rem);
    letter-spacing: .28em;
    color: ${CREAM};
    opacity: .22;
    text-transform: uppercase;
  }

  /* SVG wrapper — same proportions for all stages */
  .lb-svg-wrap {
    height: 110px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* IDLE bean float */
  @keyframes lb-float {
    0%,100% { transform: translateY(0); }
    50%      { transform: translateY(-7px); }
  }
  .lb-anim-float { animation: lb-float 4s ease-in-out infinite; }

  /* GRINDING shudder */
  @keyframes lb-shudder {
    0%,38%  { transform: translate(0,0) rotate(0deg); }
    40%     { transform: translate(-2px,1px) rotate(-1deg); }
    42%     { transform: translate(2px,-2px) rotate(1.5deg); }
    44%     { transform: translate(-1px,1px) rotate(-0.5deg); }
    46%     { transform: translate(1px,0px) rotate(1deg); }
    48%,100%{ transform: translate(0,0) rotate(0deg); }
  }
  .lb-anim-shudder { animation: lb-shudder 1.6s ease-in-out infinite; }

  /* STEEPING jar fill wave */
  .lb-jar-fill { animation: lb-liq-wave 3s ease-in-out infinite; }
  @keyframes lb-liq-wave {
    0%,100% { opacity:.65; }
    50%     { opacity:1; }
  }

  /* READY cup ice float */
  @keyframes lb-ice1 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-3px)} }
  @keyframes lb-ice2 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-2px)} }
  @keyframes lb-ice3 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
  .lb-ice1 { animation: lb-ice1 2.8s ease-in-out infinite; }
  .lb-ice2 { animation: lb-ice2 2.2s ease-in-out .4s infinite; }
  .lb-ice3 { animation: lb-ice3 3.2s ease-in-out .8s infinite; }
`

/* ── IDLE: coffee bag SVG ── */
function IdleStage() {
  return (
    <div className="lb-body">
      <div className="lb-inner">
        <div className="lb-svg-wrap">
          <svg className="lb-anim-float" width="56" height="100" viewBox="0 0 56 100" fill="none">
            <path d="M8 28 L28 10 L48 28 L48 88 Q48 94 28 94 Q8 94 8 88 Z"
              stroke={CREAM} strokeWidth="2" fill={CREAM} fillOpacity=".04" strokeLinejoin="round" opacity=".3"/>
            <path d="M20 20 L28 10 L36 20" stroke={CREAM} strokeWidth="1.5" fill="none" opacity=".2" strokeLinejoin="round"/>
            <line x1="18" y1="52" x2="38" y2="52" stroke={CREAM} strokeWidth="1" opacity=".08"/>
            <line x1="18" y1="62" x2="38" y2="62" stroke={CREAM} strokeWidth="1" opacity=".08"/>
            <line x1="18" y1="72" x2="38" y2="72" stroke={CREAM} strokeWidth="1" opacity=".06"/>
            <text x="28" y="44" textAnchor="middle"
              fontFamily="'Cinzel',serif" fontSize="5.5" fontWeight="700"
              fill={CREAM} opacity=".15" letterSpacing="1.5">CBBC</text>
          </svg>
        </div>
        <div className="lb-stage-title">STANDBY</div>
        <div className="lb-display dim">NEXT BATCH<br/>COMING SOON</div>
        <div className="lb-sub">Small batch · Los Angeles · Cold brewed</div>
      </div>
    </div>
  )
}

/* ── GRINDING: hand grinder SVG ── */
function GrindingStage({ batchNum }) {
  return (
    <div className="lb-body">
      <div className="lb-inner">
        <div className="lb-svg-wrap">
          <svg className="lb-anim-shudder" width="52" height="100" viewBox="0 0 52 100" fill="none">
            {/* handle */}
            <line x1="26" y1="4" x2="44" y2="4" stroke={GOLD} strokeWidth="2.5" strokeLinecap="round"/>
            <circle cx="44" cy="4" r="4" fill={GOLD} opacity=".8"/>
            <circle cx="26" cy="4" r="3.5" stroke={GOLD} strokeWidth="2" fill="none" opacity=".9"/>
            <line x1="26" y1="7" x2="26" y2="18" stroke={GOLD} strokeWidth="2" strokeLinecap="round"/>
            {/* hopper */}
            <path d="M14 18 L10 34 L42 34 L38 18 Z"
              stroke={GOLD} strokeWidth="1.8" fill={GOLD} fillOpacity=".12" strokeLinejoin="round"/>
            {/* body */}
            <rect x="10" y="34" width="32" height="42" rx="3"
              stroke={GOLD} strokeWidth="2" fill={GOLD} fillOpacity=".08"/>
            {/* window detail */}
            <rect x="16" y="40" width="20" height="14" rx="2"
              stroke={GOLD} strokeWidth="1.2" fill={GOLD} fillOpacity=".1" opacity=".6"/>
            {/* catch drawer */}
            <rect x="8" y="76" width="36" height="18" rx="2"
              stroke={GOLD} strokeWidth="1.8" fill="none" opacity=".7"/>
            <line x1="20" y1="85" x2="32" y2="85" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round" opacity=".4"/>
          </svg>
        </div>
        <div className="lb-stage-title">GRINDING</div>
        <div className="lb-display">BATCH<br/>#{String(batchNum).padStart(2,'0')}</div>
        <div className="lb-sub">Coarse ground · Fresh every time</div>
      </div>
    </div>
  )
}

/* ── STEEPING: jar SVG with live fill ── */
function SteepingStage({ batchNum, remaining }) {
  const pct = remaining !== null
    ? Math.max(0, Math.min(1, remaining / (STEEP_HOURS * 3600 * 1000)))
    : 1
  const fillHeight = 80
  const fillY = 18 + fillHeight * (1 - pct)

  return (
    <div className="lb-body">
      <div className="lb-inner">
        <div className="lb-svg-wrap">
          <svg width="72" height="110" viewBox="0 0 72 110" fill="none">
            <defs>
              <clipPath id="lb-jar-clip">
                <rect x="8" y="18" width="56" height="80" rx="4"/>
              </clipPath>
            </defs>
            <rect x="4" y="6" width="64" height="14" rx="3" stroke={CREAM} strokeWidth="2" fill="none" opacity=".45"/>
            <rect x="8" y="18" width="56" height="80" rx="4" stroke={CREAM} strokeWidth="2" fill="none" opacity=".45"/>
            <rect
              className="lb-jar-fill"
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
        <div className="lb-stage-title">STEEPING</div>
        <div className="lb-display">{fmt(remaining)}</div>
        <div className="lb-sub">20 hours · Cold water · No shortcuts</div>
        {batchNum > 0 && <div className="lb-batch-tag">Batch #{String(batchNum).padStart(2,'0')}</div>}
      </div>
    </div>
  )
}

/* ── READY: cold brew cup with ice ── */
function ReadyStage({ batchNum }) {
  return (
    <div className="lb-body">
      <div className="lb-inner">
        <div className="lb-svg-wrap">
          <svg width="64" height="100" viewBox="0 0 64 100" fill="none">
            <defs>
              <clipPath id="lb-cup-clip">
                <path d="M6 6L58 6L50 92Q50 96 32 96Q14 96 14 92Z"/>
              </clipPath>
            </defs>
            <path d="M6 6L58 6L50 92Q50 96 32 96Q14 96 14 92Z"
              stroke={CREAM} strokeWidth="2" fill="none" strokeLinejoin="round" opacity=".45"/>
            <line x1="6" y1="6" x2="58" y2="6" stroke={GOLD} strokeWidth="3" strokeLinecap="round"/>
            {/* liquid fill */}
            <rect x="7" y="44" width="54" height="54" fill={CREAM} fillOpacity=".04" clipPath="url(#lb-cup-clip)"/>
            {/* dashed fill line */}
            <line x1="14" y1="44" x2="52" y2="44" stroke={CREAM} strokeWidth="1"
              strokeDasharray="4 3" opacity=".12" strokeLinecap="round"/>
            {/* ice cubes */}
            <g className="lb-ice1">
              <rect x="14" y="50" width="18" height="15" rx="3"
                stroke={CREAM} strokeWidth="1.6" strokeOpacity=".2" fill={CREAM} fillOpacity=".06"/>
            </g>
            <g className="lb-ice2">
              <rect x="36" y="55" width="13" height="12" rx="2.5"
                stroke={CREAM} strokeWidth="1.4" strokeOpacity=".16" fill={CREAM} fillOpacity=".04"/>
            </g>
            <g className="lb-ice3">
              <rect x="12" y="66" width="10" height="10" rx="2"
                stroke={CREAM} strokeWidth="1.3" strokeOpacity=".14" fill={CREAM} fillOpacity=".03"/>
            </g>
            {/* straw */}
            <line x1="46" y1="4" x2="42" y2="96" stroke={GOLD} strokeWidth="2.5" strokeLinecap="round" opacity=".7"/>
          </svg>
        </div>
        <div className="lb-stage-title">READY</div>
        <div className="lb-display">BATCH<br/>#{String(batchNum).padStart(2,'0')}</div>
        <div className="lb-sub">Bold · Cold · Never bitter · Los Angeles</div>
      </div>
    </div>
  )
}

export default function LiveBatch() {
  const [batch, setBatch] = useState(null)
  const remaining = useCountdown(batch?.stage === 'steeping' ? batch.steep_start : null)

  useEffect(() => {
    supabase.from('batch_state').select('*').eq('id', 1).single()
      .then(({ data }) => { if (data) setBatch(data) })

    const channel = supabase.channel('batch-live')
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'batch_state'
      }, ({ new: row }) => setBatch(row))
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  const stage    = batch?.stage ?? 'idle'
  const batchNum = batch?.batch_number ?? 0

  const badgeText = { idle:'STANDBY', grinding:'LIVE NOW', steeping:'LIVE NOW', ready:'BATCH READY' }[stage]
  const isLive    = stage === 'grinding' || stage === 'steeping'

  return (
    <>
      <style>{css}</style>
      <div className="lb-wrap">
        <div className="lb-header">
          <span className="lb-label">Brew Status</span>
          <span className="lb-badge" style={{
            color: isLive || stage==='ready' ? GOLD : CREAM,
            opacity: stage==='idle' ? .35 : 1,
          }}>
            <span className={`lb-dot${isLive ? ' live' : ''}`} style={{
              background: isLive || stage==='ready' ? GOLD : CREAM,
              opacity: stage==='idle' ? .2 : 1,
            }}/>
            {badgeText}
          </span>
        </div>

        {stage === 'idle'     && <IdleStage />}
        {stage === 'grinding' && <GrindingStage batchNum={batchNum} />}
        {stage === 'steeping' && <SteepingStage batchNum={batchNum} remaining={remaining} />}
        {stage === 'ready'    && <ReadyStage batchNum={batchNum} />}
      </div>
    </>
  )
}
