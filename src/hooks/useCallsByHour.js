import { useCallback, useState } from 'react'
import { CALLS_API } from '../constants/api'

/**
 * Fetches ALL call log pages for a given date range (startStr..endStr, "YYYY-MM-DD"),
 * then classifies each call as Business Hours (8:00–17:59) or After Hours.
 */
export default function useCallsByHour() {
  const [business, setBusiness] = useState(0)
  const [afterHours, setAfterHours] = useState(0)
  const [totalCalls, setTotalCalls] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchForRange = useCallback(async (startStr, endStr) => {
    if (!startStr || !endStr) return
    setLoading(true)
    setError(null)

    try {
      const dayStart = new Date(startStr)
      dayStart.setHours(0, 0, 0, 0)
      const dayEnd = new Date(endStr)
      dayEnd.setHours(23, 59, 59, 999)

      const startDate = dayStart.getTime()
      const endDate   = dayEnd.getTime()

      // Fetch all pages for this range
      const PAGE_SIZE = 50
      let page = 1
      let collected = []

      while (true) {
        const params = new URLSearchParams({
          locationId: CALLS_API.LOCATION_ID,
          page:       String(page),
          pageSize:   String(PAGE_SIZE),
          startDate:  String(startDate),
          endDate:    String(endDate),
          sortBy:     'createdAt',
          sort:       'ascend',
        })
        const res = await fetch(`${CALLS_API.BASE_URL}?${params}`, {
          headers: {
            Accept:        'application/json',
            Authorization: `Bearer ${CALLS_API.TOKEN}`,
            version:       CALLS_API.VERSION,
          },
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = await res.json()
        const logs = json.callLogs || []
        collected = collected.concat(logs)
        if (collected.length >= (json.total || 0) || logs.length < PAGE_SIZE) break
        page++
      }

      // Classify by local hour
      let biz = 0
      let after = 0
      for (const log of collected) {
        const hour = new Date(log.createdAt).getHours()
        if (hour >= 8 && hour < 18) biz++
        else after++
      }

      setBusiness(biz)
      setAfterHours(after)
      setTotalCalls(collected.length)
    } catch (err) {
      setError(err.message || String(err))
    } finally {
      setLoading(false)
    }
  }, [])

  return { business, afterHours, totalCalls, loading, error, fetchForRange }
}
