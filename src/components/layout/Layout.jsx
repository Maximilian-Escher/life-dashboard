import Sidebar from './Sidebar.jsx'
import BottomNav from './BottomNav.jsx'

export default function Layout({ children }) {
  return (
    <div className="flex min-h-screen bg-[var(--color-bg)] text-zinc-100">
      <Sidebar />
      <main className="flex-1 px-4 pb-20 pt-6 md:px-8 md:pb-8 md:pt-8">
        <div className="mx-auto max-w-4xl">{children}</div>
      </main>
      <BottomNav />
    </div>
  )
}
