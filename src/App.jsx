import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import AiCalls from './pages/AiCalls'
import Leads from './pages/Leads'
import Appointments from './pages/Appointments'
import WebChats from './pages/WebChats'
import SocialMessages from './pages/SocialMessages'
import Login from './pages/Login'
import { useAuth } from './context/AuthContext'

function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
      <Route path="/aicalls" element={<PrivateRoute><AiCalls/></PrivateRoute>} />
      <Route path="/leads" element={<PrivateRoute><Leads/></PrivateRoute>} />
      <Route path="/appointments" element={<PrivateRoute><Appointments/></PrivateRoute>} />
      <Route path="/webchats" element={<PrivateRoute><WebChats/></PrivateRoute>} />
      <Route path="/socialmessages" element={<PrivateRoute><SocialMessages/></PrivateRoute>} />
    </Routes>
  )
}
