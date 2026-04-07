import React from 'react'

const STATUS_MAP = {
  confirmed: 'bg-green-500/10 text-green-400',
  cancelled: 'bg-red-500/10 text-red-400',
  showed: 'bg-blue-500/10 text-blue-400',
  noshow: 'bg-orange-500/10 text-orange-400',
  new: 'bg-primary/10 text-primary'
}

export default function StatusBadge({ status }) {
  const cls = STATUS_MAP[status] || 'bg-white/5 text-textMuted'
  return <span className={`px-2 py-1 rounded-full text-xs font-medium ${cls}`}>{status}</span>
}
