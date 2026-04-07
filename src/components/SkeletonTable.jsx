import React from 'react'

export default function SkeletonTable({ rows = 6, cols = 6 }) {
  return (
    <div className="w-full space-y-2">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex space-x-2 items-center">
          {Array.from({ length: cols }).map((__, c) => (
            <div key={c} className="h-4 rounded w-full placeholder-glow" style={{minWidth: c===0? '120px' : '60px'}} />
          ))}
        </div>
      ))}
    </div>
  )
}
