import React, { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import SkeletonTable from '../components/SkeletonTable'
import useContacts from '../hooks/useContacts'
import { CONTACTS_API } from '../constants/api'

function AppointmentCell({ contactId }) {
  const [loading, setLoading] = useState(true)
  const [appt, setAppt] = useState(null)

  useEffect(() => {
    let mounted = true
    async function fetchAppt() {
      setLoading(true)
      try {
        const url = `${CONTACTS_API.BASE_URL}${contactId}/appointments`
        const res = await fetch(url, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${CONTACTS_API.TOKEN}`,
            version: '2021-07-28'
          }
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = await res.json()
        const events = json.events || []
        const first = events.length ? events[0] : null
        if (mounted) setAppt(first)
      } catch (err) {
        if (mounted) setAppt(null)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    if (contactId) fetchAppt()
    return () => { mounted = false }
  }, [contactId])

  if (loading) return <div className="text-sm text-textMuted">Loading…</div>
  if (!appt) return <div className="text-sm text-textMuted">No appointments</div>
  return (
    <div className="text-sm">
      <div className="font-semibold">{appt.title}</div>
      <div className="text-xs text-textMuted">{new Date(appt.startTime).toLocaleString()}</div>
    </div>
  )
}

export default function Leads(){
  const { contacts, loading, error, hasNext, next, prev, search } = useContacts({ limit: 20 })
  const [query, setQuery] = useState('')

  useEffect(() => {
    const t = setTimeout(() => search(query || undefined), 500)
    return () => clearTimeout(t)
  }, [query])

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <h1 className="text-2xl font-bold mb-4">Leads</h1>
        <p className="text-textMuted mb-6">Manage your contacts from HighLevel</p>

        <div className="flex items-center justify-between mb-4">
          <div className="w-1/3">
            <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search leads..." className="w-full p-2 rounded bg-white/5 text-sm" />
          </div>
          <div className="text-sm text-textMuted">Showing {contacts.length} contacts</div>
        </div>

        <div className="kpi-card p-4 rounded-lg">
          {loading ? (
            <SkeletonTable rows={8} cols={6} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead className="text-left text-sm" style={{backgroundColor: '#8b5cf6'}}>
                  <tr>
                    <th className="p-2 text-white">Name</th>
                    <th className="p-2 text-white">Email</th>
                    <th className="p-2 text-white">Source</th>
                    <th className="p-2 text-white">Country</th>
                    <th className="p-2 text-white">Appointment</th>
                    <th className="p-2 text-white">Date Added</th>
                  </tr>
                </thead>
                <tbody>
                  {contacts.map(c => (
                    <tr key={c.id} className="border-b border-bordercolor hover:bg-[rgba(139,92,246,0.03)]">
                      <td className="p-2 text-sm">
                        <div className="font-semibold">{c.name || `${c.firstName || ''} ${c.lastName || ''}`.trim() || '—'}</div>
                        <div className="text-xs text-textMuted">{c.phone || '—'}</div>
                      </td>
                      <td className="p-2 text-sm">{c.email || '—'}</td>
                      <td className="p-2 text-sm">{c.source || '—'}</td>
                      <td className="p-2 text-sm">{c.country || '—'}</td>
                      <td className="p-2 text-sm"><AppointmentCell contactId={c.id} /></td>
                      <td className="p-2 text-sm">{c.dateAdded ? new Date(c.dateAdded).toLocaleString() : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {error && <div className="text-red-400 mt-2">{error}</div>}

          <div className="flex items-center justify-between mt-4">
            <div>
              <button onClick={prev} className="px-3 py-1 rounded bg-white/5 mr-2">Previous</button>
              <button onClick={next} disabled={!hasNext} className="px-3 py-1 rounded bg-white/5 disabled:opacity-40">Next</button>
            </div>
            <div className="text-sm text-textMuted">Cursor pagination</div>
          </div>
        </div>
      </main>
    </div>
  )
}
