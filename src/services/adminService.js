import api from './api'
import { filterMock } from './groupService'
import { page } from './mock'
export const login = async (c) => (await api.post('/admin/auth/login', c)).data
export const getDashboard = async () => (await api.get('/admin/dashboard')).data
export const getAdminGroups = async (params) => import.meta.env.VITE_USE_MOCK === 'true' ? page(filterMock(params, true), +params.page||0) : (await api.get('/admin/groups', { params })).data
export const approveGroup = (id) => api.patch(`/admin/groups/${id}/approve`)
export const rejectGroup = (id) => api.patch(`/admin/groups/${id}/reject`)
export const deleteGroup = (id) => api.delete(`/admin/groups/${id}`)
export const getAdminCategories = async () => (await api.get('/admin/categories')).data
export const createCategory = async (body) => (await api.post('/admin/categories', body)).data
export const updateCategory = async (id, body) => (await api.put(`/admin/categories/${id}`, body)).data
export const deleteCategory = (id) => api.delete(`/admin/categories/${id}`)
export const getReports = async (params={}) => (await api.get('/admin/reports', { params })).data
export const updateReport = (id, status) => api.patch(`/admin/reports/${id}/status`, { status })
export const deleteReport = (id) => api.delete(`/admin/reports/${id}`)

export const getContactMessages = async () => (await api.get('/admin/contact-messages')).data
export const deleteContactMessage = (id) => api.delete(`/admin/contact-messages/${id}`)
