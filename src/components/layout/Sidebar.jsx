import { NavLink } from 'react-router-dom'
import { navItems } from './navItems.js'
import { useUIPrefs } from '../../lib/uiPrefs.jsx'

function SwitchPill({ label, on, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between gap-2.5 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-left text-[12.5px] font-medium text-zinc-400 dark:border-white/10 light:border-black/10"
    >
      <span>{label}</span>
      <span
        className="relative inline-block h-[19px] w-[34px] shrink-0 rounded-full transition-colors"
        style={{ background: on ? 'var(--color-accent)' : 'var(--glass-track)' }}
      >
        <span
          className="absolute top-0.5 h-[15px] w-[15px] rounded-full bg-white shadow transition-all"
          style={{ left: on ? 17 : 2 }}
        />
      </span>
    </button>
  )
}

export default function Sidebar() {
  const { theme, toggleTheme, performanceMode, togglePerformanceMode, ambientEnabled, toggleAmbientEnabled, previewAmbient } =
    useUIPrefs()

  return (
    <aside className="glass-sidebar hidden md:flex md:w-60 md:shrink-0 md:flex-col md:rounded-r-[28px] px-4 py-6">
      <div className="mb-8 flex items-center gap-2.5 px-2">
        <div
          className="h-8.5 w-8.5 shrink-0 rounded-[10px]"
          style={{
            width: 34,
            height: 34,
            background: 'linear-gradient(140deg, var(--color-accent), var(--color-vitality))',
            boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
          }}
        />
        <p className="text-[16px] font-bold tracking-tight text-white">Life Dashboard</p>
      </div>

      <nav className="flex flex-col gap-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive ? 'bg-white/10 text-white' : 'text-zinc-400 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-[19px] w-[19px] shrink-0">
              <path d={item.icon} />
            </svg>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto flex flex-col gap-2.5 pt-5">
        <div className="px-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-zinc-500">Anzeige</div>

        <SwitchPill label={theme === 'dark' ? 'Dark Mode' : 'Light Mode'} on={theme === 'dark'} onClick={toggleTheme} />
        <SwitchPill label="Performance-Modus" on={performanceMode} onClick={togglePerformanceMode} />
        <SwitchPill label="Ambient (Wanddisplay)" on={ambientEnabled} onClick={toggleAmbientEnabled} />

        {ambientEnabled && (
          <button
            type="button"
            onClick={previewAmbient}
            className="w-full rounded-xl border border-dashed border-white/15 px-3 py-2.5 text-xs font-medium text-zinc-400 hover:text-zinc-200"
          >
            Ambient-Vorschau jetzt zeigen
          </button>
        )}
      </div>
    </aside>
  )
}
