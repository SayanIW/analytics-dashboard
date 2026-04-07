import React, { useCallback, useEffect, useRef, useState } from 'react'
import Sidebar from '../components/Sidebar'
import SkeletonTable from '../components/SkeletonTable'
import StatusBadge from '../components/StatusBadge'
import { CONTACTS_API } from '../constants/api'
import { formatDateTime } from '../utils/format'
import useUsers from '../hooks/useUsers'

const LIMIT = 20

async function fetchContactsPage({ startAfterId, startAfter } = {}) {
  const params = new URLSearchParams({
    locationId: CONTACTS_API.LOCATION_ID,
    limit: String(LIMIT)
  })
  if (startAfterId) params.set('startAfterId', startAfterId)
  if (startAfter) params.set('startAfter', String(startAfter))
  const res = await fetch(`${CONTACTS_API.BASE_URL}?${params}`, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${CONTACTS_API.TOKEN}`,
      version: CONTACTS_API.VERSION
    }
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

async function fetchAppointmentsForContact(contactId) {
  const url = `${CONTACTS_API.BASE_URL}${contactId}/appointments`
  const res = await fetch(url, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${CONTACTS_API.TOKEN}`,
      version: '2021-04-15'
    }
  })
  if (!res.ok) return []
  const json = await res.json()
  return (json.events || []).filter(e => !e.deleted)
}

export default function Appointments() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [hasNext, setHasNext] = useState(false)
  const [history, setHistory] = useState([])
  const cursorRef = useRef({ startAfterId: null, startAfter: null })
  const { userMap } = useUsers()

  const load = useCallback(async (cursor = {}) => {
    setLoading(true)
    setError(null)
    try {
      const json = await fetchContactsPage(cursor)
      const contacts = json.contacts || []
      setHasNext(
        Boolean(json.meta?.nextPageUrl) || contacts.length === LIMIT
      )
      cursorRef.current = {
        startAfterId: cursor.startAfterId || null,
        startAfter: cursor.startAfter || null
      }

      // Concurrently fetch appointments for each contact
      const results = await Promise.allSettled(
        contacts.map(c => fetchAppointmentsForContact(c.id))
      )
      const flat = []
      results.forEach((r, i) => {
        const appts = r.status === 'fulfilled' ? r.value : []
        appts.forEach(a => flat.push({ contact: contacts[i], appt: a }))
      })
      // Sort by startTime descending
      flat.sort((a, b) => new Date(b.appt.startTime) - new Date(a.appt.startTime))
      setRows(flat)
    } catch (err) {
      setError(err.message || String(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const next = () => {
    // need the cursor from current contacts — track last contact
    // since we flatten appts, derive cursor from last unique contact
    const seen = new Set()
    let lastContact = null
    rows.forEach(r => {
      if (!seen.has(r.contact.id)) {
        seen.add(r.contact.id)
        lastContact = r.contact
      }
    })
    if (!lastContact) return
    const newCursor = {
      startAfterId: lastContact.id,
      startAfter: new Date(lastContact.dateAdded).getTime()
    }
    setHistory(h => [...h, cursorRef.current])
    load(newCursor)
  }

  const prev = () => {
    setHistory(h => {
      if (h.length === 0) return h
      const next = [...h]
      const prevCursor = next.pop()
      load(prevCursor)
      return next
    })
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        {/* Header with accentGreen accent */}
        <h1 className="text-2xl font-bold mb-1" style={{ color: '#bef264' }}>Appointments</h1>
        <p className="text-textMuted mb-8">Scheduled appointments from HighLevel contacts</p>

        <div className="kpi-card p-4 rounded-xl">
          {loading ? (
            <SkeletonTable rows={8} cols={7} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto text-sm">
                <thead>
                  <tr>
                    <th className="p-3 text-left">Contact</th>
                    <th className="p-3 text-left">Email</th>
                    <th className="p-3 text-left">Appointment</th>
                    <th className="p-3 text-left">Status</th>
                    <th className="p-3 text-left">Assigned To</th>
                    <th className="p-3 text-left">Appointment Time</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-4 text-center text-textMuted">No appointments found</td>
                    </tr>
                  )}
                  {rows.map(({ contact: c, appt: a }, i) => {
                    const assignedUser = userMap.get(a.assignedUserId)
                    return (
                    <tr key={`${c.id}-${a.id}-${i}`} className="border-t border-bordercolor">
                      <td className="p-3">
                        <div className="font-semibold">{c.name || `${c.firstName || ''} ${c.lastName || ''}`.trim() || '—'}</div>
                        <div className="text-xs text-textMuted">{c.phone || ''}</div>
                      </td>
                      <td className="p-3 text-textMuted">{c.email || '—'}</td>
                      <td className="p-3 font-medium">{a.title || '—'}</td>
                      <td className="p-3"><StatusBadge status={a.appointmentStatus} /></td>
                      <td className="p-3">
                        {assignedUser ? (
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold flex-shrink-0">
                              {(assignedUser.firstName?.[0] || assignedUser.name?.[0] || '?').toUpperCase()}
                            </div>
                            <div>
                              <div className="text-sm font-medium">{assignedUser.name || `${assignedUser.firstName || ''} ${assignedUser.lastName || ''}`.trim()}</div>
                              <div className="text-xs text-textMuted">{assignedUser.email || ''}</div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-textMuted text-xs">—</span>
                        )}
                      </td>
                      <td className="p-3 text-textMuted whitespace-nowrap">{formatDateTime(a.startTime)}</td>
                    </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {error && <div className="text-red-400 mt-2 text-sm">{error}</div>}

          <div className="flex items-center justify-between mt-4">
            <div className="flex space-x-2">
              <button
                onClick={prev}
                disabled={history.length === 0}
                className="px-4 py-1.5 rounded bg-white/5 text-sm disabled:opacity-40 hover:bg-white/10"
              >
                ← Previous
              </button>
              <button
                onClick={next}
                disabled={!hasNext}
                className="px-4 py-1.5 rounded bg-white/5 text-sm disabled:opacity-40 hover:bg-white/10"
              >
                Next →
              </button>
            </div>
            <div className="text-xs text-textMuted">{rows.length} appointments shown</div>
          </div>
        </div>
      </main>
    </div>
  )
}

