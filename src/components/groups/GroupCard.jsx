import { Link } from 'react-router-dom'
import { Eye } from 'lucide-react'
import PlatformBadge from './PlatformBadge'; import { flag } from '../../data/geo'
export default function GroupCard({ group: g }) {
  return <article className="card flex flex-col p-5">
    <div className="flex items-start gap-3">
      {g.imageUrl ? <img src={g.imageUrl} alt="" loading="lazy" className="h-12 w-12 rounded-xl object-cover"/> : <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-sky-500 text-lg font-bold text-white">{g.name?.[0]?.toUpperCase()}</div>}
      <div className="min-w-0"><h3 className="truncate font-bold">{g.name}</h3><div className="mt-1 flex items-center gap-2"><PlatformBadge/><span className="truncate text-xs text-gray-500">{g.categoryName || g.category}</span></div></div>
    </div>
    <p className="mt-3 line-clamp-2 flex-1 text-sm text-gray-600">{g.description}</p>
    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">{g.countryCode && <span>{flag(g.countryCode)} {g.countryName}</span>}{g.languageName && <span>🗣 {g.languageName}</span>}{g.views != null && <span className="flex items-center gap-1"><Eye size={14}/>{g.views.toLocaleString()}</span>}</div>
    <div className="mt-4 flex items-center gap-3"><Link to={`/groups/${g.slug}`} className="btn-primary flex-1">Join Telegram Group</Link><Link to={`/groups/${g.slug}`} className="text-sm font-medium text-gray-600 hover:text-brand">Details</Link></div>
  </article>
}
