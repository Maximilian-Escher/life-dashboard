import { useEffect, useState } from 'react'
import { skillTreeBranches } from '../data/skillTree.js'
import { getCompletedNodeIds, completeNode } from '../lib/skillTreeProgress.js'
import { getNodes, seedDefaultNodesOnce, addNode, deleteNode } from '../lib/skillTreeNodes.js'
import { getNodeStatus } from '../lib/skillTree.js'
import SkillNodeRow from '../components/SkillNodeRow.jsx'
import CompleteNodeModal from '../components/CompleteNodeModal.jsx'
import ManageNodesModal from '../components/ManageNodesModal.jsx'

export default function SkillTree() {
  const [nodes, setNodes] = useState([])
  const [completedIds, setCompletedIds] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [modalNode, setModalNode] = useState(null)
  const [confirming, setConfirming] = useState(false)
  const [celebratingNodeId, setCelebratingNodeId] = useState(null)
  const [manageOpen, setManageOpen] = useState(false)

  async function loadAll({ cancelled = () => false } = {}) {
    setLoading(true)
    setError(null)
    try {
      await seedDefaultNodesOnce()
      const [nodeList, ids] = await Promise.all([getNodes(), getCompletedNodeIds()])
      if (cancelled()) return
      setNodes(nodeList)
      setCompletedIds(ids)
    } catch (err) {
      if (!cancelled()) setError(err.message)
    } finally {
      if (!cancelled()) setLoading(false)
    }
  }

  useEffect(() => {
    let isCancelled = false
    loadAll({ cancelled: () => isCancelled })
    return () => {
      isCancelled = true
    }
  }, [])

  async function handleConfirm() {
    if (!modalNode) return
    setConfirming(true)
    setError(null)
    try {
      await completeNode(modalNode.id)
      setCompletedIds((prev) => new Set(prev).add(modalNode.id))
      setCelebratingNodeId(modalNode.id)
      setModalNode(null)
      setTimeout(() => setCelebratingNodeId(null), 1000)
    } catch (err) {
      setError(err.message)
    } finally {
      setConfirming(false)
    }
  }

  async function handleAddNode(input) {
    await addNode(input)
    setNodes(await getNodes())
  }

  async function handleDeleteNode(node) {
    if (completedIds.has(node.id)) {
      throw new Error('Abgeschlossene Knoten können nicht gelöscht werden.')
    }
    if (nodes.some((n) => n.requires === node.id)) {
      throw new Error('Andere Knoten setzen diesen voraus – erst diese löschen.')
    }
    await deleteNode(node.id)
    setNodes(await getNodes())
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Skill-Tree</h1>
          <p className="text-sm text-zinc-500">{loading ? 'Lade Daten…' : 'Live-Daten aus Supabase'}</p>
        </div>
        <button
          type="button"
          onClick={() => setManageOpen(true)}
          className="shrink-0 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-zinc-300 hover:text-white"
        >
          Knoten verwalten
        </button>
      </header>

      {error && (
        <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {skillTreeBranches.map((branch) => (
          <div
            key={branch.key}
            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5"
            style={{ borderTopColor: branch.color, borderTopWidth: 2 }}
          >
            <h2 className="mb-4 text-sm font-medium text-white">{branch.label}</h2>
            <div className="flex flex-col gap-2">
              {nodes
                .filter((node) => node.branch === branch.key)
                .map((node) => {
                  const status = getNodeStatus(node, completedIds)
                  return (
                    <SkillNodeRow
                      key={node.id}
                      node={node}
                      status={status}
                      celebrating={celebratingNodeId === node.id}
                      onClick={status === 'in-progress' ? () => setModalNode(node) : undefined}
                    />
                  )
                })}
              {nodes.filter((node) => node.branch === branch.key).length === 0 && !loading && (
                <p className="text-xs text-zinc-600">Noch keine Knoten – über "Knoten verwalten" hinzufügen.</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <CompleteNodeModal
        node={modalNode}
        confirming={confirming}
        onCancel={() => setModalNode(null)}
        onConfirm={handleConfirm}
      />

      <ManageNodesModal
        open={manageOpen}
        nodes={nodes}
        completedIds={completedIds}
        onClose={() => setManageOpen(false)}
        onAddNode={handleAddNode}
        onDeleteNode={handleDeleteNode}
      />
    </div>
  )
}
