import { useEffect, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { MessagesSquare, Menu, X, Search } from 'lucide-react'
const links = [['/', 'Home'], ['/groups', 'Explore Groups'], ['/categories', 'Categories'], ['/trending', 'Trending']]
export default function Navbar() {
  const [open, setOpen] = useState(false), [scrolled, setScrolled] = useState(false), nav = useNavigate()
  useEffect(() => { const f = () => setScrolled(window.scrollY > 8); f(); window.addEventListener('scroll', f); return () => window.removeEventListener('scroll', f) }, [])
  const cls = ({ isActive }) => `block py-2 text-sm font-medium transition hover:text-brand ${isActive ? 'text-brand' : 'text-gray-600'}`
  return <header className={`sticky top-0 z-40 bg-white/90 backdrop-blur ${scrolled ? 'border-b border-gray-200 shadow-sm' : ''}`}>
    <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
      <Link to="/" className="flex items-center gap-2 text-lg font-extrabold"><span className="grid h-9 w-9 place-items-center rounded-xl bg-brand text-white"><MessagesSquare size={20}/></span>GroupHub</Link>
      <nav className="hidden items-center gap-8 md:flex" aria-label="Main">{links.map(([to, l]) => <NavLink key={to} to={to} end={to === '/'} className={cls}>{l}</NavLink>)}</nav>
      <div className="flex items-center gap-2">
        <button aria-label="Search" onClick={() => nav('/search')} className="rounded-xl p-2 hover:bg-gray-100"><Search size={20}/></button>
        <Link to="/add-group" className="btn-primary hidden sm:inline-flex">Add Your Group</Link>
        <button aria-label="Menu" className="rounded-xl p-2 hover:bg-gray-100 md:hidden" onClick={() => setOpen(!open)}>{open ? <X/> : <Menu/>}</button>
      </div>
    </div>
    <div className={`overflow-hidden bg-white transition-all md:hidden ${open ? 'max-h-96 border-t border-gray-100' : 'max-h-0'}`}>
      <div className="flex flex-col p-4" onClick={() => setOpen(false)}>
        {links.map(([to, l]) => <NavLink key={to} to={to} end={to === '/'} className={cls}>{l}</NavLink>)}
        <Link to="/my-Submissions" className="btn-primary mt-2">My Submissions </Link></div></div>
  </header>
}
