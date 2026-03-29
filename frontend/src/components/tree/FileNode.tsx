import { Handle, Position, type NodeProps } from '@xyflow/react'
import { FileTypeIcon } from '@/components/ui/FileTypeIcon'

export interface FileNodeData extends Record<string, unknown> {
  name: string
  language: string
  isSelected: boolean
  onSelect: () => void
}

export function FileNode({ data }: NodeProps) {
  const d = data as FileNodeData
  return (
    <>
      <Handle type="target" position={Position.Top} style={{ opacity: 0, pointerEvents: 'none' }} />
      <div
        data-testid={`tree-file-${d.name}`}
        onClick={(e) => { e.stopPropagation(); d.onSelect() }}
        style={{
          width: 152,
          display: 'flex',
          alignItems: 'center',
          gap: 7,
          padding: '6px 9px',
          borderRadius: 7,
          border: `1px solid ${d.isSelected ? 'var(--accent)' : 'var(--border-default)'}`,
          background: d.isSelected ? 'var(--accent-muted)' : 'var(--bg-surface)',
          boxShadow: d.isSelected ? 'var(--shadow-accent)' : 'var(--shadow-sm)',
          cursor: 'pointer',
          transition: 'all 150ms',
          userSelect: 'none',
        }}
        onMouseEnter={e => {
          if (!d.isSelected) e.currentTarget.style.background = 'var(--bg-raised)'
        }}
        onMouseLeave={e => {
          if (!d.isSelected) e.currentTarget.style.background = 'var(--bg-surface)'
        }}
      >
        <FileTypeIcon language={d.language} size="sm" />
        <span style={{
          flex: 1,
          fontSize: 11,
          fontFamily: 'var(--font-mono)',
          color: 'var(--text-primary)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {d.name}
        </span>
      </div>
    </>
  )
}
