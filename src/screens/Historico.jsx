import { mesAbrev } from '../lib/format'

export function HistoricoScreen({ historicoData }) {
  const { isAdmin, peladasNoAno, anoAtual, statB, jogos } = historicoData
  const statBLabel = isAdmin ? 'faltas no grupo' : 'suas presenças'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'flex', gap: '10px' }}>
        <div
          style={{
            flex: 1,
            borderRadius: '18px',
            padding: '16px',
            background: '#0F2117',
            border: '1px solid rgba(234,243,236,.07)',
          }}
        >
          <div style={{ font: "800 30px/1 'Barlow Condensed', sans-serif", color: '#C9F24D' }}>{peladasNoAno}</div>
          <div style={{ font: '400 12px/1.2 Barlow, sans-serif', color: 'rgba(234,243,236,.7)', marginTop: '5px' }}>
            peladas em {anoAtual}
          </div>
        </div>
        <div
          style={{
            flex: 1,
            borderRadius: '18px',
            padding: '16px',
            background: '#0F2117',
            border: '1px solid rgba(234,243,236,.07)',
          }}
        >
          <div style={{ font: "800 30px/1 'Barlow Condensed', sans-serif", color: '#C9F24D' }}>{statB}</div>
          <div style={{ font: '400 12px/1.2 Barlow, sans-serif', color: 'rgba(234,243,236,.7)', marginTop: '5px' }}>
            {statBLabel}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '11px' }}>
        {jogos.length === 0 && (
          <div style={{ font: '400 13px/1.4 Barlow, sans-serif', color: 'rgba(234,243,236,.6)', textAlign: 'center' }}>
            Nenhuma pelada encerrada ainda.
          </div>
        )}
        {jogos.map((j) => {
          const data = new Date(j.inicio)
          return (
            <div
              key={j.id}
              style={{
                borderRadius: '18px',
                padding: '16px 18px',
                background: '#0F2117',
                border: '1px solid rgba(234,243,236,.07)',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
              }}
            >
              <div style={{ flex: 'none', textAlign: 'center', width: '40px' }}>
                <div style={{ font: "800 21px/1 'Barlow Condensed', sans-serif" }}>{data.getDate()}</div>
                <div
                  style={{
                    font: "500 9px/1 'IBM Plex Mono', monospace",
                    letterSpacing: '.1em',
                    color: 'rgba(234,243,236,.66)',
                    marginTop: '4px',
                  }}
                >
                  {mesAbrev(data)}
                </div>
              </div>
              <div style={{ width: '1px', alignSelf: 'stretch', background: 'rgba(234,243,236,.1)' }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ font: '600 14.5px/1.2 Barlow, sans-serif' }}>
                  {j.local}
                  {j.quadra ? ` · ${j.quadra}` : ''}
                </div>
                <div style={{ font: '400 11.5px/1.2 Barlow, sans-serif', color: 'rgba(234,243,236,.68)', marginTop: '3px' }}>
                  {j.confirmados} {j.confirmados === 1 ? 'jogador' : 'jogadores'}
                </div>
              </div>
              <div style={{ flex: 'none', font: '600 12px/1 Barlow, sans-serif', color: '#C9F24D', cursor: 'pointer' }} title="Em breve">
                Súmula
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
