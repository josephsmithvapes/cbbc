// src/BrewPanels.jsx

const css = `
  .bp-section {
    width: 100%;
    background: #f2ede0;
    border-bottom: 6px solid #0f0c06;
    padding-right: 64px;
    box-sizing: border-box;
  }

  /* always 3 columns — never collapses */
  .bp-panels {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    width: 100%;
  }

  .bp-panel {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 28px 12px 24px;
    border-right: 1px solid rgba(15,12,6,.1);
    gap: 8px;
    min-width: 0;
  }
  .bp-panel:last-child { border-right: none; }

  .bp-icon {
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .bp-fleur {
    font-size: 18px;
    color: #0f0c06;
    opacity: .2;
    line-height: 1;
    margin-top: 4px;
  }

  .bp-step {
    font-family: var(--font-body);
    font-size: .38rem;
    letter-spacing: .25em;
    color: #0f0c06;
    opacity: .28;
    text-transform: uppercase;
  }

  .bp-title {
    font-family: var(--font-brand);
    font-size: clamp(.7rem, 3vw, 1.1rem);
    letter-spacing: .15em;
    font-weight: 700;
    background: linear-gradient(135deg, #f0d878 0%, #c9a84c 55%, #9a7020 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    line-height: 1;
  }

  .bp-desc {
    font-family: var(--font-body);
    font-size: clamp(.48rem, 1.8vw, .62rem);
    color: #0f0c06;
    opacity: .42;
    line-height: 1.6;
  }

  /* animations */
  @keyframes bp-shudder {
    0%,44%  { transform:translate(0,0); }
    46%     { transform:translate(-1px,1px); }
    48%     { transform:translate(1px,-1px); }
    50%,100%{ transform:translate(0,0); }
  }
  .bp-bean-g { animation: bp-shudder 3s ease-in-out infinite; }

  @keyframes bp-crack {
    0%,43%  { opacity:0; }
    53%,80% { opacity:1; }
    93%,100%{ opacity:0; }
  }
  .bp-c1 { animation: bp-crack 3s 0s   ease-in-out infinite; }
  .bp-c2 { animation: bp-crack 3s .1s  ease-in-out infinite; }
  .bp-c3 { animation: bp-crack 3s .2s  ease-in-out infinite; }

  @keyframes bp-liq {
    0%,100%{ transform:scaleY(0); }
    60%    { transform:scaleY(1); }
  }
  .bp-liq { transform-origin:40px 68px; animation:bp-liq 3.5s ease-in-out infinite; }

  @keyframes fi { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
  @keyframes f2 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-3px)} }
  @keyframes f3 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
  .bp-i1 { animation:fi 2.6s ease-in-out infinite; }
  .bp-i2 { animation:f2 2.0s ease-in-out .5s infinite; }
  .bp-i3 { animation:f3 3.0s ease-in-out 1s infinite; }

  /* strip */
  .bp-strip {
    border-top: 1px solid rgba(15,12,6,.1);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 8px 16px;
    flex-wrap: wrap;
  }
  .bp-strip span {
    font-family: var(--font-body);
    font-size: .4rem;
    letter-spacing: .18em;
    color: #0f0c06;
    opacity: .2;
  }
  .bp-dot { width:3px;height:3px;border-radius:50%;background:#0f0c06;opacity:.15; }

  @media (max-width: 600px) {
    .bp-section { padding-right: 0; }
  }
`

const INK  = "#0f0c06"
const GOLD = "#c9a84c"

export default function BrewPanels() {
  return (
    <>
      <style>{css}</style>
      <section className="bp-section">
        <div className="bp-panels">

          {/* ── GRIND ── */}
          <div className="bp-panel">
            <div className="bp-icon">
              <svg width="44" height="58" viewBox="0 0 60 80" fill="none" overflow="visible">
                <g className="bp-bean-g">
                  <ellipse cx="30" cy="42" rx="14" ry="20"
                    stroke={INK} strokeWidth="2" fill={INK} fillOpacity=".1"/>
                  <path d="M30 23C25 32 25 52 30 61"
                    stroke={INK} strokeWidth="1.3" strokeLinecap="round" opacity=".4"/>
                </g>
                <path className="bp-c1" d="M18 40L28 45L42 41"
                  stroke={INK} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                <path className="bp-c2" d="M28 45L26 30"
                  stroke={INK} strokeWidth="1.1" strokeLinecap="round" opacity=".6"/>
                <path className="bp-c3" d="M28 45L30 55"
                  stroke={INK} strokeWidth="1.1" strokeLinecap="round" opacity=".6"/>
                <line x1="2" y1="36" x2="9"  y2="36" stroke={GOLD} strokeWidth="2" strokeLinecap="round"/>
                <line x1="2" y1="43" x2="11" y2="43" stroke={GOLD} strokeWidth="2" strokeLinecap="round" opacity=".5"/>
                <line x1="2" y1="50" x2="9"  y2="50" stroke={GOLD} strokeWidth="2" strokeLinecap="round" opacity=".3"/>
              </svg>
            </div>
            <div className="bp-step">Step 01</div>
            <div className="bp-title">GRIND</div>
            <div className="bp-desc">Coarse ground.<br/>Fresh every batch.</div>
            <div className="bp-fleur">⚜</div>
          </div>

          {/* ── STEEP ── */}
          <div className="bp-panel">
            <div className="bp-icon">
              <svg width="48" height="62" viewBox="0 0 80 90" fill="none">
                <defs>
                  <clipPath id="bp-jar">
                    <rect x="21" y="25" width="38" height="43" rx="3"/>
                  </clipPath>
                </defs>
                <rect x="17" y="15" width="46" height="11" rx="3"
                  stroke={INK} strokeWidth="2.2" fill="none"/>
                <rect x="20" y="24" width="40" height="46" rx="4"
                  stroke={INK} strokeWidth="2.2" fill="none"/>
                <g className="bp-liq" clipPath="url(#bp-jar)">
                  <rect x="21" y="25" width="38" height="43" rx="3"
                    fill={INK} fillOpacity=".12"/>
                </g>
                <rect x="22" y="63" width="36" height="5" rx="2"
                  fill={GOLD} opacity=".5" clipPath="url(#bp-jar)"/>
                <text x="40" y="52" textAnchor="middle"
                  fontFamily="'Oswald',sans-serif" fontSize="13" fontWeight="700"
                  fill={GOLD} opacity=".9">20H</text>
              </svg>
            </div>
            <div className="bp-step">Step 02</div>
            <div className="bp-title">STEEP</div>
            <div className="bp-desc">Cold water.<br/>20 hours. Slow.</div>
            <div className="bp-fleur">⚜</div>
          </div>

          {/* ── SERVE ── */}
          <div className="bp-panel">
            <div className="bp-icon">
              <svg width="44" height="64" viewBox="0 0 72 96" fill="none">
                <defs>
                  <clipPath id="bp-cup">
                    <path d="M6 4L66 4L58 90Q58 93 36 93Q14 93 14 90Z"/>
                  </clipPath>
                </defs>
                <path d="M6 4L66 4L58 90Q58 93 36 93Q14 93 14 90Z"
                  stroke={INK} strokeWidth="2.2" fill="none" strokeLinejoin="round"/>
                <line x1="6" y1="4" x2="66" y2="4"
                  stroke={GOLD} strokeWidth="3" strokeLinecap="round"/>
                <rect x="6" y="42" width="60" height="54"
                  fill={INK} fillOpacity=".08" clipPath="url(#bp-cup)"/>
                <line x1="16" y1="42" x2="56" y2="42"
                  stroke={INK} strokeWidth="1" strokeLinecap="round" opacity=".18"
                  strokeDasharray="4 3"/>
                <g className="bp-i1">
                  <rect x="16" y="48" width="22" height="18" rx="4"
                    stroke={INK} strokeWidth="1.8" strokeOpacity=".28" fill={INK} fillOpacity=".05"/>
                </g>
                <g className="bp-i2">
                  <rect x="41" y="53" width="15" height="14" rx="3"
                    stroke={INK} strokeWidth="1.6" strokeOpacity=".22" fill={INK} fillOpacity=".04"/>
                </g>
                <g className="bp-i3">
                  <rect x="13" y="64" width="11" height="11" rx="3"
                    stroke={INK} strokeWidth="1.4" strokeOpacity=".18" fill={INK} fillOpacity=".03"/>
                </g>
              </svg>
            </div>
            <div className="bp-step">Step 03</div>
            <div className="bp-title">SERVE</div>
            <div className="bp-desc">Over ice.<br/>Bold. Never bitter.</div>
            <div className="bp-fleur">⚜</div>
          </div>

        </div>

       
      </section>
    </>
  )
}