import { skillTree } from '../data/dummyData.js'

const statusStyles = {
  done: 'border-[var(--color-accent)] bg-[var(--color-accent)]/15 text-white',
  'in-progress': 'border-amber-500/50 bg-amber-500/10 text-amber-300',
  locked: 'border-[var(--color-border)] text-zinc-500',
}

const statusLabel = {
  done: 'Abgeschlossen',
  'in-progress': 'In Arbeit',
  locked: 'Gesperrt',
}

export default function SkillTree() {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold text-white">Skill-Tree</h1>
        <p className="text-sm text-zinc-500">Platzhalter-Daten – noch keine Live-Integration</p>
      </header>

      <div className="flex flex-col gap-6">
        {skillTree.map((branch) => (
          <div
            key={branch.branch}
            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5"
          >
            <h2 className="mb-4 text-sm font-medium text-white">{branch.branch}</h2>
            <div className="flex flex-col gap-2">
              {branch.nodes.map((node) => (
                <div
                  key={node.id}
                  className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm ${statusStyles[node.status]}`}
                >
                  <span>{node.label}</span>
                  <span className="text-xs opacity-80">{statusLabel[node.status]}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
