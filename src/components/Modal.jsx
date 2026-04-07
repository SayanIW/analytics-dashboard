import React from 'react'

export default function Modal({ open, onClose, title, subtitle, children }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-surface max-w-2xl w-full rounded-xl p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-lg font-semibold">{title}</h3>
            {subtitle && <p className="text-sm text-textMuted">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="text-textMuted">✕</button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}
