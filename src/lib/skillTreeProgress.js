// Skill-Tree-Fortschritt in Supabase (Tabelle "skill_tree_progress", RLS auf
// auth.uid()). Abschluss ist einmalig/permanent – kein "entabschließen".

import { supabase } from './supabaseClient.js'

export async function getCompletedNodeIds() {
  const { data, error } = await supabase.from('skill_tree_progress').select('node_id')
  if (error) throw error
  return new Set(data.map((row) => row.node_id))
}

export async function completeNode(nodeId) {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Nicht eingeloggt.')

  const { error } = await supabase
    .from('skill_tree_progress')
    .insert({ user_id: user.id, node_id: nodeId })

  if (error) throw error
}
