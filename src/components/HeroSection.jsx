import { useState, useEffect } from 'react'
import { useWaitlistCount } from '../lib/hooks'
import styles from './HeroSection.module.css'

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 960)
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 960)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  return isMobile
}

export default function HeroSection() {
  const isMobile = useIsMobile()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [vaultOpen, setVaultOpen] = useState(false)
  const count = useWaitlistCount() || 0

  // Lock body scroll when the mobile bottom sheet is open
  useEffect(() => {
    if (sheetOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [sheetOpen])

  const handleReserve = (tier) => {
    window._bccbTier = tier
    if (isMobile) setSheetOpen(false)
    document.querySelector('.capture')?.scrollIntoView({ behavior: 'smooth' })
    setTimeout(() => document.getElementById('email')?.focus(), 400)
  }

  // Calculate real-time vault percentages directly from the hook!
  const t5 = Math.min(count, 5), p5 = Math.round((t5 / 5) * 100)
  const t10 = Math.min(count, 10), p10 = Math.round((t10 / 10) * 100)
  const t25 = Math.min(count, 25), p25 = Math.round((t25 / 25) * 100)

  const DesktopPricing = () => (
    <div className={styles.serviceMatrix} role="list" aria-label="Reservation tiers">
      {/* Weekly */}
      <div className={styles.planCard} role="listitem">
        <div className={styles.planCardHead}>
          <img className={styles.planCardImg} src="/img/plan-weekly.svg" alt="Single cold brew bottle" loading="lazy"/>
          <span className={styles.planCardEyebrow}>Weekly</span>
          <span className={styles.planCardName}>WEEKLY</span>
          <span className={styles.planCardSub}>One six pack per week.</span>
        </div>
        <div className={styles.planCardStat}>
          <span className={styles.planStatQty}>1 Case</span>
          <span className={styles.planStatUnit}>of 6 · 12 oz</span>
        </div>
        <div className={styles.planCardFeatures}>
          <div className={styles.planFeature}>Ships every Sunday</div>
          <div className={styles.planFeature}>On batch finish</div>
          <div className={styles.planFeature}>Cancel anytime</div>
        </div>
        <div className={styles.planCardCta}>
          <button className={styles.serviceMatrixBtn} onClick={() => handleReserve('weekly')}>Reserve weekly</button>
        </div>
      </div>

      {/* Monthly (Featured) */}
      <div className={`${styles.planCard} ${styles.isFeatured}`} role="listitem">
        <div className={styles.planCardHead}>
          <span className={styles.planCardFlag}>★ Most reserved</span>
          <img className={styles.planCardImg} src="/img/plan-monthly.svg" alt="Mason jar cold steep" loading="lazy"/>
          <span className={styles.planCardEyebrow}>Monthly</span>
          <span className={styles.planCardName}>MONTHLY</span>
          <span className={styles.planCardSub}>One six pack every other week.</span>
        </div>
        <div className={styles.planCardStat}>
          <span className={styles.planStatQty}>2 Cases</span>
          <span className={styles.planStatUnit}>of 6 · 12 oz each</span>
        </div>
        <div className={styles.planCardFeatures}>
          <div className={styles.planFeature}>Ships twice a month</div>
          <div className={styles.planFeature}>On batch finish</div>
          <div className={styles.planFeature}>Cancel anytime</div>
        </div>
        <div className={styles.planCardCta}>
          <button className={`${styles.serviceMatrixBtn} ${styles.isPrimary}`} onClick={() => handleReserve('monthly')}>Reserve monthly</button>
        </div>
      </div>

      {/* Single */}
      <div className={styles.planCard} role="listitem">
        <div className={styles.planCardHead}>
          <img className={styles.planCardImg} src="/img/plan-single.svg" alt="Cold brew glass over ice" loading="lazy"/>
          <span className={styles.planCardEyebrow}>Single Batch</span>
          <span className={styles.planCardName}>SINGLE</span>
          <span className={styles.planCardSub}>Order when you're ready.</span>
        </div>
        <div className={styles.planCardStat}>
          <span className={styles.planStatQty}>1 Case</span>
          <span className={styles.planStatUnit}>of 6 · 12 oz</span>
        </div>
        <div className={styles.planCardFeatures}>
          <div className={styles.planFeature}>One-time order</div>
          <div className={styles.planFeature}>Ships on batch finish</div>
          <div className={styles.planFeature}>No commitment</div>
        </div>
        <div className={styles.planCardCta}>
          <button className={styles.serviceMatrixBtn} onClick={() => handleReserve('single')}>Reserve single</button>
        </div>
      </div>
    </div>
  )

  const MobilePricing = () => (
    <div className={`${styles.serviceMatrix} ${styles.mobileMatrix}`} role="list" aria-label="Reservation tiers">
      {/* Weekly */}
      <div className={styles.planCard} role="listitem">
        <div className={styles.planCardHead}>
          <div className={styles.labBarcode}></div>
          <div className={styles.labSpecRow}><span className={styles.labLbl}>TYPE</span><span className={`${styles.labVal} ${styles.goldText}`}>WEEKLY</span></div>
          <div className={styles.labSpecRow}><span className={styles.labLbl}>VOL</span><span className={styles.labVal}>72oz (6x12)</span></div>
          <div className={styles.labSpecRow}><span className={styles.labLbl}>FREQ</span><span className={styles.labVal}>1 / WK</span></div>
          <div className={styles.labSpecRow}><span className={styles.labLbl}>COMMIT</span><span className={styles.labVal}>NONE</span></div>
        </div>
        <div className={styles.planCardFeatures}>
          <div className={styles.planFeature}>Ships every Sunday</div>
          <div className={styles.planFeature}>On batch finish</div>
          <div className={styles.planFeature}>Cancel anytime</div>
        </div>
        <div className={styles.planCardCta}>
          <button className={styles.serviceMatrixBtn} onClick={() => handleReserve('weekly')}>RESERVE [W]</button>
        </div>
      </div>

      {/* Monthly (Featured) */}
      <div className={`${styles.planCard} ${styles.isFeatured}`} role="listitem">
        <span className={styles.labFlag}>MOST RESERVED</span>
        <div className={styles.planCardHead}>
          <div className={styles.labBarcode}></div>
          <div className={styles.labSpecRow}><span className={styles.labLbl}>TYPE</span><span className={`${styles.labVal} ${styles.goldText}`}>MONTHLY</span></div>
          <div className={styles.labSpecRow}><span className={styles.labLbl}>VOL</span><span className={styles.labVal}>144oz (12x12)</span></div>
          <div className={styles.labSpecRow}><span className={styles.labLbl}>FREQ</span><span className={styles.labVal}>1 / 2WKS</span></div>
          <div className={styles.labSpecRow}><span className={styles.labLbl}>COMMIT</span><span className={styles.labVal}>NONE</span></div>
        </div>
        <div className={styles.planCardFeatures}>
          <div className={styles.planFeature}>Ships twice a month</div>
          <div className={styles.planFeature}>On batch finish</div>
          <div className={styles.planFeature}>Cancel anytime</div>
        </div>
        <div className={styles.planCardCta}>
          <button className={`${styles.serviceMatrixBtn} ${styles.isPrimary}`} onClick={() => handleReserve('monthly')}>RESERVE [M]</button>
        </div>
      </div>

      {/* Single */}
      <div className={styles.planCard} role="listitem">
        <div className={styles.planCardHead}>
          <div className={styles.labBarcode}></div>
          <div className={styles.labSpecRow}><span className={styles.labLbl}>TYPE</span><span className={`${styles.labVal} ${styles.goldText}`}>SINGLE</span></div>
          <div className={styles.labSpecRow}><span className={styles.labLbl}>VOL</span><span className={styles.labVal}>72oz (6x12)</span></div>
          <div className={styles.labSpecRow}><span className={styles.labLbl}>FREQ</span><span className={styles.labVal}>ON DEMAND</span></div>
          <div className={styles.labSpecRow}><span className={styles.labLbl}>COMMIT</span><span className={styles.labVal}>ONE-TIME</span></div>
        </div>
        <div className={styles.planCardFeatures}>
          <div className={styles.planFeature}>One-time order</div>
          <div className={styles.planFeature}>Ships on batch finish</div>
          <div className={styles.planFeature}>No commitment</div>
        </div>
        <div className={styles.planCardCta}>
          <button className={styles.serviceMatrixBtn} onClick={() => handleReserve('single')}>RESERVE [S]</button>
        </div>
      </div>
    </div>
  )

  return (
    <section className={styles.liveHero} id="live" aria-label="Live brew monitor">
      {isMobile && (
        <div 
          className={`${styles.sheetBackdrop} ${sheetOpen ? styles.sheetOpen : ''}`} 
          onClick={() => setSheetOpen(false)} 
          aria-hidden="true"
        />
      )}

      <div className={`${styles.liveHeroMain} ${sheetOpen ? styles.sheetOpen : ''}`} id="bottom-sheet">
        {isMobile && (
          <button className={styles.sheetCloseBtn} onClick={() => setSheetOpen(false)} aria-label="Close reservation options">✕</button>
        )}

        <div className={styles.serviceStrip}>
          <section 
            className={[styles.tierVault, vaultOpen && styles.isExpanded].filter(Boolean).join(' ')}
            aria-label="Maiden batch reservation rewards" 
            role="button" 
            tabIndex="0" 
            aria-expanded={vaultOpen}
            onClick={() => setVaultOpen(!vaultOpen)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setVaultOpen(!vaultOpen); } }}
          >
            <div className={styles.vaultTrigger}>
              <div className={styles.vaultBanner}>
                <span className={styles.vaultStar} aria-hidden="true">☆</span>
                <span style={{color: '#c9a84c'}}>Maiden</span> investors unlock exclusive benefits — Be one of the first to Join the Crew!
              </div>
              <svg className={styles.vaultChevron} width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M2 5l5 5 5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className={styles.vaultDivider}></div>
            <div className={styles.vaultBody}>
              <div className={styles.vaultGrid} style={{marginTop: 22}}>
                {[
                  { label: "Tier I", t: t5, p: p5, max: 5 },
                  { label: "Tier II", t: t10, p: p10, max: 10 },
                  { label: "Tier III", t: t25, p: p25, max: 25 },
                ].map((tier, i) => (
                  <div className={styles.vaultCell} key={i}>
                    <svg className={styles.vaultLock} width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden="true">
                      <defs>
                        <clipPath id={`cbbc-vault-clip-${tier.max}`}><rect x="13" y="31" width="38" height="26" rx="1.5"/></clipPath>
                      </defs>
                      <path d="M20 30 V22 a12 12 0 0 1 24 0 V30" stroke="#f2ede0" strokeOpacity=".55" strokeWidth="2.4" strokeLinecap="round" fill="none"/>
                      <rect x="12" y="30" width="40" height="28" rx="2" stroke="#c9a84c" strokeOpacity=".85" strokeWidth="1.6" fill="none"/>
                      <rect x="13" y={57 - (26 * (tier.p / 100))} width="38" height={26 * (tier.p / 100)} fill="#c9a84c" fillOpacity=".22" clipPath={`url(#cbbc-vault-clip-${tier.max})`}/>
                      <circle cx="32" cy="42" r="3" fill="#c9a84c" fillOpacity=".5"/>
                      <rect x="31" y="44" width="2" height="6" fill="#c9a84c" fillOpacity=".5"/>
                    </svg>
                    <div className={styles.vaultCount}>
                      <span className={styles.vaultNum}>{tier.t}</span>
                      <span className={styles.vaultOf}>/ {tier.max} reservations</span>
                    </div>
                    <p className={styles.vaultReward}>{tier.label}</p>
                    <div className={styles.vaultBar}><span style={{width: `${tier.p}%`}}></span></div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {isMobile ? <MobilePricing /> : <DesktopPricing />}

          <div className={styles.trackBar}>
            <svg width="18" height="14" viewBox="0 0 36 28" fill="none" aria-hidden="true">
              <polyline points="0,22 6,18 12,16 18,14 22,15 28,9 34,5 36,4" fill="none" stroke="#c9a84c" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" opacity=".7"/>
              <circle cx="36" cy="4" r="2" fill="#c9a84c" opacity=".7"/>
            </svg>
            <span>Every batch on the record — temperature curves, steep times, tasting notes.</span>
            <button className={styles.serviceLink} onClick={() => document.getElementById('batches')?.scrollIntoView({behavior:'smooth'})}>See the archive →</button>
          </div>
        </div>
      </div>

      <div className={styles.liveHeroPanel}>
        <div className={styles.photoFull}>
          {isMobile ? (
            // Mobile SVG Schematic
            <svg viewBox="0 0 800 993" preserveAspectRatio="xMidYMid slice" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="BCCB Bottle Schematic">
              <defs>
                <clipPath id="bottle-mask"><path d="M330 170 h140 v60 c0 60 70 100 70 160 v400 a30 30 0 0 1 -30 30 h-220 a30 30 0 0 1 -30 -30 v-400 c0 -60 70 -100 70 -160 Z" /></clipPath>
                <linearGradient id="hero-liquid" x1="0" y1="380" x2="0" y2="993">
                  <stop offset="0%" stopColor="#c9a84c"/>
                  <stop offset="100%" stopColor="#c8673a"/>
                </linearGradient>
              </defs>
              <image href="/img/bottle-bccb.webp" x="0" y="0" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" opacity="0.15" />
              <path d="M0 200h800 M0 400h800 M0 600h800 M0 800h800" stroke="rgba(242,237,224,0.03)" strokeWidth="1"/>
              <path d="M200 0v993 M400 0v993 M600 0v993" stroke="rgba(242,237,224,0.03)" strokeWidth="1"/>
              <image href="/img/bottle-bccb.webp" x="0" y="0" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" clipPath="url(#bottle-mask)" opacity="0.8"/>
              <path d="M260 380 h280 v410 a30 30 0 0 1 -30 30 h-220 a30 30 0 0 1 -30 -30 Z" fill="url(#hero-liquid)" opacity="0.25"/>
              <line x1="240" y1="380" x2="560" y2="380" stroke="#c9a84c" strokeWidth="3" opacity="0.7"/>
              <path d="M330 170 h140 v60 c0 60 70 100 70 160 v400 a30 30 0 0 1 -30 30 h-220 a30 30 0 0 1 -30 -30 v-400 c0 -60 70 -100 70 -160 Z" stroke="rgba(201,168,76,0.5)" strokeWidth="3" strokeDasharray="6 6"/>
              <path d="M330 170 h140 v60 c0 60 70 100 70 160 v400 a30 30 0 0 1 -30 30 h-220 a30 30 0 0 1 -30 -30 v-400 c0 -60 70 -100 70 -160 Z" stroke="#c9a84c" strokeWidth="2" opacity="0.8"/>
              <rect x="300" y="80" width="200" height="90" rx="8" stroke="#c9a84c" strokeWidth="3" fill="rgba(13,10,5,0.6)"/>
              <g 
                onClick={() => document.getElementById('telemetry')?.scrollIntoView({ behavior: 'smooth' })} 
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); document.getElementById('telemetry')?.scrollIntoView({ behavior: 'smooth' }); } }}
                style={{ cursor: 'pointer' }} 
                role="button" 
                aria-label="View live telemetry"
                tabIndex="0"
              >
                {/* Target dot on bottle */}
                <circle cx="400" cy="480" r="6" fill="#c9a84c"/>
                <circle cx="400" cy="480" r="16" stroke="#c9a84c" strokeWidth="2" fill="none" opacity="0.8" strokeDasharray="4 4">
                  <animateTransform attributeName="transform" type="rotate" from="0 400 480" to="360 400 480" dur="6s" repeatCount="indefinite" />
                </circle>
                <circle cx="400" cy="480" r="26" stroke="#c9a84c" strokeWidth="1" fill="none" opacity="0.3"/>
                
                {/* Callout Line */}
                <polyline points="400,480 460,480 500,560" fill="none" stroke="#c9a84c" strokeWidth="2" opacity="0.6"/>

                {/* Sun Rays emerging from behind the box */}
                <g opacity="0.35">
                  <animateTransform attributeName="transform" type="rotate" from="0 600 620" to="360 600 620" dur="30s" repeatCount="indefinite" />
                  {Array.from({ length: 12 }).map((_, i) => (
                    <line key={i} x1="600" y1="620" x2="600" y2="450" stroke="#c9a84c" strokeWidth="1.5" strokeDasharray="3 6" transform={`rotate(${i * 30} 600 620)`} />
                  ))}
                </g>
                
                {/* CTA Box (Width 280, Height 120, Centered at X=600 -> x=460, y=560) */}
                <rect x="464" y="564" width="280" height="120" rx="10" fill="rgba(201,168,76,0.15)" />
                <rect x="460" y="560" width="280" height="120" rx="10" fill="rgba(13,10,5,0.95)" stroke="#c9a84c" strokeWidth="2"/>
                <rect x="466" y="566" width="268" height="108" rx="6" fill="none" stroke="#c9a84c" strokeWidth="1" opacity="0.3"/>
                
                {/* Content */}
                <text x="484" y="602" fontFamily="var(--font-brand)" fontSize="18" fill="#f2ede0" opacity="0.6" letterSpacing="0.1em">TAP TO VIEW</text>
                <g>
                  <animateTransform attributeName="transform" type="translate" values="0,0; 4,-4; 0,0" dur="2s" repeatCount="indefinite" />
                  <text x="696" y="604" fontFamily="var(--font-brand)" fontSize="24" fill="#c9a84c" opacity="0.9">↗</text>
                </g>
                
                <line x1="466" y1="620" x2="734" y2="620" stroke="#c9a84c" strokeWidth="1" opacity="0.3"/>
                <text x="484" y="660" fontFamily="var(--font-display)" fontSize="26" fill="#c9a84c" letterSpacing="0.05em">LIVE BATCH DATA</text>
              </g>
            </svg>
          ) : (
            // Desktop Image
            <img src="/img/bottle-bccb.webp" alt="BCCB cold brew bottle — small batch, Los Angeles" width="800" height="993" loading="eager" className={styles.desktopImg} />
          )}
          <span className={styles.photoTag}>SMALL BATCH · LOS ANGELES</span>
          <div className={styles.overlay}>
            <div>
              <div className={styles.overlayEyebrow}><span className={styles.dotPulse}></span> Est. 2026</div>
              <h2 className={styles.headline}><span className={styles.goldText}>BOLD CREW</span><br/>COLD BREW.</h2>
              <p className={styles.overlaySub}>Small batch · Cold steeped 20 hours · Los Angeles</p>
            </div>
            <a className={styles.investCallout} href="#invest" onClick={(e) => {
              e.preventDefault()
              const b = document.getElementById('invest-body')
              const t = document.getElementById('invest-toggle')
              if (b && !b.classList.contains('open')) {
                b.classList.add('open')
                if (t) t.setAttribute('aria-expanded', 'true')
              }
              setTimeout(() => {
                const f = document.getElementById('if-name')
                if (f) f.scrollIntoView({behavior:'smooth', block:'center'})
                else document.getElementById('invest')?.scrollIntoView({behavior:'smooth'})
              }, 120)
            }}>
              <span className={styles.investTitle}>INVEST IN BCCB</span>
              <div className={styles.investRight}>
                <span className={styles.investStat}>Open Round · $400M market</span>
                <span className={styles.investArrow}>→</span>
              </div>
            </a>
          </div>
        </div>
      </div>

      {isMobile && (
        <div className={styles.mobileReserveBar}>
          <button className={styles.reserveTriggerBtn} onClick={() => setSheetOpen(true)}>RESERVE BATCH #01</button>
        </div>
      )}
    </section>
  )
}