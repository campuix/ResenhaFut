import { iniciais, mesAbrev, mesAnoCurto } from '../lib/format'

function CabecalhoPerfil({ perfilData }) {
  const isAdmin = perfilData.papel === 'dono' || perfilData.papel === 'admin'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
      <div
        style={{
          flex: 'none',
          width: '76px',
          height: '76px',
          borderRadius: '24px',
          background: '#C9F24D',
          color: '#08130E',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          font: "700 28px/1 'Barlow Condensed', sans-serif",
          letterSpacing: '.03em',
        }}
      >
        {iniciais(perfilData.nome ?? 'Jogador')}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ font: "800 26px/1.05 'Barlow Condensed', sans-serif", letterSpacing: '-.01em' }}>{perfilData.nome}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '9px' }}>
          <div
            style={{
              padding: '5px 10px',
              borderRadius: '999px',
              background: isAdmin ? 'rgba(201,242,77,.16)' : 'rgba(234,243,236,.1)',
              color: isAdmin ? '#C9F24D' : 'rgba(234,243,236,.75)',
              font: "500 10px/1 'IBM Plex Mono', monospace",
              letterSpacing: '.08em',
            }}
          >
            {perfilData.papel === 'dono' ? 'DONO' : perfilData.papel === 'admin' ? 'ADMIN' : 'JOGADOR'}
          </div>
          <div style={{ font: '400 12px/1 Barlow, sans-serif', color: 'rgba(234,243,236,.6)' }}>
            desde {mesAnoCurto(new Date(perfilData.entrouEm))}
          </div>
        </div>
      </div>
    </div>
  )
}

function EstatisticasPerfil({ perfilData }) {
  return (
    <div style={{ display: 'flex', gap: '10px' }}>
      <div style={{ flex: 1, padding: '15px 16px', borderRadius: '16px', background: '#0F2117', border: '1px solid rgba(234,243,236,.07)' }}>
        <div style={{ font: "800 26px/1 'Barlow Condensed', sans-serif", color: '#C9F24D' }}>{perfilData.presencasCount}</div>
        <div style={{ font: '400 11.5px/1.25 Barlow, sans-serif', color: 'rgba(234,243,236,.7)', marginTop: '6px' }}>
          presenças em {perfilData.totalEncerrados}
        </div>
      </div>
      <div style={{ flex: 1, padding: '15px 16px', borderRadius: '16px', background: '#0F2117', border: '1px solid rgba(234,243,236,.07)' }}>
        <div style={{ font: "800 26px/1 'Barlow Condensed', sans-serif" }}>{perfilData.faltas ?? 0}</div>
        <div style={{ font: '400 11.5px/1.25 Barlow, sans-serif', color: 'rgba(234,243,236,.7)', marginTop: '6px' }}>
          {perfilData.faltas === 1 ? 'falta no ano' : 'faltas no ano'}
        </div>
      </div>
      <div style={{ flex: 1, padding: '15px 16px', borderRadius: '16px', background: '#0F2117', border: '1px solid rgba(234,243,236,.07)' }}>
        <div style={{ font: "800 26px/1 'Barlow Condensed', sans-serif", color: perfilData.emDia ? '#C9F24D' : '#F2C14D' }}>
          {perfilData.emDia ? 'em dia' : 'devendo'}
        </div>
        <div style={{ font: '400 11.5px/1.25 Barlow, sans-serif', color: 'rgba(234,243,236,.7)', marginTop: '6px' }}>pagamentos</div>
      </div>
    </div>
  )
}

function LinhaMeusDados({ onAbrir }) {
  return (
    <div
      onClick={onAbrir}
      style={{
        padding: '16px 18px',
        borderRadius: '16px',
        background: '#0F2117',
        border: '1px solid rgba(234,243,236,.07)',
        cursor: 'pointer',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ font: '600 15px/1 Barlow, sans-serif' }}>Meus dados</div>
        <div style={{ font: '400 15px/1 Barlow, sans-serif', color: 'rgba(234,243,236,.4)' }}>›</div>
      </div>
      <div style={{ font: '400 12px/1.4 Barlow, sans-serif', color: 'rgba(234,243,236,.6)', marginTop: '6px' }}>
        Nome, telefone, e-mail e Pix
      </div>
    </div>
  )
}

export function HistoricoScreen({ historicoData, perfilData, onAbrirMeusDados, onSairDaConta }) {
  const { isAdmin, peladasNoAno, anoAtual, statB, jogos } = historicoData
  const statBLabel = isAdmin ? 'faltas no grupo' : 'suas presenças'

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {perfilData && !perfilData.semGrupo && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <CabecalhoPerfil perfilData={perfilData} />
          <EstatisticasPerfil perfilData={perfilData} />
          <LinhaMeusDados onAbrir={onAbrirMeusDados} />
        </div>
      )}

      <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
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

      <div
        onClick={onSairDaConta}
        style={{
          marginTop: '24px',
          padding: '15px',
          borderRadius: '14px',
          textAlign: 'center',
          width: '100%',
          border: '1px solid rgba(242,132,61,.35)',
          color: '#F2843D',
          font: '600 15px/1 Barlow, sans-serif',
          cursor: 'pointer',
        }}
      >
        Sair da conta
      </div>
    </div>
  )
}
