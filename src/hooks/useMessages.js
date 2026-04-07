import { useCallback, useState } from 'react'
import { CONVERSATIONS_API } from '../constants/api'

/**
 * Fetches messages for a given conversationId on demand.
 * Call `fetchMessages(conversationId)` to load.
 */
export default function useMessages() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchMessages = useCallback(async (conversationId) => {
    if (!conversationId) return
    setLoading(true)
    setError(null)
    setMessages([])
    try {
      const url = `${CONVERSATIONS_API.MESSAGES_URL}/${conversationId}/messages`
      const res = await fetch(url, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${CONVERSATIONS_API.TOKEN}`,
          version: CONVERSATIONS_API.VERSION
        }
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      // API nests: { messages: { messages: [...] } }
      const raw = json.messages?.messages ?? json.messages ?? []
      // Sort ascending by dateAdded
      const sorted = [...raw].sort(
        (a, b) => new Date(a.dateAdded) - new Date(b.dateAdded)
      )
      setMessages(sorted)
    } catch (err) {
      setError(err.message || String(err))
    } finally {
      setLoading(false)
    }
  }, [])

  return { messages, loading, error, fetchMessages }
}
