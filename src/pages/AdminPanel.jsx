import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth, useBrewState } from '../lib/hooks'
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
  const { session, loading } = useAuth()
  const brewState = useBrewState()
  const userId = session?.user?.id ?? null
  const [email, setEmail]   = useState('')
  const [pw, setPw]         = useState('')
  const [pwErr, setPwErr]   = useState(false)
  const [authLoading, setAuthLoading] = useState(false)
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
  const [grindPopup, setGrindPopup]       = useState(false)
  const [, setTick]                       = useState(0)
  const [postBatchPopup, setPostBatchPopup] = useState(false)
  const [postBatchForm, setPostBatchForm] = useState({ startWeight: '', yieldWeight: '', tastingNotes: '' })
  const [publishScreen, setPublishScreen] = useState(false)
  const [readingCount, setReadingCount]   = useState(null)
  const [publishing, setPublishing]       = useState(false)

  const current  = batch?.stage ?? 'idle'
  const isBrewing = current === 'grinding' || current === 'steeping' || current === 'ready'

  useEffect(() => {
    if (!session) return
    let cancelled = false
    async function poll() {
      const { data } = await supabase.from('batch_state').select('*').eq('id', 1).single()
      if (!cancelled && data) { setBatch(data); if (data.batch_target) setBatchTarget(data.batch_target) }
    }
    poll()
    const id = setInterval(poll, 5000)
    return () => { cancelled = true; clearInterval(id) }
  }, [userId])

  useEffect(() => {
    if (!session) return
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
  }, [userId])

  useEffect(() => {
    if (batch?.stage !== 'grinding') { setGrindPopup(false); return }
    const grindStart = batch?.updated_at ? new Date(batch.updated_at).getTime() : Date.now()
    const GRIND_DURATION = 15 * 60 * 1000
    let notified = false
    const id = setInterval(() => {
      const remaining = GRIND_DURATION - (Date.now() - grindStart)
      if (remaining <= 0 && !notified) {
        notified = true
        setGrindPopup(true)
      }
    }, 1000)
    return () => clearInterval(id)
  }, [batch?.stage, batch?.updated_at])

  useEffect(() => {
    if (batch?.stage !== 'grinding' && batch?.stage !== 'steeping') return
    const id = setInterval(() => setTick(t => t + 1), 1000)
    return () => clearInterval(id)
  }, [batch?.stage])

  useEffect(() => {
    if (current === 'ready') {
      setPostBatchForm(f => ({ ...f, tastingNotes: activeBatch?.tasting_notes ?? '' }))
      setPostBatchPopup(true)
    } else {
      setPostBatchPopup(false)
      setPublishScreen(false)
      setReadingCount(null)
    }
  }, [current])

  function steepElapsedDisplay() {
    if (!batch?.steep_start) return '0h 00m'
    const s = Math.floor((Date.now() - new Date(batch.steep_start).getTime()) / 1000)
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    return `${h}h ${String(m).padStart(2, '0')}m`
  }

  function grindRemainingSeconds() {
    if (!batch?.updated_at) return 15 * 60
    const grindStart = new Date(batch.updated_at).getTime()
    return Math.max(0, Math.floor((15 * 60 * 1000 - (Date.now() - grindStart)) / 1000))
  }

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

  async function login(e) {
    e.preventDefault()
    setAuthLoading(true)
    setPwErr(false)
    const { error } = await supabase.auth.signInWithPassword({ email, password: pw })
    if (error) { setPwErr(true); setPw(''); setTimeout(() => setPwErr(false), 1600) }
    setAuthLoading(false)
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
        steep_start: null,
      }).select().single()
      if (nb) { setActiveBatch(nb); loadPastBatches() }
    }
    if (stage === 'steeping') {
      update.steep_start = now
      if (activeBatch) {
        await supabase.from('batches').update({ steep_start: now }).eq('id', activeBatch.id)
      }
    }
    if (stage === 'ready' && activeBatch) {
      await supabase.from('batches').update({ steep_end: now }).eq('id', activeBatch.id)
      setActiveBatch(prev => ({ ...prev, steep_end: now }))
      loadPastBatches()
    }
    if (stage === 'idle') { update.steep_start = null; setActiveBatch(null); setForm(EMPTY_FORM) }

    const { error } = await supabase.from('batch_state').update(update).eq('id', 1)
    if (!error) {
      setBatch(prev => ({ ...prev, ...update }))
      // Keep brew_state in sync so BrewTelemetry reflects admin stage without ESP32
      const statusMap = { grinding: 'BREWING', steeping: 'BREWING', ready: 'READY', idle: 'IDLE' }
      const mappedStatus = statusMap[stage]
      if (mappedStatus) await supabase.from('brew_state').update({ status: mappedStatus }).eq('id', 1)
      flash_('✓ LIVE')
    } else flash_('✗ ERROR')
    setSaving(false)
  }

  async function resetGrindTimer() {
    const now = new Date().toISOString()
    await supabase.from('batch_state').update({ updated_at: now }).eq('id', 1)
    setBatch(prev => ({ ...prev, updated_at: now }))
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

  async function reviewAndPublish() {
    if (!activeBatch?.steep_start || !activeBatch?.steep_end) return
    setSaving(true)
    const { count } = await supabase.from('temperature_readings')
      .select('*', { count: 'exact' })
      .gte('recorded_at', activeBatch.steep_start)
      .lte('recorded_at', activeBatch.steep_end)
      .is('batch_id', null)
    setReadingCount(count ?? 0)
    setPublishScreen(true)
    setPostBatchPopup(false)
    setSaving(false)
  }

  async function publishBatch() {
    if (!activeBatch) return
    setPublishing(true)
    const now = new Date().toISOString()

    // 1. Claim temperature readings into this batch
    await supabase.from('temperature_readings')
      .update({ batch_id: activeBatch.id })
      .gte('recorded_at', activeBatch.steep_start)
      .lte('recorded_at', activeBatch.steep_end)
      .is('batch_id', null)

    // 2. Publish batch with post-batch details
    await supabase.from('batches').update({
      published: true,
      yield_g: postBatchForm.yieldWeight ? parseInt(postBatchForm.yieldWeight, 10) : null,
      start_weight_g: postBatchForm.startWeight ? parseInt(postBatchForm.startWeight, 10) : null,
      tasting_notes: postBatchForm.tastingNotes || null,
    }).eq('id', activeBatch.id)

    // 3. Set batch_state to idle
    await supabase.from('batch_state').update({ stage: 'idle', steep_start: null, updated_at: now }).eq('id', 1)
    await supabase.from('brew_state').update({ status: 'IDLE' }).eq('id', 1)

    // 4. Reset local state
    setBatch(prev => ({ ...prev, stage: 'idle', steep_start: null, updated_at: now }))
    setActiveBatch(null)
    setForm(EMPTY_FORM)
    setPublishScreen(false)
    setPublishing(false)
    setReadingCount(null)
    loadPastBatches()
    flash_('✓ PUBLISHED')
  }

  async function logout() {
    await supabase.auth.signOut()
  }

  // ── Login screen ────────────────────────────────────────────────────────────
  if (loading) return null

  if (!session) return (
    <div style={{ position:'fixed', inset:0, background:INK, display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999 }}>
      <form onSubmit={login} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:24, padding:48, border:'1px solid rgba(201,168,76,.2)', maxWidth:360, width:'90%' }}>
        <div style={{ color:GOLD, fontSize:'var(--t-micro,.625rem)', letterSpacing:'.4em', opacity:.7, fontFamily:"'Cinzel',serif" }}>BOLD CREW COLD BREW</div>
        <div style={{ color:CREAM, fontSize:'1.6rem', letterSpacing:'.1em', fontFamily:"'Alfa Slab One',serif" }}>ADMIN</div>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email" autoFocus
          style={{ ...FIELD, textAlign:'center' }} />
        <input type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder="password"
          style={{ ...FIELD, border:`2px solid ${pwErr ? '#c0392b' : 'rgba(201,168,76,.3)'}`, textAlign:'center' }} />
        {pwErr && <div style={{ color:'#c0392b', fontSize:'var(--t-micro,.625rem)', letterSpacing:'.15em', marginTop:-12, fontFamily:"'Cinzel',serif" }}>INCORRECT CREDENTIALS</div>}
        <button type="submit" disabled={authLoading}
          style={{ width:'100%', padding:'14px', background:GOLD, border:'none', cursor:'pointer', fontFamily:"'Alfa Slab One',serif", fontSize:'1rem', letterSpacing:'.06em', color:INK, opacity: authLoading ? .5 : 1 }}>
          {authLoading ? '...' : 'ENTER'}
        </button>
      </form>
    </div>
  )

  const batchNum = batch?.batch_number ?? 0

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

      {/* ── batch metadata (only visible during active brew) ── */}
      {isBrewing && (
        <div style={{ padding:'28px 24px', borderBottom:'1px solid rgba(201,168,76,.1)', maxWidth:520, margin:'0 auto', width:'100%', boxSizing:'border-box' }}>
          <div style={{ color:GOLD, fontSize:'var(--t-micro,.625rem)', letterSpacing:'.3em', opacity:.4, marginBottom:20, textAlign:'center' }}>CURRENT BATCH</div>
          <MetaFields form={form} set={setForm} disabled={current !== 'ready'} />
          {activeBatch && (
            <button onClick={saveTastingNotes} disabled={saving} style={{ marginTop:14, width:'100%', padding:'10px', background:'transparent', border:'1px solid rgba(201,168,76,.3)', color:GOLD, cursor:'pointer', fontFamily:"'Cinzel',serif", fontSize:'var(--t-micro,.625rem)', letterSpacing:'.25em', opacity: saving ? .4 : .8 }}>
              SAVE NOTES
            </button>
          )}
        </div>
      )}

      {/* ── Wizard: idle → Screen 1 (pre-brew) ── */}
      {current === 'idle' && !isBrewing && (
        <div style={{ padding:'28px 24px', borderBottom:'1px solid rgba(201,168,76,.1)', maxWidth:520, margin:'0 auto', width:'100%', boxSizing:'border-box' }}>
          <div style={{ color:GOLD, fontSize:'var(--t-micro,.625rem)', letterSpacing:'.3em', opacity:.4, marginBottom:20, textAlign:'center' }}>NEW BATCH</div>
          <MetaFields form={form} set={setForm} />
          <button
            onClick={() => setStage('grinding')}
            disabled={saving || !form.name.trim()}
            style={{ marginTop:20, width:'100%', padding:'18px', background: form.name.trim() ? GOLD : 'transparent', border:`2px solid ${form.name.trim() ? GOLD : 'rgba(201,168,76,.2)'}`, cursor: form.name.trim() ? 'pointer' : 'not-allowed', fontFamily:"'Alfa Slab One',serif", fontSize:'1.1rem', letterSpacing:'.06em', color: form.name.trim() ? INK : GOLD, opacity: saving ? .5 : 1, transition:'all .2s' }}
          >
            START GRINDING
          </button>
        </div>
      )}

      {/* ── Wizard: grinding → Screen 2 (countdown) ── */}
      {current === 'grinding' && (
        <div style={{ padding:'28px 24px', borderBottom:'1px solid rgba(201,168,76,.1)', maxWidth:520, margin:'0 auto', width:'100%', boxSizing:'border-box', textAlign:'center' }}>
          <div style={{ color:GOLD, fontSize:'var(--t-micro,.625rem)', letterSpacing:'.3em', opacity:.4, marginBottom:20 }}>GRINDING</div>
          {activeBatch?.name && (
            <div style={{ color:CREAM, fontFamily:"'Alfa Slab One',serif", fontSize:'1.1rem', letterSpacing:'.04em', marginBottom:8, opacity:.7 }}>{activeBatch.name}</div>
          )}
          <div style={{ fontFamily:"'Alfa Slab One',serif", fontSize:'clamp(3rem,15vw,5rem)', color:GOLD, letterSpacing:'.04em', lineHeight:1, marginBottom:8 }}>
            {(() => {
              const s = grindRemainingSeconds()
              const m = Math.floor(s / 60)
              const sec = s % 60
              return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`
            })()}
          </div>
          <div style={{ color:CREAM, fontSize:'var(--t-micro,.625rem)', letterSpacing:'.2em', opacity:.3, marginBottom:28 }}>GRINDING TIMER</div>
          <button
            onClick={() => setGrindPopup(true)}
            style={{ padding:'12px 28px', background:'transparent', border:'1px solid rgba(201,168,76,.3)', cursor:'pointer', fontFamily:"'Cinzel',serif", fontSize:'var(--t-micro,.625rem)', letterSpacing:'.25em', color:GOLD, opacity:.6 }}
          >
            DONE GRINDING
          </button>
        </div>
      )}

      {/* ── Grinding popup ── */}
      {grindPopup && (
        <div style={{ position:'fixed', inset:0, background:'rgba(13,11,8,.92)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:10000, padding:24 }}>
          <div style={{ maxWidth:380, width:'100%', border:'1px solid rgba(201,168,76,.35)', background:INK, padding:40, textAlign:'center' }}>
            <div style={{ color:GOLD, fontFamily:"'Alfa Slab One',serif", fontSize:'1.4rem', letterSpacing:'.04em', marginBottom:12 }}>Grind looks good?</div>
            <div style={{ color:CREAM, fontFamily:"'Cinzel',serif", fontSize:'var(--t-small,.8125rem)', letterSpacing:'.08em', opacity:.55, marginBottom:32 }}>Ready to start steeping.</div>
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              <button
                onClick={() => { setGrindPopup(false); setStage('steeping') }}
                disabled={saving}
                style={{ padding:'16px', background:GOLD, border:'none', cursor:'pointer', fontFamily:"'Alfa Slab One',serif", fontSize:'1rem', color:INK, letterSpacing:'.04em', opacity: saving ? .5 : 1 }}
              >
                BEGIN STEEP
              </button>
              <button
                onClick={() => { setGrindPopup(false); resetGrindTimer() }}
                style={{ padding:'14px', background:'transparent', border:'1px solid rgba(201,168,76,.2)', cursor:'pointer', fontFamily:"'Cinzel',serif", fontSize:'var(--t-micro,.625rem)', letterSpacing:'.2em', color:CREAM, opacity:.5 }}
              >
                NOT YET — KEEP GRINDING
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Wizard: steeping → Screen 3 ── */}
      {current === 'steeping' && (
        <div style={{ padding:'28px 24px', borderBottom:'1px solid rgba(201,168,76,.1)', maxWidth:520, margin:'0 auto', width:'100%', boxSizing:'border-box' }}>
          <div style={{ color:GOLD, fontSize:'var(--t-micro,.625rem)', letterSpacing:'.3em', opacity:.4, marginBottom:20, textAlign:'center' }}>STEEPING</div>

          {/* Elapsed time — counting up */}
          <div style={{ textAlign:'center', marginBottom:24 }}>
            <div style={{ fontFamily:"'Alfa Slab One',serif", fontSize:'clamp(2.5rem,12vw,4rem)', color:GOLD, letterSpacing:'.04em', lineHeight:1 }}>
              {steepElapsedDisplay()}
            </div>
            <div style={{ color:CREAM, fontSize:'var(--t-micro,.625rem)', letterSpacing:'.2em', opacity:.3, marginTop:6 }}>ELAPSED</div>
          </div>

          {/* Live temperature */}
          {brewState?.current_temp_f != null && (
            <div style={{ textAlign:'center', marginBottom:24 }}>
              <div style={{ fontFamily:"'Alfa Slab One',serif", fontSize:'1.8rem', color:CREAM, letterSpacing:'.04em', opacity:.8 }}>
                {brewState.current_temp_f.toFixed(1)}°F
              </div>
              <div style={{ color:CREAM, fontSize:'var(--t-micro,.625rem)', letterSpacing:'.2em', opacity:.3, marginTop:4 }}>CURRENT TEMP</div>
            </div>
          )}

          {/* Batch metadata summary */}
          {activeBatch && (
            <div style={{ textAlign:'center', marginBottom:28, color:CREAM, fontSize:'var(--t-micro,.625rem)', letterSpacing:'.18em', opacity:.35 }}>
              {[activeBatch.name, activeBatch.origin, activeBatch.roast].filter(Boolean).join(' · ')}
            </div>
          )}

          {/* MARK AS READY */}
          <button
            onClick={() => setStage('ready')}
            disabled={saving}
            style={{ width:'100%', padding:'18px', background:GOLD, border:'none', cursor:'pointer', fontFamily:"'Alfa Slab One',serif", fontSize:'1.1rem', letterSpacing:'.06em', color:INK, opacity: saving ? .5 : 1, transition:'opacity .2s' }}
          >
            MARK AS READY
          </button>
        </div>
      )}

      {/* ── Wizard: ready → batch complete ── */}
      {current === 'ready' && (
        <div style={{ padding:'28px 24px', borderBottom:'1px solid rgba(201,168,76,.1)', maxWidth:520, margin:'0 auto', width:'100%', boxSizing:'border-box', textAlign:'center' }}>
          <div style={{ color:GOLD, fontSize:'var(--t-micro,.625rem)', letterSpacing:'.3em', opacity:.4, marginBottom:16 }}>BATCH COMPLETE</div>
          {activeBatch?.name && (
            <div style={{ color:CREAM, fontFamily:"'Alfa Slab One',serif", fontSize:'1.1rem', letterSpacing:'.04em', marginBottom:20, opacity:.8 }}>{activeBatch.name}</div>
          )}
          {!publishScreen && (
            <button
              onClick={() => setPostBatchPopup(true)}
              style={{ padding:'12px 28px', background:'transparent', border:'1px solid rgba(201,168,76,.3)', cursor:'pointer', fontFamily:"'Cinzel',serif", fontSize:'var(--t-micro,.625rem)', letterSpacing:'.25em', color:GOLD, opacity:.7 }}
            >
              FILL IN DETAILS
            </button>
          )}
          {publishScreen && (
            <div style={{ color:CREAM, fontSize:'var(--t-micro,.625rem)', letterSpacing:'.18em', opacity:.4 }}>Review in progress…</div>
          )}
        </div>
      )}

      {/* ── Post-batch popup ── */}
      {postBatchPopup && (
        <div style={{ position:'fixed', inset:0, background:'rgba(13,11,8,.92)', display:'flex', alignItems:'flex-end', justifyContent:'center', zIndex:10000, padding:24 }}>
          <div style={{ maxWidth:420, width:'100%', border:'1px solid rgba(201,168,76,.3)', background:INK, padding:'32px 28px 40px', marginBottom:24 }}>
            <div style={{ color:GOLD, fontFamily:"'Alfa Slab One',serif", fontSize:'1.2rem', letterSpacing:'.04em', marginBottom:8, textAlign:'center' }}>Batch Complete</div>
            <div style={{ color:CREAM, fontFamily:"'Cinzel',serif", fontSize:'var(--t-small,.8125rem)', letterSpacing:'.08em', opacity:.45, marginBottom:28, textAlign:'center' }}>Add final details before publishing.</div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }}>
              <div>
                <label style={LABEL_STYLE}>Start Weight (g)</label>
                <input type="number" style={FIELD} placeholder="e.g. 400"
                  value={postBatchForm.startWeight}
                  onChange={e => setPostBatchForm(f => ({ ...f, startWeight: e.target.value }))} />
              </div>
              <div>
                <label style={LABEL_STYLE}>Yield Weight (g)</label>
                <input type="number" style={FIELD} placeholder="e.g. 1800"
                  value={postBatchForm.yieldWeight}
                  onChange={e => setPostBatchForm(f => ({ ...f, yieldWeight: e.target.value }))} />
              </div>
            </div>
            <div style={{ marginBottom:24 }}>
              <label style={LABEL_STYLE}>Tasting Notes</label>
              <input style={FIELD} placeholder="e.g. Chocolate, low acid, smooth finish"
                value={postBatchForm.tastingNotes}
                onChange={e => setPostBatchForm(f => ({ ...f, tastingNotes: e.target.value }))} />
            </div>

            <button
              onClick={reviewAndPublish}
              disabled={saving}
              style={{ width:'100%', padding:'16px', background:GOLD, border:'none', cursor:'pointer', fontFamily:"'Alfa Slab One',serif", fontSize:'1rem', color:INK, letterSpacing:'.04em', opacity: saving ? .5 : 1, marginBottom:10 }}
            >
              REVIEW & PUBLISH
            </button>
            <button
              onClick={() => setPostBatchPopup(false)}
              style={{ width:'100%', padding:'12px', background:'transparent', border:'1px solid rgba(201,168,76,.15)', cursor:'pointer', fontFamily:"'Cinzel',serif", fontSize:'var(--t-micro,.625rem)', letterSpacing:'.2em', color:CREAM, opacity:.4 }}
            >
              LATER
            </button>
          </div>
        </div>
      )}

      {/* ── Screen 4: Review & Publish ── */}
      {publishScreen && (
        <div style={{ position:'fixed', inset:0, background:'rgba(13,11,8,.95)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:10000, padding:24, overflowY:'auto' }}>
          <div style={{ maxWidth:440, width:'100%', border:'1px solid rgba(201,168,76,.3)', background:INK, padding:'36px 28px' }}>
            <div style={{ color:GOLD, fontSize:'var(--t-micro,.625rem)', letterSpacing:'.3em', opacity:.5, marginBottom:20, textAlign:'center' }}>REVIEW · BATCH #{batch?.batch_number}</div>

            {/* Batch summary */}
            {activeBatch?.name && (
              <div style={{ color:CREAM, fontFamily:"'Alfa Slab One',serif", fontSize:'1.3rem', letterSpacing:'.04em', textAlign:'center', marginBottom:8 }}>{activeBatch.name}</div>
            )}
            {activeBatch?.steep_start && activeBatch?.steep_end && (
              <div style={{ color:CREAM, fontFamily:"'Cinzel',serif", fontSize:'var(--t-micro,.625rem)', letterSpacing:'.18em', opacity:.4, textAlign:'center', marginBottom:24 }}>
                {fmtDate(activeBatch.steep_start)} · {fmtDur(activeBatch.steep_start, activeBatch.steep_end)}
              </div>
            )}

            {/* Reading count */}
            <div style={{ border:'1px solid rgba(201,168,76,.15)', padding:'16px 20px', marginBottom:24, textAlign:'center' }}>
              {readingCount === 0 ? (
                <>
                  <div style={{ color:'#c0392b', fontFamily:"'Alfa Slab One',serif", fontSize:'1.1rem', marginBottom:6 }}>⚠ No sensor data found</div>
                  <div style={{ color:CREAM, fontFamily:"'Cinzel',serif", fontSize:'var(--t-micro,.625rem)', letterSpacing:'.15em', opacity:.5 }}>Batch will publish without a temperature chart.</div>
                </>
              ) : (
                <>
                  <div style={{ color:GOLD, fontFamily:"'Alfa Slab One',serif", fontSize:'1.3rem', letterSpacing:'.04em', marginBottom:4 }}>
                    {(readingCount ?? 0).toLocaleString()} readings
                  </div>
                  <div style={{ color:CREAM, fontFamily:"'Cinzel',serif", fontSize:'var(--t-micro,.625rem)', letterSpacing:'.15em', opacity:.4 }}>Found in steep window</div>
                </>
              )}
            </div>

            <button
              onClick={publishBatch}
              disabled={publishing}
              style={{ width:'100%', padding:'18px', background:GOLD, border:'none', cursor:'pointer', fontFamily:"'Alfa Slab One',serif", fontSize:'1.1rem', color:INK, letterSpacing:'.04em', opacity: publishing ? .5 : 1, marginBottom:10 }}
            >
              {publishing ? 'PUBLISHING…' : 'PUBLISH TO SITE'}
            </button>
            <button
              onClick={() => { setPublishScreen(false); setPostBatchPopup(true) }}
              disabled={publishing}
              style={{ width:'100%', padding:'12px', background:'transparent', border:'1px solid rgba(201,168,76,.15)', cursor:'pointer', fontFamily:"'Cinzel',serif", fontSize:'var(--t-micro,.625rem)', letterSpacing:'.2em', color:CREAM, opacity: publishing ? .2 : .4 }}
            >
              BACK
            </button>
          </div>
        </div>
      )}

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
