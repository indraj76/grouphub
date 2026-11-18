import { useEffect, useRef, useState } from 'react'
import { ChevronDown, X } from 'lucide-react'
export default function SearchSelect({ options = [], value, onChange, placeholder = 'Select…', allLabel, label, error }) {
  const [open, setOpen] = useState(false), [q, setQ] = useState(''), ref = useRef()
  useEffect(() => { const f = (e) => !ref.current?.contains(e.target) && setOpen(false); document.addEventListener('mousedown', f); return () => document.removeEventListener('mousedown', f) }, [])
  const sel = options.find(o => String(o.value) === String(value))
  const shown = options.filter(o => o.label.toLowerCase().includes(q.toLowerCase()))
  const pick = (v) => { onChange(v); setOpen(false); setQ('') }
  return <div ref={ref} className="relative">
    <button type="button" aria-label={label} aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen(!open)} className={`input flex items-center justify-between text-left ${error ? 'border-red-400' : ''}`}>
      <span className={`truncate ${sel ? '' : 'text-gray-400'}`}>{sel ? `${sel.flag ? sel.flag + ' ' : ''}${sel.label}` : (allLabel || placeholder)}</span>
      <span className="flex items-center gap-1">{sel && allLabel && <X size={14} className="text-gray-400" onClick={(e) => { e.stopPropagation(); pick('') }}/>}<ChevronDown size={16} className="text-gray-400"/></span></button>
    {open && <div className="absolute z-30 mt-1 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
      <input autoFocus className="w-full border-b border-gray-100 px-3 py-2 text-sm outline-none" placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)}/>
      <ul role="listbox" className="max-h-56 overflow-auto py-1 text-sm">
        {allLabel && <li><button type="button" className="w-full px-3 py-2 text-left text-gray-500 hover:bg-gray-50" onClick={() => pick('')}>{allLabel}</button></li>}
        {shown.map(o => <li key={o.value}><button type="button" role="option" aria-selected={String(o.value) === String(value)} className="w-full px-3 py-2 text-left hover:bg-brand-soft" onClick={() => pick(o.value)}>{o.flag && <span className="mr-2">{o.flag}</span>}{o.label}</button></li>)}
        {!shown.length && <li className="px-3 py-3 text-gray-500">No matches</li>}</ul></div>}
  </div>
}
