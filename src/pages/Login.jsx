import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')
  const [error, setError] = useState('')
  const auth = useAuth()
  const nav = useNavigate()

  const submit = (e) => {
    e.preventDefault()
    if (auth.login(user, pass)) {
      nav('/')
    } else {
      setError('Invalid credentials')
      setTimeout(() => setError(''), 2500)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md kpi-card rounded-xl p-6">
        <div className="text-center mb-4">
          <div className="w-12 h-12 rounded-lg bg-primary inline-flex items-center justify-center text-white font-bold">JF</div>
          <h1 className="text-2xl font-bold mt-2">Welcome Back</h1>
          <p className="text-textMuted">JarrettFord</p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <input value={user} onChange={e=>setUser(e.target.value)} placeholder="Username" className="w-full p-2 rounded bg-white/5" />
          <input value={pass} onChange={e=>setPass(e.target.value)} type="password" placeholder="Password" className="w-full p-2 rounded bg-white/5" />
          {error && <div className="text-sm text-red-400">{error}</div>}
          <button type="submit" className="w-full py-2 bg-primary text-white rounded">Sign in</button>
        </form>
      </div>
    </div>
  )
}
