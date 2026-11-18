import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import useAsync from '../components/common/useAsync'
import { getGroups, searchGroups } from '../services/groupService'
import { getCategories, getCategoryGroups } from '../services/categoryService'
import { COUNTRIES, LANGUAGES } from '../data/geo'
import SearchSelect from '../components/common/SearchSelect'
import GroupGrid from '../components/groups/GroupGrid'; import Pagination from '../components/common/Pagination'
import { CardSkeletons } from '../components/common/Skeleton'; import ErrorState from '../components/common/ErrorState'
export default function Groups({ searchMode, byCategory }) {
  const { slug } = useParams(), [sp, setSp] = useSearchParams()
  const p = Object.fromEntries(sp), page = +p.page || 0
  const [q, setQ] = useState(p.q || '')
  const set = (patch) => { const n = { ...p, ...patch }; Object.keys(n).forEach(k => !n[k] && delete n[k]); setSp(n) }
  useEffect(() => { setQ(p.q || '') }, [p.q])
  useEffect(() => { const t = setTimeout(() => q !== (p.q || '') && set({ q, page: '' }), 400); return () => clearTimeout(t) }, [q]) // debounce
  document.title = (searchMode ? 'Search' : byCategory ? 'Category' : 'Explore Groups') + ' – GroupHub'
  const cats = useAsync(getCategories, [])
  const res = useAsync(() => byCategory ? getCategoryGroups(slug, { ...p, page }) : (searchMode ? searchGroups : getGroups)({ ...p, page }), [sp.toString(), slug])
  const d = res.data, list = d?.content || [], hasFilters = ['q', 'category', 'country', 'language', 'sort'].some(k => p[k])
  const catOpts = (cats.data || []).map(c => ({ value: c.slug, label: c.name }))
  return <div className="mx-auto max-w-7xl px-4 py-10">
    <h1 className="text-3xl font-extrabold">{searchMode ? (p.q ? `Results for "${p.q}"` : 'Search') : byCategory ? 'Category groups' : 'Explore Telegram Groups'}</h1>
    {d?.totalElements != null && <p className="mt-1 text-sm text-gray-500">{d.totalElements} groups found</p>}
    <div className="mt-6 grid gap-3 md:grid-cols-3 lg:grid-cols-5">
      <input className="input" aria-label="Search" placeholder="Search groups..." value={q} onChange={(e) => setQ(e.target.value)}/>
      {!byCategory && <SearchSelect label="Category" options={catOpts} value={p.category} allLabel="All Categories" onChange={(v) => set({ category: v, page: '' })}/>}
      <SearchSelect label="Country" options={COUNTRIES} value={p.country} allLabel="All Countries" onChange={(v) => set({ country: v, page: '' })}/>
      <SearchSelect label="Language" options={LANGUAGES} value={p.language} allLabel="All Languages" onChange={(v) => set({ language: v, page: '' })}/>
      <select aria-label="Sort" className="input" value={p.sort || ''} onChange={(e) => set({ sort: e.target.value })}><option value="">Recently Added</option><option value="views">Most Viewed</option><option value="trending">Trending</option></select>
    </div>
    {hasFilters && <button className="mt-3 text-sm font-semibold text-brand hover:underline" onClick={() => { setQ(''); setSp(searchMode && p.q ? {} : {}) }}>Clear all filters</button>}
    <div className="mt-6">{res.loading ? <CardSkeletons/> : res.error ? <ErrorState message={res.error} onRetry={res.retry}/> : !list.length ? <div className="card py-16 text-center text-gray-500 hover:translate-y-0">No groups match your filters.</div> : <GroupGrid groups={list}/>}</div>
    <Pagination page={page} totalPages={d?.totalPages} onChange={(n) => set({ page: n || '' })}/>
  </div>
}
