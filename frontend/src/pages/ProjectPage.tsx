import { useEffect, useCallback } from 'react'
import { useProjectStore } from '@/store/projectStore'
import TreeCanvas from '@/components/tree/TreeCanvas'
import PropertyInspector from '@/components/dashboard/PropertyInspector'
import NodePanel from '@/components/dashboard/NodePanel'
import Toolbar from '@/components/dashboard/Toolbar'
import toast from 'react-hot-toast'

const STARTER_NODES = [
  {
    id: 'n1', type: 'workflow', position: { x: 80, y: 160 },
    data: { kind: 'trigger' as const, label: 'Webhook received', subtitle: 'POST /hook', description: '', accent: '#f59e0b', status: 'live' as const, notes: '', config: {} as Record<string, string> },
  },
  {
    id: 'n2', type: 'workflow', position: { x: 340, y: 160 },
    data: { kind: 'processor' as const, label: 'Parse payload', subtitle: 'Extract fields', description: '', accent: '#34d399', status: 'ready' as const, notes: '', config: { field: 'body.data' } as Record<string, string> },
  },
  {
    id: 'n3', type: 'workflow', position: { x: 600, y: 80 },
    data: { kind: 'condition' as const, label: 'Has errors?', subtitle: '', description: '', accent: '#fb7185', status: 'ready' as const, notes: '', config: {} as Record<string, string> },
  },
  {
    id: 'n4', type: 'workflow', position: { x: 600, y: 260 },
    data: { kind: 'action' as const, label: 'Notify Slack', subtitle: '#alerts channel', description: '', accent: '#818cf8', status: 'draft' as const, notes: '', config: { channel: '#alerts' } as Record<string, string> },
  },
]

const STARTER_EDGES = [
  { id: 'e1-2', source: 'n1', target: 'n2' },
  { id: 'e2-3', source: 'n2', target: 'n3' },
  { id: 'e2-4', source: 'n2', target: 'n4' },
]

export default function ProjectPage() {
  const { nodes, edges, reset, undo, redo, removeNode, snapshot } = useProjectStore()

  // Load starter workflow on first mount
  useEffect(() => {
    if (nodes.length === 0) {
      reset(STARTER_NODES, STARTER_EDGES)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Keyboard shortcuts
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return

      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo() }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); redo() }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const sid = useProjectStore.getState().selectedNodeId
        if (sid) { snapshot(); removeNode(sid) }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [undo, redo, removeNode, snapshot])

  const handleSave = useCallback(() => {
    const data = JSON.stringify({ nodes, edges }, null, 2)
    localStorage.setItem('forge_workflow', data)
    toast.success('Workflow saved locally')
  }, [nodes, edges])

  const handleExport = useCallback(() => {
    const blob = new Blob([JSON.stringify({ nodes, edges }, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'workflow.json'
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Exported workflow.json')
  }, [nodes, edges])

  return (
    <div className="flex flex-col h-full">
      <Toolbar onSave={handleSave} onExport={handleExport} isSaving={false} lastSaved={null} />

      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar — node library */}
        <aside className="w-56 shrink-0 border-r border-border bg-card overflow-y-auto inspector-scroll p-3">
          <NodePanel />
        </aside>

        {/* Canvas */}
        <div className="flex-1 min-w-0">
          <TreeCanvas />
        </div>

        {/* Right panel — property inspector */}
        <aside
          data-testid="property-inspector"
          className="w-60 shrink-0 border-l border-border bg-card"
        >
          <PropertyInspector />
        </aside>
      </div>
    </div>
  )
}
