const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY
const AUTH_KEY = 'sb_session'

function getToken() {
  try {
    const s = JSON.parse(localStorage.getItem(AUTH_KEY))
    if (!s?.access_token) return SUPABASE_ANON_KEY
    if (s.expires_at && s.expires_at * 1000 < Date.now()) {
      localStorage.removeItem(AUTH_KEY)
      return SUPABASE_ANON_KEY
    }
    return s.access_token
  } catch { return SUPABASE_ANON_KEY }
}

function saveSession(session) {
  if (session) localStorage.setItem(AUTH_KEY, JSON.stringify(session))
  else localStorage.removeItem(AUTH_KEY)
}

function baseHeaders(extra = {}) {
  return {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${getToken()}`,
    'Content-Type': 'application/json',
    ...extra,
  }
}

class QueryBuilder {
  constructor(table) {
    this._table = table
    this._params = new URLSearchParams()
    this._method = 'GET'
    this._body = null
    this._single = false
    this._count = false
    this._prefer = []
  }

  select(cols = '*', opts = {}) {
    this._params.set('select', cols)
    if (opts.count === 'exact') this._count = true
    return this
  }

  eq(col, val)             { this._params.append(col, `eq.${val}`);       return this }
  is(col, val)             { this._params.append(col, `is.${val}`);       return this }
  not(col, op, val)        { this._params.append(col, `not.${op}.${val}`); return this }
  gte(col, val)            { this._params.append(col, `gte.${val}`);      return this }
  lte(col, val)            { this._params.append(col, `lte.${val}`);      return this }

  order(col, { ascending = true } = {}) {
    this._params.set('order', `${col}.${ascending ? 'asc' : 'desc'}`)
    return this
  }

  limit(n) { this._params.set('limit', n); return this }

  single() { this._single = true; return this }

  insert(data) {
    this._method = 'POST'
    this._body = JSON.stringify(data)
    this._prefer.push('return=representation')
    return this
  }

  update(data) {
    this._method = 'PATCH'
    this._body = JSON.stringify(data)
    this._prefer.push('return=representation')
    return this
  }

  delete() {
    this._method = 'DELETE'
    return this
  }

  then(resolve, reject) {
    return this._exec().then(resolve, reject)
  }

  async _exec() {
    const qs = this._params.toString()
    const url = `${SUPABASE_URL}/rest/v1/${this._table}${qs ? '?' + qs : ''}`

    const headers = baseHeaders()
    if (this._single) headers['Accept'] = 'application/vnd.pgrst.object+json'
    if (this._count) {
      headers['Prefer'] = 'count=exact'
    } else if (this._prefer.length) {
      headers['Prefer'] = this._prefer.join(',')
    }

    try {
      const res = await fetch(url, { method: this._method, headers, body: this._body })

      if (this._count) {
        const range = res.headers.get('Content-Range')
        const count = range ? parseInt(range.split('/')[1]) : null
        return { count, error: res.ok ? null : await res.json().catch(() => null) }
      }

      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: res.statusText }))
        return { data: null, error: err }
      }

      if (res.status === 204 || this._method === 'DELETE') {
        return { data: null, error: null }
      }

      const data = await res.json()
      return { data, error: null }
    } catch (e) {
      return { data: null, error: { message: e.message } }
    }
  }
}

const _authListeners = new Set()

export const supabase = {
  from(table) {
    return new QueryBuilder(table)
  },

  auth: {
    getSession() {
      try {
        const s = JSON.parse(localStorage.getItem(AUTH_KEY))
        const session = s?.access_token ? s : null
        return Promise.resolve({ data: { session } })
      } catch {
        return Promise.resolve({ data: { session: null } })
      }
    },

    onAuthStateChange(cb) {
      _authListeners.add(cb)
      supabase.auth.getSession().then(({ data: { session } }) => cb('INITIAL_SESSION', session))
      return { data: { subscription: { unsubscribe: () => _authListeners.delete(cb) } } }
    },

    async signInWithPassword({ email, password }) {
      try {
        const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
          method: 'POST',
          headers: { apikey: SUPABASE_ANON_KEY, 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        })
        const data = await res.json()
        if (!res.ok) return { data: null, error: data }
        saveSession(data)
        _authListeners.forEach(cb => cb('SIGNED_IN', data))
        return { data, error: null }
      } catch (e) {
        return { data: null, error: { message: e.message } }
      }
    },

    async signOut() {
      saveSession(null)
      _authListeners.forEach(cb => cb('SIGNED_OUT', null))
    },
  },

  // Stub — realtime replaced by polling in hooks and components
  channel()      { return { on() { return this }, subscribe() { return this } } },
  removeChannel() {},
}
