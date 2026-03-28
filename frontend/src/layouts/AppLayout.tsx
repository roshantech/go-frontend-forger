import { Navigate, Outlet, Link, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { authApi } from '@/lib/api'
import { isAuthenticated, clearToken } from '@/lib/auth'
import { LayoutDashboard, GitBranch, LogOut } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AppLayout() {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />
  }

  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: () => authApi.me().then((r) => r.data),
  })

  const location = useLocation()

  function handleLogout() {
    clearToken()
    toast.success('Logged out')
    window.location.href = '/login'
  }

  const navItems = [
    { to: '/project', icon: <LayoutDashboard size={18} />, label: 'Workflow' },
    { to: '/ast',     icon: <GitBranch size={18} />,       label: 'AST Visualizer' },
  ]

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      {/* Sidebar */}
      <aside className="w-14 flex flex-col items-center py-4 gap-2 border-r border-border bg-card shrink-0">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm mb-4">
          F
        </div>
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            title={item.label}
            className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors
              ${location.pathname === item.to
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              }`}
          >
            {item.icon}
          </Link>
        ))}
        <div className="flex-1" />
        <button
          onClick={handleLogout}
          title="Logout"
          className="w-10 h-10 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        >
          <LogOut size={18} />
        </button>
        {user && (
          <div
            title={user.email}
            className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-xs"
          >
            {user.email[0].toUpperCase()}
          </div>
        )}
      </aside>

      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  )
}
