import { Link, useLocation } from 'react-router-dom'
import type { MenuRoute } from '../auth-context'
import { flattenMenu, labelForRoute, menuPath } from './sidebar-utils'

type SidebarProps = {
  open: boolean
  userType?: string
  menu: MenuRoute[]
  isLoading: boolean
  error: string
}

function Sidebar({ open, userType, menu, isLoading, error }: SidebarProps) {
  const location = useLocation()
  const menuItems = flattenMenu(menu)

  if (!open) return null

  return <aside className="dashboard-sidebar">
    <span className="sidebar-label">{userType} menu</span>
    {isLoading ? <p className="menu-empty">Loading menu...</p> : menuItems.length > 0 ? <nav>{menuItems.map((item) => { const path = menuPath(item.Route); return <Link className={location.pathname === path ? 'menu-link active' : 'menu-link'} to={path} key={`${item.Route}-${item.components}`}><span>{labelForRoute(item)}</span></Link> })}</nav> : <p className="menu-empty">{error || 'No menu items available.'}</p>}
    
  </aside>
}

export default Sidebar
