import api from './api'
import { mockCategories, mockGroups, page } from './mock'
const MOCK = import.meta.env.VITE_USE_MOCK === 'true'
export const getCategories = async () => MOCK ? mockCategories : (await api.get('/categories')).data
export const getCategoryGroups = async (slug, params) => MOCK ? page(mockGroups.filter(g=>g.categorySlug===slug), +params?.page||0) : (await api.get(`/categories/${slug}/groups`, { params })).data
