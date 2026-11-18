import axios from 'axios'
export const TOKEN_KEY = 'grouphub_admin_token'
const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1', timeout: 15000 })
api.interceptors.request.use((c) => { const t = sessionStorage.getItem(TOKEN_KEY); if (t) c.headers.Authorization = `Bearer ${t}`; return c })
export const errMsg = (e) => e?.response?.data?.message || e?.message || 'Something went wrong'
export default api
