import React, { useEffect, useRef, useState } from 'react'
import Sidebar from '../components/Sidebar'
import SkeletonTable from '../components/SkeletonTable'
import Modal from '../components/Modal'
import useConversations from '../hooks/useConversations'
import useMessages from '../hooks/useMessages'
import { formatDateTime } from '../utils/format'

const FB_BLUE = '#1877F2'

function FbBubble({ direction, text, meta }) {
  const outbound = direction === 'outbound'
  return (
    <div className={`flex ${outbound ? 'justify-end' : 'justify-start'} my-2`}>
      <div
        className="rounded-xl p-3 max-w-[70%]"
        style={{
          background: outbound ? FB_BLUE : 'rgba(255,255,255,0.07)',
          color: '#fff'
        }}
      >
        <div className="text-sm">{text}</div>
        {meta && <div className="text-[11px] text-white/60 mt-1">{meta}</div>}
      </div>
    </div>
  )
}

export default function SocialMessages() {
  const { conversations, loading, error, total, hasNext, history, next, prev } =
    useConversations({ lastMessageType: 'TYPE_FACEBOOK', limit: 20 })

  const { messages, loading: msgLoading, error: msgError, fetchMessages } = useMessages()
  const [modalOpen, setModalOpen] = useState(false)
  const [activeConv, setActiveConv] = useState(null)
  const scrollRef = useRef(null)

  function openConv(conv) {
    setActiveConv(conv)
    setModalOpen(true)
    fetchMessages(conv.id)
  }

  useEffect(() => {
    if (modalOpen && !msgLoading && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [msgLoading, modalOpen])

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-2xl font-bold" style={{ color: FB_BLUE }}>Social Messages</h1>
          {!loading && <span className="text-sm text-textMuted">{total} total</span>}
        </div>
        <p className="text-textMuted mb-8">Facebook messages via HighLevel</p>

        <div className="kpi-card p-4 rounded-xl">
          {loading ? (
            <SkeletonTable rows={8} cols={6} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto text-sm">
                <thead style={{ '--tw-bg-opacity': 1 }}>
                  <tr style={{ backgroundColor: FB_BLUE }}>
                    <th className="p-3 text-left text-white text-[10px] uppercase tracking-wider">Full Name</th>
                    <th className="p-3 text-left text-white text-[10px] uppercase tracking-wider">Contact Name</th>
                    <th className="p-3 text-left text-white text-[10px] uppercase tracking-wider">Email</th>
                    <th className="p-3 text-left text-white text-[10px] uppercase tracking-wider">Phone</th>
                    <th className="p-3 text-left text-white text-[10px] uppercase tracking-wider">Last Message</th>
                    <th className="p-3 text-left text-white text-[10px] uppercase tracking-wider">Unread</th>
                    <th className="p-3 text-left text-white text-[10px] uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {conversations.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-4 text-center text-textMuted">No conversations found</td>
                    </tr>
                  )}
                  {conversations.map(conv => (
                    <tr key={conv.id} className="border-t border-bordercolor">
                      <td className="p-3">
                        <div className="flex items-center space-x-2">
                          {/* FB avatar */}
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center text-xs relative shrink-0"
                            style={{ background: 'rgba(24,119,242,0.2)', color: '#60a5fa' }}
                          >
                            <i className="fa-brands fa-facebook-f" />
                          </div>
                          <span className="font-semibold">{conv.fullName || '—'}</span>
                        </div>
                      </td>
                      <td className="p-3 text-textMuted">{conv.contactName || '—'}</td>
                      <td className="p-3 text-textMuted">{conv.email || '—'}</td>
                      <td className="p-3 text-textMuted">{conv.phone || '—'}</td>
                      <td className="p-3 text-textMuted max-w-[200px] truncate">{conv.lastMessageBody || '—'}</td>
                      <td className="p-3">
                        {conv.unreadCount > 0 && (
                          <span
                            className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-white text-xs font-bold min-w-[22px]"
                            style={{ backgroundColor: FB_BLUE }}
                          >
                            {conv.unreadCount}
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => openConv(conv)}
                          className="px-3 py-1.5 rounded text-xs font-medium transition-colors"
                          style={{ background: 'rgba(24,119,242,0.15)', color: '#60a5fa' }}
                          onMouseOver={e => {
                            e.currentTarget.style.background = FB_BLUE
                            e.currentTarget.style.color = '#fff'
                          }}
                          onMouseOut={e => {
                            e.currentTarget.style.background = 'rgba(24,119,242,0.15)'
                            e.currentTarget.style.color = '#60a5fa'
                          }}
                        >
                          View Info
                        </button>
                      </td>
                    </tr>
                  ))}
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
            <div className="text-xs text-textMuted">{conversations.length} shown</div>
          </div>
        </div>
      </main>

      {/* Message Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={activeConv?.fullName || activeConv?.contactName || 'Conversation'}
        subtitle={[activeConv?.email, activeConv?.phone].filter(Boolean).join(' • ')}
      >
        <div ref={scrollRef} className="max-h-[55vh] overflow-y-auto p-2">
          {msgLoading && (
            <div className="flex justify-center py-8">
              <div className="text-textMuted text-sm">Loading messages…</div>
            </div>
          )}
          {msgError && <div className="text-red-400 text-sm p-2">{msgError}</div>}
          {!msgLoading && messages.length === 0 && !msgError && (
            <div className="text-textMuted text-sm text-center py-8">No messages</div>
          )}
          {messages.map((msg, i) => (
            <FbBubble
              key={msg.id || i}
              direction={msg.direction}
              text={msg.body}
              meta={formatDateTime(msg.dateAdded)}
            />
          ))}
        </div>
        {!msgLoading && messages.length > 0 && (
          <div className="pt-2 text-xs text-textMuted border-t border-bordercolor">
            {messages.length} messages
          </div>
        )}
      </Modal>
    </div>
  )
}

