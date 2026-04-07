import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import useCallLogs from '../hooks/useCallLogs'
import SkeletonTable from '../components/SkeletonTable'
import Modal from '../components/Modal'
import ChatBubble from '../components/ChatBubble'
import Pagination from '../components/Pagination'
import { formatDuration, formatDateTime } from '../utils/format'

export default function AiCalls() {
  const [searchParams] = useSearchParams()
  const callType = searchParams.get('type') || 'inbound'

  const { callLogs, total, page, pageSize, loading, error, fetchPage, setPage } = useCallLogs({ page: 1, pageSize: 10 })
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [modalContent, setModalContent] = useState({ type: null, payload: null })

  useEffect(() => {
    fetchPage({ page: 1, pageSize })
  }, [callType])

  function applyFilters() {
    const sd = startDate ? new Date(startDate).getTime() : undefined
    const ed = endDate ? new Date(endDate).getTime() + 86399999 : undefined
    fetchPage({ page: 1, pageSize, startDate: sd, endDate: ed })
  }

  function clearFilters() {
    setStartDate('')
    setEndDate('')
    fetchPage({ page: 1, pageSize })
  }

  function openSummary(log) {
    setModalContent({ type: 'summary', payload: log.summary || 'No summary available.' })
    setModalOpen(true)
  }

  function openTranscript(log) {
    const parts = (log.transcript || '').split('\n').map(l => l.trim()).filter(Boolean).map(l => {
      if (l.toLowerCase().startsWith('bot:')) return { from: 'bot', text: l.replace(/^bot:\s*/i, '') }
      if (l.toLowerCase().startsWith('human:')) return { from: 'human', text: l.replace(/^human:\s*/i, '') }
      return { from: 'human', text: l }
    })
    setModalContent({ type: 'transcript', payload: parts })
    setModalOpen(true)
  }

  const onPageChange = (p) => {
    setPage(p)
    fetchPage({ page: p, pageSize })
  }

  const title = callType === 'outbound' ? 'AI Calls — Outbound' : 'AI Calls — Inbound'

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <h1 className="text-2xl font-bold mb-1">{title}</h1>
        <p className="text-textMuted mb-6">Monitor your artificial intelligence conversations</p>

        {/* Date filter bar */}
        <div className="flex items-center space-x-3 mb-6 justify-end flex-wrap gap-y-2">
          <div className="flex items-center space-x-2">
            <label className="text-xs text-textMuted">From</label>
            <input value={startDate} onChange={e => setStartDate(e.target.value)} type="date" className="p-2 rounded bg-white/5 text-sm" />
          </div>
          <div className="flex items-center space-x-2">
            <label className="text-xs text-textMuted">To</label>
            <input value={endDate} onChange={e => setEndDate(e.target.value)} type="date" className="p-2 rounded bg-white/5 text-sm" />
          </div>
          <button onClick={applyFilters} className="px-4 py-2 bg-primary rounded text-white text-sm hover:bg-primary/80">Apply</button>
          <button onClick={clearFilters} className="px-4 py-2 bg-white/5 rounded text-sm hover:bg-white/10">Clear</button>
        </div>

        <div className="kpi-card p-4 rounded-xl">
          {loading ? (
            <SkeletonTable rows={6} cols={7} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr>
                    <th className="p-3 text-left">Agent Name</th>
                    <th className="p-3 text-left">Contact Name</th>
                    <th className="p-3 text-left">Phone Number</th>
                    <th className="p-3 text-left">Date & Time</th>
                    <th className="p-3 text-left">Duration</th>
                    <th className="p-3 text-left">Actions Triggered</th>
                    <th className="p-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {callLogs.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-4 text-center text-textMuted">No call logs found</td>
                    </tr>
                  )}
                  {callLogs.map(log => (
                    <tr key={log.id} className="border-t border-bordercolor">
                      <td className="p-3 text-sm">{log.agentName || log.agentId || '—'}</td>
                      <td className="p-3 text-sm">{log.extractedData?.name || '—'}</td>
                      <td className="p-3 text-sm">{log.fromNumber || '—'}</td>
                      <td className="p-3 text-sm whitespace-nowrap">{formatDateTime(log.createdAt)}</td>
                      <td className="p-3 text-sm font-mono">{formatDuration(log.duration)}</td>
                      <td className="p-3 text-sm">{(log.executedCallActions || []).length}</td>
                      <td className="p-3 text-sm flex space-x-2">
                        <button onClick={() => openSummary(log)} className="px-2 py-1 bg-primary/10 text-primary rounded text-xs hover:bg-primary/20">
                          Summary
                        </button>
                        <button onClick={() => openTranscript(log)} className="px-2 py-1 bg-white/5 rounded text-xs hover:bg-white/10" title="Transcript">
                          <i className="fa-regular fa-file-lines" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {error && <div className="text-red-400 mt-2 text-sm">{error}</div>}

          <Pagination page={page} pageSize={pageSize} total={total} onPageChange={onPageChange} />
        </div>
      </main>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalContent.type === 'summary' ? 'Call Summary' : 'Call Transcript'}
        subtitle={modalContent.type === 'transcript' ? 'Translated Content' : undefined}
      >
        {modalContent.type === 'summary' && (
          <div className="p-3 text-sm leading-relaxed">{modalContent.payload}</div>
        )}
        {modalContent.type === 'transcript' && (
          <div className="p-2">
            {modalContent.payload?.map((m, i) => (
              <ChatBubble
                key={i}
                from={m.from === 'bot' ? 'outbound' : 'inbound'}
                text={m.text}
              />
            ))}
          </div>
        )}
      </Modal>
    </div>
  )
}

