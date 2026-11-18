import { Link } from 'react-router-dom'
export default function NotFound() { document.title = 'Not found – GroupHub'; return <div className="py-24 text-center"><p className="text-6xl font-extrabold text-brand">404</p><p className="mt-2 text-gray-600">This page doesn't exist.</p><Link to="/" className="btn-primary mt-6">Back home</Link></div> }
