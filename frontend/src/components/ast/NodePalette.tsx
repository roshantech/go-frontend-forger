import { useState, type DragEvent } from 'react'
import { useMutation } from '@tanstack/react-query'
import { ChevronDown, ChevronRight, Sparkles, Code2, Loader2, GripVertical } from 'lucide-react'
import { CATEGORY_COLORS } from './ASTNode'
import { astApi, type TreeNode } from '@/lib/api'
import { useASTViewerStore } from '@/store/astViewerStore'
import toast from 'react-hot-toast'

// ─── Template definitions ─────────────────────────────────────────────────────

interface PaletteTemplate {
  type: string
  category: string
  name?: string
  description: string
}

const PALETTE_SECTIONS: { title: string; color: string; items: PaletteTemplate[] }[] = [
  {
    title: 'Structure',
    color: '#6366f1',
    items: [
      { type: 'File',        category: 'file',     name: 'main.go',    description: 'Go source file' },
      { type: 'FuncDecl',    category: 'function', name: 'MyFunc',     description: 'Function declaration' },
      { type: 'FuncType',    category: 'function', name: '',           description: 'Function type signature' },
      { type: 'GenDecl',     category: 'statement',name: '',           description: 'General declaration (var/const/type/import)' },
    ],
  },
  {
    title: 'Statements',
    color: '#eab308',
    items: [
      { type: 'AssignStmt',  category: 'statement', name: '',  description: 'Assignment :=' },
      { type: 'ReturnStmt',  category: 'statement', name: '',  description: 'Return statement' },
      { type: 'IfStmt',      category: 'control',   name: '',  description: 'If / else if / else' },
      { type: 'ForStmt',     category: 'control',   name: '',  description: 'For loop' },
      { type: 'RangeStmt',   category: 'control',   name: '',  description: 'Range over slice/map' },
      { type: 'SwitchStmt',  category: 'control',   name: '',  description: 'Switch statement' },
      { type: 'CaseClause',  category: 'control',   name: '',  description: 'Case clause' },
      { type: 'BlockStmt',   category: 'statement', name: '',  description: 'Block { ... }' },
      { type: 'DeferStmt',   category: 'statement', name: '',  description: 'Defer call' },
      { type: 'GoStmt',      category: 'statement', name: '',  description: 'Go goroutine' },
      { type: 'SendStmt',    category: 'statement', name: '',  description: 'Channel send <-' },
      { type: 'IncDecStmt',  category: 'statement', name: '',  description: 'Increment / decrement' },
      { type: 'BranchStmt',  category: 'control',   name: '',  description: 'break / continue / goto' },
    ],
  },
  {
    title: 'Expressions',
    color: '#22c55e',
    items: [
      { type: 'CallExpr',    category: 'expression', name: '',  description: 'Function call' },
      { type: 'BinaryExpr',  category: 'expression', name: '',  description: 'Binary operator (+, -, &&, …)' },
      { type: 'UnaryExpr',   category: 'expression', name: '',  description: 'Unary operator (!, -, &, …)' },
      { type: 'SelectorExpr',category: 'expression', name: '',  description: 'Selector (x.Field)' },
      { type: 'IndexExpr',   category: 'expression', name: '',  description: 'Index access (x[i])' },
      { type: 'SliceExpr',   category: 'expression', name: '',  description: 'Slice (x[a:b])' },
      { type: 'TypeAssertExpr', category: 'expression', name: '', description: 'Type assert x.(T)' },
      { type: 'StarExpr',    category: 'expression', name: '',  description: 'Pointer dereference *x' },
    ],
  },
  {
    title: 'Types',
    color: '#14b8a6',
    items: [
      { type: 'StructType',    category: 'type', name: 'MyStruct',  description: 'Struct definition' },
      { type: 'InterfaceType', category: 'type', name: 'MyIface',   description: 'Interface definition' },
      { type: 'ArrayType',     category: 'type', name: '',          description: 'Array / slice type' },
      { type: 'MapType',       category: 'type', name: '',          description: 'Map type' },
      { type: 'ChanType',      category: 'type', name: '',          description: 'Channel type' },
      { type: 'FieldList',     category: 'field',name: '',          description: 'Struct field list' },
    ],
  },
  {
    title: 'Literals & Idents',
    color: '#f43f5e',
    items: [
      { type: 'BasicLit',     category: 'literal',    name: '"hello"', description: 'String / int / float literal' },
      { type: 'CompositeLit', category: 'literal',    name: '',        description: 'Composite literal {}' },
      { type: 'FuncLit',      category: 'function',   name: '',        description: 'Function literal (closure)' },
      { type: 'Ident',        category: 'identifier', name: 'name',    description: 'Identifier' },
      { type: 'ImportSpec',   category: 'import',     name: '',        description: 'Import path' },
    ],
  },
]

// ─── NodePalette component ────────────────────────────────────────────────────

export default function NodePalette() {
  const { addCustomNode } = useASTViewerStore()
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(['Structure', 'Statements']))
  const [snippet, setSnippet] = useState('')
  const [snippetName, setSnippetName] = useState('snippet.go')

  function toggleSection(title: string) {
    setOpenSections((prev) => {
      const next = new Set(prev)
      if (next.has(title)) next.delete(title)
      else next.add(title)
      return next
    })
  }

  function onDragStart(e: DragEvent<HTMLDivElement>, template: PaletteTemplate) {
    const node: TreeNode = {
      id: `palette-${template.type}-${crypto.randomUUID()}`,
      type: template.type,
      category: template.category,
      name: template.name || undefined,
      children: [],
    }
    e.dataTransfer.setData('application/ast-node', JSON.stringify(node))
    e.dataTransfer.effectAllowed = 'copy'
  }

  // "Parse & Add" — parse snippet via backend and drop nodes onto canvas
  const { mutate: parseSnippet, isPending: parsing } = useMutation({
    mutationFn: (src: string) => astApi.treeRaw(snippetName || 'snippet.go', src),
    onSuccess: (res) => {
      const root = res.data
      const children = root.children ?? []
      if (children.length === 0) {
        // Add root itself if no children
        addCustomNode(root, { x: 100 + Math.random() * 200, y: 100 + Math.random() * 200 })
      } else {
        children.forEach((child, i) => {
          addCustomNode(child, { x: 80 + i * 230, y: 80 + Math.random() * 80 })
        })
      }
      toast.success(`Added ${children.length || 1} node(s) to canvas`)
    },
    onError: () => toast.error('Parse failed — check your Go snippet'),
  })

  return (
    <div className="h-full flex flex-col bg-[hsl(222,47%,7%)] border-r border-border overflow-hidden">
      {/* Header */}
      <div className="px-3 py-2.5 border-b border-border shrink-0">
        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60">
          Node Palette
        </p>
        <p className="text-[10px] text-muted-foreground/40 mt-0.5">Drag onto canvas</p>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto inspector-scroll">

        {/* Template sections */}
        {PALETTE_SECTIONS.map((section) => {
          const open = openSections.has(section.title)
          return (
            <div key={section.title} className="border-b border-border/40">
              <button
                onClick={() => toggleSection(section.title)}
                className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-accent/30 transition-colors text-left"
              >
                {open
                  ? <ChevronDown size={10} className="text-muted-foreground/40 shrink-0" />
                  : <ChevronRight size={10} className="text-muted-foreground/40 shrink-0" />
                }
                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: section.color }}>
                  {section.title}
                </span>
                <span className="ml-auto text-[9px] text-muted-foreground/30">{section.items.length}</span>
              </button>

              {open && (
                <div className="pb-1">
                  {section.items.map((item) => (
                    <PaletteItem key={item.type} item={item} onDragStart={onDragStart} />
                  ))}
                </div>
              )}
            </div>
          )
        })}

        {/* Generate from snippet */}
        <div className="p-3 border-t border-border/40">
          <div className="flex items-center gap-1.5 mb-2">
            <Sparkles size={11} className="text-primary/70" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary/70">
              Parse & Add
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground/40 mb-2 leading-relaxed">
            Paste a Go snippet — the AST nodes will be added to the canvas.
          </p>

          <input
            value={snippetName}
            onChange={(e) => setSnippetName(e.target.value)}
            placeholder="filename.go"
            className="w-full px-2 py-1 mb-1.5 text-[10px] font-mono bg-background border border-border text-foreground/80 focus:outline-none focus:border-primary/50"
          />

          <div className="relative">
            <Code2 size={10} className="absolute top-2 right-2 text-muted-foreground/30" />
            <textarea
              value={snippet}
              onChange={(e) => setSnippet(e.target.value)}
              rows={5}
              placeholder={'func Add(a, b int) int {\n  return a + b\n}'}
              spellCheck={false}
              className="w-full px-2 py-1.5 text-[10px] font-mono bg-background border border-border text-foreground/75 focus:outline-none focus:border-primary/50 resize-none leading-relaxed"
            />
          </div>

          <button
            onClick={() => snippet.trim() && parseSnippet(snippet.trim())}
            disabled={parsing || !snippet.trim()}
            className="w-full mt-2 py-1.5 text-[10px] font-bold uppercase tracking-wider border border-primary/40 text-primary/80 hover:bg-primary/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-1.5"
          >
            {parsing
              ? <><Loader2 size={10} className="animate-spin" /> Parsing…</>
              : <><Sparkles size={10} /> Parse & Add to Canvas</>
            }
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Palette item ─────────────────────────────────────────────────────────────

function PaletteItem({
  item,
  onDragStart,
}: {
  item: PaletteTemplate
  onDragStart: (e: DragEvent<HTMLDivElement>, item: PaletteTemplate) => void
}) {
  const style = CATEGORY_COLORS[item.category] ?? CATEGORY_COLORS.other

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, item)}
      className="group flex items-center gap-2 mx-2 my-0.5 px-2 py-1.5 cursor-grab active:cursor-grabbing hover:bg-accent/40 transition-colors border border-transparent hover:border-border/60"
      style={{ borderLeft: `2px solid ${style.border}` }}
      title={item.description}
    >
      <GripVertical size={9} className="text-muted-foreground/20 shrink-0 group-hover:text-muted-foreground/50" />
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-mono font-semibold truncate" style={{ color: style.border }}>
          {item.type}
        </p>
        {item.name && (
          <p className="text-[9px] text-muted-foreground/40 font-mono truncate">{item.name}</p>
        )}
      </div>
      <span className={`w-1.5 h-1.5 shrink-0 ${style.dot}`} />
    </div>
  )
}
