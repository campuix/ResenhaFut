export function Header({ eyebrow, title, papel, onConvidar }) {
  const isAdmin = papel === 'dono' || papel === 'admin'
  const chip = isAdmin
    ? { label: papel === 'dono' ? 'DONO' : 'ADMIN', bg: 'rgba(201,242,77,.16)', fg: '#C9F24D' }
    : { label: 'JOGADOR', bg: 'rgba(234,243,236,.1)', fg: 'rgba(234,243,236,.75)' }

  return (
    <div
      style={{
        flex: 'none',
        padding: '62px 20px 14px',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        background: '#08130E',
      }}
    >
      <div>
        <div
          style={{
            font: "500 10px/1 'IBM Plex Mono', monospace",
            letterSpacing: '.14em',
            color: 'rgba(234,243,236,.68)',
            textTransform: 'uppercase',
          }}
        >
          {eyebrow}
        </div>
        <div
          style={{
            font: "800 30px/1 'Barlow Condensed', sans-serif",
            letterSpacing: '-.01em',
            marginTop: '7px',
          }}
        >
          {title}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div
          style={{
            padding: '9px 12px',
            borderRadius: '999px',
            font: "500 10px/1 'IBM Plex Mono', monospace",
            letterSpacing: '.08em',
            background: chip.bg,
            color: chip.fg,
          }}
        >
          {chip.label}
        </div>
        <div
          onClick={onConvidar}
          style={{
            padding: '9px 13px',
            borderRadius: '999px',
            border: '1px solid rgba(201,242,77,.28)',
            color: '#C9F24D',
            font: "600 12px/1 Barlow, sans-serif",
            cursor: 'pointer',
          }}
        >
          Convidar
        </div>
      </div>
    </div>
  )
}
