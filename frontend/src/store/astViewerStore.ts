import { create } from 'zustand'
import type { TreeNode, FileInspection } from '@/lib/api'
import { buildNodeMap } from '@/lib/astToGraph'

export type ViewMode = 'flow' | 'code'

interface ASTViewerStore {
  tree: TreeNode | null
  nodeMap: Map<string, TreeNode>
  inspection: FileInspection | null
  expandedNodeIds: Set<string>
  selectedNodeId: string | null
  sourceCode: string
  fileName: string
  viewMode: ViewMode

  setData: (tree: TreeNode, inspection: FileInspection, source: string, fileName: string) => void
  toggleExpand: (id: string) => void
  selectNode: (id: string | null) => void
  setViewMode: (m: ViewMode) => void
  clear: () => void
}

export const useASTViewerStore = create<ASTViewerStore>((set, get) => ({
  tree: null,
  nodeMap: new Map(),
  inspection: null,
  expandedNodeIds: new Set(),
  selectedNodeId: null,
  sourceCode: '',
  fileName: '',
  viewMode: 'flow',

  setData: (tree, inspection, source, fileName) => {
    const nodeMap = buildNodeMap(tree)
    set({
      tree,
      nodeMap,
      inspection,
      sourceCode: source,
      fileName,
      expandedNodeIds: new Set(),
      selectedNodeId: null,
      viewMode: 'flow',
    })
  },

  toggleExpand: (id) => {
    const { expandedNodeIds, nodeMap } = get()
    const node = nodeMap.get(id)
    if (!node || !node.children?.length) return
    const next = new Set(expandedNodeIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    set({ expandedNodeIds: next })
  },

  selectNode: (id) => set({ selectedNodeId: id }),
  setViewMode: (m) => set({ viewMode: m }),
  clear: () =>
    set({
      tree: null,
      nodeMap: new Map(),
      inspection: null,
      expandedNodeIds: new Set(),
      selectedNodeId: null,
      sourceCode: '',
      fileName: '',
      viewMode: 'flow',
    }),
}))
