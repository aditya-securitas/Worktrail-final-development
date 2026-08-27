import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from './useAuth'
import type { MenuRoute } from './auth-context'
import { useState, useEffect } from 'react'
import ServiceRequest from './Components/ServiceRequest'
import AddEmployee from './Components/AddEmployee'
import Client from './Components/Client'
import Contributor from './Components/Contributor'
// import Privacypolicy from './Components/Privacypolicy' // No longer needed here
import Navbar from './Components/Navbar'
import Sidebar from './Components/Sidebar'
import { flattenMenu, menuPath } from './Components/sidebar-utils'

// Links for external menu entries
const EXTERNAL_LINKS: Record<string, string> = {
  'TermsandConditions.tsx': 'https://walsonsverify.com/assets/documents/Terms_and_condition.pdf',
  'Termsandconditions.tsx': 'https://walsonsverify.com/assets/documents/Terms_and_condition.pdf',
  'OtherServices.tsx': 'https://www.securitas.in/services/background-verification/',
  'Privacypolicy.tsx': 'https://www.securitas.in/about-us/privacy-policy/',
}

function MenuComponent({ item }: { item: MenuRoute | undefined }) {
  // This component will handle external links in Dashboard instead, so only render mapped components here
  if (!item) return null
  if (item.components === 'ServiceRequest.tsx') return <ServiceRequest />
  if (item.components === 'AddEmployee.tsx') return <AddEmployee />
  if (item.components === 'Client.tsx') return <Client />
  if (item.components === 'Contributor.tsx') return <Contributor />
  // Don't use Privacypolicy component anymore, open as external link via Dashboard logic
  return null
}

function Dashboard() {
  const { user, menu, isMenuLoading, menuError } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const menuItems = flattenMenu(menu)

  useEffect(() => {
    // Get the selected menu item based on the location
    const activeMenuItem = menuItems.find((item) => menuPath(item.Route) === location.pathname)

    // If the menu item points to an external link (T&C, OtherServices, Privacypolicy), open in new tab and navigate back to dashboard
    if (activeMenuItem && activeMenuItem.components && EXTERNAL_LINKS[activeMenuItem.components]) {
      window.open(EXTERNAL_LINKS[activeMenuItem.components], '_blank', 'noopener,noreferrer')
      // After opening the link, navigate back to /dashboard to avoid side navigation switching away
      // Use `replace: true` so history stack isn't polluted
      navigate('/dashboard', { replace: true })
    }
  // Only run when location.pathname changes
  // eslint-disable-next-line
  }, [location.pathname, menuItems, navigate])

  return (
    <main className={sidebarOpen ? 'dashboard-shell' : 'dashboard-shell sidebar-collapsed'}>
      <Navbar sidebarOpen={sidebarOpen} onToggleSidebar={() => setSidebarOpen((open) => !open)} />
      <div className="dashboard-layout">
        <Sidebar
          open={sidebarOpen}
          userType={user?.Usertype}
          menu={menu}
          isLoading={isMenuLoading}
          error={menuError}
        />
        <section className="dashboard-content">
          {location.pathname === '/dashboard' ? (
            <>
              <span className="form-kicker">{user?.Usertype} workspace</span>
              <h1>
                Welcome, <em>{user?.username}</em>
              </h1>
              <p>Your account is active and ready for meaningful work.</p>
              <div className="account-meta">
                <div>
                  <span>Account status</span>
                  <strong>Active</strong>
                </div>
                <div>
                  <span>Access level</span>
                  <strong>{user?.Usertype}</strong>
                </div>
                <div>
                  <span>Member since</span>
                  <strong>
                    {user?.created_at
                      ? new Date(user.created_at).toLocaleDateString()
                      : '-'}
                  </strong>
                </div>
              </div>
            </>
          ) : (
            // Only show the MenuComponent if the item is not an external link
            (() => {
              const activeMenuItem = menuItems.find((item) => menuPath(item.Route) === location.pathname)
              // If it's an external link component, render nothing (link handled in effect above)
              if (activeMenuItem && activeMenuItem.components && EXTERNAL_LINKS[activeMenuItem.components]) {
                return null
              }
              return <MenuComponent item={activeMenuItem} />
            })()
          )}
        </section>
      </div>
    </main>
  )
}

export default Dashboard
