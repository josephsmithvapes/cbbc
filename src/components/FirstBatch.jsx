import { useWaitlistCount, useBatchState } from '../lib/hooks'

const BATCH_TARGET_DEFAULT = 25
const INK       = '#161108'
const GOLD      = '#c9a84c'
const CREAM     = '#f2ede0'
const RULE      = 'rgba(201,168,76,.15)'
const GOLD_GRAD = `linear-gradient(135deg, #f0d878 0%, ${GOLD} 55%, #9a7020 100%)`

const css = `
  .fb-wrap {
    width: 100%;
    border-bottom: 1px solid ${RULE};
    background: ${INK};
  }
  .fb-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 24px;
    border-bottom: 1px solid ${RULE};
    background: ${INK};
    position: relative;
    z-index: 1;
  }
  .fb-label {
    font-family: var(--font-brand);
    font-size: var(--t-label, 0.6875rem);
    letter-spacing: .32em;
    color: rgba(242,237,224,0.28);
    text-transform: uppercase;
  }
  .fb-maiden {
    color: ${GOLD};
  }
  .fb-badge {
    font-family: var(--font-brand);
    font-size: var(--t-label, 0.6875rem);
    letter-spacing: .28em;
    text-transform: uppercase;
    color: ${CREAM};
    opacity: .28;
  }
  .fb-body {
    min-height: 340px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 52px 64px;
    position: relative;
    overflow: hidden;
    background: #0c0804;
  }
  @media (max-width: 700px) {
    .fb-body { padding: 40px 20px; min-height: 280px; }
  }

  /* ── Cityscape photo layer ── */
  .fb-cityscape {
    position: absolute;
    inset: 0;
    background-image: url('/img/story-scoop.webp');
    background-size: cover;
    background-position: center 60%;
    /* Darken + push toward amber/sepia — filter chain order matters */
    filter: brightness(0.38) sepia(0.55) saturate(1.6) hue-rotate(-8deg);
    transform: scale(1.02); /* avoids edge bleed from blur if added later */
  }
  /* Gradient overlays — amber glow at horizon, dark vignette on top & sides */
  .fb-cityscape::after {
    content: '';
    position: absolute;
    inset: 0;
    background:
      /* dark top fade */
      linear-gradient(to bottom,
        rgba(12,8,4,.88) 0%,
        rgba(12,8,4,.25) 38%,
        rgba(12,8,4,.1)  60%,
        rgba(20,10,2,.5) 100%
      ),
      /* warm amber horizon bloom */
      radial-gradient(ellipse 90% 55% at 50% 100%,
        rgba(180,110,20,.18) 0%,
        rgba(140,80,10,.08) 50%,
        transparent 100%
      ),
      /* side vignettes */
      linear-gradient(to right,
        rgba(12,8,4,.65) 0%,
        transparent 18%,
        transparent 82%,
        rgba(12,8,4,.65) 100%
      );
  }

  /* ── Content ── */
  .fb-inner {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    text-align: center;
    position: relative;
    z-index: 1;
  }
  /* Soft radial backing so text is always legible */
  .fb-inner::before {
    content: '';
    position: absolute;
    inset: -56px -88px;
    background: radial-gradient(ellipse at center, rgba(10,6,1,.75) 25%, transparent 70%);
    pointer-events: none;
    z-index: -1;
  }
  .fb-stage-title {
    font-family: var(--font-display);
    font-size: clamp(1.4rem, 4vw, 2.4rem);
    letter-spacing: .06em;
    color: ${CREAM};
    opacity: .6;
  }
  .fb-display {
    font-family: var(--font-display);
    font-size: clamp(2.8rem, 9vw, 6rem);
    line-height: 1;
    letter-spacing: .04em;
    background: ${GOLD_GRAD};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .fb-display.dim {
    background: none;
    -webkit-text-fill-color: ${CREAM};
    opacity: .12;
    font-size: clamp(2rem, 6vw, 4rem);
  }
  .fb-sub {
    font-family: var(--font-brand);
    font-size: var(--t-small, 0.8125rem);
    letter-spacing: .2em;
    color: ${CREAM};
    opacity: .28;
    text-transform: uppercase;
  }
  .fb-count-label {
    font-family: var(--font-brand);
    font-size: var(--t-micro, 0.625rem);
    letter-spacing: .28em;
    text-transform: uppercase;
    color: ${CREAM};
    opacity: .35;
    margin-top: -6px;
  }
  .fb-meter-bar {
    width: 180px;
    height: 2px;
    background: rgba(201,168,76,.12);
    border-radius: 1px;
    overflow: hidden;
    margin: 10px 0 4px;
  }
  .fb-meter-fill {
    height: 100%;
    background: ${GOLD_GRAD};
    border-radius: 1px;
    transition: width 1.2s cubic-bezier(.22,1,.36,1);
  }
  @keyframes fb-float {
    0%,100% { transform: translateY(0); }
    50%      { transform: translateY(-7px); }
  }
  .fb-anim-float { animation: fb-float 4s ease-in-out infinite; will-change: transform; }
`

export default function FirstBatch() {
  const count      = useWaitlistCount()
  const batchState = useBatchState()
  const target     = batchState?.batch_target ?? BATCH_TARGET_DEFAULT

  const pct    = count != null ? Math.min(100, (count / target) * 100) : 0
  const needed = count != null ? Math.max(0, target - count) : null

  return (
    <>
      <style>{css}</style>
      <div className="fb-wrap">
        <div className="fb-header">
          <span className="fb-label"><span className="fb-maiden">Maiden</span> Batch</span>
          <span className="fb-badge">BATCH #01 · OPEN</span>
        </div>
        <div className="fb-body">
          <div className="fb-cityscape" aria-hidden="true" />
          <div className="fb-inner">
            <div style={{ height: 110, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg className="fb-anim-float" width="56" height="100" viewBox="0 0 56 100" fill="none">
                <path d="M8 28 L28 10 L48 28 L48 88 Q48 94 28 94 Q8 94 8 88 Z"
                  stroke={CREAM} strokeWidth="2" fill={CREAM} fillOpacity=".04" strokeLinejoin="round" opacity=".3"/>
                <path d="M20 20 L28 10 L36 20" stroke={CREAM} strokeWidth="1.5" fill="none" opacity=".2" strokeLinejoin="round"/>
                <line x1="18" y1="52" x2="38" y2="52" stroke={CREAM} strokeWidth="1" opacity=".08"/>
                <line x1="18" y1="62" x2="38" y2="62" stroke={CREAM} strokeWidth="1" opacity=".08"/>
                <line x1="18" y1="72" x2="38" y2="72" stroke={CREAM} strokeWidth="1" opacity=".06"/>
                <text x="28" y="44" textAnchor="middle"
                  fontFamily="'Cinzel',serif" fontSize="5.5" fontWeight="700"
                  fill={CREAM} opacity=".15" letterSpacing="1.5">BCCB</text>
              </svg>
            </div>
            <div className="fb-stage-title"> Join the <span style={{ color: GOLD }}>Maiden</span> Batch now!</div>
            {count != null ? (
              <>
                <div className="fb-display">
                  {count} <span style={{ fontSize: '0.38em', opacity: .4, WebkitTextFillColor: CREAM }}>/ {target}</span>
                </div>
                <div className="fb-count-label">Free shipping on all Maiden batch orders.</div>
                <div className="fb-meter-bar">
                  <div className="fb-meter-fill" style={{ width: `${pct}%` }} />
                </div>
                <div className="fb-sub">
                  {needed > 0
                    ? `${needed} more and we brew batch #01`
                    : "Batch #01 confirmed — we're brewing"}
                </div>
              </>
            ) : (
              <>
                <div className="fb-display dim">BATCH #01<br/>COMING SOON</div>
                <div className="fb-sub">Small batch · cold brewed · Los Angeles</div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
