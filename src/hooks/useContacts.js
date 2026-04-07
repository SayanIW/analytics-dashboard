import { useCallback, useEffect, useState, useRef } from 'react'
import { CONTACTS_API } from '../constants/api'

export default function useContacts({ limit = 20 } = {}) {
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [hasNext, setHasNext] = useState(false)
  const [history, setHistory] = useState([]) // stack of cursors for prev
  const currentCursor = useRef({ startAfterId: null, startAfter: null, query: null })

  const fetchContacts = useCallback(async ({ query, startAfterId, startAfter } = {}) => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        locationId: CONTACTS_API.LOCATION_ID,
        limit: String(limit)
      })
      if (query) params.set('query', query)
      if (startAfterId) params.set('startAfterId', startAfterId)
      if (startAfter) params.set('startAfter', String(startAfter))

      const url = `${CONTACTS_API.BASE_URL}?${params.toString()}`
      const res = await fetch(url, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${CONTACTS_API.TOKEN}`,
          version: CONTACTS_API.VERSION
        }
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      setContacts(json.contacts || [])
      // determine if there's a next page: API may provide meta.nextPageUrl or count
      setHasNext(Boolean(json.meta && json.meta.nextPageUrl) || (json.count && json.count === limit))

      // update current cursor
      currentCursor.current = { startAfterId: startAfterId || null, startAfter: startAfter || null, query: query || null }
    } catch (err) {
      setError(err.message || String(err))
    } finally {
      setLoading(false)
    }
  }, [limit])

  useEffect(() => {
    // initial load
    fetchContacts()
  }, [])

  const next = useCallback(() => {
    // push current cursor to history
    setHistory(h => [...h, currentCursor.current])
    // build next params from last contact
    if (!contacts.length) return
    const last = contacts[contacts.length - 1]
    const startAfterId = last.id
    const startAfter = new Date(last.dateAdded).getTime()
    fetchContacts({ startAfterId, startAfter, query: currentCursor.current.query })
  }, [contacts, fetchContacts])

  const prev = useCallback(() => {
    setHistory(h => {
      if (h.length === 0) return h
      const newHistory = [...h]
      const prevCursor = newHistory.pop()
      // fetch previous cursor
      fetchContacts({ query: prevCursor.query, startAfterId: prevCursor.startAfterId, startAfter: prevCursor.startAfter })
      return newHistory
    })
  }, [fetchContacts])

  const search = useCallback((query) => {
    // reset history when searching
    setHistory([])
    fetchContacts({ query })
  }, [fetchContacts])

  return { contacts, loading, error, hasNext, history, next, prev, search, fetchContacts }
}
