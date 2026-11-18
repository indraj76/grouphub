import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ExternalLink, Flag, ShieldAlert } from 'lucide-react'
import useAsync from '../components/common/useAsync'
import { getGroup, reportGroup, getRelated } from '../services/groupService'
import PlatformBadge from '../components/groups/PlatformBadge'; import GroupGrid from '../components/groups/GroupGrid'; import ErrorState from '../components/common/ErrorState'; import { Skeleton } from '../components/common/Skeleton'
import { flag } from '../data/geo'
export default function GroupDetails() {
  const { slug } = useParams(), { data: g, loading, error, retry } = useAsync(() => getGroup(slug), [slug])
  const rel = useAsync(() => g ? getRelated(g) : Promise.resolve([]), [g?.id])
  const [confirm, setConfirm] = useState(false), [msg, setMsg] = useState('')
  if (loading) return <div className="mx-auto max-w-3xl space-y-4 px-4 py-10"><Skeleton className="h-16"/><Skeleton className="h-40"/></div>
  if (error || !g) return <div className="mx-auto max-w-3xl px-4 py-10"><ErrorState message={error || 'Group not found'} onRetry={retry}/></div>
  document.title = `${g.name} – GroupHub`
  const report = async () => { try { await reportGroup(g.id, { reason: 'User report' }); setMsg('Thanks, our team will review this group.') } catch { setMsg('Could not send report. Try again.') } }
  return <div className="mx-auto max-w-3xl px-4 py-10"><div className="card p-6 hover:translate-y-0">
    <PlatformBadge/><h1 className="mt-3 text-3xl font-extrabold">{g.name}</h1>
    <p className="mt-1 text-sm text-gray-500">{g.categoryName || g.category}{g.countryCode && ` · ${flag(g.countryCode)} ${g.countryName}`}{g.languageName && ` · ${g.languageName}`} · {g.views?.toLocaleString()} views{g.createdAt && ` · Added ${new Date(g.createdAt).toLocaleDateString()}`}</p>
    <p className="mt-4 text-gray-700">{g.description}</p>
    <div className="mt-4 flex flex-wrap gap-2">{g.tags?.map(t => <Link key={t} to={`/search?q=${t}`} className="rounded-full bg-gray-100 px-3 py-1 text-xs hover:bg-green-100">#{t}</Link>)}</div>
    <div className="mt-6 flex gap-3"><button className="btn-primary" onClick={() => setConfirm(true)}><ExternalLink size={16}/>Join Telegram Group</button><button className="btn-ghost" onClick={report}><Flag size={16}/>Report Group</button></div>
    {msg && <p className="mt-3 text-sm text-gray-600" role="status">{msg}</p>}
    {confirm && <div role="dialog" className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm"><p className="flex gap-2 font-semibold"><ShieldAlert size={18}/>You're leaving GroupHub</p><p className="mt-1 text-gray-700">Only join groups you trust and never share personal or financial details.</p>
      <div className="mt-3 flex gap-2"><a className="btn-primary" href={g.inviteLink} target="_blank" rel="noopener noreferrer nofollow" onClick={() => setConfirm(false)}>Continue to Telegram</a><button className="btn-ghost" onClick={() => setConfirm(false)}>Cancel</button></div></div>}
  </div>
  {rel.data?.length > 0 && <section className="mt-10"><h2 className="mb-4 text-xl font-extrabold">Related Telegram groups</h2><GroupGrid groups={rel.data}/></section>}</div>
}
