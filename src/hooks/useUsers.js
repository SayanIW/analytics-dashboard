import { useEffect, useState } from 'react'
import { USERS_API } from '../constants/api'

/**
 * Fetches all users for the location once on mount.
 * Returns a Map<userId, user> for O(1) lookups.
 */
export default function useUsers() {
  const [userMap, setUserMap] = useState(new Map())
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState(null)

  useEffect(() => {
    async function fetchUsers() {
      try {
        const params = new URLSearchParams({ locationId: USERS_API.LOCATION_ID })
        const res = await fetch(`${USERS_API.BASE_URL}?${params}`, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${USERS_API.TOKEN}`,
            Version: USERS_API.VERSION
          }
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = await res.json()
        const users = json.users || []
        const map = new Map(users.map(u => [u.id, u]))
        setUserMap(map)
      } catch (err) {
        setError(err.message || String(err))
      } finally {
        setLoading(false)
      }
    }
    fetchUsers()
  }, [])

  return { userMap, loading, error }
}
