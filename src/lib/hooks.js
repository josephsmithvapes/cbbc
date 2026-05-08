import { useState, useEffect } from 'react'
import { supabase } from './supabase'

export function useBatchState() {
  const [data, setData] = useState(null)

  useEffect(() => {
    supabase.from('batch_state').select('*').eq('id', 1).single()
      .then(({ data }) => { if (data) setData(data) })

    const ch = supabase.channel('batch-state')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'batch_state' },
        ({ new: row }) => setData(row))
      .subscribe()

    return () => supabase.removeChannel(ch)
  }, [])

  return data
}

export function useBrewState() {
  const [data, setData] = useState(null)

  useEffect(() => {
    supabase.from('brew_state').select('*').eq('id', 1).single()
      .then(({ data }) => { if (data) setData(data) })

    const ch = supabase.channel('brew-state')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'brew_state' },
        ({ new: row }) => setData(row))
      .subscribe()

    return () => supabase.removeChannel(ch)
  }, [])

  return data
}

export function useWaitlistCount() {
  const [count, setCount] = useState(null)

  useEffect(() => {
    supabase.from('waitlist_entries').select('id', { count: 'exact' }).limit(0)
      .then(({ count: c }) => { if (c != null) setCount(c) })
  }, [])

  return count
}

export function useTemperatureReadings(limit = 120) {
  const [readings, setReadings] = useState([])

  useEffect(() => {
    supabase.from('temperature_readings')
      .select('temp_c, recorded_at')
      .order('recorded_at', { ascending: false })
      .limit(limit)
      .then(({ data }) => {
        if (data?.length) setReadings(toTempF(data.reverse()))
      })

    const ch = supabase.channel('temperature-readings')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'temperature_readings' },
        ({ new: row }) => setReadings(prev => [...prev.slice(-(limit - 1)), toTempF([row])[0]]))
      .subscribe()

    return () => supabase.removeChannel(ch)
  }, [limit])

  return readings
}

function toTempF(rows) {
  return rows.map(r => ({ temp_f: r.temp_c * 9 / 5 + 32 }))
}
