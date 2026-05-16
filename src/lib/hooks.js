import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import { toTempF } from './utils'

export function useAuth() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  return { session, loading }
}

export function useBatchState() {
  const [data, setData] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function poll() {
      const { data } = await supabase.from('batch_state').select('*').eq('id', 1).single()
      if (!cancelled && data) setData(data)
    }
    poll()
    const id = setInterval(poll, 5000)
    return () => { cancelled = true; clearInterval(id) }
  }, [])

  return data
}

export function useBrewState() {
  const [data, setData] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function poll() {
      const { data } = await supabase.from('brew_state').select('*').eq('id', 1).single()
      if (!cancelled && data) setData(data)
    }
    poll()
    const id = setInterval(poll, 5000)
    return () => { cancelled = true; clearInterval(id) }
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
    let cancelled = false
    async function poll() {
      const { data } = await supabase.from('temperature_readings')
        .select('temp_c, recorded_at')
        .order('recorded_at', { ascending: false })
        .limit(limit)
      if (!cancelled && data?.length) setReadings(toTempF(data.reverse()))
    }
    poll()
    const id = setInterval(poll, 10000)
    return () => { cancelled = true; clearInterval(id) }
  }, [limit])

  return readings
}
