export function CenterMessage({ children }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '50vh',
        textAlign: 'center',
        font: '400 14px/1.5 Barlow, sans-serif',
        color: 'rgba(234,243,236,.7)',
        padding: '0 12px',
      }}
    >
      {children}
    </div>
  )
}
