export default function SkillTreeHintWidget({ branches, inProgressByBranch }) {
  return (
    <section className="glass-panel h-full rounded-2xl p-5">
      <h2 className="mb-3 text-[12.5px] font-semibold text-zinc-400">Skill-Tree – in Arbeit</h2>
      {branches.length === 0 ? (
        <p className="text-sm text-zinc-500">Aktuell nichts in Arbeit.</p>
      ) : (
        <ul className="flex flex-col gap-2.5 text-sm">
          {branches.map((b) => (
            <li key={b.key} className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-1.5 text-zinc-500">
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: b.color, boxShadow: `0 0 8px ${b.color}` }}
                />
                {b.label}
              </span>
              <span className="truncate text-right text-zinc-200">{inProgressByBranch[b.key].title}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
