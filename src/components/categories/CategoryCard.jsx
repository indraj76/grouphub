import { Link } from 'react-router-dom'
import { ArrowRight, Hash } from 'lucide-react'
export default function CategoryCard({ category: c }) {
  return <Link to={`/category/${c.slug}`} className="card group flex items-center gap-4 p-5">
    <span className="grid h-12 w-12 place-items-center rounded-xl bg-brand-soft text-brand"><Hash size={22}/></span>
    <span className="flex-1"><span className="block font-bold">{c.name}</span><span className="text-xs text-gray-500">{c.groupCount ?? 0} groups</span></span>
    <ArrowRight size={18} className="text-gray-400 transition group-hover:translate-x-1 group-hover:text-brand"/></Link>
}
