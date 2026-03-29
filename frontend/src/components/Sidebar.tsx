import { useNavigate, useLocation } from 'react-router-dom'
import { LayoutDashboard, GitBranch, Plus } from 'lucide-react'

const NAV_ITEMS = [
  { to: '/project', icon: LayoutDashboard, label: 'Workflow' },
  { to: '/ast',     icon: GitBranch,       label: 'AST Visualizer' },
]

const MOCK_PROJECTS = [
  { id: '1', name: 'my-forge-app',     language: 'go', active: true  },
  { id: '2', name: 'instagram-clone',  language: 'ts', active: false },
  { id: '3', name: 'todo-api',         language: 'go', active: false },
]

const LANG_COLOR: Record<string, string> = {
  go: 'var(--lang-go)', ts: 'var(--lang-ts)',
  py: 'var(--lang-py)', sql: 'var(--lang-sql)',
}

export function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <aside style={{
      display: 'flex', flexDirection: 'column',
      background: 'var(--bg-surface)',
      borderRight: '1px solid var(--border-subtle)',
      overflow: 'hidden',
    }}>

      {/* ── Nav items ── */}
      <div style={{ padding: '6px 8px', borderBottom: '1px solid var(--border-subtle)' }}>
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => {
          const active = location.pathname === to || location.pathname.startsWith(to + '/')
          return (
            <button
              key={to}
              data-testid={`nav-${label.toLowerCase().replace(/\s+/g, '-')}`}
              onClick={() => navigate(to)}
              style={{
                width: '100%', height: 30,
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '0 8px', borderRadius: 5,
                fontSize: 12, fontWeight: active ? 500 : 400,
                border: 'none', cursor: 'pointer',
                transition: 'background 120ms, color 120ms',
                background: active ? 'var(--accent-muted)' : 'transparent',
                color: active ? 'var(--accent)' : 'var(--text-secondary)',
                borderLeft: `2px solid ${active ? 'var(--accent)' : 'transparent'}`,
                marginBottom: 1,
              }}
              onMouseEnter={e => {
                if (!active) {
                  e.currentTarget.style.background = 'var(--bg-raised)'
                  e.currentTarget.style.color = 'var(--text-primary)'
                }
              }}
              onMouseLeave={e => {
                if (!active) {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = 'var(--text-secondary)'
                }
              }}
            >
              <Icon size={14} style={{ flexShrink: 0 }} />
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {label}
              </span>
            </button>
          )
        })}
      </div>

      {/* ── Project list ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '8px 8px 6px', overflow: 'hidden' }}>

        {/* New project */}
        <button
          data-testid="new-project-btn"
          onClick={() => navigate('/project')}
          style={{
            width: '100%', height: 28,
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '0 8px', borderRadius: 5,
            fontSize: 11, fontWeight: 400,
            border: '1px dashed var(--border-default)',
            cursor: 'pointer', transition: 'all 150ms',
            background: 'transparent', color: 'var(--text-disabled)',
            marginBottom: 8,
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'var(--accent)'
            e.currentTarget.style.background = 'var(--accent-muted)'
            e.currentTarget.style.color = 'var(--text-secondary)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'var(--border-default)'
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = 'var(--text-disabled)'
          }}
        >
          <Plus size={11} style={{ flexShrink: 0 }} />
          New Project
        </button>

        {/* Section label */}
        <div style={{
          fontSize: 9, fontWeight: 600,
          letterSpacing: '0.10em', textTransform: 'uppercase',
          color: 'var(--text-disabled)',
          padding: '0 8px', marginBottom: 3,
        }}>
          Projects
        </div>

        {/* Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1, overflowY: 'auto' }}>
          {MOCK_PROJECTS.map(p => (
            <div
              key={p.id}
              data-testid={`project-item-${p.id}`}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                height: 28, padding: '0 8px', borderRadius: 5,
                cursor: 'pointer', transition: 'background 100ms, color 100ms',
                fontSize: 11, fontWeight: p.active ? 500 : 400,
                background: p.active ? 'rgba(99,102,241,0.12)' : 'transparent',
                color: p.active ? 'var(--text-primary)' : 'var(--text-secondary)',
                borderLeft: `2px solid ${p.active ? 'var(--accent)' : 'transparent'}`,
              }}
              onMouseEnter={e => {
                if (!p.active) {
                  e.currentTarget.style.background = 'var(--bg-raised)'
                  e.currentTarget.style.color = 'var(--text-primary)'
                }
              }}
              onMouseLeave={e => {
                if (!p.active) {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = 'var(--text-secondary)'
                }
              }}
            >
              <div style={{
                width: 5, height: 5, borderRadius: 9999, flexShrink: 0,
                background: p.active ? 'var(--accent)' : 'var(--border-strong)',
              }} />
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {p.name}
              </span>
              <span style={{
                fontSize: 9, fontFamily: 'var(--font-mono)', fontWeight: 600,
                textTransform: 'uppercase', flexShrink: 0,
                color: LANG_COLOR[p.language] ?? 'var(--text-disabled)',
              }}>
                {p.language}
              </span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
}
