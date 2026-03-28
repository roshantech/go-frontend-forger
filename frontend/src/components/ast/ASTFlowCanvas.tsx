import { useEffect, useMemo, useCallback } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  useReactFlow,
  type NodeMouseHandler,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { astNodeTypes, CATEGORY_COLORS } from './ASTNode'
import { useASTViewerStore } from '@/store/astViewerStore'
import { treeToGraph } from '@/lib/astToGraph'
import { applyDagreLayout } from '@/lib/dagreLayout'
import type { ASTFlowNodeData } from '@/lib/astToGraph'

export default function ASTFlowCanvas() {
  const { tree, nodeMap, expandedNodeIds, selectedNodeId, toggleExpand, selectNode } =
    useASTViewerStore()
  const { fitView } = useReactFlow()

  const { nodes, edges } = useMemo(() => {
    if (!tree) return { nodes: [], edges: [] }
    const raw = treeToGraph(nodeMap, tree.id, expandedNodeIds)
    const laid = applyDagreLayout(raw.nodes, raw.edges, 'TB')
    return { nodes: laid, edges: raw.edges }
  }, [tree, nodeMap, expandedNodeIds])

  useEffect(() => {
    if (nodes.length > 0) {
      const t = setTimeout(() => fitView({ padding: 0.12, duration: 350 }), 60)
      return () => clearTimeout(t)
    }
  }, [nodes.length, tree?.id, fitView])

  const onNodeClick: NodeMouseHandler = useCallback(
    (_, node) => {
      const d = node.data as ASTFlowNodeData
      // Select for sidebar
      selectNode(node.id)
      // Toggle expand/collapse if it has children and is not root
      if (d.hasChildren && !d.isRoot) {
        toggleExpand(node.id)
      }
    },
    [selectNode, toggleExpand]
  )

  const onPaneClick = useCallback(() => selectNode(null), [selectNode])

  const styledNodes = useMemo(
    () => nodes.map((n) => ({ ...n, selected: n.id === selectedNodeId })),
    [nodes, selectedNodeId]
  )

  if (!tree) return null

  return (
    <ReactFlow
      nodes={styledNodes}
      edges={edges}
      nodeTypes={astNodeTypes}
      onNodeClick={onNodeClick}
      onPaneClick={onPaneClick}
      minZoom={0.05}
      maxZoom={2.5}
      fitView
      nodesDraggable
      nodesConnectable={false}
      elementsSelectable
    >
      <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="hsl(216,34%,13%)" />
      <Controls />
      <MiniMap
        nodeColor={(n) => {
          const cat = (n.data as ASTFlowNodeData)?.node?.category ?? 'other'
          return CATEGORY_COLORS[cat]?.border ?? '#6b7280'
        }}
        maskColor="rgba(10,15,28,0.75)"
        style={{ background: 'hsl(222,47%,8%)', border: '1px solid hsl(216,34%,15%)' }}
      />
    </ReactFlow>
  )
}
