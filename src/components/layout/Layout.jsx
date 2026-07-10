import Sidebar from './Sidebar.jsx'
import BottomNav from './BottomNav.jsx'
import AmbientOverlay from '../AmbientOverlay.jsx'
import { useAuth } from '../../lib/AuthContext.jsx'
import { supabase } from '../../lib/supabaseClient.js'
import { useUIPrefs } from '../../lib/uiPrefs.jsx'

export default function Layout({ children }) {
  const { user } = useAuth()
  const { ambientActive, registerInteraction } = useUIPrefs()

  if (ambientActive) {
    return <AmbientOverlay />
  }

  return (
    <div
      className="relative flex min-h-screen overflow-hidden text-zinc-100"
      onClick={registerInteraction}
      onTouchStart={registerInteraction}
      onKeyDown={registerInteraction}
    >
      <div className="bg-blob bg-blob-a" />
      <div className="bg-blob bg-blob-b" />

      <div className="relative z-10 flex min-w-0 flex-1">
        <Sidebar />
        <main className="min-w-0 flex-1 px-4 pb-20 pt-6 md:px-8 md:pb-8 md:pt-8">
          <div className="mx-auto max-w-4xl">
            <div className="mb-4 flex items-center justify-end gap-3 text-xs text-zinc-500">
              <span className="truncate">{user?.email}</span>
              <button onClick={() => supabase.auth.signOut()} className="shrink-0 hover:text-zinc-300">
                Abmelden
              </button>
            </div>
            {children}
          </div>
        </main>
        <BottomNav />
      </div>
    </div>
  )
}
