import React, { useEffect, useRef, useState } from 'react'
import Sidebar from '../components/Sidebar'
import SkeletonTable from '../components/SkeletonTable'
import Modal from '../components/Modal'
import ChatBubble from '../components/ChatBubble'
import useConversations from '../hooks/useConversations'
import useMessages from '../hooks/useMessages'
import { formatDateTime } from '../utils/format'

export default function WebChats() {
  const { conversations, loading, error, total, hasNext, history, next, prev } =
    useConversations({ lastMessageType: 'TYPE_LIVE_CHAT', limit: 20 })

  const { messages, loading: msgLoading, error: msgError, fetchMessages } = useMessages()
  const [modalOpen, setModalOpen] = useState(false)
  const [activeConv, setActiveConv] = useState(null)
  const scrollRef = useRef(null)

  function openConv(conv) {
    setActiveConv(conv)
    setModalOpen(true)
    fetchMessages(conv.id)
  }

  // Auto-scroll to bottom when messages load
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
          <h1 className="text-2xl font-bold">Web Chats</h1>
          {!loading && <span className="text-sm text-textMuted">{total} total</span>}
        </div>
        <p className="text-textMuted mb-8">Live chat conversations from your website</p>

        <div className="kpi-card p-4 rounded-xl">
          {loading ? (
            <SkeletonTable rows={8} cols={6} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto text-sm">
                <thead>
                  <tr>
                    <th className="p-3 text-left">Full Name</th>
                    <th className="p-3 text-left">Contact Name</th>
                    <th className="p-3 text-left">Email</th>
                    <th className="p-3 text-left">Phone</th>
                    <th className="p-3 text-left">Last Message</th>
                    <th className="p-3 text-left">Unread</th>
                    <th className="p-3 text-left">Actions</th>
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
                      <td className="p-3 font-semibold">{conv.fullName || '—'}</td>
                      <td className="p-3 text-textMuted">{conv.contactName || '—'}</td>
                      <td className="p-3 text-textMuted">{conv.email || '—'}</td>
                      <td className="p-3 text-textMuted">{conv.phone || '—'}</td>
                      <td className="p-3 text-textMuted max-w-[200px] truncate">
                        {conv.lastMessageBody || '—'}
                      </td>
                      <td className="p-3">
                        {conv.unreadCount > 0 && (
                          <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold min-w-[22px]">
                            {conv.unreadCount}
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => openConv(conv)}
                          className="px-3 py-1.5 rounded bg-white/5 text-xs hover:bg-primary/20 hover:text-primary transition-colors"
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
            <ChatBubble
              key={msg.id || i}
              from={msg.direction === 'outbound' ? 'outbound' : 'inbound'}
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

