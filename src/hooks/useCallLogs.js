import { useCallback, useEffect, useState } from 'react'
import { CALLS_API } from '../constants/api'

export default function useCallLogs(initial = { page: 1, pageSize: 10 }) {
  const [callLogs, setCallLogs] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(initial.page)
  const [pageSize, setPageSize] = useState(initial.pageSize)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchPage = useCallback(async ({ page: p = 1, pageSize: ps = pageSize, startDate, endDate } = {}) => {
    const safePagSize = Math.min(ps, 50)
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        locationId: CALLS_API.LOCATION_ID,
        page: String(p),
        pageSize: String(safePagSize)
      })
      if (startDate) params.set('startDate', String(startDate))
      if (endDate) params.set('endDate', String(endDate))

      const url = `${CALLS_API.BASE_URL}?${params.toString()}`
      const res = await fetch(url, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${CALLS_API.TOKEN}`,
          version: CALLS_API.VERSION
        }
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      setCallLogs(json.callLogs || [])
      setTotal(json.total || 0)
      setPage(Number(json.page) || p)
      setPageSize(Number(json.pageSize) || safePagSize)
    } catch (err) {
      setError(err.message || String(err))
    } finally {
      setLoading(false)
    }
  }, [pageSize])

  useEffect(() => {
    fetchPage({ page, pageSize })
  }, [])

  return { callLogs, total, page, pageSize, loading, error, fetchPage, setPage }
}
