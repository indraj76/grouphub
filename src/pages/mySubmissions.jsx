import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { lookupSubmissions } from '../services/groupService'
import { getCodes, addCode } from '../services/MySubmissions'
import { errMsg } from '../services/api'
import JoinButton from '../components/common/JoinButton'

const STYLE = {
  PENDING: 'bg-amber-100 text-amber-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
}
const LABEL = { PENDING: 'Pending review', APPROVED: 'Approved', REJECTED: 'Rejected' }

export default function MySubmissions() {
  document.title = 'My Submissions – GroupHub'
  const [items, setItems] = useState([]), [input, setInput] = useState(''), [msg, setMsg] = useState(''), [busy, setBusy] = useState(true)

  const load = async () => {
    setBusy(true)
    try {
      const codes = getCodes()
      setItems(codes.length ? await lookupSubmissions(codes) : [])
    } catch (x) { setMsg(errMsg(x)) } finally { setBusy(false) }
  }
  useEffect(() => { load() }, [])

  const check = async (ev) => {
    ev.preventDefault()
    const code = input.trim().toUpperCase()
    if (!code) return
    setMsg('')
    try {
      const found = await lookupSubmissions([code])
      if (!found.length) return setMsg('No submission found for that code.')
      addCode(code); setInput(''); load()
    } catch (x) { setMsg(errMsg(x)) }
  }

  return <div className="mx-auto max-w-2xl px-4 py-10">
    <h1 className="text-3xl font-extrabold">My Submissions</h1>
    <p className="mt-2 text-gray-600">Groups you submitted from this browser. Have a code from another device? Enter it below.</p>
    <form onSubmit={check} className="mt-5 flex gap-2">
      <input className="input flex-1" placeholder="GH-XXXXXXXX" value={input} onChange={(e) => setInput(e.target.value)} />
      <button className="btn-primary">Check status</button>
    </form>
    {msg && <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700" role="alert">{msg}</p>}
    <div className="mt-6 space-y-4">
      {!busy && items.length === 0 && <p className="text-gray-500">No submissions saved in this browser yet. <Link to="/add-group" className="font-semibold text-brand underline">Add your group</Link></p>}
      {items.map((g) => <div key={g.submissionCode} className="card p-5 hover:translate-y-0">
        <div className="flex items-start justify-between gap-3">
          <div><h2 className="font-bold">{g.name}</h2><p className="text-sm text-gray-500">{g.categoryName} · Code {g.submissionCode}</p></div>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STYLE[g.status]}`}>{LABEL[g.status]}</span>
        </div>
        {g.status === 'APPROVED' && <div className="mt-3 flex flex-wrap items-center gap-4">
          <Link to={`/groups/${g.slug}`} className="font-semibold text-brand underline">View listing</Link>
          <JoinButton group={g} />
        </div>}
        {g.status === 'REJECTED' && <p className="mt-3 text-sm text-gray-600">This group wasn't approved. You can <Link to="/add-group" className="font-semibold text-brand underline">submit it again</Link> with corrections.</p>}
        {g.status === 'PENDING' && <p className="mt-3 text-sm text-gray-600">Our team is reviewing it. Check back soon.</p>}
      </div>)}
    </div>
  </div>
}
