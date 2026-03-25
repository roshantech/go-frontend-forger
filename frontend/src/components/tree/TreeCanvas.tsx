import { useCallback, useRef } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  BackgroundVariant,
  type Connection,
  type NodeMouseHandler,
  type OnNodesChange,
  type OnEdgesChange,
  applyNodeChanges,
  applyEdgeChanges,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useProjectStore, type WorkflowNode, type WorkflowEdge, type WorkflowNodeData } from '@/store/projectStore'
import { nanoid } from './nanoid'

const KIND_COLORS: Record<string, string> = {
  trigger:   '#f59e0b',
  input:     '#38bdf8',
  processor: '#34d399',
  condition: '#fb7185',
  action:    '#818cf8',
  output:    '#a78bfa',
}

function WorkflowNodeComponent({ data, selected }: { data: WorkflowNodeData; selected: boolean }) {
  const color = KIND_COLORS[data.kind] ?? '#64748b'
  return (
    <div
      className={`rounded-xl border px-4 py-3 min-w-[160px] shadow-lg transition-all
        ${selected ? 'ring-2 ring-primary ring-offset-1 ring-offset-background' : ''}
      `}
      style={{
        background: 'hsl(222,47%,9%)',
        borderColor: selected ? color : 'hsl(216,34%,18%)',
      }}
    >
      <div className="flex items-center gap-2 mb-1">
        <span
          className="w-2 h-2 rounded-full shrink-0"
          style={{ background: color }}
        />
        <span className="text-xs font-semibold uppercase tracking-wide" style={{ color }}>
          {data.kind}
        </span>
      </div>
      <p className="text-sm font-medium text-foreground truncate">{data.label}</p>
      {data.subtitle && (
        <p className="text-xs text-muted-foreground truncate mt-0.5">{data.subtitle}</p>
      )}
      <div
        className="mt-1.5 inline-flex items-center px-1.5 py-0.5 rounded text-xs"
        style={{
          background: `${color}22`,
          color,
        }}
      >
        {data.status}
      </div>
    </div>
  )
}

const nodeTypes = { workflow: WorkflowNodeComponent }

interface Props {
  onNodeClick?: (id: string) => void
}

export default function TreeCanvas({ onNodeClick }: Props) {
  const { nodes, edges, setNodes, setEdges, snapshot, selectedNodeId, setSelectedNodeId } = useProjectStore()
  const containerRef = useRef<HTMLDivElement>(null)

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => setNodes(applyNodeChanges(changes, nodes) as WorkflowNode[]),
    [nodes, setNodes]
  )

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges(applyEdgeChanges(changes, edges) as WorkflowEdge[]),
    [edges, setEdges]
  )

  const onConnect = useCallback(
    (connection: Connection) => {
      snapshot()
      setEdges(addEdge(connection, edges) as WorkflowEdge[])
    },
    [edges, setEdges, snapshot]
  )

  const handleNodeClick: NodeMouseHandler = useCallback(
    (_, node) => {
      setSelectedNodeId(node.id)
      onNodeClick?.(node.id)
    },
    [setSelectedNodeId, onNodeClick]
  )

  const handlePaneClick = useCallback(() => setSelectedNodeId(null), [setSelectedNodeId])

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      const kind = e.dataTransfer.getData('application/x-forge-node') as WorkflowNodeData['kind']
      if (!kind || !containerRef.current) return

      const rect = containerRef.current.getBoundingClientRect()
      snapshot()
      const newNode: WorkflowNode = {
        id: nanoid(),
        type: 'workflow',
        position: { x: e.clientX - rect.left - 80, y: e.clientY - rect.top - 40 },
        data: {
          kind,
          label: `New ${kind}`,
          subtitle: '',
          description: '',
          accent: KIND_COLORS[kind] ?? '#64748b',
          status: 'draft',
          notes: '',
          config: {},
        },
      }
      setNodes([...nodes, newNode])
    },
    [nodes, setNodes, snapshot]
  )

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      <ReactFlow
        nodes={nodes.map((n) => ({ ...n, selected: n.id === selectedNodeId }))}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={handleNodeClick}
        onPaneClick={handlePaneClick}
        snapToGrid
        snapGrid={[16, 16]}
        minZoom={0.3}
        maxZoom={1.5}
        fitView
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="hsl(216,34%,18%)" />
        <Controls />
        <MiniMap
          nodeColor={(n) => KIND_COLORS[(n.data as WorkflowNodeData)?.kind] ?? '#64748b'}
          maskColor="rgba(15,23,42,0.6)"
        />
      </ReactFlow>
    </div>
  )
}
