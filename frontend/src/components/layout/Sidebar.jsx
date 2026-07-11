import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Dumbbell, ListChecks, Apple, TrendingUp,
  CreditCard, Users, Timer, UserCircle, ChevronLeft, ChevronRight,
  LogOut, Moon, Sun, Menu, X
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useThemeStore } from '../../store/themeStore'

const navItems = [
  { label: 'Resumen', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Sesiones', path: '/sessions', icon: Timer },
  { label: 'Rutinas', path: '/routines', icon: ListChecks },
  { label: 'Ejercicios', path: '/exercises', icon: Dumbbell },
  { label: 'Nutrición', path: '/nutrition', icon: Apple },
  { label: 'Progreso', path: '/progress', icon: TrendingUp },
  { label: 'Coaches', path: '/coaches', icon: Users },
  { label: 'Membresías', path: '/memberships', icon: CreditCard, adminOnly: true },
]

function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const theme = useThemeStore((state) => state.theme)
  const toggleTheme = useThemeStore((state) => state.toggleTheme)

  const initials = user?.full_name
    ?.split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase() || '?'

  const navContent = (
    <>
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-4 border-b border-surface-hover">
        <div className="w-7 h-7 rounded-lg bg-strength flex items-center justify-center font-display font-bold text-bg text-sm shrink-0">
          G
        </div>
        {!collapsed && (
          <span className="font-display font-bold text-text-primary text-sm">GymApp</span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto text-text-secondary hover:text-text-primary hidden lg:block"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
        <button
          onClick={() => setMobileOpen(false)}
          className="ml-auto text-text-secondary hover:text-text-primary lg:hidden"
        >
          <X size={18} />
        </button>
      </div>

      {/* Navegación */}
      <nav className="flex flex-col gap-0.5 p-2 flex-1">
        {navItems
          .filter((item) => !item.adminOnly || user?.role === 'admin')
          .map((item) => {
            const isActive = location.pathname === item.path
            const Icon = item.icon
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-bg text-text-primary font-medium'
                    : 'text-text-secondary hover:bg-bg hover:text-text-primary'
                }`}
              >
                <Icon size={17} className={isActive ? 'text-strength' : ''} strokeWidth={2} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            )
          })}
      </nav>

      {/* Footer */}
      <div className="p-2 border-t border-surface-hover">
        <Link
          to="/profile"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-bg transition-colors group"
        >
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0"
            style={{ background: 'var(--color-nutrition)', color: 'var(--color-bg)' }}
          >
            {initials}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-text-primary text-xs font-medium truncate">{user?.full_name}</p>
              <p className="text-text-secondary text-xs capitalize">{user?.role}</p>
            </div>
          )}
          {!collapsed && (
            <UserCircle size={14} className="text-text-secondary group-hover:text-strength shrink-0" />
          )}
        </Link>

        {!collapsed && (
          <button
            onClick={toggleTheme}
            className="w-full text-left px-2 py-1.5 text-text-secondary hover:text-text-primary text-xs rounded-lg flex items-center justify-between"
          >
            <span>Modo {theme === 'dark' ? 'oscuro' : 'claro'}</span>
            {theme === 'dark' ? <Moon size={14} /> : <Sun size={14} />}
          </button>
        )}

        {!collapsed && (
          <button
            onClick={logout}
            className="w-full text-left px-2 py-1.5 mt-1 text-text-secondary hover:text-effort text-xs rounded-lg flex items-center gap-1.5"
          >
            <LogOut size={14} />
            Cerrar sesión
          </button>
        )}
      </div>
    </>
  )

  return (
    <>
      {/* Botón hamburguesa — solo visible en móvil */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 w-9 h-9 bg-surface border border-surface-hover rounded-lg flex items-center justify-center text-text-primary"
      >
        <Menu size={18} />
      </button>

      {/* Overlay — móvil */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar móvil — slide desde la izquierda */}
      <aside className={`
        lg:hidden fixed top-0 left-0 h-full z-50 flex flex-col bg-surface border-r border-surface-hover w-64
        transition-transform duration-200
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {navContent}
      </aside>

      {/* Sidebar desktop — fijo */}
      <aside className={`
        hidden lg:flex flex-col bg-surface border-r border-surface-hover transition-all duration-200
        ${collapsed ? 'w-16' : 'w-56'}
      `}>
        {navContent}
      </aside>
    </>
  )
}

export default Sidebar