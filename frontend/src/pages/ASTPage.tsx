import { useRef, useCallback, useEffect, useState, type DragEvent } from 'react'
import { ReactFlowProvider } from '@xyflow/react'
import { useMutation } from '@tanstack/react-query'
import { astApi } from '@/lib/api'
import { useASTViewerStore } from '@/store/astViewerStore'
import ASTFlowCanvas from '@/components/ast/ASTFlowCanvas'
import ASTSidebar from '@/components/ast/ASTSidebar'
import { Upload, Code2, GitBranch, X, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import { CATEGORY_COLORS } from '@/components/ast/ASTNode'

const SIDEBAR_MIN = 200
const SIDEBAR_MAX = 640
const SIDEBAR_DEFAULT = 300

export default function ASTPage() {
  const { setData, clear, tree, viewMode, setViewMode, sourceCode, fileName } =
    useASTViewerStore()
  const fileRef = useRef<HTMLInputElement>(null)

  // ── Resizable sidebar ────────────────────────────────────────────────────
  const [sidebarW, setSidebarW] = useState(SIDEBAR_DEFAULT)
  const resizing = useRef(false)
  const resizeStartX = useRef(0)
  const resizeStartW = useRef(0)

  useEffect(() => {
    function onMove(e: MouseEvent) {
      if (!resizing.current) return
      const delta = resizeStartX.current - e.clientX
      setSidebarW(Math.max(SIDEBAR_MIN, Math.min(SIDEBAR_MAX, resizeStartW.current + delta)))
    }
    function onUp() { resizing.current = false; document.body.style.cursor = '' }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
  }, [])

  function startResize(e: React.MouseEvent) {
    resizing.current = true
    resizeStartX.current = e.clientX
    resizeStartW.current = sidebarW
    document.body.style.cursor = 'col-resize'
    e.preventDefault()
  }

  // ── Live code editing ────────────────────────────────────────────────────
  const [editSource, setEditSource] = useState(sourceCode)
  const [isParsing, setIsParsing] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()

  // Sync textarea when a new file is loaded
  useEffect(() => { setEditSource(sourceCode) }, [sourceCode])

  const { mutate: reparse } = useMutation({
    mutationFn: (src: string) =>
      Promise.all([astApi.treeRaw(fileName || 'edit.go', src), astApi.inspectRaw(fileName || 'edit.go', src)]),
    onMutate: () => setIsParsing(true),
    onSuccess: ([treeRes, inspectRes]) => {
      setData(treeRes.data, inspectRes.data, editSource, fileName || 'edit.go')
      setIsParsing(false)
    },
    onError: () => setIsParsing(false),
  })

  function handleCodeChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const val = e.target.value
    setEditSource(val)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => reparse(val), 700)
  }

  // ── File upload ──────────────────────────────────────────────────────────
  const { mutate: upload, isPending: uploading } = useMutation({
    mutationFn: async ({ file, content, name }: { file?: File; content?: string; name: string }) => {
      if (file) {
        const [treeRes, inspectRes] = await Promise.all([astApi.treeFile(file), astApi.inspectFile(file)])
        return { tree: treeRes.data, inspection: inspectRes.data, source: content ?? '', name }
      }
      const [treeRes, inspectRes] = await Promise.all([astApi.treeRaw(name, content!), astApi.inspectRaw(name, content!)])
      return { tree: treeRes.data, inspection: inspectRes.data, source: content!, name }
    },
    onSuccess: ({ tree, inspection, source, name }) => {
      setData(tree, inspection, source, name)
      toast.success(`Parsed ${name}`)
    },
    onError: (err: unknown) => {
      toast.error((err as { response?: { data?: { error?: string } } }).response?.data?.error ?? 'Parse failed')
    },
  })

  const handleFile = useCallback((file: File) => {
    if (!file.name.endsWith('.go')) { toast.error('Only .go files supported'); return }
    const reader = new FileReader()
    reader.onload = (e) => upload({ file, content: e.target?.result as string, name: file.name })
    reader.readAsText(file)
  }, [upload])

  const onDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const isLoading = uploading

  return (
    <div className="flex flex-col h-full">
      {/* ── Top bar ── */}
      <div className="flex items-center gap-3 px-4 py-2 border-b border-border bg-card shrink-0 min-w-0">
        <GitBranch size={14} className="text-primary shrink-0" />
        <span className="text-sm font-semibold text-foreground truncate max-w-[160px]">
          {fileName || 'AST Visualizer'}
        </span>

        {tree && (
          <>
            <span className="text-muted-foreground/30">·</span>
            <span className="text-xs text-muted-foreground shrink-0">
              {useASTViewerStore.getState().nodeMap.size} nodes
            </span>

            {isParsing && (
              <span className="flex items-center gap-1 text-[10px] text-primary/70">
                <RefreshCw size={10} className="animate-spin" /> reparsing…
              </span>
            )}

            <div className="flex-1 min-w-0" />

            {/* Category legend */}
            <div className="hidden xl:flex items-center gap-1">
              {(['function', 'control', 'statement', 'expression', 'type', 'import'] as const).map((cat) => (
                <span key={cat} className="text-[10px] px-1.5 py-0.5 rounded-full font-medium shrink-0"
                  style={{ background: `${CATEGORY_COLORS[cat].border}22`, color: CATEGORY_COLORS[cat].border }}>
                  {cat}
                </span>
              ))}
            </div>

            <div className="flex-1 min-w-0" />

            {/* View toggle */}
            <div className="flex rounded-lg overflow-hidden border border-border text-xs shrink-0">
              <button onClick={() => setViewMode('flow')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 transition-colors ${
                  viewMode === 'flow' ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground hover:bg-accent'}`}>
                <GitBranch size={12} /> Flow
              </button>
              <button onClick={() => setViewMode('code')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 transition-colors ${
                  viewMode === 'code' ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground hover:bg-accent'}`}>
                <Code2 size={12} /> Code
              </button>
            </div>

            <button onClick={clear} title="Close file"
              className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-accent transition-colors shrink-0">
              <X size={14} />
            </button>
          </>
        )}

        {!tree && <div className="flex-1" />}
      </div>

      {/* ── Main area ── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* Canvas / Code / Upload */}
        <div className="flex-1 min-w-0 relative overflow-hidden">
          {!tree ? (
            <UploadZone
              onPaste={(name, content) => upload({ content, name })}
              isPending={isLoading}
              onDrop={onDrop}
              fileRef={fileRef}
            />
          ) : viewMode === 'flow' ? (
            <ReactFlowProvider>
              <ASTFlowCanvas />
            </ReactFlowProvider>
          ) : (
            /* Live code editor */
            <div className="h-full flex flex-col">
              <div className="flex items-center gap-2 px-3 py-1.5 border-b border-border bg-card/50 shrink-0">
                <Code2 size={12} className="text-muted-foreground" />
                <span className="text-[11px] text-muted-foreground font-mono">{fileName}</span>
                <span className="ml-auto text-[10px] text-muted-foreground/50">
                  edit code · AST updates automatically
                </span>
                {isParsing && (
                  <span className="flex items-center gap-1 text-[10px] text-primary/70">
                    <RefreshCw size={9} className="animate-spin" /> parsing
                  </span>
                )}
              </div>
              <textarea
                value={editSource}
                onChange={handleCodeChange}
                spellCheck={false}
                className="flex-1 w-full p-4 font-mono text-xs text-foreground/85 bg-background resize-none focus:outline-none leading-relaxed"
                style={{ tabSize: 2 }}
              />
            </div>
          )}

          <input ref={fileRef} type="file" accept=".go" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = '' }} />
        </div>

        {/* ── Resize handle ── */}
        <div
          onMouseDown={startResize}
          className="w-1 shrink-0 cursor-col-resize bg-border hover:bg-primary/50 transition-colors active:bg-primary"
          title="Drag to resize"
        />

        {/* ── Right sidebar (resizable) ── */}
        <aside
          className="shrink-0 border-l border-border bg-card overflow-hidden"
          style={{ width: sidebarW }}
        >
          <ASTSidebar />
        </aside>
      </div>
    </div>
  )
}

// ─── Upload zone ──────────────────────────────────────────────────────────────

function UploadZone({
  onPaste, isPending, onDrop, fileRef,
}: {
  onPaste: (name: string, content: string) => void
  isPending: boolean
  onDrop: (e: DragEvent<HTMLDivElement>) => void
  fileRef: React.RefObject<HTMLInputElement>
}) {
  return (
    <div className="h-full flex items-center justify-center p-8">
      <div
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => fileRef.current?.click()}
        className="w-full max-w-md flex flex-col items-center gap-5 rounded-2xl border-2 border-dashed border-border hover:border-primary/60 hover:bg-accent/10 transition-colors cursor-pointer py-12 px-8 text-center"
      >
        {isPending
          ? <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          : <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
              <Upload size={24} className="text-muted-foreground" />
            </div>
        }
        <div>
          <p className="text-base font-semibold text-foreground">
            {isPending ? 'Parsing…' : 'Drop a .go file'}
          </p>
          <p className="text-sm text-muted-foreground mt-1">or click to browse</p>
        </div>

        {!isPending && (
          <div className="w-full" onClick={(e) => e.stopPropagation()}>
            <p className="text-xs text-muted-foreground/50 mb-2">or paste source:</p>
            <QuickPasteForm onSubmit={onPaste} />
          </div>
        )}
      </div>
    </div>
  )
}

function QuickPasteForm({ onSubmit }: { onSubmit: (name: string, content: string) => void }) {
  const nameRef = useRef<HTMLInputElement>(null)
  const contentRef = useRef<HTMLTextAreaElement>(null)

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        const name = nameRef.current?.value.trim() || 'input.go'
        const content = contentRef.current?.value.trim() || ''
        if (content) onSubmit(name, content)
      }}
      className="space-y-2 text-left"
    >
      <input ref={nameRef} defaultValue="main.go"
        className="w-full px-2.5 py-1.5 rounded-lg bg-muted border border-border text-foreground text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary/40" />
      <textarea ref={contentRef} rows={4} placeholder={'package main\n\nfunc main() {\n}'}
        className="w-full px-2.5 py-2 rounded-lg bg-muted border border-border text-foreground text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none" />
      <button type="submit"
        className="w-full py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors">
        Parse
      </button>
    </form>
  )
}
