import api from './api'
import { mockGroups, page } from './mock'
const MOCK = import.meta.env.VITE_USE_MOCK === 'true'
const filt = (p={}, all=false) => mockGroups.filter(g => (all || g.status==='APPROVED') && (!p.status || g.status===p.status) && (!p.q || (g.name+g.description+g.category+g.tags).toLowerCase().includes(p.q.toLowerCase())) && (!p.category || g.categorySlug===p.category) && (!p.country || g.countryCode===p.country) && (!p.language || g.languageCode===p.language))
export const getGroups = async (params) => MOCK ? page(filt(params), +params.page||0) : (await api.get('/groups', { params })).data
export const searchGroups = async (params) => MOCK ? page(filt(params), +params.page||0) : (await api.get('/groups/search', { params })).data
export const getRelated = async (g) => MOCK ? mockGroups.filter(x=>x.categorySlug===g.categorySlug && x.id!==g.id && x.status==='APPROVED').slice(0,3) : (await api.get('/groups', { params: { category: g.categorySlug, size: 4 } })).data.content.filter(x=>x.id!==g.id).slice(0,3)
export const getTrending = async () => MOCK ? mockGroups.filter(g=>g.status==='APPROVED').slice(0,6) : (await api.get('/groups/trending')).data
export const filterMock = filt
export const getGroup = async (slug) => MOCK ? mockGroups.find(g=>g.slug===slug) : (await api.get(`/groups/${slug}`)).data
export const submitGroup = async (body) => MOCK ? { status:'PENDING', submissionCode:'GH-MOCK0001' } : (await api.post('/groups', body)).data
export const reportGroup = async (id, body) => MOCK ? {} : (await api.post(`/groups/${id}/report`, body)).data
export const lookupSubmissions = async (codes) => MOCK
  ? codes.map(c => ({ submissionCode: c, name: 'Mock submission', categoryName: 'Mock', status: 'PENDING', createdAt: new Date().toISOString() }))
  : (await api.post('/submissions/lookup', { codes })).data