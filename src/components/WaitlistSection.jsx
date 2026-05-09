import { useWaitlistCount, useBatchState } from '../lib/hooks'
import { CREAM, GOLD } from '../theme'
import styles from './WaitlistSection.module.css'

const BATCH_TARGET_DEFAULT = 25

export default function WaitlistSection() {
  const count      = useWaitlistCount()
  const batchState = useBatchState()
  const target     = batchState?.batch_target ?? BATCH_TARGET_DEFAULT

  const pct    = count != null ? Math.min(100, (count / target) * 100) : 0
  const needed = count != null ? Math.max(0, target - count) : null

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <span className={styles.label}><span className={styles.maiden}>Maiden</span> Batch</span>
        <span className={styles.badge}>BATCH #01 · OPEN</span>
      </div>
      <div className={styles.body}>
        <div className={styles.cityscape} aria-hidden="true" />
        <div className={styles.inner}>
          <div style={{ height: 110, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg className={styles.animFloat} width="56" height="100" viewBox="0 0 56 100" fill="none">
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
          <div className={styles.stageTitle}>
            Join the <span style={{ color: GOLD }}>Maiden</span> Batch now!
          </div>
          {count != null ? (
            <>
              <div className={styles.display}>
                {count} <span style={{ fontSize: '0.38em', opacity: .4, WebkitTextFillColor: CREAM }}>/ {target}</span>
              </div>
              <div className={styles.countLabel}>Free shipping on all Maiden batch orders.</div>
              <div className={styles.meterBar}>
                <div className={styles.meterFill} style={{ width: `${pct}%` }} />
              </div>
              <div className={styles.sub}>
                {needed > 0
                  ? `${needed} more and we brew batch #01`
                  : "Batch #01 confirmed — we're brewing"}
              </div>
            </>
          ) : (
            <>
              <div className={[styles.display, styles.dim].join(' ')}>BATCH #01<br/>COMING SOON</div>
              <div className={styles.sub}>Small batch · cold brewed · Los Angeles</div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
