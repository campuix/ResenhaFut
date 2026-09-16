const TABS = [
  { id: 'jogo', label: 'Jogo' },
  { id: 'times', label: 'Times' },
  { id: 'caixa', label: 'Caixa' },
  { id: 'grupo', label: 'Grupo' },
  { id: 'hist', label: 'Histórico' },
]

export function TabBar({ tab, onChange }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: '14px',
        right: '14px',
        bottom: '26px',
        zIndex: 40,
        display: 'flex',
        gap: '4px',
        padding: '7px',
        borderRadius: '22px',
        background: 'rgba(12,29,20,.86)',
        backdropFilter: 'blur(18px)',
        border: '1px solid rgba(234,243,236,.1)',
      }}
    >
      {TABS.map((t) => {
        const active = t.id === tab
        return (
          <div
            key={t.id}
            onClick={() => onChange(t.id)}
            style={{
              flex: 1,
              textAlign: 'center',
              padding: '12px 0 11px',
              borderRadius: '16px',
              cursor: 'pointer',
              background: active ? '#C9F24D' : 'transparent',
            }}
          >
            <div
              style={{
                font: '600 12.5px/1 Barlow, sans-serif',
                color: active ? '#08130E' : 'rgba(234,243,236,.72)',
              }}
            >
              {t.label}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export { TABS }
