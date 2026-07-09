// Skill-Tree-Knoten in Supabase (Tabelle "skill_tree_nodes", RLS auf
// auth.uid()). Ersetzt die frühere statische Config als Datenquelle für die
// Views – src/data/skillTree.js liefert nur noch die Branch-Metadaten und
// die Default-Knoten fürs einmalige Seeding.

import { supabase } from './supabaseClient.js'
import { skillTreeNodes as defaultNodes } from '../data/skillTree.js'

function fromRow(row) {
  return {
    id: row.id,
    title: row.title,
    branch: row.branch,
    statKey: row.stat_key,
    bonusXp: row.bonus_xp,
    requires: row.requires_node_id,
  }
}

export async function getNodes() {
  const { data, error } = await supabase
    .from('skill_tree_nodes')
    .select('id, title, branch, stat_key, bonus_xp, requires_node_id, created_at')
    .order('created_at', { ascending: true })

  if (error) throw error
  return data.map(fromRow)
}

// Befüllt die Tabelle einmalig mit den ursprünglichen Standard-Knoten – aber
// wirklich nur EIN EINZIGES MAL pro Nutzer, dauerhaft. Markiert das in
// "skill_tree_seed_status", statt anhand des aktuellen Node-Counts zu
// entscheiden (sonst würde z.B. Löschen aller Knoten das Seeding erneut
// auslösen). Wird beim ersten Laden der Skill-Tree-View automatisch
// aufgerufen.
export async function seedDefaultNodesOnce() {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Nicht eingeloggt.')

  const { data: existingStatus, error: statusError } = await supabase
    .from('skill_tree_seed_status')
    .select('user_id')
    .maybeSingle()

  if (statusError) throw statusError
  if (existingStatus) return false

  const rows = defaultNodes.map((n) => ({
    user_id: user.id,
    id: n.id,
    title: n.title,
    branch: n.branch,
    stat_key: n.statKey,
    bonus_xp: n.bonusXp,
    requires_node_id: n.requires,
  }))

  // 23505 = unique_violation – ein paralleler Aufruf (z.B. React StrictMode
  // im Dev-Modus) hat bereits geseedet/markiert. Das Endergebnis ist
  // dasselbe, also kein echter Fehler.
  const { error: insertError } = await supabase.from('skill_tree_nodes').insert(rows)
  if (insertError && insertError.code !== '23505') throw insertError

  const { error: markError } = await supabase
    .from('skill_tree_seed_status')
    .insert({ user_id: user.id })
  if (markError && markError.code !== '23505') throw markError

  return true
}

function slugify(title) {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export async function addNode({ title, branch, statKey, bonusXp, requires }) {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Nicht eingeloggt.')

  const id = `${slugify(title) || 'knoten'}-${Date.now().toString(36)}`

  const { error } = await supabase.from('skill_tree_nodes').insert({
    user_id: user.id,
    id,
    title,
    branch,
    stat_key: statKey,
    bonus_xp: bonusXp,
    requires_node_id: requires || null,
  })

  if (error) throw error
}

export async function deleteNode(nodeId) {
  const { error } = await supabase.from('skill_tree_nodes').delete().eq('id', nodeId)
  if (error) throw error
}
