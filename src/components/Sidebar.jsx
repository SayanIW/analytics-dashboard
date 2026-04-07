import React, { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Sidebar() {
  const { logout } = useAuth()
  const location = useLocation()
  const [aiCallsOpen, setAiCallsOpen] = useState(
    location.pathname === '/aicalls'
  )

  const navLink = ({ isActive }) =>
    `flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-primary/10 text-primary font-semibold'
        : 'text-textMuted hover:text-textMain hover:bg-white/5'
    }`

  return (
    <aside className="w-64 border-r border-bordercolor flex flex-col sticky top-0 h-screen p-4">
      {/* Logo */}
      <div className="flex items-center space-x-3 mb-8">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white">
          <i className="fa-solid fa-microphone-lines text-sm" />
        </div>
        <span className="font-bold text-sm">JarrettFord</span>
      </div>

      <nav className="flex-1 space-y-1">
        {/* Dashboard */}
        <NavLink to="/" end className={navLink}>
          <i className="fa-solid fa-gauge-high w-4 text-center" />
          <span>Dashboard</span>
        </NavLink>

        {/* AI Calls collapsible */}
        <div>
          <button
            onClick={() => setAiCallsOpen(o => !o)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              location.pathname === '/aicalls'
                ? 'bg-primary/10 text-primary font-semibold'
                : 'text-textMuted hover:text-textMain hover:bg-white/5'
            }`}
          >
            <i className="fa-solid fa-robot w-4 text-center" />
            <span className="flex-1 text-left">AI Calls</span>
            <i
              className="fa-solid fa-chevron-down text-xs transition-transform duration-200"
              style={{ transform: aiCallsOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
            />
          </button>
          {aiCallsOpen && (
            <div className="pl-11 space-y-1 mt-1">
              <NavLink
                to="/aicalls?type=inbound"
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-lg text-sm transition-colors ${
                    isActive ? 'text-primary font-bold' : 'text-textMuted hover:text-textMain'
                  }`
                }
              >
                Inbound
              </NavLink>
              <NavLink
                to="/aicalls?type=outbound"
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-lg text-sm transition-colors ${
                    isActive ? 'text-primary font-bold' : 'text-textMuted hover:text-textMain'
                  }`
                }
              >
                Outbound
              </NavLink>
            </div>
          )}
        </div>

        {/* Leads */}
        <NavLink to="/leads" className={navLink}>
          <i className="fa-solid fa-users w-4 text-center" />
          <span>Leads</span>
        </NavLink>

        {/* Appointments */}
        <NavLink to="/appointments" className={navLink}>
          <i className="fa-solid fa-calendar-check w-4 text-center" />
          <span>Appointments</span>
        </NavLink>

        {/* Web Chats */}
        <NavLink to="/webchats" className={navLink}>
          <i className="fa-solid fa-comments w-4 text-center" />
          <span>Web Chats</span>
        </NavLink>

        {/* Social Messages */}
        <NavLink to="/socialmessages" className={navLink}>
          <i className="fa-brands fa-facebook-messenger w-4 text-center" />
          <span>Social Messages</span>
        </NavLink>
      </nav>

      <div className="border-t border-bordercolor pt-4">
        <button
          onClick={logout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-textMuted hover:bg-white/5 hover:text-accentRed transition-colors"
        >
          <i className="fa-solid fa-right-from-bracket w-4 text-center" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  )
}

