import { useLocation } from 'react-router-dom'
import { useAuth } from './useAuth'
import type { MenuRoute } from './auth-context'
import { useState } from 'react'
import ServiceRequest from './Components/ServiceRequest'
import Navbar from './Components/Navbar'
import Sidebar from './Components/Sidebar'
import { flattenMenu, menuPath } from './Components/sidebar-utils'

function MenuComponent({ item }: { item: MenuRoute | undefined }) {
  if (item?.components === 'ServiceRequest.tsx') return <ServiceRequest />
  return null
}

function Dashboard() {
  const { user, menu, isMenuLoading, menuError } = useAuth()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const menuItems = flattenMenu(menu)

  return <main className={sidebarOpen ? 'dashboard-shell' : 'dashboard-shell sidebar-collapsed'}>
    <Navbar sidebarOpen={sidebarOpen} onToggleSidebar={() => setSidebarOpen((open) => !open)} />
    <div className="dashboard-layout"><Sidebar open={sidebarOpen} userType={user?.Usertype} menu={menu} isLoading={isMenuLoading} error={menuError} /><section className="dashboard-content">{location.pathname === '/dashboard' ? <><span className="form-kicker">{user?.Usertype} workspace</span><h1>Welcome, <em>{user?.username}</em></h1><p>Your account is active and ready for meaningful work.</p><div className="account-meta"><div><span>Account status</span><strong>Active</strong></div><div><span>Access level</span><strong>{user?.Usertype}</strong></div><div><span>Member since</span><strong>{user?.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}</strong></div></div></> : <MenuComponent item={menuItems.find((item) => menuPath(item.Route) === location.pathname)} />}</section></div>
  </main>
}

export default Dashboard
