import { useState } from 'react'
import { ChevronDown, ChevronRight, FileCode, Layers, Trash2 } from 'lucide-react'
import { useASTViewerStore, useActiveTab, type CustomNodeEntry } from '@/store/astViewerStore'
import type { TreeNode, FunctionInfo, TypeInfo, InterfaceInfo, VarInfo, ImportInfo } from '@/lib/api'
import { CATEGORY_COLORS } from './ASTNode'

type Tab = 'node' | 'file'

const EMPTY_NODE_MAP = new Map<string, TreeNode>()
const EMPTY_CUSTOM_MAP = new Map<string, CustomNodeEntry>()

export default function ASTSidebar() {
  const activeTab = useActiveTab()
  const { selectedNodeId, removeCustomNode, hideNode } = useASTViewerStore()

  const nodeMap = activeTab?.nodeMap ?? EMPTY_NODE_MAP
  const inspection = activeTab?.inspection ?? null
  const sourceCode = activeTab?.sourceCode ?? ''
  const customNodes = activeTab?.customNodes ?? EMPTY_CUSTOM_MAP

  const selectedNode = selectedNodeId ? nodeMap.get(selectedNodeId) : null
  const isCustomNode = selectedNodeId ? customNodes.has(selectedNodeId) : false

  // 'pane' tracks which sidebar panel tab is selected
  const [pane, setPane] = useState<Tab>('file')
  const activePane = selectedNode ? pane : 'file'

  function deleteSelected() {
    if (!selectedNodeId) return
    if (isCustomNode) removeCustomNode(selectedNodeId)
    else hideNode(selectedNodeId)
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Tab bar */}
      <div className="flex border-b border-border shrink-0">
        <TabBtn
          active={activePane === 'node'}
          disabled={!selectedNode}
          icon={<Layers size={12} />}
          label="Node"
          onClick={() => setPane('node')}
        />
        <TabBtn
          active={activePane === 'file'}
          icon={<FileCode size={12} />}
          label="File"
          onClick={() => setPane('file')}
        />
        {selectedNode && (
          <button
            onClick={deleteSelected}
            title={isCustomNode ? 'Delete node' : 'Hide node (Del)'}
            className="px-2.5 border-l border-border text-muted-foreground/50 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
          >
            <Trash2 size={12} />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto inspector-scroll">
        {activePane === 'node' && selectedNode ? (
          <div className="p-3 space-y-3">
            {/* Identity card */}
            <div
              className="p-3 border"
              style={{
                background: `${CATEGORY_COLORS[selectedNode.category]?.border ?? '#6b7280'}11`,
                borderColor: `${CATEGORY_COLORS[selectedNode.category]?.border ?? '#6b7280'}44`,
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p
                    className="text-[10px] font-bold uppercase tracking-widest mb-0.5"
                    style={{ color: CATEGORY_COLORS[selectedNode.category]?.border ?? '#6b7280' }}
                  >
                    {selectedNode.category}
                    {isCustomNode && (
                      <span className="ml-1.5 text-[9px] text-muted-foreground/40 normal-case tracking-normal">palette</span>
                    )}
                  </p>
                  <p className="text-sm font-bold font-mono text-foreground">{selectedNode.type}</p>
                  {(selectedNode.name || selectedNode.value) && (
                    <p
                      className="text-xs font-mono mt-0.5"
                      style={{ color: CATEGORY_COLORS[selectedNode.category]?.border ?? '#6b7280' }}
                    >
                      {selectedNode.name || selectedNode.value}
                    </p>
                  )}
                </div>
              </div>
              <p className="text-[10px] font-mono text-muted-foreground/50 mt-1.5">
                line {selectedNode.line ?? '?'} – {selectedNode.endLine ?? '?'}
                &nbsp;·&nbsp; col {selectedNode.col ?? '?'}
                &nbsp;·&nbsp; {selectedNode.children?.length ?? 0} children
              </p>
            </div>

            {/* Code snippet */}
            <CodeSnippet source={sourceCode} line={selectedNode.line} endLine={selectedNode.endLine} />

            {/* Props */}
            {selectedNode.props && Object.keys(selectedNode.props).length > 0 && (
              <SideSection title="Properties">
                <table className="w-full text-[11px]">
                  <tbody>
                    {Object.entries(selectedNode.props).map(([k, v]) => (
                      <tr key={k} className="border-b border-border/20 last:border-0">
                        <td className="py-1 pr-3 text-muted-foreground/60 font-mono align-top w-1/3">{k}</td>
                        <td className="py-1 text-foreground/80 font-mono break-all">{v}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </SideSection>
            )}

            {/* Children */}
            {selectedNode.children && selectedNode.children.length > 0 && (
              <SideSection title={`Children (${selectedNode.children.length})`}>
                <div className="space-y-0.5">
                  {selectedNode.children.map((c) => (
                    <ChildRow
                      key={c.id}
                      type={c.type}
                      name={c.name ?? c.value}
                      category={c.category}
                      line={c.line}
                    />
                  ))}
                </div>
              </SideSection>
            )}
          </div>
        ) : (
          /* File overview */
          inspection ? (
            <div className="p-2 space-y-1">
              <div className="px-2 py-2 border-b border-border/40 mb-2">
                <p className="text-xs font-semibold text-foreground truncate">{inspection.fileName}</p>
                <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                  package <span className="text-primary font-mono">{inspection.packageName}</span>
                </p>
              </div>

              <InspectSection title="Functions" count={inspection.functions.length} color="#3b82f6">
                {inspection.functions.map((fn) => <FnRow key={fn.name + fn.lineStart} fn={fn} />)}
              </InspectSection>

              <InspectSection title="Types" count={inspection.types.length} color="#14b8a6">
                {inspection.types.map((t) => <TypeRow key={t.name} type={t} />)}
              </InspectSection>

              <InspectSection title="Interfaces" count={inspection.interfaces.length} color="#22c55e">
                {inspection.interfaces.map((i) => <IfaceRow key={i.name} iface={i} />)}
              </InspectSection>

              <InspectSection title="Imports" count={inspection.imports.length} color="#06b6d4">
                {inspection.imports.map((imp) => <ImpRow key={imp.path} imp={imp} />)}
              </InspectSection>

              <InspectSection title="Variables" count={inspection.variables.length} color="#f97316">
                {inspection.variables.map((v) => <VarRow key={v.name} v={v} />)}
              </InspectSection>

              <InspectSection title="Constants" count={inspection.constants.length} color="#f43f5e">
                {inspection.constants.map((c) => <VarRow key={c.name} v={c} />)}
              </InspectSection>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center px-4 text-center">
              <p className="text-xs text-muted-foreground/40">Upload a .go file to inspect</p>
            </div>
          )
        )}
      </div>
    </div>
  )
}

// ─── Code snippet ────────────────────────────────────────────────────────────

function CodeSnippet({
  source,
  line,
  endLine,
}: {
  source: string
  line?: number
  endLine?: number
}) {
  if (!line || !endLine || !source) return null
  const allLines = source.split('\n')
  const snippet = allLines.slice(line - 1, endLine)
  if (snippet.length === 0) return null

  return (
    <SideSection title={`Code · lines ${line}–${endLine}`}>
      <div className="rounded-lg overflow-hidden border border-border/60 bg-[hsl(222,47%,6%)]">
        <pre className="p-2 text-[10px] font-mono leading-relaxed overflow-x-auto">
          {snippet.map((l, i) => (
            <div key={i} className="flex min-w-0">
              <span className="text-muted-foreground/25 w-7 shrink-0 text-right pr-2 select-none tabular-nums">
                {line + i}
              </span>
              <span className="text-foreground/75 break-all">{l || ' '}</span>
            </div>
          ))}
        </pre>
      </div>
    </SideSection>
  )
}

// ─── Shared sub-components ───────────────────────────────────────────────────

function TabBtn({
  active, disabled, icon, label, onClick,
}: {
  active: boolean; disabled?: boolean; icon: React.ReactNode; label: string; onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium transition-colors
        ${active ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-muted-foreground hover:text-foreground border-b-2 border-transparent'}
        ${disabled ? 'opacity-30 cursor-not-allowed' : ''}`}
    >
      {icon}{label}
    </button>
  )
}

function SideSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 mb-1.5">
        {title}
      </p>
      {children}
    </div>
  )
}

function ChildRow({
  type, name, category, line,
}: { type: string; name?: string; category: string; line?: number }) {
  const color = CATEGORY_COLORS[category]?.border ?? '#6b7280'
  return (
    <div className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-accent/30 text-[11px] font-mono">
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: color }} />
      <span className="text-foreground/70 truncate">{type}</span>
      {name && <span className="truncate" style={{ color }}>{name}</span>}
      {line && <span className="ml-auto text-muted-foreground/30 shrink-0">:{line}</span>}
    </div>
  )
}

// ─── FileInspection rows ─────────────────────────────────────────────────────

function InspectSection({
  title, count, color, children,
}: { title: string; count: number; color: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true)
  return (
    <div className="rounded-lg overflow-hidden border border-border/60">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-2.5 py-1.5 bg-card hover:bg-accent/50 transition-colors"
      >
        <div className="flex items-center gap-1.5">
          {open ? <ChevronDown size={11} className="text-muted-foreground/50" />
                : <ChevronRight size={11} className="text-muted-foreground/50" />}
          <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color }}>
            {title}
          </span>
        </div>
        <span className="text-[10px] text-muted-foreground/50 bg-muted px-1.5 py-0.5 rounded-full">
          {count}
        </span>
      </button>
      {open && count > 0 && <div className="px-1.5 pb-1.5 pt-0.5 bg-background/20 space-y-0.5">{children}</div>}
      {open && count === 0 && <p className="px-3 py-1.5 text-[10px] text-muted-foreground/30 bg-background/20">None</p>}
    </div>
  )
}

function FnRow({ fn }: { fn: FunctionInfo }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-1.5 px-2 py-1 hover:bg-accent/40 transition-colors text-left"
      >
        {open ? <ChevronDown size={10} className="text-muted-foreground/30 shrink-0" />
               : <ChevronRight size={10} className="text-muted-foreground/30 shrink-0" />}
        {fn.receiver && <span className="text-[10px] text-muted-foreground/40 font-mono shrink-0">({fn.receiver})</span>}
        <span className={`text-[11px] font-mono font-semibold truncate ${fn.isExported ? 'text-blue-300' : 'text-foreground/70'}`}>
          {fn.name}
        </span>
        <span className="ml-auto text-[10px] text-muted-foreground/30 shrink-0">:{fn.lineStart}</span>
      </button>
      {open && (
        <div className="px-3 pb-1.5 text-[10px] font-mono space-y-0.5 border-t border-border/20">
          {fn.comment && <p className="text-green-400/50 italic pt-1">{fn.comment}</p>}
          {fn.params.length > 0 && <p><span className="text-muted-foreground/40">params </span>{fn.params.join(', ')}</p>}
          {fn.returns.length > 0 && <p><span className="text-muted-foreground/40">returns </span>{fn.returns.join(', ')}</p>}
        </div>
      )}
    </div>
  )
}

function TypeRow({ type: t }: { type: TypeInfo }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-1.5 px-2 py-1 hover:bg-accent/40 transition-colors text-left"
      >
        {open ? <ChevronDown size={10} className="text-muted-foreground/30 shrink-0" />
               : <ChevronRight size={10} className="text-muted-foreground/30 shrink-0" />}
        <span className={`text-[11px] font-mono font-semibold truncate ${t.isExported ? 'text-teal-300' : 'text-foreground/70'}`}>{t.name}</span>
        <span className="text-[10px] text-muted-foreground/40 ml-1">{t.kind}</span>
        {t.fields && <span className="ml-auto text-[10px] text-muted-foreground/30 shrink-0">{t.fields.length}f</span>}
      </button>
      {open && t.fields && t.fields.length > 0 && (
        <div className="px-2 pb-1.5 border-t border-border/20">
          {t.fields.map((f) => (
            <div key={f.name} className="flex gap-2 py-0.5 text-[10px] font-mono">
              <span className="text-foreground/60">{f.name}</span>
              <span className="text-teal-400/50">{f.type}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function IfaceRow({ iface }: { iface: InterfaceInfo }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-1.5 px-2 py-1 hover:bg-accent/40 transition-colors text-left"
      >
        {open ? <ChevronDown size={10} className="text-muted-foreground/30 shrink-0" />
               : <ChevronRight size={10} className="text-muted-foreground/30 shrink-0" />}
        <span className={`text-[11px] font-mono font-semibold truncate ${iface.isExported ? 'text-green-300' : 'text-foreground/70'}`}>{iface.name}</span>
        <span className="ml-auto text-[10px] text-muted-foreground/30 shrink-0">{iface.methods.length}m</span>
      </button>
      {open && iface.methods.length > 0 && (
        <div className="px-2 pb-1.5 space-y-0.5 border-t border-border/20 pt-1">
          {iface.methods.map((m) => (
            <p key={m.name} className="text-[10px] font-mono text-foreground/50">
              <span className="text-green-400/70">{m.name}</span>({m.params.join(', ')})
            </p>
          ))}
        </div>
      )}
    </div>
  )
}

function ImpRow({ imp }: { imp: ImportInfo }) {
  return (
    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded hover:bg-accent/30 text-[10px] font-mono">
      {imp.alias && <span className="text-orange-300/60">{imp.alias}</span>}
      <span className="text-cyan-300/70 truncate">{imp.path}</span>
    </div>
  )
}

function VarRow({ v }: { v: VarInfo }) {
  return (
    <div className="flex items-center gap-2 px-2 py-0.5 rounded hover:bg-accent/30 text-[10px] font-mono">
      <span className={v.isExported ? 'text-orange-300' : 'text-foreground/50'}>{v.name}</span>
      {v.type && <span className="text-sky-400/50">{v.type}</span>}
      {v.value && <span className="text-muted-foreground/30">= {v.value}</span>}
    </div>
  )
}
