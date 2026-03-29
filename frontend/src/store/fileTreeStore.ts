import { create } from 'zustand'

export interface FTreeItem {
  id: string
  name: string
  type: 'root' | 'folder' | 'file'
  language?: string
  parentId?: string
  children?: string[]
}

// Mock Go project — replace with real API data
const ITEMS: FTreeItem[] = [
  { id: 'root',       name: 'forge-api',     type: 'root',   children: ['cmd', 'internal', 'api', 'db', 'go.mod', 'readme'] },
  { id: 'cmd',        name: 'cmd',           type: 'folder', parentId: 'root',     children: ['main.go'] },
  { id: 'main.go',    name: 'main.go',       type: 'file',   parentId: 'cmd',      language: 'go' },
  { id: 'internal',   name: 'internal',      type: 'folder', parentId: 'root',     children: ['auth', 'ast'] },
  { id: 'auth',       name: 'auth',          type: 'folder', parentId: 'internal', children: ['handler.go', 'jwt.go'] },
  { id: 'handler.go', name: 'handler.go',    type: 'file',   parentId: 'auth',     language: 'go' },
  { id: 'jwt.go',     name: 'jwt.go',        type: 'file',   parentId: 'auth',     language: 'go' },
  { id: 'ast',        name: 'ast',           type: 'folder', parentId: 'internal', children: ['parser.go', 'tree.go'] },
  { id: 'parser.go',  name: 'parser.go',     type: 'file',   parentId: 'ast',      language: 'go' },
  { id: 'tree.go',    name: 'tree.go',       type: 'file',   parentId: 'ast',      language: 'go' },
  { id: 'api',        name: 'api',           type: 'folder', parentId: 'root',     children: ['handlers', 'router'] },
  { id: 'handlers',   name: 'handlers',      type: 'folder', parentId: 'api',      children: ['ast_handler.go'] },
  { id: 'ast_handler.go', name: 'ast.go',    type: 'file',   parentId: 'handlers', language: 'go' },
  { id: 'router',     name: 'router',        type: 'folder', parentId: 'api',      children: ['router.go'] },
  { id: 'router.go',  name: 'router.go',     type: 'file',   parentId: 'router',   language: 'go' },
  { id: 'db',         name: 'db',            type: 'folder', parentId: 'root',     children: ['migrate.sql'] },
  { id: 'migrate.sql',name: 'migrate.sql',   type: 'file',   parentId: 'db',       language: 'sql' },
  { id: 'go.mod',     name: 'go.mod',        type: 'file',   parentId: 'root',     language: 'toml' },
  { id: 'readme',     name: 'README.md',     type: 'file',   parentId: 'root',     language: 'markdown' },
]

const ITEM_MAP: Record<string, FTreeItem> = {}
for (const item of ITEMS) ITEM_MAP[item.id] = item

interface FileTreeStore {
  items: Record<string, FTreeItem>
  expandedIds: Set<string>
  selectedFileId: string | null
  toggleFolder: (id: string) => void
  selectFile: (id: string | null) => void
}

export const useFileTreeStore = create<FileTreeStore>((set) => ({
  items: ITEM_MAP,
  expandedIds: new Set(['root']),
  selectedFileId: null,

  toggleFolder: (id) =>
    set((s) => {
      const next = new Set(s.expandedIds)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return { expandedIds: next }
    }),

  selectFile: (id) => set({ selectedFileId: id }),
}))

/** Returns which node ids are visible given current expanded set */
export function getVisibleIds(
  items: Record<string, FTreeItem>,
  expandedIds: Set<string>
): string[] {
  const visible: string[] = []
  function walk(id: string) {
    visible.push(id)
    const item = items[id]
    if ((item.type === 'root' || item.type === 'folder') && expandedIds.has(id)) {
      for (const childId of item.children ?? []) walk(childId)
    }
  }
  walk('root')
  return visible
}
