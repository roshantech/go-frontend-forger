import { create } from 'zustand'
import type { Edge } from '@xyflow/react'
import type { TreeNode, FileInspection } from '@/lib/api'
import { buildNodeMap } from '@/lib/astToGraph'

export type ViewMode = 'flow' | 'code'

export interface CustomNodeEntry {
  node: TreeNode
  position: { x: number; y: number }
}

export interface TabState {
  id: string
  fileName: string
  tree: TreeNode
  nodeMap: Map<string, TreeNode>
  inspection: FileInspection
  sourceCode: string
  expandedNodeIds: Set<string>
  customNodes: Map<string, CustomNodeEntry>
  customEdges: Edge[]
  hiddenNodeIds: Set<string>
  /** Drill-down stack — last entry is the current display root */
  focusStack: string[]
  viewMode: ViewMode
  maxDepth: number
}

interface ASTViewerStore {
  tabs: TabState[]
  activeTabId: string | null
  selectedNodeId: string | null

  // Tab management
  openFile: (tree: TreeNode, inspection: FileInspection, source: string, fileName: string) => void
  updateActiveTab: (tree: TreeNode, inspection: FileInspection, source: string) => void
  closeTab: (id: string) => void
  switchTab: (id: string) => void

  // Per-active-tab mutations
  toggleExpand: (id: string) => void
  setViewMode: (m: ViewMode) => void
  setMaxDepth: (d: number) => void
  addCustomNode: (node: TreeNode, position: { x: number; y: number }) => void
  removeCustomNode: (id: string) => void
  updateCustomNodePosition: (id: string, position: { x: number; y: number }) => void
  addCustomEdge: (edge: Edge) => void
  removeEdge: (id: string) => void
  hideNode: (id: string) => void

  // Drill-down navigation
  focusPush: (nodeId: string) => void
  focusPop: () => void
  focusTo: (depth: number) => void

  selectNode: (id: string | null) => void
  clear: () => void
}

function makeTab(
  id: string,
  tree: TreeNode,
  inspection: FileInspection,
  source: string,
  fileName: string,
  viewMode: ViewMode = 'flow',
): TabState {
  return {
    id, fileName, tree,
    nodeMap: buildNodeMap(tree),
    inspection,
    sourceCode: source,
    expandedNodeIds: new Set(),
    customNodes: new Map(),
    customEdges: [],
    hiddenNodeIds: new Set(),
    focusStack: [],
    viewMode,
    maxDepth: 3,
  }
}

function applyPatch(
  tabs: TabState[],
  id: string | null,
  p: Partial<TabState>,
): TabState[] {
  if (!id) return tabs
  return tabs.map(t => (t.id === id ? { ...t, ...p } : t))
}

export const useASTViewerStore = create<ASTViewerStore>((set, get) => ({
  tabs: [],
  activeTabId: null,
  selectedNodeId: null,

  openFile: (tree, inspection, source, fileName) => {
    const { tabs } = get()
    const existing = tabs.find(t => t.fileName === fileName)
    if (existing) {
      // Re-use the tab, preserve view mode
      const updated = makeTab(existing.id, tree, inspection, source, fileName, existing.viewMode)
      set({ tabs: tabs.map(t => (t.id === existing.id ? updated : t)), activeTabId: existing.id, selectedNodeId: null })
    } else {
      const id = `tab-${Date.now()}`
      set({ tabs: [...tabs, makeTab(id, tree, inspection, source, fileName)], activeTabId: id, selectedNodeId: null })
    }
  },

  updateActiveTab: (tree, inspection, source) => {
    const { tabs, activeTabId } = get()
    const tab = tabs.find(t => t.id === activeTabId)
    if (!tab) return
    const newNodeMap = buildNodeMap(tree)
    // Validate focusStack against new nodeMap — truncate at first stale id
    const validStack: string[] = []
    for (const id of tab.focusStack) {
      if (newNodeMap.has(id)) validStack.push(id)
      else break
    }
    set({ tabs: applyPatch(tabs, activeTabId, { tree, nodeMap: newNodeMap, inspection, sourceCode: source, focusStack: validStack }) })
  },

  closeTab: (id) => {
    const { tabs, activeTabId } = get()
    const remaining = tabs.filter(t => t.id !== id)
    let nextId = activeTabId
    if (activeTabId === id) {
      const idx = tabs.findIndex(t => t.id === id)
      nextId = remaining[Math.max(0, idx - 1)]?.id ?? null
    }
    set({ tabs: remaining, activeTabId: nextId, selectedNodeId: null })
  },

  switchTab: (id) => set({ activeTabId: id, selectedNodeId: null }),

  toggleExpand: (id) => {
    const { tabs, activeTabId } = get()
    const tab = tabs.find(t => t.id === activeTabId)
    if (!tab) return
    const node = tab.nodeMap.get(id)
    if (!node || !node.children?.length) return
    const next = new Set(tab.expandedNodeIds)
    if (next.has(id)) next.delete(id); else next.add(id)
    set({ tabs: applyPatch(tabs, activeTabId, { expandedNodeIds: next }) })
  },

  setViewMode: (m) => {
    const { tabs, activeTabId } = get()
    set({ tabs: applyPatch(tabs, activeTabId, { viewMode: m }) })
  },

  setMaxDepth: (d) => {
    const { tabs, activeTabId } = get()
    set({ tabs: applyPatch(tabs, activeTabId, { maxDepth: Math.max(0, d) }) })
  },

  addCustomNode: (node, position) => {
    const { tabs, activeTabId } = get()
    const tab = tabs.find(t => t.id === activeTabId)
    if (!tab) return
    const nextC = new Map(tab.customNodes)
    nextC.set(node.id, { node, position })
    const nextM = new Map(tab.nodeMap)
    nextM.set(node.id, node)
    set({ tabs: applyPatch(tabs, activeTabId, { customNodes: nextC, nodeMap: nextM }) })
  },

  removeCustomNode: (id) => {
    const { tabs, activeTabId, selectedNodeId } = get()
    const tab = tabs.find(t => t.id === activeTabId)
    if (!tab) return
    const nextC = new Map(tab.customNodes)
    nextC.delete(id)
    const nextE = tab.customEdges.filter(e => e.source !== id && e.target !== id)
    set({ tabs: applyPatch(tabs, activeTabId, { customNodes: nextC, customEdges: nextE }), selectedNodeId: selectedNodeId === id ? null : selectedNodeId })
  },

  updateCustomNodePosition: (id, position) => {
    const { tabs, activeTabId } = get()
    const tab = tabs.find(t => t.id === activeTabId)
    if (!tab) return
    const entry = tab.customNodes.get(id)
    if (!entry) return
    const next = new Map(tab.customNodes)
    next.set(id, { ...entry, position })
    set({ tabs: applyPatch(tabs, activeTabId, { customNodes: next }) })
  },

  addCustomEdge: (edge) => {
    const { tabs, activeTabId } = get()
    const tab = tabs.find(t => t.id === activeTabId)
    if (!tab) return
    set({ tabs: applyPatch(tabs, activeTabId, { customEdges: [...tab.customEdges, edge] }) })
  },

  removeEdge: (id) => {
    const { tabs, activeTabId } = get()
    const tab = tabs.find(t => t.id === activeTabId)
    if (!tab) return
    set({ tabs: applyPatch(tabs, activeTabId, { customEdges: tab.customEdges.filter(e => e.id !== id) }) })
  },

  hideNode: (id) => {
    const { tabs, activeTabId, selectedNodeId } = get()
    const tab = tabs.find(t => t.id === activeTabId)
    if (!tab) return
    const nextH = new Set(tab.hiddenNodeIds)
    nextH.add(id)
    const nextE = tab.customEdges.filter(e => e.source !== id && e.target !== id)
    set({ tabs: applyPatch(tabs, activeTabId, { hiddenNodeIds: nextH, customEdges: nextE }), selectedNodeId: selectedNodeId === id ? null : selectedNodeId })
  },

  focusPush: (nodeId) => {
    const { tabs, activeTabId } = get()
    const tab = tabs.find(t => t.id === activeTabId)
    if (!tab) return
    const nextStack = [...tab.focusStack, nodeId]
    set({ tabs: applyPatch(tabs, activeTabId, { focusStack: nextStack, expandedNodeIds: new Set() }), selectedNodeId: nodeId })
  },

  focusPop: () => {
    const { tabs, activeTabId } = get()
    const tab = tabs.find(t => t.id === activeTabId)
    if (!tab || tab.focusStack.length === 0) return
    const nextStack = tab.focusStack.slice(0, -1)
    set({ tabs: applyPatch(tabs, activeTabId, { focusStack: nextStack, expandedNodeIds: new Set() }), selectedNodeId: nextStack.at(-1) ?? null })
  },

  focusTo: (depth) => {
    const { tabs, activeTabId } = get()
    const tab = tabs.find(t => t.id === activeTabId)
    if (!tab) return
    const nextStack = tab.focusStack.slice(0, depth)
    set({ tabs: applyPatch(tabs, activeTabId, { focusStack: nextStack, expandedNodeIds: new Set() }), selectedNodeId: nextStack.at(-1) ?? null })
  },

  selectNode: (id) => set({ selectedNodeId: id }),
  clear: () => set({ tabs: [], activeTabId: null, selectedNodeId: null }),
}))

/** Selector hook — returns the active tab or null */
export const useActiveTab = () =>
  useASTViewerStore(s => s.tabs.find(t => t.id === s.activeTabId) ?? null)
