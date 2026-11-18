import { useState } from 'react'
import { Link } from 'react-router-dom'
import useAsync from '../components/common/useAsync'
import SearchSelect from '../components/common/SearchSelect'
import { submitGroup } from '../services/groupService'; import { getCategories } from '../services/categoryService'; import { errMsg } from '../services/api'
import { addCode } from '../services/mySubmissions.js';
import { COUNTRIES, LANGUAGES, countryName, languageName } from '../data/geo'
const TG = /^https:\/\/(t\.me|telegram\.me)\/(\+|joinchat\/)?[\w-]{4,}$/
const empty = { name: '', inviteLink: '', categoryId: '', description: '', tags: '', countryCode: '', languageCode: '', contactEmail: '' }
const Field = ({ label, error, children }) => <div><span className="mb-1 block text-sm font-semibold">{label}</span>{children}{error && <span className="mt-1 block text-xs text-red-600">{error}</span>}</div>
export default function AddGroup() {
  document.title = 'Add Your Telegram Group – GroupHub'
  const [f, setF] = useState(empty), [err, setErr] = useState({}), [busy, setBusy] = useState(false), [done, setDone] = useState(false), [apiErr, setApiErr] = useState(''), [code, setCode] = useState('')
  const cats = useAsync(getCategories, [])
  const on = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const validate = () => { const e = {}
    if (f.name.trim().length < 3 || f.name.length > 80) e.name = 'Name must be 3–80 characters'
    if (!TG.test(f.inviteLink.trim())) e.inviteLink = 'Enter a valid Telegram link, e.g. https://t.me/yourgroup or https://t.me/+AbCdEf'
    if (!f.categoryId) e.categoryId = 'Choose a category'
    if (f.description.trim().length < 20 || f.description.length > 500) e.description = 'Description must be 20–500 characters'
    if (!f.countryCode) e.countryCode = 'Choose a country'; if (!f.languageCode) e.languageCode = 'Choose a language'; if (f.contactEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.contactEmail.trim())) e.contactEmail = 'Enter a valid email address'; return e }
  const submit = async (ev) => { ev.preventDefault(); const e = validate(); setErr(e); if (Object.keys(e).length) return
    setBusy(true); setApiErr('')
    try {
      const res = await submitGroup({ name: f.name.trim(), inviteLink: f.inviteLink.trim(), description: f.description.trim(), categoryId: +f.categoryId, tags: f.tags.split(',').map(t => t.trim()).filter(Boolean),
        countryCode: f.countryCode, countryName: countryName(f.countryCode), languageCode: f.languageCode, languageName: languageName(f.languageCode), contactEmail: f.contactEmail.trim() || null })
      const data = res?.data ?? res
      if (data?.submissionCode) { addCode(data.submissionCode); setCode(data.submissionCode) }
      setDone(true)
    } catch (x) { setApiErr(errMsg(x)) } finally { setBusy(false) } }
  if (done) return <div className="mx-auto max-w-xl px-4 py-20 text-center">
    <h1 className="text-2xl font-extrabold text-brand">Submitted!</h1>
    <p className="mt-3 text-gray-600">Your group has been submitted successfully. It will be reviewed before appearing publicly.</p>
    {code && <div className="card mt-6 p-5 hover:translate-y-0">
      <p className="text-sm text-gray-600">Your submission code. Save it to check your status later:</p>
      <p className="mt-2 select-all text-2xl font-extrabold tracking-wider">{code}</p>
      <button type="button" className="btn-primary mt-3" onClick={() => navigator.clipboard?.writeText(code)}>Copy code</button>
    </div>}
    <Link to="/my-submissions" className="mt-6 inline-block font-semibold text-brand underline">Check my submissions</Link>
  </div>
  return <div className="mx-auto max-w-2xl px-4 py-10"><h1 className="text-3xl font-extrabold">Add Your Telegram Group</h1>
    <form onSubmit={submit} noValidate className="card mt-6 space-y-5 p-6 hover:translate-y-0">
      <Field label="Group Name" error={err.name}><input className="input" maxLength={80} value={f.name} onChange={on('name')}/></Field>
      <Field label="Telegram Invite Link" error={err.inviteLink}><input className="input" type="url" value={f.inviteLink} onChange={on('inviteLink')} placeholder="https://t.me/..."/></Field>
      <Field label="Category" error={err.categoryId}><SearchSelect label="Category" placeholder="Select category…" options={(cats.data || []).map(c => ({ value: c.id, label: c.name }))} value={f.categoryId} onChange={(v) => setF({ ...f, categoryId: v })} error={err.categoryId}/></Field>
      <Field label={`Description (${f.description.length}/500)`} error={err.description}><textarea className="input" rows={4} maxLength={500} value={f.description} onChange={on('description')}/></Field>
      <Field label="Tags (comma separated)"><input className="input" value={f.tags} onChange={on('tags')}/></Field>
      <Field label="Contact Email (optional)" error={err.contactEmail}><input className="input" type="email" autoComplete="email" placeholder="you@example.com" value={f.contactEmail} onChange={on('contactEmail')}/><span className="mt-1 block text-xs text-gray-500">Only used if our moderation team needs to contact you.</span></Field>
      <div className="grid gap-4 sm:grid-cols-2"><Field label="Country" error={err.countryCode}><SearchSelect label="Country" placeholder="Select country…" options={COUNTRIES} value={f.countryCode} onChange={(v) => setF({ ...f, countryCode: v })} error={err.countryCode}/></Field>
        <Field label="Language" error={err.languageCode}><SearchSelect label="Language" placeholder="Select language…" options={LANGUAGES} value={f.languageCode} onChange={(v) => setF({ ...f, languageCode: v })} error={err.languageCode}/></Field></div>
      {apiErr && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700" role="alert">{apiErr}</p>}
      <button className="btn-primary w-full" disabled={busy}>{busy ? 'Submitting…' : 'Submit Group'}</button></form></div>
}
