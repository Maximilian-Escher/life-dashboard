export default function SkillTreeHintWidget({ branches, inProgressByBranch }) {
  if (branches.length === 0) return null

  return (
    <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
      <h2 className="mb-3 text-sm font-medium text-zinc-300">Skill-Tree – in Arbeit</h2>
      <ul className="flex flex-col gap-2 text-sm">
        {branches.map((b) => (
          <li key={b.key} className="flex items-center justify-between gap-3">
            <span className="text-zinc-500">{b.label}</span>
            <span className="truncate text-zinc-200">{inProgressByBranch[b.key].title}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
