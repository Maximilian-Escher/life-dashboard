import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout.jsx'
import Home from './views/Home.jsx'
import Charakterbogen from './views/Charakterbogen.jsx'
import Streaks from './views/Streaks.jsx'
import SkillTree from './views/SkillTree.jsx'
import Finanzen from './views/Finanzen.jsx'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/charakterbogen" element={<Charakterbogen />} />
        <Route path="/streaks" element={<Streaks />} />
        <Route path="/skill-tree" element={<SkillTree />} />
        <Route path="/finanzen" element={<Finanzen />} />
      </Routes>
    </Layout>
  )
}
