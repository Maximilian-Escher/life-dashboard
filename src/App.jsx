import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import Home from './views/Home.jsx'
import Charakterbogen from './views/Charakterbogen.jsx'
import Streaks from './views/Streaks.jsx'
import SkillTree from './views/SkillTree.jsx'
import Finanzen from './views/Finanzen.jsx'
import Login from './views/Login.jsx'
import { useAuth } from './lib/AuthContext.jsx'

export default function App() {
  const { session } = useAuth()

  if (session === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)] text-sm text-zinc-500">
        Lade…
      </div>
    )
  }

  if (!session) {
    return <Login />
  }

  return (
    <ErrorBoundary>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/charakterbogen" element={<Charakterbogen />} />
          <Route path="/streaks" element={<Streaks />} />
          <Route path="/skill-tree" element={<SkillTree />} />
          <Route path="/finanzen" element={<Finanzen />} />
        </Routes>
      </Layout>
    </ErrorBoundary>
  )
}
