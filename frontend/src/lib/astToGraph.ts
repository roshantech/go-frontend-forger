import type { Node, Edge } from '@xyflow/react'
import type { TreeNode } from '@/lib/api'

export interface ASTFlowNodeData extends Record<string, unknown> {
  node: TreeNode
  isExpanded: boolean
  hasChildren: boolean
  childCount: number
  isRoot: boolean
}

/** Build a flat id→node lookup from the recursive tree */
export function buildNodeMap(tree: TreeNode): Map<string, TreeNode> {
  const map = new Map<string, TreeNode>()
  const dfs = (n: TreeNode) => {
    map.set(n.id, n)
    n.children?.forEach(dfs)
  }
  dfs(tree)
  return map
}

/**
 * Convert tree to React Flow nodes/edges using expand-on-click model.
 * - Root's direct children are always visible.
 * - Deeper nodes are visible only when their parent is in expandedNodeIds.
 */
export function treeToGraph(
  nodeMap: Map<string, TreeNode>,
  rootId: string,
  expandedNodeIds: Set<string>
): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = []
  const edges: Edge[] = []
  let edgeIdx = 0

  function add(id: string, parentId: string | null, isDirectChildOfRoot: boolean) {
    const n = nodeMap.get(id)
    if (!n) return

    const children = n.children ?? []
    const isRoot = id === rootId
    const isExpanded = expandedNodeIds.has(id)
    // Root and direct children of root are always in graph.
    // Deeper nodes only if their parent was expanded.
    const showChildren = isRoot || isExpanded

    nodes.push({
      id: n.id,
      type: 'astNode',
      position: { x: 0, y: 0 },
      data: {
        node: n,
        isExpanded: isExpanded || isRoot,
        hasChildren: children.length > 0,
        childCount: children.length,
        isRoot,
      } satisfies ASTFlowNodeData,
    })

    if (parentId) {
      edges.push({
        id: `e${++edgeIdx}`,
        source: parentId,
        target: id,
        type: 'smoothstep',
        animated: isDirectChildOfRoot,
        style: { stroke: 'hsl(216,34%,28%)', strokeWidth: 1.5 },
      })
    }

    if (showChildren) {
      children.forEach((child) => add(child.id, id, false))
    }
  }

  add(rootId, null, false)
  return { nodes, edges }
}
