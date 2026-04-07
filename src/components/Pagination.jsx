import React from 'react'

export default function Pagination({ page, pageSize, total, onPageChange }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const windowSize = 5
  let start = Math.max(1, page - Math.floor(windowSize / 2))
  let end = Math.min(totalPages, start + windowSize - 1)
  if (end - start < windowSize - 1) start = Math.max(1, end - windowSize + 1)

  const pages = []
  for (let i = start; i <= end; i++) pages.push(i)

  return (
    <div className="flex items-center space-x-2 mt-4">
      <button disabled={page <= 1} onClick={() => onPageChange(page - 1)} className="px-3 py-1 rounded bg-white/5 disabled:opacity-40">Prev</button>
      {start > 1 && <button onClick={() => onPageChange(1)} className="px-2 py-1 rounded bg-white/5">1</button>}
      {start > 2 && <div className="px-2">…</div>}
      {pages.map(p => (
        <button key={p} onClick={() => onPageChange(p)} className={`px-3 py-1 rounded ${p===page? 'bg-primary text-white' : 'bg-white/5'}`}>{p}</button>
      ))}
      {end < totalPages - 1 && <div className="px-2">…</div>}
      {end < totalPages && <button onClick={() => onPageChange(totalPages)} className="px-2 py-1 rounded bg-white/5">{totalPages}</button>}
      <button disabled={page >= totalPages} onClick={() => onPageChange(page + 1)} className="px-3 py-1 rounded bg-white/5 disabled:opacity-40">Next</button>
    </div>
  )
}
