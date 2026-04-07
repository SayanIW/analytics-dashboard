import React from 'react'

export default function ChatBubble({ from = 'inbound', text, meta }) {
  const inbound = from === 'inbound'
  return (
    <div className={`flex ${inbound ? 'justify-start' : 'justify-end'} my-2`}> 
      <div className={`${inbound ? 'bg-white/5 text-textMain' : 'bg-primary text-white'} rounded-xl p-3 max-w-[70%]`}> 
        <div className="text-sm">{text}</div>
        {meta && <div className="text-[11px] text-textMuted mt-1">{meta}</div>}
      </div>
    </div>
  )
}
