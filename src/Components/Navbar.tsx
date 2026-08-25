import { useNavigate } from 'react-router-dom'
import { useAuth } from '../useAuth'

type NavbarProps = {
  sidebarOpen: boolean
  onToggleSidebar: () => void
}

function Navbar({ sidebarOpen, onToggleSidebar }: NavbarProps) {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return <header className="dashboard-navbar"><div className="dashboard-brand"><div className="brand-mark">*</div><span>worktrail</span></div><div className="dashboard-actions"><button className="sidebar-toggle" type="button" aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'} onClick={onToggleSidebar}>{sidebarOpen ? '<' : '>'}</button><button className="logout-button" type="button" onClick={handleLogout}>Log out</button></div></header>
}

export default Navbar
