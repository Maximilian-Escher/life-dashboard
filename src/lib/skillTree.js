export const STAT_LABELS = {
  vitalitaet: 'Vitalität',
  disziplin: 'Disziplin',
  wealth: 'Wealth',
}

// 'locked' | 'in-progress' | 'completed'
export function getNodeStatus(node, completedIds) {
  if (completedIds.has(node.id)) return 'completed'
  if (node.requires == null || completedIds.has(node.requires)) return 'in-progress'
  return 'locked'
}

// { [branchKey]: node } – der jeweils erste freigeschaltete, noch nicht
// abgeschlossene Knoten pro Zweig (jeder Zweig ist eine lineare Kette, es
// gibt also höchstens einen "in Arbeit"-Knoten gleichzeitig pro Zweig).
export function getInProgressNodeByBranch(nodes, completedIds) {
  const result = {}
  for (const node of nodes) {
    if (!result[node.branch] && getNodeStatus(node, completedIds) === 'in-progress') {
      result[node.branch] = node
    }
  }
  return result
}
