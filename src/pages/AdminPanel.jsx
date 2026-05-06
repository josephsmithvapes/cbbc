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
  outline: 'none', boxSizing: 'border-box',
}

const LABEL_STYLE = {
  display: 'block', color: CREAM,
  fontSize: '0.55rem', letterSpacing: '.22em',
  opacity: .35, textTransform: 'uppercase',
  marginBottom: 5, fontFamily: "'Cinzel',serif",
}

const EMPTY_FORM = {
  name: '', origin: '', roast: 'Light',
  process: 'Washed', grind_notes: '', tasting_notes: '',
  steep_start: '', steep_end: '',
}

function toLocal(iso) {
  if (!iso) return ''
  // datetime-local needs "YYYY-MM-DDTHH:MM"
  return new Date(iso).toISOString().slice(0, 16)
}
function toISO(local) {
  if (!local) return null
  return new Date(local).toISOString()
}
function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
function fmtDur(startIso, endIso) {
  if (!startIso || !endIso) return null
  const s = (new Date(endIso) - new Date(startIso)) / 1000
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60)
  return `${h}h ${String(m).padStart(2,'0')}m`
}

// ── Reusable metadata form grid ──────────────────────────────────────────────
function MetaFields({ form, set, disabled = false, showDateFields = false }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
      <div style={{ gridColumn: '1 / -1' }}>
        <label style={LABEL_STYLE}>Batch Name</label>
        <input style={FIELD} placeholder="e.g. Dark Matter #03"
          value={form.name} disabled={disabled}
          onChange={e => set(f => ({ ...f, name: e.target.value }))} />
      </div>
      <div>
        <label style={LABEL_STYLE}>Origin</label>
        <input style={FIELD} placeholder="e.g. Ethiopia Yirgacheffe"
          value={form.origin} disabled={disabled}
          onChange={e => set(f => ({ ...f, origin: e.target.value }))} />
      </div>
      <div>
        <label style={LABEL_STYLE}>Roast</label>
        <select style={FIELD} value={form.roast} disabled={disabled}
          onChange={e => set(f => ({ ...f, roast: e.target.value }))}>
          {['Light','Medium','Dark','Dark+'].map(r => <option key={r}>{r}</option>)}
        </select>
      </div>
      <div>
        <label style={LABEL_STYLE}>Process</label>
        <select style={FIELD} value={form.process} disabled={disabled}
          onChange={e => set(f => ({ ...f, process: e.target.value }))}>
          {['Washed','Natural','Honey','Other'].map(p => <option key={p}>{p}</option>)}
        </select>
      </div>
      <div>
        <label style={LABEL_STYLE}>Grind Notes</label>
        <input style={FIELD} placeholder="e.g. Coarse, 30 clicks"
          value={form.grind_notes} disabled={disabled}
          onChange={e => set(f => ({ ...f, grind_notes: e.target.value }))} />
      </div>
      <div style={{ gridColumn: '1 / -1' }}>
        <label style={LABEL_STYLE}>Tasting Notes</label>
        <input style={FIELD} placeholder="e.g. Chocolate, low acid, smooth finish"
          value={form.tasting_notes}
          onChange={e => set(f => ({ ...f, tasting_notes: e.target.value }))} />
      </div>
      {showDateFields && <>
        <div>
          <label style={LABEL_STYLE}>Steep Start</label>
          <input type="datetime-local" style={FIELD} value={form.steep_start}
            onChange={e => set(f => ({ ...f, steep_start: e.target.value }))} />
        </div>
        <div>
          <label style={LABEL_STYLE}>Steep End</label>
          <input type="datetime-local" style={FIELD} value={form.steep_end}
            onChange={e => set(f => ({ ...f, steep_end: e.target.value }))} />
        </div>
      </>}
    </div>
  )
}

// ── Past batch row ────────────────────────────────────────────────────────────
function PastBatchRow({ b, onEdit }) {
  const dur = fmtDur(b.steep_start, b.steep_end)
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid rgba(201,168,76,.08)' }}>
      <div>
        <div style={{ color: CREAM, fontFamily: "'Alfa Slab One',serif", fontSize: '.9rem', letterSpacing: '.03em', opacity: b.name ? 1 : .3 }}>
          {b.name || 'Unnamed'}
        </div>
        <div style={{ color: CREAM, fontFamily: "'Cinzel',serif", fontSize: '0.55rem', letterSpacing: '.2em', opacity: .3, marginTop: 3 }}>
          {fmtDate(b.steep_start)}{b.origin ? ` · ${b.origin}` : ''}{b.roast ? ` · ${b.roast}` : ''}{dur ? ` · ${dur}` : ''}
        </div>
      </div>
      <button onClick={onEdit} style={{ background: 'none', border: '1px solid rgba(201,168,76,.2)', color: GOLD, cursor: 'pointer', fontFamily: "'Cinzel',serif", fontSize: '0.55rem', letterSpacing: '.22em', padding: '6px 12px', flexShrink: 0 }}>
        EDIT
      </button>
    </div>
  )
}

export default function AdminPanel() {
  const [authed, setAuthed]       = useState(() => sessionStorage.getItem('cbbc_admin') === '1')
  const [pw, setPw]               = useState('')
  const [pwErr, setPwErr]         = useState(false)
  const [batch, setBatch]         = useState(null)
  const [saving, setSaving]       = useState(false)
  const [flash, setFlash]         = useState('')
  const [form, setForm]           = useState(EMPTY_FORM)
  const [activeBatch, setActiveBatch] = useState(null)
  const [pastBatches, setPastBatches] = useState([])
  const [expandedId, setExpandedId]   = useState(null)
  const [editForm, setEditForm]       = useState(EMPTY_FORM)
  const [isAdding, setIsAdding]       = useState(false)
  const [addForm, setAddForm]         = useState(EMPTY_FORM)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [batchTarget, setBatchTarget]     = useState(25)
  const [savingTarget, setSavingTarget]   = useState(false)

  useEffect(() => {
    if (!authed) return
    supabase.from('batch_state').select('*').eq('id', 1).single()
      .then(({ data }) => { if (data) { setBatch(data); if (data.batch_target) setBatchTarget(data.batch_target) } })
    const ch = supabase.channel('admin-batch')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'batch_state' },
        ({ new: row }) => setBatch(row))
      .subscribe()
    return () => supabase.removeChannel(ch)
  }, [authed])

  useEffect(() => {
    if (!authed) return
    // Load active batch (no steep_end)
    supabase.from('batches').select('*').is('steep_end', null)
      .order('steep_start', { ascending: false }).limit(1).single()
      .then(({ data }) => {
        if (data) {
          setActiveBatch(data)
          setForm({ name: data.name ?? '', origin: data.origin ?? '', roast: data.roast ?? 'Light', process: data.process ?? 'Washed', grind_notes: data.grind_notes ?? '', tasting_notes: data.tasting_notes ?? '', steep_start: '', steep_end: '' })
        }
      })
    // Load all past batches
    loadPastBatches()
  }, [authed])

  function loadPastBatches() {
    supabase.from('batches').select('*').order('steep_start', { ascending: false })
      .then(({ data }) => { if (data) setPastBatches(data) })
  }

  function flash_(msg) { setFlash(msg); setTimeout(() => setFlash(''), 2200) }

  async function saveBatchTarget() {
    const n = parseInt(batchTarget)
    if (!n || n < 1) return
    setSavingTarget(true)
    const { error } = await supabase.from('batch_state').update({ batch_target: n }).eq('id', 1)
    flash_(error ? '✗ ERROR' : '✓ SAVED')
    setSavingTarget(false)
  }

  function login(e) {
    e.preventDefault()
    if (pw === PASS) { sessionStorage.setItem('cbbc_admin', '1'); setAuthed(true) }
    else { setPwErr(true); setPw(''); setTimeout(() => setPwErr(false), 1600) }
  }

  async function setStage(stage) {
    setSaving(true)
    const now = new Date().toISOString()
    const update = { stage, updated_at: now }

    if (stage === 'grinding') {
      update.batch_number = (batch?.batch_number ?? 0) + 1
      update.steep_start  = null
      const { data: nb } = await supabase.from('batches').insert({
        batch_number: update.batch_number,
        name: form.name || null, origin: form.origin || null,
        roast: form.roast || null, process: form.process || null,
        grind_notes: form.grind_notes || null, tasting_notes: form.tasting_notes || null,
        steep_start: now,
      }).select().single()
      if (nb) { setActiveBatch(nb); loadPastBatches() }
    }
    if (stage === 'steeping') update.steep_start = now
    if (stage === 'ready' && activeBatch) {
      await supabase.from('batches').update({ steep_end: now }).eq('id', activeBatch.id)
      loadPastBatches()
    }
    if (stage === 'idle') { update.steep_start = null; setActiveBatch(null); setForm(EMPTY_FORM) }

    const { error } = await supabase.from('batch_state').update(update).eq('id', 1)
    if (!error) {
      setBatch(prev => ({ ...prev, ...update }))
      // Keep brew_state in sync so BrewMonitor reflects admin stage without ESP32
      const statusMap = { grinding: 'BREWING', steeping: 'BREWING', ready: 'READY', idle: 'IDLE' }
      await supabase.from('brew_state').update({ status: statusMap[stage] }).eq('id', 1)
      flash_('✓ LIVE')
    } else flash_('✗ ERROR')
    setSaving(false)
  }

  async function saveTastingNotes() {
    if (!activeBatch) return
    setSaving(true)
    const { error } = await supabase.from('batches').update({ tasting_notes: form.tasting_notes }).eq('id', activeBatch.id)
    flash_(error ? '✗ ERROR' : '✓ SAVED')
    if (!error) loadPastBatches()
    setSaving(false)
  }

  function startEdit(b) {
    setExpandedId(b.id)
    setIsAdding(false)
    setEditForm({
      name: b.name ?? '', origin: b.origin ?? '', roast: b.roast ?? 'Light',
      process: b.process ?? 'Washed', grind_notes: b.grind_notes ?? '',
      tasting_notes: b.tasting_notes ?? '',
      steep_start: toLocal(b.steep_start), steep_end: toLocal(b.steep_end),
    })
  }

  async function saveEdit() {
    setSaving(true)
    const { error } = await supabase.from('batches').update({
      name: editForm.name || null, origin: editForm.origin || null,
      roast: editForm.roast || null, process: editForm.process || null,
      grind_notes: editForm.grind_notes || null, tasting_notes: editForm.tasting_notes || null,
      steep_start: toISO(editForm.steep_start), steep_end: toISO(editForm.steep_end),
    }).eq('id', expandedId)
    if (!error) { flash_('✓ SAVED'); setExpandedId(null); loadPastBatches() }
    else flash_('✗ ERROR')
    setSaving(false)
  }

  async function addBatch() {
    if (!addForm.steep_start) { flash_('✗ NEED START DATE'); return }
    setSaving(true)
    const { error } = await supabase.from('batches').insert({
      name: addForm.name || null, origin: addForm.origin || null,
      roast: addForm.roast || null, process: addForm.process || null,
      grind_notes: addForm.grind_notes || null, tasting_notes: addForm.tasting_notes || null,
      steep_start: toISO(addForm.steep_start), steep_end: toISO(addForm.steep_end) || null,
    })
    if (!error) { flash_('✓ ADDED'); setIsAdding(false); setAddForm(EMPTY_FORM); loadPastBatches() }
    else flash_('✗ ERROR')
    setSaving(false)
  }

  async function deleteBatch(id) {
    setSaving(true)
    const { error } = await supabase.from('batches').delete().eq('id', id)
    if (!error) { setExpandedId(null); setConfirmDelete(null); loadPastBatches(); flash_('✓ DELETED') }
    else flash_('✗ ERROR')
    setSaving(false)
  }

  function logout() { sessionStorage.removeItem('cbbc_admin'); window.location.href = '/' }

  // ── Login screen ────────────────────────────────────────────────────────────
  if (!authed) return (
    <div style={{ position:'fixed', inset:0, background:INK, display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999 }}>
      <form onSubmit={login} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:24, padding:48, border:'1px solid rgba(201,168,76,.2)', maxWidth:360, width:'90%' }}>
        <div style={{ color:GOLD, fontSize:'var(--t-micro,.625rem)', letterSpacing:'.4em', opacity:.7, fontFamily:"'Cinzel',serif" }}>BOLD CREW COLD BREW</div>
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
    <div style={{ position:'fixed', inset:0, background:INK, overflowY:'auto', zIndex:9999, fontFamily:"'Cinzel',serif", padding:'0 0 80px' }}>

      {/* ── header ── */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 24px', height:54, borderBottom:'1px solid rgba(201,168,76,.15)', position:'sticky', top:0, background:INK, zIndex:10 }}>
        <span style={{ color:GOLD, fontSize:'var(--t-micro,.625rem)', letterSpacing:'.4em', opacity:.7 }}>BCCB ADMIN</span>
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

      {/* ── batch target ── */}
      <div style={{ padding:'20px 24px', borderBottom:'1px solid rgba(201,168,76,.1)', maxWidth:520, margin:'0 auto', width:'100%', boxSizing:'border-box' }}>
        <div style={{ color:GOLD, fontSize:'var(--t-micro,.625rem)', letterSpacing:'.3em', opacity:.4, marginBottom:14, textAlign:'center' }}>KEG TARGET</div>
        <div style={{ display:'flex', gap:10, alignItems:'center' }}>
          <input type="number" min="1" max="999" value={batchTarget}
            onChange={e => setBatchTarget(e.target.value)}
            style={{ ...FIELD, width:90, textAlign:'center', fontFamily:"'Alfa Slab One',serif", fontSize:'1.2rem' }} />
          <span style={{ color:CREAM, fontSize:'var(--t-micro,.625rem)', letterSpacing:'.2em', opacity:.3, fontFamily:"'Cinzel',serif" }}>PRE-ORDERS TO TRIGGER BREW</span>
          <button onClick={saveBatchTarget} disabled={savingTarget}
            style={{ marginLeft:'auto', padding:'10px 18px', background:GOLD, border:'none', cursor:'pointer', fontFamily:"'Cinzel',serif", fontSize:'var(--t-micro,.625rem)', letterSpacing:'.22em', color:INK, opacity: savingTarget ? .5 : 1, flexShrink:0 }}>
            SET
          </button>
        </div>
      </div>

      {/* ── new batch metadata form ── */}
      <div style={{ padding:'28px 24px', borderBottom:'1px solid rgba(201,168,76,.1)', maxWidth:520, margin:'0 auto', width:'100%', boxSizing:'border-box' }}>
        <div style={{ color:GOLD, fontSize:'var(--t-micro,.625rem)', letterSpacing:'.3em', opacity:.4, marginBottom:20, textAlign:'center' }}>
          {isBrewing ? 'CURRENT BATCH' : 'NEW BATCH DETAILS'}
        </div>
        <MetaFields form={form} set={setForm} disabled={isBrewing && current !== 'ready'} />
        {activeBatch && (
          <button onClick={saveTastingNotes} disabled={saving} style={{ marginTop:14, width:'100%', padding:'10px', background:'transparent', border:'1px solid rgba(201,168,76,.3)', color:GOLD, cursor:'pointer', fontFamily:"'Cinzel',serif", fontSize:'var(--t-micro,.625rem)', letterSpacing:'.25em', opacity: saving ? .4 : .8 }}>
            SAVE NOTES
          </button>
        )}
      </div>

      {/* ── stage buttons ── */}
      <div style={{ padding:'28px 24px', borderBottom:'1px solid rgba(201,168,76,.1)', maxWidth:520, margin:'0 auto', width:'100%', boxSizing:'border-box' }}>
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
        <div style={{ textAlign:'center', marginTop:24, color:CREAM, fontSize:'var(--t-micro,.625rem)', letterSpacing:'.2em', opacity:.2, lineHeight:1.8 }}>
          GRINDING → creates batch record · READY → closes it
        </div>
      </div>

      {/* ── past batches ── */}
      <div style={{ padding:'28px 24px', maxWidth:520, margin:'0 auto', width:'100%', boxSizing:'border-box' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
          <div style={{ color:GOLD, fontSize:'var(--t-micro,.625rem)', letterSpacing:'.3em', opacity:.4 }}>PAST BATCHES</div>
          <button onClick={() => { setIsAdding(a => !a); setExpandedId(null); setAddForm(EMPTY_FORM) }}
            style={{ background:'none', border:'1px solid rgba(201,168,76,.25)', color:GOLD, cursor:'pointer', fontFamily:"'Cinzel',serif", fontSize:'0.55rem', letterSpacing:'.22em', padding:'6px 12px' }}>
            {isAdding ? 'CANCEL' : '+ ADD'}
          </button>
        </div>

        {/* Add form */}
        {isAdding && (
          <div style={{ padding:'20px', border:'1px solid rgba(201,168,76,.2)', marginBottom:16, background:'rgba(201,168,76,.03)' }}>
            <MetaFields form={addForm} set={setAddForm} showDateFields />
            <div style={{ display:'flex', gap:10, marginTop:14 }}>
              <button onClick={addBatch} disabled={saving}
                style={{ flex:1, padding:'10px', background:GOLD, border:'none', cursor:'pointer', fontFamily:"'Alfa Slab One',serif", fontSize:'.85rem', color:INK, opacity: saving ? .5 : 1 }}>
                SAVE BATCH
              </button>
              <button onClick={() => setIsAdding(false)}
                style={{ padding:'10px 16px', background:'none', border:'1px solid rgba(201,168,76,.2)', color:CREAM, cursor:'pointer', fontFamily:"'Cinzel',serif", fontSize:'0.55rem', letterSpacing:'.2em', opacity:.5 }}>
                CANCEL
              </button>
            </div>
          </div>
        )}

        {/* Batch list */}
        {pastBatches.length === 0 && (
          <div style={{ color:CREAM, fontSize:'var(--t-micro,.625rem)', letterSpacing:'.2em', opacity:.2, textAlign:'center', padding:'24px 0' }}>No batches recorded yet</div>
        )}

        {pastBatches.map(b => (
          <div key={b.id}>
            {expandedId === b.id ? (
              <div style={{ padding:'16px', border:'1px solid rgba(201,168,76,.25)', marginBottom:2, background:'rgba(201,168,76,.03)' }}>
                <MetaFields form={editForm} set={setEditForm} showDateFields />
                <div style={{ display:'flex', gap:10, marginTop:14 }}>
                  <button onClick={saveEdit} disabled={saving}
                    style={{ flex:1, padding:'10px', background:GOLD, border:'none', cursor:'pointer', fontFamily:"'Alfa Slab One',serif", fontSize:'.85rem', color:INK, opacity: saving ? .5 : 1 }}>
                    SAVE
                  </button>
                  <button onClick={() => setExpandedId(null)}
                    style={{ padding:'10px 16px', background:'none', border:'1px solid rgba(201,168,76,.2)', color:CREAM, cursor:'pointer', fontFamily:"'Cinzel',serif", fontSize:'0.55rem', letterSpacing:'.2em', opacity:.5 }}>
                    CANCEL
                  </button>
                  {confirmDelete === b.id ? (
                    <button onClick={() => deleteBatch(b.id)} disabled={saving}
                      style={{ padding:'10px 14px', background:'#c0392b', border:'none', cursor:'pointer', fontFamily:"'Cinzel',serif", fontSize:'0.55rem', letterSpacing:'.15em', color:CREAM }}>
                      CONFIRM DELETE
                    </button>
                  ) : (
                    <button onClick={() => setConfirmDelete(b.id)}
                      style={{ padding:'10px 14px', background:'none', border:'1px solid rgba(192,57,43,.4)', color:'#c0392b', cursor:'pointer', fontFamily:"'Cinzel',serif", fontSize:'0.55rem', letterSpacing:'.15em' }}>
                      DELETE
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <PastBatchRow b={b} onEdit={() => startEdit(b)} />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
