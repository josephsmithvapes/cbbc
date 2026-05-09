import { describe, it, expect } from 'vitest'
import { fmt, calcRemaining, toTempF, STEEP_HOURS } from '../utils'

describe('fmt', () => {
  it('returns --:--:-- for null', () => {
    expect(fmt(null)).toBe('--:--:--')
  })
  it('returns --:--:-- for undefined', () => {
    expect(fmt(undefined)).toBe('--:--:--')
  })
  it('formats zero as 00:00:00', () => {
    expect(fmt(0)).toBe('00:00:00')
  })
  it('formats 1 hour as 01:00:00', () => {
    expect(fmt(3_600_000)).toBe('01:00:00')
  })
  it('formats mixed h/m/s with padding', () => {
    expect(fmt(3_661_000)).toBe('01:01:01')
  })
  it('pads single-digit seconds', () => {
    expect(fmt(65_000)).toBe('00:01:05')
  })
})

describe('toTempF', () => {
  it('converts 0°C → 32°F', () => {
    expect(toTempF([{ temp_c: 0 }])).toEqual([{ temp_f: 32 }])
  })
  it('converts 100°C → 212°F', () => {
    expect(toTempF([{ temp_c: 100 }])).toEqual([{ temp_f: 212 }])
  })
  it('handles multiple rows', () => {
    expect(toTempF([{ temp_c: 0 }, { temp_c: 100 }])).toEqual([
      { temp_f: 32 },
      { temp_f: 212 },
    ])
  })
  it('returns empty array for empty input', () => {
    expect(toTempF([])).toEqual([])
  })
})

describe('calcRemaining', () => {
  it('returns null for null steepStart', () => {
    expect(calcRemaining(null)).toBeNull()
  })
  it('returns null for empty string steepStart', () => {
    expect(calcRemaining('')).toBeNull()
  })
  it('returns null for undefined steepStart', () => {
    expect(calcRemaining(undefined)).toBeNull()
  })
  it('returns 0 when steep period has fully elapsed', () => {
    const longAgo = new Date(Date.now() - (STEEP_HOURS + 1) * 3_600_000).toISOString()
    expect(calcRemaining(longAgo)).toBe(0)
  })
  it('returns positive ms when steep is still in progress', () => {
    const justStarted = new Date().toISOString()
    const result = calcRemaining(justStarted)
    expect(result).toBeGreaterThan(0)
    expect(result).toBeLessThanOrEqual(STEEP_HOURS * 3_600_000)
  })
})
