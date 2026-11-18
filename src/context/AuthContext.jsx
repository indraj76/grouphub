import { createContext, useContext, useState } from 'react'
import { login as apiLogin } from '../services/adminService'
import { TOKEN_KEY } from '../services/api'
const Ctx = createContext(null)
export const useAuth = () => useContext(Ctx)
export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => sessionStorage.getItem(TOKEN_KEY))
  const login = async (creds) => { const d = await apiLogin(creds); const t = d.token || d.accessToken; sessionStorage.setItem(TOKEN_KEY, t); setToken(t) }
  const logout = () => { sessionStorage.removeItem(TOKEN_KEY); setToken(null) }
  return <Ctx.Provider value={{ token, isAuthed: !!token, login, logout }}>{children}</Ctx.Provider>
}
