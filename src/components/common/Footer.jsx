import { Link } from 'react-router-dom'
import { MessagesSquare } from 'lucide-react'
export default function Footer() {
  const col = (t, items) => <div><h3 className="mb-3 text-sm font-bold">{t}</h3><ul className="space-y-2 text-sm text-gray-600">{items.map(([to, l]) => <li key={l}><Link className="hover:text-brand" to={to}>{l}</Link></li>)}</ul></div>
  return <footer className="mt-20 border-t border-gray-200 bg-white"><div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-4">
    <div><div className="flex items-center gap-2 font-extrabold"><span className="grid h-8 w-8 place-items-center rounded-lg bg-brand text-white"><MessagesSquare size={16}/></span>GroupHub</div>
      <p className="mt-3 text-sm text-gray-600">A public directory of Telegram groups, organised by interest.</p></div>
    {col('Quick Links', [['/groups', 'Explore Groups'], ['/trending', 'Trending'], ['/add-group', 'Submit Group']])}
    {col('Categories', [['/categories', 'All categories']])}
    {col('Company', [['/about', 'About Us'], ['/contact', 'Contact'], ['/privacy-policy', 'Privacy Policy'], ['/terms', 'Terms & Conditions']])}
  </div><p className="border-t border-gray-100 py-5 text-center text-xs text-gray-500">© {new Date().getFullYear()} GroupHub. All rights reserved.</p></footer>
}
