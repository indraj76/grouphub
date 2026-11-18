import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'; import { errMsg } from '../../services/api'
export default function AdminLogin() {
  const { login, isAuthed } = useAuth(), nav = useNavigate(), [f, setF] = useState({ email: '', password: '' }), [err, setErr] = useState(''), [busy, setBusy] = useState(false)
  if (isAuthed) return <Navigate to="/admin/dashboard" replace/>
  const submit = async (e) => { e.preventDefault(); if (!/\S+@\S+\.\S+/.test(f.email) || f.password.length < 6) return setErr('Enter a valid email and password (6+ chars)')
    setBusy(true); try { await login(f); nav('/admin/dashboard') } catch (x) { setErr(errMsg(x)) } finally { setBusy(false) } }
  return <div className="grid min-h-screen place-items-center px-4"><form onSubmit={submit} className="card w-full max-w-sm space-y-4 p-6 hover:translate-y-0"><h1 className="text-xl font-extrabold">Admin Login</h1>
    <input className="input" type="email" aria-label="Email" placeholder="Email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })}/>
    <input className="input" type="password" aria-label="Password" placeholder="Password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })}/>
    {err && <p className="text-sm text-red-600" role="alert">{err}</p>}<button className="btn-primary w-full" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button></form></div>
}
