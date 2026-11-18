import { Routes, Route, Outlet, Link } from 'react-router-dom'
import Navbar from '../components/common/Navbar'; import Footer from '../components/common/Footer'
import Home from '../pages/Home'; import Groups from '../pages/Groups'; import GroupDetails from '../pages/GroupDetails'
import Categories from '../pages/Categories'; import AddGroup from '../pages/AddGroup'; import NotFound from '../pages/NotFound'
import MySubmissions from '../pages/MySubmissions'
import ManageContacts from '../pages/admin/ManageContacts'; import About from '../pages/About'; import Contact from '../pages/Contact'; import PrivacyPolicy from '../pages/PrivacyPolicy'; import Terms from '../pages/Terms'
import AdminLogin from '../pages/admin/AdminLogin'; import AdminDashboard from '../pages/admin/AdminDashboard'; import ManageGroups from '../pages/admin/ManageGroups'; import ManageCategories from '../pages/admin/ManageCategories'; import ManageReports from '../pages/admin/ManageReports'; import ProtectedRoute from './ProtectedRoute'

const Public = () => (
  <>
    <Navbar/>
    <main className="min-h-[70vh] animate-fade"><Outlet/></main>
    <Footer/>
    <Link to="/my-submissions" className="btn-primary fixed bottom-5 right-5 z-50 shadow-lg">My Submissions</Link>
  </>
)

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<Public/>}>
        <Route index element={<Home/>}/>
        <Route path="groups" element={<Groups/>}/>
        <Route path="search" element={<Groups searchMode/>}/>
        <Route path="groups/:slug" element={<GroupDetails/>}/>
        <Route path="categories" element={<Categories/>}/>
        <Route path="category/:slug" element={<Groups byCategory/>}/>
        <Route path="trending" element={<Groups/>}/>
        <Route path="add-group" element={<AddGroup/>}/>
        <Route path="my-submissions" element={<MySubmissions/>}/>
        <Route path="about" element={<About/>}/>
        <Route path="contact" element={<Contact/>}/>
        <Route path="privacy-policy" element={<PrivacyPolicy/>}/>
        <Route path="terms" element={<Terms/>}/>
        <Route path="*" element={<NotFound/>}/>
      </Route>
      <Route path="admin/login" element={<AdminLogin/>}/>
      <Route element={<ProtectedRoute/>}>
        <Route path="admin/dashboard" element={<AdminDashboard/>}/>
        <Route path="admin/groups" element={<ManageGroups/>}/>
        <Route path="admin/categories" element={<ManageCategories/>}/>
        <Route path="admin/reports" element={<ManageReports/>}/>
        <Route path="admin/contacts" element={<ManageContacts/>}/>
      </Route>
    </Routes>
  )
}