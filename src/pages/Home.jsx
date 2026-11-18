import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, ShieldCheck, Compass, Tags, PlusCircle } from 'lucide-react'
import useAsync from '../components/common/useAsync'
import { getTrending, getGroups } from '../services/groupService'
import { getCategories } from '../services/categoryService'
import { getPublicStats } from '../services/contentService'
import GroupGrid from '../components/groups/GroupGrid'; import CategoryCard from '../components/categories/CategoryCard'
import { CardSkeletons } from '../components/common/Skeleton'; import ErrorState from '../components/common/ErrorState'
const tags = ['Education', 'Technology', 'Jobs', 'Business', 'Entertainment', 'Gaming']
const Section = ({ title, link, children }) => <section className="mx-auto max-w-7xl px-4 pt-16"><div className="mb-6 flex items-end justify-between"><h2 className="text-2xl font-extrabold">{title}</h2>{link && <Link to={link} className="text-sm font-semibold text-brand hover:underline">View all</Link>}</div>{children}</section>
const List = ({ state }) => state.loading ? <CardSkeletons n={3}/> : state.error ? <ErrorState message={state.error} onRetry={state.retry}/> : <GroupGrid groups={(state.data?.content || state.data || []).slice(0, 6)}/>
export default function Home() {
  document.title = 'GroupHub – Find Telegram Groups'
  const [q, setQ] = useState(''), nav = useNavigate()
  const trending = useAsync(getTrending, []), recent = useAsync(() => getGroups({ sort: 'recent', size: 6 }), []), cats = useAsync(getCategories, []), stats = useAsync(getPublicStats, [])
  const go = (v) => nav(`/search?q=${encodeURIComponent(v)}`)
  return <>
    <section className="relative overflow-hidden border-b border-gray-200 bg-gradient-to-b from-brand-soft to-white">
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-green-200/40 blur-3xl"/>
      <div className="relative mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Find Your Community. <span className="text-brand">Join the Conversation.</span></h1>
        <p className="mt-4 text-lg text-gray-600">Discover thousands of active Telegram groups across every interest, passion, and community.</p>
        <form onSubmit={(e) => { e.preventDefault(); q.trim() && go(q.trim()) }} className="mx-auto mt-8 flex gap-2 rounded-2xl border border-gray-200 bg-white p-2 shadow-md transition focus-within:ring-4 focus-within:ring-green-100">
          <Search className="ml-2 self-center text-gray-400" size={20}/><input aria-label="Search groups" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search groups, categories, or interests..." className="min-w-0 flex-1 bg-transparent px-2 outline-none"/>
          <button className="btn-primary">Search</button></form>
        <div className="mt-5 flex flex-wrap justify-center gap-2">{tags.map(t => <button key={t} onClick={() => go(t)} className="rounded-full border border-gray-200 bg-white px-3 py-1 text-sm text-gray-600 transition hover:border-brand hover:text-brand">{t}</button>)}</div>
      </div></section>
    <section className="mx-auto -mt-2 grid max-w-5xl grid-cols-2 gap-3 px-4 sm:grid-cols-4">{stats.error ? null : [['Approved groups',stats.data?.totalGroups],['Categories',stats.data?.totalCategories],['Group views',stats.data?.totalViews],['Countries',stats.data?.totalCountries]].map(([label,value])=><div key={label} className="card p-4 text-center hover:translate-y-0"><p className="text-2xl font-extrabold text-brand">{value==null?'—':Number(value).toLocaleString()}</p><p className="mt-1 text-xs font-semibold text-gray-500">{label}</p></div>)}</section>
    <Section title="Browse Categories" link="/categories">{cats.loading ? <CardSkeletons n={6}/> : cats.error ? <ErrorState message={cats.error} onRetry={cats.retry}/> : <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{cats.data.slice(0, 12).map(c => <CategoryCard key={c.id} category={c}/>)}</div>}</Section>
    <Section title="Trending Groups" link="/trending"><List state={trending}/></Section>
    <Section title="Recently Added" link="/groups"><List state={recent}/></Section>
    <Section title="Why Choose GroupHub?"><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {[[Compass, 'Discover communities easily'], [ShieldCheck, 'Explore verified listings'], [Tags, 'Browse by interests'], [PlusCircle, 'Submit your own group']].map(([I, t]) => <div key={t} className="card p-6"><I className="text-brand"/><p className="mt-3 font-bold">{t}</p></div>)}</div></Section>
    <section className="mx-auto mt-16 max-w-7xl px-4"><div className="rounded-3xl bg-ink px-6 py-14 text-center text-white"><h2 className="text-3xl font-extrabold">Have a Great Community?</h2>
      <p className="mx-auto mt-3 max-w-xl text-gray-300">Share your Telegram group and help others discover your community.</p><Link to="/add-group" className="btn-primary mt-6">Submit Your Telegram Group</Link></div></section>
  </>
}
