import Sidebar from './Sidebar.jsx'
import BottomNav from './BottomNav.jsx'
import { useAuth } from '../../lib/AuthContext.jsx'
import { supabase } from '../../lib/supabaseClient.js'

export default function Layout({ children }) {
  const { user } = useAuth()

  return (
    <div className="flex min-h-screen bg-[var(--color-bg)] text-zinc-100">
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
  )
}
