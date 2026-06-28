import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

const navItems = [
  { label: 'Resumen', path: '/dashboard', icon: '◆' },
  { label: 'Rutinas', path: '/routines', icon: '▣' },
  { label: 'Ejercicios', path: '/exercises', icon: '●' },
  { label: 'Nutrición', path: '/nutrition', icon: '◉' },
  { label: 'Progreso', path: '/progress', icon: '▲' },
]

function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)

  const initials = user?.full_name
    ?.split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase() || '?'

  return (
    <aside className={`flex flex-col bg-surface border-r border-surface-hover transition-all duration-200 ${collapsed ? 'w-16' : 'w-56'}`}>
      <div className="flex items-center gap-2 px-3 py-4 border-b border-surface-hover">
        <div className="w-7 h-7 rounded-lg bg-strength flex items-center justify-center font-display font-bold text-bg text-sm shrink-0">
          G
        </div>
        {!collapsed && (
          <span className="font-display font-bold text-text-primary text-sm">GymApp</span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto text-text-secondary hover:text-text-primary text-sm"
        >
          {collapsed ? '›' : '‹'}
        </button>
      </div>

      <nav className="flex flex-col gap-0.5 p-2 flex-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-bg text-text-primary font-medium'
                  : 'text-text-secondary hover:bg-bg hover:text-text-primary'
              }`}
            >
              <span className={isActive ? 'text-strength' : ''}>{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      <div className="p-2 border-t border-surface-hover">
        <div className="flex items-center gap-2.5 px-2 py-2">
          <div className="w-7 h-7 rounded-full bg-nutrition flex items-center justify-center font-bold text-xs shrink-0" style={{ color: 'var(--color-bg)' }}>
            {initials}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-text-primary text-xs font-medium truncate">{user?.full_name}</p>
              <p className="text-text-secondary text-xs capitalize">{user?.role}</p>
            </div>
          )}
        </div>
        {!collapsed && (
          <button
            onClick={logout}
            className="w-full text-left px-2 py-1.5 mt-1 text-text-secondary hover:text-effort text-xs rounded-lg"
          >
            Cerrar sesión
          </button>
        )}
      </div>
    </aside>
  )
}

export default Sidebar