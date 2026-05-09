// src/components/ProductInfoPanels.jsx

import { GOLD, CREAM } from '../theme'
import styles from './ProductInfoPanels.module.css'

export default function ProductInfoPanels() {
  return (
    <>
      <section className={styles.section}>
        <div className={styles.panels}>

          {/* ── GRIND ── */}
          <div className={styles.panel}>
            <div className={styles.icon}>
              <svg width="44" height="58" viewBox="0 0 60 80" fill="none" overflow="visible">
                <g className={styles.beanG}>
                  <ellipse cx="30" cy="42" rx="14" ry="20"
                    stroke={CREAM} strokeWidth="2" fill={CREAM} fillOpacity=".1"/>
                  <path d="M30 23C25 32 25 52 30 61"
                    stroke={CREAM} strokeWidth="1.3" strokeLinecap="round" opacity=".4"/>
                </g>
                <path className={styles.c1} d="M18 40L28 45L42 41"
                  stroke={CREAM} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                <path className={styles.c2} d="M28 45L26 30"
                  stroke={CREAM} strokeWidth="1.1" strokeLinecap="round" opacity=".6"/>
                <path className={styles.c3} d="M28 45L30 55"
                  stroke={CREAM} strokeWidth="1.1" strokeLinecap="round" opacity=".6"/>
                <line x1="2" y1="36" x2="9"  y2="36" stroke={GOLD} strokeWidth="2" strokeLinecap="round"/>
                <line x1="2" y1="43" x2="11" y2="43" stroke={GOLD} strokeWidth="2" strokeLinecap="round" opacity=".5"/>
                <line x1="2" y1="50" x2="9"  y2="50" stroke={GOLD} strokeWidth="2" strokeLinecap="round" opacity=".3"/>
              </svg>
            </div>
            <div className={styles.step}>Step 01</div>
            <div className={styles.title}>GRIND</div>
            <div className={styles.desc}>Coarse ground.<br/>Fresh every batch.</div>
            <div className={styles.fleur}>⚜</div>
          </div>

          {/* ── STEEP ── */}
          <div className={styles.panel}>
            <div className={styles.icon}>
              <svg width="48" height="62" viewBox="0 0 80 90" fill="none">
                <defs>
                  <clipPath id="bp-jar">
                    <rect x="21" y="25" width="38" height="43" rx="3"/>
                  </clipPath>
                </defs>
                <rect x="17" y="15" width="46" height="11" rx="3"
                  stroke={CREAM} strokeWidth="2.2" fill="none"/>
                <rect x="20" y="24" width="40" height="46" rx="4"
                  stroke={CREAM} strokeWidth="2.2" fill="none"/>
                <g className={styles.liq} clipPath="url(#bp-jar)">
                  <rect x="21" y="25" width="38" height="43" rx="3"
                    fill={CREAM} fillOpacity=".12"/>
                </g>
                <rect x="22" y="63" width="36" height="5" rx="2"
                  fill={GOLD} opacity=".5" clipPath="url(#bp-jar)"/>
                <text x="40" y="52" textAnchor="middle"
                  fontFamily="'Oswald',sans-serif" fontSize="13" fontWeight="700"
                  fill={GOLD} opacity=".9">20H</text>
              </svg>
            </div>
            <div className={styles.step}>Step 02</div>
            <div className={styles.title}>STEEP</div>
            <div className={styles.desc}>Cold water.<br/>20 hours. Slow.</div>
            <div className={styles.fleur}>⚜</div>
          </div>

          {/* ── SERVE ── */}
          <div className={styles.panel}>
            <div className={styles.icon}>
              <svg width="44" height="64" viewBox="0 0 72 96" fill="none">
                <defs>
                  <clipPath id="bp-cup">
                    <path d="M6 4L66 4L58 90Q58 93 36 93Q14 93 14 90Z"/>
                  </clipPath>
                </defs>
                <path d="M6 4L66 4L58 90Q58 93 36 93Q14 93 14 90Z"
                  stroke={CREAM} strokeWidth="2.2" fill="none" strokeLinejoin="round"/>
                <line x1="6" y1="4" x2="66" y2="4"
                  stroke={GOLD} strokeWidth="3" strokeLinecap="round"/>
                <rect x="6" y="42" width="60" height="54"
                  fill={CREAM} fillOpacity=".08" clipPath="url(#bp-cup)"/>
                <line x1="16" y1="42" x2="56" y2="42"
                  stroke={CREAM} strokeWidth="1" strokeLinecap="round" opacity=".18"
                  strokeDasharray="4 3"/>
                <g className={styles.i1}>
                  <rect x="16" y="48" width="22" height="18" rx="4"
                    stroke={CREAM} strokeWidth="1.8" strokeOpacity=".28" fill={CREAM} fillOpacity=".05"/>
                </g>
                <g className={styles.i2}>
                  <rect x="41" y="53" width="15" height="14" rx="3"
                    stroke={CREAM} strokeWidth="1.6" strokeOpacity=".22" fill={CREAM} fillOpacity=".04"/>
                </g>
                <g className={styles.i3}>
                  <rect x="13" y="64" width="11" height="11" rx="3"
                    stroke={CREAM} strokeWidth="1.4" strokeOpacity=".18" fill={CREAM} fillOpacity=".03"/>
                </g>
              </svg>
            </div>
            <div className={styles.step}>Step 03</div>
            <div className={styles.title}>SERVE</div>
            <div className={styles.desc}>Over ice.<br/>Bold. Never bitter.</div>
            <div className={styles.fleur}>⚜</div>
          </div>

        </div>


      </section>
    </>
  )
}
