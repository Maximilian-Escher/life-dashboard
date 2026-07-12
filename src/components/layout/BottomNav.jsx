import { NavLink } from 'react-router-dom'
import { navItems } from './navItems.js'

export default function BottomNav() {
  return (
    <nav className="glass-bottomnav fixed inset-x-0 bottom-0 z-10 flex md:hidden">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.path === '/'}
          className={({ isActive }) =>
            `flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium ${
              isActive ? 'text-white' : 'text-zinc-500'
            }`
          }
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
            <path d={item.icon} />
          </svg>
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}
