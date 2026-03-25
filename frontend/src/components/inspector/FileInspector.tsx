import { useState } from 'react'
import type { FileInspection, FunctionInfo, TypeInfo, InterfaceInfo, VarInfo, ImportInfo } from '@/lib/api'
import { ChevronDown, ChevronRight } from 'lucide-react'

interface Props {
  inspection: FileInspection
}

export default function FileInspector({ inspection }: Props) {
  return (
    <div className="h-full overflow-y-auto inspector-scroll p-4 space-y-3">
      {/* Header */}
      <div className="pb-3 border-b border-border">
        <p className="text-sm font-semibold text-foreground">{inspection.fileName}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          package <span className="text-primary font-mono">{inspection.packageName}</span>
        </p>
      </div>

      {inspection.parseErrors && inspection.parseErrors.length > 0 && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/30 p-3">
          <p className="text-xs font-semibold text-destructive mb-1">Parse errors</p>
          {inspection.parseErrors.map((e, i) => (
            <p key={i} className="text-xs text-destructive/80 font-mono">{e}</p>
          ))}
        </div>
      )}

      <Section
        title="Functions"
        count={inspection.functions.length}
        color="text-yellow-400"
      >
        {inspection.functions.map((fn) => (
          <FunctionCard key={fn.name + fn.lineStart} fn={fn} />
        ))}
      </Section>

      <Section
        title="Types"
        count={inspection.types.length}
        color="text-sky-400"
      >
        {inspection.types.map((t) => (
          <TypeCard key={t.name} type={t} />
        ))}
      </Section>

      <Section
        title="Interfaces"
        count={inspection.interfaces.length}
        color="text-emerald-400"
      >
        {inspection.interfaces.map((iface) => (
          <InterfaceCard key={iface.name} iface={iface} />
        ))}
      </Section>

      <Section
        title="Imports"
        count={inspection.imports.length}
        color="text-purple-400"
      >
        <div className="space-y-0.5">
          {inspection.imports.map((imp) => (
            <ImportRow key={imp.path} imp={imp} />
          ))}
        </div>
      </Section>

      <Section
        title="Variables"
        count={inspection.variables.length}
        color="text-orange-400"
      >
        {inspection.variables.map((v) => (
          <VarRow key={v.name} v={v} />
        ))}
      </Section>

      <Section
        title="Constants"
        count={inspection.constants.length}
        color="text-rose-400"
      >
        {inspection.constants.map((c) => (
          <VarRow key={c.name} v={c} isConst />
        ))}
      </Section>
    </div>
  )
}

function Section({
  title,
  count,
  color,
  children,
}: {
  title: string
  count: number
  color: string
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(true)

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-3 py-2 bg-card hover:bg-accent transition-colors"
        data-testid={`section-${title.toLowerCase()}`}
      >
        <div className="flex items-center gap-2">
          {open ? <ChevronDown size={13} className="text-muted-foreground" /> : <ChevronRight size={13} className="text-muted-foreground" />}
          <span className={`text-xs font-semibold ${color}`}>{title}</span>
        </div>
        <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
          {count}
        </span>
      </button>
      {open && count > 0 && (
        <div className="p-2 space-y-1 bg-background/30">{children}</div>
      )}
      {open && count === 0 && (
        <p className="text-xs text-muted-foreground/60 px-3 py-2 bg-background/30">None</p>
      )}
    </div>
  )
}

function FunctionCard({ fn }: { fn: FunctionInfo }) {
  const [exp, setExp] = useState(false)
  return (
    <div
      className="rounded-md border border-border/60 bg-card/50 overflow-hidden"
      data-testid={`fn-${fn.name}`}
    >
      <button
        onClick={() => setExp((v) => !v)}
        className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-accent/50 transition-colors text-left"
      >
        <div className="flex items-center gap-1.5 min-w-0">
          {exp ? <ChevronDown size={11} className="shrink-0 text-muted-foreground" /> : <ChevronRight size={11} className="shrink-0 text-muted-foreground" />}
          {fn.receiver && (
            <span className="text-xs text-muted-foreground font-mono shrink-0">({fn.receiver})</span>
          )}
          <span className={`text-xs font-mono font-semibold truncate ${fn.isExported ? 'text-yellow-300' : 'text-foreground'}`}>
            {fn.name}
          </span>
        </div>
        <span className="text-xs text-muted-foreground/50 shrink-0 ml-1">:{fn.lineStart}</span>
      </button>
      {exp && (
        <div className="px-3 pb-2 space-y-1 text-xs font-mono text-muted-foreground border-t border-border/40">
          {fn.comment && <p className="text-green-400/70 pt-1 italic">{fn.comment}</p>}
          {fn.params.length > 0 && (
            <p><span className="text-sky-400/70">params: </span>{fn.params.join(', ')}</p>
          )}
          {fn.returns.length > 0 && (
            <p><span className="text-purple-400/70">returns: </span>{fn.returns.join(', ')}</p>
          )}
          <p className="text-muted-foreground/40">lines {fn.lineStart}–{fn.lineEnd}</p>
        </div>
      )}
    </div>
  )
}

function TypeCard({ type: t }: { type: TypeInfo }) {
  const [exp, setExp] = useState(false)
  return (
    <div className="rounded-md border border-border/60 bg-card/50 overflow-hidden">
      <button
        onClick={() => setExp((v) => !v)}
        className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-accent/50 transition-colors text-left"
      >
        <div className="flex items-center gap-1.5">
          {exp ? <ChevronDown size={11} className="text-muted-foreground" /> : <ChevronRight size={11} className="text-muted-foreground" />}
          <span className={`text-xs font-mono font-semibold ${t.isExported ? 'text-sky-300' : 'text-foreground'}`}>
            {t.name}
          </span>
          <span className="text-xs text-muted-foreground/50">{t.kind}</span>
        </div>
        {t.fields && (
          <span className="text-xs text-muted-foreground/50">{t.fields.length} fields</span>
        )}
      </button>
      {exp && t.fields && t.fields.length > 0 && (
        <div className="px-3 pb-2 border-t border-border/40">
          <table className="w-full text-xs font-mono mt-1">
            <tbody>
              {t.fields.map((f) => (
                <tr key={f.name} className="border-b border-border/20 last:border-0">
                  <td className="py-0.5 pr-3 text-foreground/80">{f.name}</td>
                  <td className="py-0.5 pr-3 text-sky-400/80">{f.type}</td>
                  {f.tag && <td className="py-0.5 text-muted-foreground/50 text-[10px]">{f.tag}</td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function InterfaceCard({ iface }: { iface: InterfaceInfo }) {
  const [exp, setExp] = useState(false)
  return (
    <div className="rounded-md border border-border/60 bg-card/50 overflow-hidden">
      <button
        onClick={() => setExp((v) => !v)}
        className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-accent/50 transition-colors text-left"
      >
        <div className="flex items-center gap-1.5">
          {exp ? <ChevronDown size={11} className="text-muted-foreground" /> : <ChevronRight size={11} className="text-muted-foreground" />}
          <span className={`text-xs font-mono font-semibold ${iface.isExported ? 'text-emerald-300' : 'text-foreground'}`}>
            {iface.name}
          </span>
        </div>
        <span className="text-xs text-muted-foreground/50">{iface.methods.length} methods</span>
      </button>
      {exp && iface.methods.length > 0 && (
        <div className="px-3 pb-2 space-y-1 border-t border-border/40 pt-1">
          {iface.methods.map((m) => (
            <p key={m.name} className="text-xs font-mono text-foreground/70">
              <span className="text-emerald-400/80">{m.name}</span>
              ({m.params.join(', ')})
              {m.returns.length > 0 && <span className="text-muted-foreground"> → {m.returns.join(', ')}</span>}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}

function ImportRow({ imp }: { imp: ImportInfo }) {
  return (
    <div className="flex items-center gap-2 px-2 py-0.5 rounded hover:bg-accent/30">
      {imp.alias && (
        <span className="text-xs font-mono text-orange-300/70">{imp.alias}</span>
      )}
      <span className="text-xs font-mono text-purple-300/80">{imp.path}</span>
    </div>
  )
}

function VarRow({ v, isConst }: { v: VarInfo; isConst?: boolean }) {
  return (
    <div className="flex items-center gap-2 px-2 py-0.5 rounded hover:bg-accent/30">
      <span className={`text-xs font-mono ${v.isExported ? (isConst ? 'text-rose-300' : 'text-orange-300') : 'text-foreground/70'}`}>
        {v.name}
      </span>
      {v.type && <span className="text-xs font-mono text-sky-400/60">{v.type}</span>}
      {v.value && <span className="text-xs font-mono text-muted-foreground/60">= {v.value}</span>}
    </div>
  )
}
