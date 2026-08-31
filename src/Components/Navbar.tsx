import { useNavigate } from 'react-router-dom'
import { useAuth } from '../useAuth'
import { Menu, LogOut } from 'lucide-react'

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

  return (
    <header className="flex items-center justify-between w-full h-16 mb-6 select-none bg-transparent">
      {/* Toggle button and Brand */}
      <div className="flex items-center gap-4">
        <button
          className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#031f30] transition-colors cursor-pointer select-none focus:outline-none"
          type="button"
          aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          onClick={onToggleSidebar}
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>

          <div className="flex items-center gap-2">
            Welcome in, (Aditya Raghav)
          </div>
          <span className='text-[11px] font-bold text-salte-400 ml-1'>(TCS)</span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex items-center gap-3">
        {/* <button
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer rounded-full bg-slate-100 hover:bg-slate-200 focus:outline-none"
          type="button"
          onClick={handleLogout}
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Log out</span>
        </button> */}
      </div>
    </header>
  )
}

export default Navbar
