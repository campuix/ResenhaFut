export function ErrorScreen({ mensagem, onTentarNovamente }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '50vh',
        textAlign: 'center',
        padding: '0 24px',
      }}
    >
      <div style={{ font: "800 22px/1.2 'Barlow Condensed', sans-serif" }}>Não deu para carregar</div>
      <div style={{ font: '400 13.5px/1.5 Barlow, sans-serif', color: 'rgba(234,243,236,.7)', marginTop: '8px', maxWidth: '280px' }}>
        Pode ser a conexão. Tente de novo em instantes.
      </div>
      <div
        onClick={onTentarNovamente}
        style={{
          marginTop: '18px',
          padding: '14px 24px',
          borderRadius: '14px',
          border: '1px solid rgba(201,242,77,.3)',
          color: '#C9F24D',
          font: '600 15px/1 Barlow, sans-serif',
          cursor: 'pointer',
        }}
      >
        Tentar de novo
      </div>
      {mensagem && (
        <div style={{ marginTop: '16px', font: '400 11px/1.4 Barlow, sans-serif', color: 'rgba(234,243,236,.45)', maxWidth: '280px' }}>
          {mensagem}
        </div>
      )}
    </div>
  )
}
