import { useState } from 'react'
import { Link } from 'react-router-dom'
import useAsync from '../../components/common/useAsync'
import { getAdminGroups, approveGroup, rejectGroup, deleteGroup } from '../../services/adminService'
import { getCategories } from '../../services/categoryService'; import { COUNTRIES, LANGUAGES, flag } from '../../data/geo'
import SearchSelect from '../../components/common/SearchSelect'; import Pagination from '../../components/common/Pagination'; import ErrorState from '../../components/common/ErrorState'
export default function ManageGroups() {
  const [f, setF] = useState({ q: '', category: '', country: '', language: '', status: '', page: 0 }), set = (p) => setF({ ...f, page: 0, ...p })
  const cats = useAsync(getCategories, []), res = useAsync(() => getAdminGroups(Object.fromEntries(Object.entries(f).filter(([, v]) => v !== ''))), [JSON.stringify(f)])
  const act = (fn, id) => async () => { if (fn === deleteGroup && !confirm('Delete this group?')) return; try { await fn(id); res.retry() } catch { alert('Action failed') } }
  const list = res.data?.content || []
  return <div className="mx-auto max-w-7xl px-4 py-8"><div className="flex items-center justify-between"><h1 className="text-2xl font-extrabold">Manage Groups</h1><Link className="btn-ghost" to="/admin/dashboard">Dashboard</Link></div>
    <div className="mt-5 grid gap-3 md:grid-cols-3 lg:grid-cols-5"><input className="input" aria-label="Search" placeholder="Search…" value={f.q} onChange={(e) => set({ q: e.target.value })}/>
      <SearchSelect label="Category" allLabel="All Categories" options={(cats.data || []).map(c => ({ value: c.slug, label: c.name }))} value={f.category} onChange={(v) => set({ category: v })}/>
      <SearchSelect label="Country" allLabel="All Countries" options={COUNTRIES} value={f.country} onChange={(v) => set({ country: v })}/>
      <SearchSelect label="Language" allLabel="All Languages" options={LANGUAGES} value={f.language} onChange={(v) => set({ language: v })}/>
      <select className="input" aria-label="Status" value={f.status} onChange={(e) => set({ status: e.target.value })}><option value="">All Statuses</option><option>PENDING</option><option>APPROVED</option><option>REJECTED</option></select></div>
    {res.error ? <div className="mt-6"><ErrorState message={res.error} onRetry={res.retry}/></div> : <div className="card mt-6 overflow-x-auto hover:translate-y-0"><table className="w-full min-w-[1050px] text-left text-sm"><thead className="border-b bg-gray-50 text-xs uppercase text-gray-500"><tr>{['Group', 'Invite Link', 'Category', 'Country', 'Language', 'Contact Email', 'Submitted', 'Status', ''].map(h => <th key={h} className="p-3">{h}</th>)}</tr></thead>
      <tbody>{list.map(g => <tr key={g.id} className="border-b last:border-0"><td className="p-3 font-semibold">{g.name}</td><td className="max-w-[160px] truncate p-3"><a className="text-sky-600 hover:underline" href={g.inviteLink} target="_blank" rel="noopener noreferrer">{g.inviteLink}</a></td>
        <td className="p-3">{g.categoryName || g.category}</td><td className="p-3">{flag(g.countryCode)} {g.countryName}</td><td className="p-3">{g.languageName}</td><td className="p-3">{g.contactEmail || '—'}</td><td className="p-3">{g.createdAt && new Date(g.createdAt).toLocaleDateString()}</td><td className="p-3">{g.status}</td>
        <td className="flex gap-1 p-3"><button className="btn-primary !px-3 !py-1" onClick={act(approveGroup, g.id)}>Approve</button><button className="btn-ghost !px-3 !py-1" onClick={act(rejectGroup, g.id)}>Reject</button><button className="btn-ghost !px-3 !py-1 text-red-600" onClick={act(deleteGroup, g.id)}>Delete</button></td></tr>)}</tbody></table>
      {!res.loading && !list.length && <p className="p-6 text-center text-gray-500">No groups found.</p>}</div>}
    <Pagination page={f.page} totalPages={res.data?.totalPages} onChange={(n) => setF({ ...f, page: n })}/></div>
}
