export const STEEP_HOURS = 20

export function fmt(ms) {
  if (ms === null || ms === undefined) return '--:--:--'
  const h = Math.floor(ms / 3_600_000)
  const m = Math.floor((ms % 3_600_000) / 60_000)
  const s = Math.floor((ms % 60_000) / 1_000)
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function calcRemaining(steepStart) {
  if (!steepStart) return null
  const end = new Date(steepStart).getTime() + STEEP_HOURS * 3_600_000
  const diff = end - Date.now()
  return diff > 0 ? diff : 0
}

export function toTempF(rows) {
  return rows.map(r => ({ temp_f: r.temp_c * 9 / 5 + 32 }))
}
