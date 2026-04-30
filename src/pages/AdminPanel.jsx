import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const PASS = import.meta.env.VITE_ADMIN_PASS
const INK  = '#161108'
const GOLD = '#c9a84c'
const CREAM = '#f2ede0'

const STAGES = [
  { key: 'idle',     label: 'IDLE',     sub: 'No active batch',            color: INK,  textColor: CREAM },
  { key: 'grinding', label: 'GRINDING', sub: 'Beans are being ground now', color: INK,  textColor: GOLD  },
  { key: 'steeping', label: 'STEEPING', sub: 'Cold steep in progress',     color: CREAM, textColor: INK  },
  { key: 'ready',    label: 'READY',    sub: 'Batch is done',              color: GOLD, textColor: INK   },
]

export default function AdminPanel() {
  const [authed, setAuthed]   = useState(() => sessionStorage.getItem('cbbc_admin') === '1')
  const [pw, setPw]           = useState('')
  const [pwErr, setPwErr]     = useState(false)
  const [batch, setBatch]     = useState(null)
  const [saving, setSaving]   = useState(false)
  const [flash, setFlash]     = useState('')

  useEffect(() => {
    if (!authed) return
    supabase.from('batch_state').select('*').eq('id', 1).single()
      .then(({ data }) => { if (data) setBatch(data) })

    const ch = supabase.channel('admin-batch')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'batch_state' },
        ({ new: row }) => setBatch(row))
      .subscribe()
    return () => supabase.removeChannel(ch)
  }, [authed])

  function login(e) {
    e.preventDefault()
    if (pw === PASS) {
      sessionStorage.setItem('cbbc_admin', '1')
      setAuthed(true)
    } else {
      setPwErr(true)
      setPw('')
      setTimeout(() => setPwErr(false), 1600)
    }
  }

  async function setStage(stage) {
    setSaving(true)
    const now = new Date().toISOString()
    const update = { stage, updated_at: now }
    if (stage === 'steeping') update.steep_start = now
    if (stage === 'grinding') {
      update.batch_number = (batch?.batch_number ?? 0) + 1
      update.steep_start = null
    }
    if (stage === 'idle') update.steep_start = null

    const { error } = await supabase.from('batch_state').update(update).eq('id', 1)

    if (!error) {
      setBatch(prev => ({ ...prev, ...update }))
      setFlash('✓ LIVE')
      setTimeout(() => setFlash(''), 2000)
    } else {
      setFlash('✗ ERROR')
      setTimeout(() => setFlash(''), 2000)
    }
    setSaving(false)
  }

  function logout() {
    sessionStorage.removeItem('cbbc_admin')
    window.location.href = '/'
  }

  if (!authed) return (
    <div style={{
      position:'fixed', inset:0, background:INK,
      display:'flex', alignItems:'center', justifyContent:'center',
      zIndex:9999, fontFamily:"'Cinzel', serif"
    }}>
      <form onSubmit={login} style={{
        display:'flex', flexDirection:'column', alignItems:'center', gap:24,
        padding:48, border:`1px solid rgba(201,168,76,.2)`, maxWidth:360, width:'90%'
      }}>
        <div style={{color:GOLD,fontSize:'var(--t-micro, 0.625rem)',letterSpacing:'.4em',opacity:.7}}>
          COLD BREW BOLD CREW
        </div>
        <div style={{color:CREAM,fontSize:'1.6rem',letterSpacing:'.1em',fontFamily:"'Alfa Slab One',serif"}}>
          ADMIN
        </div>
        <input
          type="password"
          value={pw}
          onChange={e => setPw(e.target.value)}
          placeholder="password"
          autoFocus
          style={{
            width:'100%', padding:'14px 16px',
            background:'transparent',
            border:`2px solid ${pwErr ? '#c0392b' : 'rgba(201,168,76,.3)'}`,
            color:CREAM, fontFamily:"'Cinzel',serif",
            fontSize:'.85rem', letterSpacing:'.1em',
            outline:'none', transition:'border-color .2s',
            textAlign:'center',
          }}
        />
        {pwErr && (
          <div style={{color:'#c0392b',fontSize:'var(--t-micro, 0.625rem)',letterSpacing:'.15em',marginTop:-12}}>
            INCORRECT PASSWORD
          </div>
        )}
        <button type="submit" style={{
          width:'100%', padding:'14px',
          background:GOLD, border:'none', cursor:'pointer',
          fontFamily:"'Alfa Slab One',serif", fontSize:'1rem',
          letterSpacing:'.06em', color:INK,
        }}>
          ENTER
        </button>
      </form>
    </div>
  )

  const current = batch?.stage ?? 'idle'
  const batchNum = batch?.batch_number ?? 0

  return (
    <div style={{
      position:'fixed', inset:0, background:INK, overflowY:'auto',
      zIndex:9999, fontFamily:"'Cinzel',serif", padding:'0 0 40px'
    }}>
      {/* header */}
      <div style={{
        display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'0 24px', height:54,
        borderBottom:`1px solid rgba(201,168,76,.15)`
      }}>
        <span style={{color:GOLD,fontSize:'var(--t-micro, 0.625rem)',letterSpacing:'.4em',opacity:.7}}>
          CBBC ADMIN
        </span>
        <span style={{
          color: flash.startsWith('✓') ? GOLD : flash.startsWith('✗') ? '#c0392b' : CREAM,
          fontSize:'var(--t-label, 0.6875rem)', letterSpacing:'.2em',
          opacity: flash ? 1 : .3,
          transition: 'all .2s',
          fontFamily:"'Alfa Slab One',serif",
        }}>
          {flash || `BATCH #${batchNum}`}
        </span>
        <button onClick={logout} style={{
          background:'none', border:`1px solid rgba(201,168,76,.2)`,
          color:GOLD, cursor:'pointer', fontFamily:"'Cinzel',serif",
          fontSize:'var(--t-micro, 0.625rem)', letterSpacing:'.25em', padding:'6px 14px', opacity:.6
        }}>
          EXIT
        </button>
      </div>

      {/* current status */}
      <div style={{
        padding:'32px 24px 24px', textAlign:'center',
        borderBottom:`1px solid rgba(201,168,76,.1)`
      }}>
        <div style={{color:GOLD,fontSize:'var(--t-micro, 0.625rem)',letterSpacing:'.3em',opacity:.5,marginBottom:8}}>
          CURRENT STATUS
        </div>
        <div style={{
          color: current==='idle' ? CREAM : GOLD,
          fontFamily:"'Alfa Slab One',serif",
          fontSize:'clamp(2rem,8vw,3.5rem)',
          letterSpacing:'.06em',
          opacity: current==='idle' ? .25 : 1,
        }}>
          {current.toUpperCase()}
        </div>
        {batch?.steep_start && current==='steeping' && (
          <div style={{color:CREAM,fontSize:'var(--t-micro, 0.625rem)',letterSpacing:'.18em',opacity:.35,marginTop:8}}>
            STARTED: {new Date(batch.steep_start).toLocaleString()}
          </div>
        )}
      </div>

      {/* stage buttons */}
      <div style={{padding:'32px 24px'}}>
        <div style={{color:GOLD,fontSize:'var(--t-micro, 0.625rem)',letterSpacing:'.3em',opacity:.4,marginBottom:20,textAlign:'center'}}>
          SET STAGE
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,maxWidth:480,margin:'0 auto'}}>
          {STAGES.map(s => (
            <button
              key={s.key}
              onClick={() => setStage(s.key)}
              disabled={saving || current === s.key}
              style={{
                padding:'22px 12px',
                background: current===s.key ? s.color : 'transparent',
                border: `2px solid ${current===s.key ? s.color : 'rgba(201,168,76,.2)'}`,
                cursor: current===s.key ? 'default' : 'pointer',
                opacity: current===s.key ? 1 : saving ? .4 : .75,
                transition:'all .2s',
                display:'flex', flexDirection:'column',
                alignItems:'center', gap:6,
              }}
            >
              <span style={{
                fontFamily:"'Alfa Slab One',serif",
                fontSize:'1.1rem', letterSpacing:'.04em',
                color: current===s.key ? s.textColor : CREAM,
              }}>
                {s.label}
              </span>
              <span style={{
                fontFamily:"'Cinzel',serif", fontSize:'var(--t-micro, 0.625rem)',
                letterSpacing:'.18em', color:CREAM, opacity:.45,
              }}>
                {s.sub}
              </span>
            </button>
          ))}
        </div>

        <div style={{textAlign:'center',marginTop:32}}>
          <div style={{color:CREAM,fontSize:'var(--t-micro, 0.625rem)',letterSpacing:'.2em',opacity:.2,lineHeight:1.8}}>
            GRINDING → automatically increments batch number<br/>
            STEEPING → records steep start time for live countdown<br/>
            Changes go live instantly for all visitors
          </div>
        </div>
      </div>
    </div>
  )
}
