import { useBatchState } from '../lib/hooks'

const INK   = '#161108'
const GOLD  = '#c9a84c'
const CREAM = '#f2ede0'

const STEPS = [
  {
    key: 'grinding',
    label: 'GRIND',
    icon: (active) => (
      <svg width="16" height="20" viewBox="0 0 40 52" fill="none">
        <ellipse cx="20" cy="30" rx="10" ry="15"
          stroke={active ? GOLD : CREAM} strokeWidth="2"
          fill={active ? GOLD : 'none'} fillOpacity={active ? .15 : 0}
          opacity={active ? 1 : .35}/>
        <path d="M20 15C16 22 16 38 20 45"
          stroke={active ? GOLD : CREAM} strokeWidth="1.2"
          strokeLinecap="round" opacity={active ? .6 : .25}/>
        <line x1="2" y1="27" x2="7" y2="27"
          stroke={active ? GOLD : CREAM} strokeWidth="1.8"
          strokeLinecap="round" opacity={active ? .9 : .3}/>
        <line x1="2" y1="32" x2="9" y2="32"
          stroke={active ? GOLD : CREAM} strokeWidth="1.8"
          strokeLinecap="round" opacity={active ? .6 : .2}/>
      </svg>
    ),
  },
  {
    key: 'steeping',
    label: 'STEEP',
    icon: (active) => (
      <svg width="16" height="20" viewBox="0 0 40 52" fill="none">
        <rect x="8" y="6" width="24" height="7" rx="2"
          stroke={active ? GOLD : CREAM} strokeWidth="1.8" fill="none"
          opacity={active ? 1 : .35}/>
        <rect x="10" y="12" width="20" height="28" rx="2"
          stroke={active ? GOLD : CREAM} strokeWidth="1.8" fill="none"
          opacity={active ? 1 : .35}/>
        <rect x="11" y="28" width="18" height="11" rx="1"
          fill={active ? GOLD : CREAM} fillOpacity={active ? .3 : .1}/>
      </svg>
    ),
  },
  {
    key: 'ready',
    label: 'READY',
    icon: (active) => (
      <svg width="14" height="20" viewBox="0 0 36 52" fill="none">
        <path d="M4 4L32 4L28 46Q28 49 18 49Q8 49 8 46Z"
          stroke={active ? GOLD : CREAM} strokeWidth="1.8" fill="none"
          strokeLinejoin="round" opacity={active ? 1 : .35}/>
        <line x1="4" y1="4" x2="32" y2="4"
          stroke={active ? GOLD : CREAM} strokeWidth="2.5"
          strokeLinecap="round" opacity={active ? 1 : .35}/>
        <rect x="5" y="24" width="26" height="24"
          fill={active ? GOLD : CREAM} fillOpacity={active ? .15 : .05}
          clipPath="url(#cup-c)"/>
        <defs>
          <clipPath id="cup-c">
            <path d="M4 4L32 4L28 46Q28 49 18 49Q8 49 8 46Z"/>
          </clipPath>
        </defs>
      </svg>
    ),
  },
]

const STAGE_INDEX = { idle: -1, grinding: 0, steeping: 1, ready: 2 }

export default function BrewFlow() {
  const batch   = useBatchState()
  const stage   = batch?.stage ?? 'idle'
  const current = STAGE_INDEX[stage] ?? -1

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 0,
      marginLeft: 'auto',
      marginRight: '12px',
    }}>
      {STEPS.map((step, i) => {
        const active  = i === current
        const done    = i < current

        return (
          <div key={step.key} style={{ display: 'flex', alignItems: 'center' }}>
            {/* connector line */}
            {i > 0 && (
              <div style={{
                width: 20, height: 1,
                background: done || active ? GOLD : CREAM,
                opacity: done ? .5 : active ? .4 : .15,
                margin: '0 2px',
              }}/>
            )}

            {/* step */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              padding: '0 6px',
              position: 'relative',
            }}>
              {/* active glow ring */}
              {active && (
                <div style={{
                  position: 'absolute',
                  inset: '-3px',
                  border: `1px solid ${GOLD}`,
                  borderRadius: 3,
                  opacity: .3,
                  pointerEvents: 'none',
                }}/>
              )}

              {step.icon(active || done)}

              <span style={{
                fontFamily: "var(--font-brand, 'Cinzel', serif)",
                fontSize: '0.5625rem',
                letterSpacing: '.2em',
                color: active ? GOLD : done ? GOLD : CREAM,
                opacity: active ? 1 : done ? .5 : .25,
                lineHeight: 1,
                whiteSpace: 'nowrap',
              }}>
                {done ? '✓' : step.label}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
