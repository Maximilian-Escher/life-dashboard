import { NavLink } from 'react-router-dom'
import { navItems } from './navItems.js'

export default function Sidebar() {
  return (
    <aside className="hidden md:flex md:w-60 md:flex-col md:shrink-0 border-r border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-6">
      <div className="mb-8 px-2">
        <p className="text-lg font-semibold tracking-tight text-white">Life Dashboard</p>
      </div>
      <nav className="flex flex-col gap-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-[var(--color-accent)]/15 text-white'
                  : 'text-zinc-400 hover:bg-[var(--color-surface-hover)] hover:text-white'
              }`
            }
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 shrink-0">
              <path d={item.icon} />
            </svg>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
