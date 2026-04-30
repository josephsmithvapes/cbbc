import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const PASS  = import.meta.env.VITE_ADMIN_PASS
const INK   = '#161108'
const GOLD  = '#c9a84c'
const CREAM = '#f2ede0'

const STAGES = [
  { key: 'idle',     label: 'IDLE',     sub: 'No active batch',            color: INK,   textColor: CREAM },
  { key: 'grinding', label: 'GRINDING', sub: 'Beans are being ground now', color: INK,   textColor: GOLD  },
  { key: 'steeping', label: 'STEEPING', sub: 'Cold steep in progress',     color: CREAM, textColor: INK   },
  { key: 'ready',    label: 'READY',    sub: 'Batch is done',              color: GOLD,  textColor: INK   },
]

const FIELD = {
  width: '100%', padding: '11px 14px',
  background: 'transparent',
  border: '1px solid rgba(201,168,76,.25)',
  color: CREAM, fontFamily: "'Cinzel',serif",
  fontSize: '0.8rem', letterSpacing: '.06em',
  outline: 'none', transition: 'border-color .15s',
  boxSizing: 'border-box',
}

const EMPTY_FORM = { name: '', origin: '', roast: 'Light', process: 'Washed', grind_notes: '', tasting_notes: '' }

export default function AdminPanel() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem('cbbc_admin') === '1')
  const [pw, setPw]         = useState('')
  const [pwErr, setPwErr]   = useState(false)
  const [batch, setBatch]   = useState(null)
  const [saving, setSaving] = useState(false)
  const [flash, setFlash]   = useState('')
  const [form, setForm]     = useState(EMPTY_FORM)
  const [activeBatch, setActiveBatch] = useState(null)

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

  // Load the currently active batch (no steep_end) to show its metadata
  useEffect(() => {
    if (!authed) return
    supabase.from('batches')
      .select('*')
      .is('steep_end', null)
      .order('steep_start', { ascending: false })
      .limit(1)
      .single()
      .then(({ data }) => {
        if (data) {
          setActiveBatch(data)
          setForm({
            name: data.name ?? '',
            origin: data.origin ?? '',
            roast: data.roast ?? 'Light',
            process: data.process ?? 'Washed',
            grind_notes: data.grind_notes ?? '',
            tasting_notes: data.tasting_notes ?? '',
          })
        }
      })
  }, [authed])

  function login(e) {
    e.preventDefault()
    if (pw === PASS) { sessionStorage.setItem('cbbc_admin', '1'); setAuthed(true) }
    else { setPwErr(true); setPw(''); setTimeout(() => setPwErr(false), 1600) }
  }

  function flash_(msg) { setFlash(msg); setTimeout(() => setFlash(''), 2200) }

  async function setStage(stage) {
    setSaving(true)
    const now = new Date().toISOString()
    const update = { stage, updated_at: now }

    if (stage === 'grinding') {
      update.batch_number = (batch?.batch_number ?? 0) + 1
      update.steep_start  = null

      // Create new batch record with current form metadata
      const { data: newBatch, error: bErr } = await supabase.from('batches').insert({
        batch_number:   update.batch_number,
        name:           form.name || null,
        origin:         form.origin || null,
        roast:          form.roast || null,
        process:        form.process || null,
        grind_notes:    form.grind_notes || null,
        tasting_notes:  form.tasting_notes || null,
        steep_start:    now,
      }).select().single()

      if (!bErr) setActiveBatch(newBatch)
    }

    if (stage === 'steeping') update.steep_start = now

    if (stage === 'ready' && activeBatch) {
      await supabase.from('batches').update({ steep_end: now }).eq('id', activeBatch.id)
    }

    if (stage === 'idle') {
      update.steep_start = null
      setActiveBatch(null)
      setForm(EMPTY_FORM)
    }

    const { error } = await supabase.from('batch_state').update(update).eq('id', 1)
    if (!error) { setBatch(prev => ({ ...prev, ...update })); flash_('✓ LIVE') }
    else flash_('✗ ERROR')
    setSaving(false)
  }

  // Save tasting notes to the active batch without changing stage
  async function saveTastingNotes() {
    if (!activeBatch) return
    setSaving(true)
    const { error } = await supabase.from('batches')
      .update({ tasting_notes: form.tasting_notes })
      .eq('id', activeBatch.id)
    flash_(error ? '✗ ERROR' : '✓ SAVED')
    setSaving(false)
  }

  function logout() { sessionStorage.removeItem('cbbc_admin'); window.location.href = '/' }

  if (!authed) return (
    <div style={{ position:'fixed', inset:0, background:INK, display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999 }}>
      <form onSubmit={login} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:24, padding:48, border:'1px solid rgba(201,168,76,.2)', maxWidth:360, width:'90%' }}>
        <div style={{ color:GOLD, fontSize:'var(--t-micro,.625rem)', letterSpacing:'.4em', opacity:.7, fontFamily:"'Cinzel',serif" }}>COLD BREW BOLD CREW</div>
        <div style={{ color:CREAM, fontSize:'1.6rem', letterSpacing:'.1em', fontFamily:"'Alfa Slab One',serif" }}>ADMIN</div>
        <input type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder="password" autoFocus
          style={{ ...FIELD, border:`2px solid ${pwErr ? '#c0392b' : 'rgba(201,168,76,.3)'}`, textAlign:'center' }} />
        {pwErr && <div style={{ color:'#c0392b', fontSize:'var(--t-micro,.625rem)', letterSpacing:'.15em', marginTop:-12, fontFamily:"'Cinzel',serif" }}>INCORRECT PASSWORD</div>}
        <button type="submit" style={{ width:'100%', padding:'14px', background:GOLD, border:'none', cursor:'pointer', fontFamily:"'Alfa Slab One',serif", fontSize:'1rem', letterSpacing:'.06em', color:INK }}>ENTER</button>
      </form>
    </div>
  )

  const current  = batch?.stage ?? 'idle'
  const batchNum = batch?.batch_number ?? 0
  const isBrewing = current === 'grinding' || current === 'steeping' || current === 'ready'

  return (
    <div style={{ position:'fixed', inset:0, background:INK, overflowY:'auto', zIndex:9999, fontFamily:"'Cinzel',serif", padding:'0 0 60px' }}>

      {/* ── header ── */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 24px', height:54, borderBottom:'1px solid rgba(201,168,76,.15)' }}>
        <span style={{ color:GOLD, fontSize:'var(--t-micro,.625rem)', letterSpacing:'.4em', opacity:.7 }}>CBBC ADMIN</span>
        <span style={{ color: flash.startsWith('✓') ? GOLD : flash.startsWith('✗') ? '#c0392b' : CREAM, fontSize:'var(--t-label,.6875rem)', letterSpacing:'.2em', opacity: flash ? 1 : .3, transition:'all .2s', fontFamily:"'Alfa Slab One',serif" }}>
          {flash || `BATCH #${batchNum}`}
        </span>
        <button onClick={logout} style={{ background:'none', border:'1px solid rgba(201,168,76,.2)', color:GOLD, cursor:'pointer', fontFamily:"'Cinzel',serif", fontSize:'var(--t-micro,.625rem)', letterSpacing:'.25em', padding:'6px 14px', opacity:.6 }}>EXIT</button>
      </div>

      {/* ── current status ── */}
      <div style={{ padding:'28px 24px 20px', textAlign:'center', borderBottom:'1px solid rgba(201,168,76,.1)' }}>
        <div style={{ color:GOLD, fontSize:'var(--t-micro,.625rem)', letterSpacing:'.3em', opacity:.5, marginBottom:8 }}>CURRENT STATUS</div>
        <div style={{ color: current==='idle' ? CREAM : GOLD, fontFamily:"'Alfa Slab One',serif", fontSize:'clamp(2rem,8vw,3.5rem)', letterSpacing:'.06em', opacity: current==='idle' ? .25 : 1 }}>
          {current.toUpperCase()}
        </div>
        {batch?.steep_start && current==='steeping' && (
          <div style={{ color:CREAM, fontSize:'var(--t-micro,.625rem)', letterSpacing:'.18em', opacity:.35, marginTop:8 }}>
            STARTED: {new Date(batch.steep_start).toLocaleString()}
          </div>
        )}
      </div>

      {/* ── batch metadata form ── */}
      <div style={{ padding:'28px 24px', borderBottom:'1px solid rgba(201,168,76,.1)', maxWidth:520, margin:'0 auto', width:'100%', boxSizing:'border-box' }}>
        <div style={{ color:GOLD, fontSize:'var(--t-micro,.625rem)', letterSpacing:'.3em', opacity:.4, marginBottom:20, textAlign:'center' }}>
          {isBrewing ? 'CURRENT BATCH' : 'NEW BATCH DETAILS'}
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
          <div style={{ gridColumn:'1 / -1' }}>
            <label style={labelStyle}>Batch Name</label>
            <input style={FIELD} placeholder="e.g. Dark Matter #03"
              value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              disabled={isBrewing && current !== 'ready'} />
          </div>
          <div>
            <label style={labelStyle}>Origin</label>
            <input style={FIELD} placeholder="e.g. Ethiopia Yirgacheffe"
              value={form.origin} onChange={e => setForm(f => ({ ...f, origin: e.target.value }))}
              disabled={isBrewing && current !== 'ready'} />
          </div>
          <div>
            <label style={labelStyle}>Roast</label>
            <select style={FIELD} value={form.roast} onChange={e => setForm(f => ({ ...f, roast: e.target.value }))}
              disabled={isBrewing && current !== 'ready'}>
              {['Light','Medium','Dark','Dark+'].map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Process</label>
            <select style={FIELD} value={form.process} onChange={e => setForm(f => ({ ...f, process: e.target.value }))}
              disabled={isBrewing && current !== 'ready'}>
              {['Washed','Natural','Honey','Other'].map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Grind Notes</label>
            <input style={FIELD} placeholder="e.g. Coarse, 30 clicks"
              value={form.grind_notes} onChange={e => setForm(f => ({ ...f, grind_notes: e.target.value }))}
              disabled={isBrewing && current !== 'ready'} />
          </div>
          <div style={{ gridColumn:'1 / -1' }}>
            <label style={labelStyle}>Tasting Notes <span style={{ opacity:.4 }}>(optional, fill after)</span></label>
            <input style={FIELD} placeholder="e.g. Chocolate, low acid, smooth finish"
              value={form.tasting_notes} onChange={e => setForm(f => ({ ...f, tasting_notes: e.target.value }))} />
          </div>
        </div>

        {/* Save tasting notes mid-brew */}
        {activeBatch && (
          <button onClick={saveTastingNotes} disabled={saving} style={{ marginTop:14, width:'100%', padding:'10px', background:'transparent', border:'1px solid rgba(201,168,76,.3)', color:GOLD, cursor:'pointer', fontFamily:"'Cinzel',serif", fontSize:'var(--t-micro,.625rem)', letterSpacing:'.25em', opacity: saving ? .4 : .8 }}>
            SAVE NOTES
          </button>
        )}
      </div>

      {/* ── stage buttons ── */}
      <div style={{ padding:'28px 24px', maxWidth:520, margin:'0 auto', width:'100%', boxSizing:'border-box' }}>
        <div style={{ color:GOLD, fontSize:'var(--t-micro,.625rem)', letterSpacing:'.3em', opacity:.4, marginBottom:20, textAlign:'center' }}>SET STAGE</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          {STAGES.map(s => (
            <button key={s.key} onClick={() => setStage(s.key)} disabled={saving || current === s.key}
              style={{ padding:'22px 12px', background: current===s.key ? s.color : 'transparent', border:`2px solid ${current===s.key ? s.color : 'rgba(201,168,76,.2)'}`, cursor: current===s.key ? 'default' : 'pointer', opacity: current===s.key ? 1 : saving ? .4 : .75, transition:'all .2s', display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
              <span style={{ fontFamily:"'Alfa Slab One',serif", fontSize:'1.1rem', letterSpacing:'.04em', color: current===s.key ? s.textColor : CREAM }}>{s.label}</span>
              <span style={{ fontFamily:"'Cinzel',serif", fontSize:'var(--t-micro,.625rem)', letterSpacing:'.18em', color:CREAM, opacity:.45 }}>{s.sub}</span>
            </button>
          ))}
        </div>
        <div style={{ textAlign:'center', marginTop:28, color:CREAM, fontSize:'var(--t-micro,.625rem)', letterSpacing:'.2em', opacity:.2, lineHeight:1.8 }}>
          GRINDING → creates batch record + increments number<br/>
          STEEPING → records steep start for live countdown<br/>
          READY → closes batch record with end time
        </div>
      </div>
    </div>
  )
}

const labelStyle = {
  display: 'block',
  color: CREAM,
  fontSize: '0.55rem',
  letterSpacing: '.22em',
  opacity: .35,
  textTransform: 'uppercase',
  marginBottom: 5,
  fontFamily: "'Cinzel',serif",
}
