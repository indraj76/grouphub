import api from './api'
export const getPublicStats = async () => (await api.get('/stats')).data
export const sendContactMessage = async (body) => (await api.post('/contact', body)).data
