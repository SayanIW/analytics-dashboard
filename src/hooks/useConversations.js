import { useCallback, useEffect, useRef, useState } from 'react'
import { CONVERSATIONS_API } from '../constants/api'

/**
 * Cursor-based conversations hook.
 * @param {string} lastMessageType - 'TYPE_LIVE_CHAT' | 'TYPE_FACEBOOK'
 * @param {number} limit
 */
export default function useConversations({ lastMessageType, limit = 20 } = {}) {
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [total, setTotal] = useState(0)
  const [hasNext, setHasNext] = useState(false)
  const [history, setHistory] = useState([]) // stack of cursors
  const cursorRef = useRef({ startAfterDate: null, id: null })

  const fetchConversations = useCallback(async ({ startAfterDate, id } = {}) => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        locationId: CONVERSATIONS_API.LOCATION_ID,
        limit: String(limit),
        lastMessageType
      })
      if (startAfterDate) params.set('startAfterDate', startAfterDate)
      if (id) params.set('id', id)

      const res = await fetch(`${CONVERSATIONS_API.BASE_URL}?${params}`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${CONVERSATIONS_API.TOKEN}`,
          version: CONVERSATIONS_API.VERSION
        }
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      const convs = json.conversations || []
      setConversations(convs)
      setTotal(json.total || 0)
      setHasNext(convs.length === limit)
      cursorRef.current = { startAfterDate: startAfterDate || null, id: id || null }
    } catch (err) {
      setError(err.message || String(err))
    } finally {
      setLoading(false)
    }
  }, [lastMessageType, limit])

  useEffect(() => { fetchConversations() }, [fetchConversations])

  const next = useCallback(() => {
    if (!conversations.length) return
    const last = conversations[conversations.length - 1]
    const newCursor = {
      startAfterDate: last.lastMessageDate,
      id: last.id
    }
    setHistory(h => [...h, cursorRef.current])
    fetchConversations(newCursor)
  }, [conversations, fetchConversations])

  const prev = useCallback(() => {
    setHistory(h => {
      if (h.length === 0) return h
      const next = [...h]
      const prevCursor = next.pop()
      fetchConversations(prevCursor)
      return next
    })
  }, [fetchConversations])

  return { conversations, loading, error, total, hasNext, history, next, prev, refetch: fetchConversations }
}
