import { useEffect, useMemo, useState } from 'react'
import type { ComponentType } from 'react'
import {
  FileJson,
  Globe,
  Home,
  Image as ImageIcon,
  Link2,
  LogOut,
  QrCode,
  Search,
  Settings,
  Wrench,
} from 'lucide-react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { api, removeAccessToken } from '../../services/api'

interface NavItem {
  label: string
  path: string
  icon: ComponentType<{ className?: string }>
}

interface AuthMeResponse {
  id?: string
  email?: string
}

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: Home },
  { label: 'QR Generator', path: '/dashboard/qr-generator', icon: QrCode },
  { label: 'URL Shortener', path: '/dashboard/url-shortener', icon: Link2 },
  { label: 'JSON Formatter', path: '/dashboard/json-formatter', icon: FileJson },
  { label: 'IP Analyzer', path: '/dashboard/ip-analyzer', icon: Globe },
  { label: 'File Converter', path: '/dashboard/file-converter', icon: ImageIcon },
  { label: 'Settings', path: '/dashboard/settings', icon: Settings },
]

const DashboardLayout = () => {
  const navigate = useNavigate()
  const [userEmail, setUserEmail] = useState('user@webutilities.local')

  useEffect(() => {
    const loadMe = async () => {
      try {
        const { data } = await api.get<AuthMeResponse>('/auth/me')
        if (data.email) {
          setUserEmail(data.email)
        }
      } catch {
        // Keep fallback value. Dashboard still works with local token guard.
      }
    }

    loadMe()
  }, [])

  const userInitials = useMemo(() => {
    const first = userEmail[0] ?? 'U'
    return first.toUpperCase()
  }, [userEmail])

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout')
    } catch {
      // local cleanup below is still sufficient
    } finally {
      removeAccessToken()
      navigate('/login', { replace: true })
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white md:flex">
      <aside className="border-b border-gray-800 bg-gray-900 md:sticky md:top-0 md:h-screen md:w-64 md:border-b-0 md:border-r">
        <div className="flex h-[73px] items-center border-b border-gray-800 px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
              <Wrench className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-lg font-semibold">Utilify</p>
              <p className="text-xs text-gray-400">Dashboard</p>
            </div>
          </div>
        </div>

        <nav className="grid grid-cols-2 gap-2 p-3 md:block md:space-y-1 md:p-4">
          {navItems.map((item) => {
            const Icon = item.icon

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/dashboard'}
                className={({ isActive }) =>
                  [
                    'flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors md:gap-3 md:px-4 md:py-3',
                    isActive
                      ? 'bg-indigo-500/10 text-indigo-400'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200',
                  ].join(' ')
                }
              >
                <Icon className="h-5 w-5" />
                <span className="truncate">{item.label}</span>
              </NavLink>
            )
          })}
        </nav>

        <div className="hidden border-t border-gray-800 p-4 md:block">
          <div className="mb-3 flex items-center gap-3 rounded-lg bg-gray-950 px-3 py-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 text-xs font-semibold">
              {userInitials}
            </div>
            <p className="truncate text-sm text-gray-300">{userEmail}</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-800 bg-gray-950 px-3 py-2.5 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-800 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 border-b border-gray-800 bg-gray-900/95 px-4 backdrop-blur sm:px-6">
          <div className="flex h-[73px] items-center justify-between gap-4">
            <div className="relative hidden max-w-xl flex-1 md:block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Search tools..."
                className="w-full rounded-lg border border-gray-800 bg-gray-950 py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-gray-500 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <p className="truncate text-sm text-gray-400">{userEmail}</p>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg border border-gray-800 bg-gray-950 px-3 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-800 md:hidden"
            >
              Logout
            </button>
          </div>
        </header>

        <main className="flex-1 bg-slate-950 bg-[radial-gradient(#33415555_1px,transparent_1px)] [background-size:20px_20px]">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout

