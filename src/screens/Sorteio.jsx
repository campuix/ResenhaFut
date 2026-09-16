import { useMemo, useState } from 'react'
import { AVATAR_COLORS, iniciais, nivelFmt } from '../lib/format'
import { VESTS } from '../lib/vests'

export function SorteioScreen({ userId, sorteioData, onSortear }) {
  const [mode, setMode] = useState('eq')
  const [sorting, setSorting] = useState(false)
  const [hideResult, setHideResult] = useState(false)

  const { confirmados, membrosPub, timesSalvos } = sorteioData
  const nConfirmed = confirmados.length

  const nivelMap = useMemo(() => new Map(membrosPub.map((m) => [m.usuario_id, Number(m.nivel)])), [membrosPub])

  const teams = useMemo(() => {
    if (timesSalvos.length === 0) return []
    const ultimoSorteio = timesSalvos.reduce((max, t) => (t.sorteado_em > max ? t.sorteado_em : max), timesSalvos[0].sorteado_em)
    const lote = timesSalvos.filter((t) => t.sorteado_em === ultimoSorteio)
    const porOrdemDoColete = (t) => {
      const idx = VESTS.findIndex((v) => v.nome === t.nome)
      return idx === -1 ? 99 : idx
    }
    return lote
      .slice()
      .sort((a, b) => porOrdemDoColete(a) - porOrdemDoColete(b))
      .map((t, i) => {
        const vest = VESTS[i % VESTS.length]
        const jogadores = (t.time_jogadores ?? []).map((tj, j) => {
          const nivel = nivelMap.get(tj.usuario_id)
          const souEu = tj.usuario_id === userId
          const nome = tj.profiles?.nome ?? 'Jogador'
          return {
            key: tj.usuario_id,
            nome: souEu ? 'Você' : nome,
            ini: souEu ? 'VC' : iniciais(nome),
            bg: AVATAR_COLORS[j % AVATAR_COLORS.length],
            meta: nivelFmt(nivel) ?? '',
          }
        })
        const niveis = (t.time_jogadores ?? []).map((tj) => nivelMap.get(tj.usuario_id)).filter((n) => n != null)
        const media = niveis.length ? niveis.reduce((a, b) => a + b, 0) / niveis.length : null
        return {
          key: t.id,
          name: t.nome,
          bg: vest.bg,
          fg: vest.fg,
          avgLabel: media != null ? `NÍVEL MÉDIO ${nivelFmt(media)}` : `${jogadores.length} JOGADORES`,
          players: jogadores,
        }
      })
  }, [timesSalvos, nivelMap, userId])

  const hasTeams = !hideResult && teams.length > 0

  const handleSortear = async () => {
    setSorting(true)
    setHideResult(false)
    try {
      await Promise.all([onSortear(mode), new Promise((resolve) => setTimeout(resolve, 900))])
    } catch (err) {
      alert('Não deu para sortear os times: ' + err.message)
    } finally {
      setSorting(false)
    }
  }

  const changeMode = (next) => {
    if (next === mode) return
    setMode(next)
    setHideResult(true)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div
        style={{
          display: 'flex',
          gap: '6px',
          padding: '5px',
          borderRadius: '14px',
          background: '#0F2117',
          border: '1px solid rgba(234,243,236,.07)',
        }}
      >
        <div
          onClick={() => changeMode('eq')}
          style={{
            flex: 1,
            textAlign: 'center',
            padding: '11px 0',
            borderRadius: '10px',
            cursor: 'pointer',
            font: '600 14px/1 Barlow, sans-serif',
            background: mode === 'eq' ? 'rgba(201,242,77,.15)' : 'transparent',
            color: mode === 'eq' ? '#C9F24D' : 'rgba(234,243,236,.72)',
          }}
        >
          Equilibrado
        </div>
        <div
          onClick={() => changeMode('al')}
          style={{
            flex: 1,
            textAlign: 'center',
            padding: '11px 0',
            borderRadius: '10px',
            cursor: 'pointer',
            font: '600 14px/1 Barlow, sans-serif',
            background: mode === 'al' ? 'rgba(201,242,77,.15)' : 'transparent',
            color: mode === 'al' ? '#C9F24D' : 'rgba(234,243,236,.72)',
          }}
        >
          Aleatório
        </div>
      </div>

      {sorting ? (
        <div
          style={{
            borderRadius: '20px',
            padding: '54px 20px',
            background: '#0F2117',
            border: '1px solid rgba(234,243,236,.07)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px',
          }}
        >
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              border: '3px solid rgba(201,242,77,.2)',
              borderTopColor: '#C9F24D',
              animation: 'rf-spin .7s linear infinite',
            }}
          />
          <div style={{ font: '600 15px/1 Barlow, sans-serif', color: 'rgba(234,243,236,.6)' }}>
            Misturando a resenha…
          </div>
        </div>
      ) : !hasTeams ? (
        <div
          style={{
            borderRadius: '20px',
            padding: '44px 24px',
            background: '#0F2117',
            border: '1px dashed rgba(201,242,77,.25)',
            textAlign: 'center',
          }}
        >
          <div style={{ font: "800 24px/1.1 'Barlow Condensed', sans-serif", letterSpacing: '-.01em' }}>
            {nConfirmed} confirmados
          </div>
          <div
            style={{
              font: '400 13.5px/1.45 Barlow, sans-serif',
              color: 'rgba(234,243,236,.7)',
              marginTop: '8px',
              maxWidth: '240px',
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            Qualquer um do grupo pode sortear. O modo equilibrado usa o nível que o admin definiu para cada jogador.
          </div>
          <div
            onClick={nConfirmed > 0 ? handleSortear : undefined}
            style={{
              marginTop: '22px',
              display: 'inline-block',
              padding: '15px 26px',
              borderRadius: '14px',
              background: '#C9F24D',
              color: '#08130E',
              font: '700 16px/1 Barlow, sans-serif',
              cursor: nConfirmed > 0 ? 'pointer' : 'default',
              opacity: nConfirmed > 0 ? 1 : 0.5,
            }}
          >
            Sortear times
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', animation: 'rf-in .35s ease both' }}>
          {teams.map((t) => (
            <div
              key={t.key}
              style={{ borderRadius: '20px', background: '#0F2117', border: '1px solid rgba(234,243,236,.07)', overflow: 'hidden' }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 18px',
                  background: t.bg,
                  color: t.fg,
                }}
              >
                <div
                  style={{
                    font: "800 19px/1 'Barlow Condensed', sans-serif",
                    letterSpacing: '.05em',
                    textTransform: 'uppercase',
                  }}
                >
                  {t.name}
                </div>
                <div style={{ font: "500 10px/1 'IBM Plex Mono', monospace", opacity: 0.7 }}>{t.avgLabel}</div>
              </div>
              <div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {t.players.map((p) => (
                  <div key={p.key} style={{ display: 'flex', alignItems: 'center', gap: '11px' }}>
                    <div
                      style={{
                        flex: 'none',
                        width: '30px',
                        height: '30px',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        font: "700 12px/1 'Barlow Condensed', sans-serif",
                        background: p.bg,
                        color: '#08130E',
                      }}
                    >
                      {p.ini}
                    </div>
                    <div style={{ flex: 1, font: '600 14.5px/1.2 Barlow, sans-serif' }}>{p.nome}</div>
                    <div style={{ font: '400 11.5px/1 Barlow, sans-serif', color: 'rgba(234,243,236,.66)' }}>{p.meta}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div style={{ display: 'flex', gap: '10px' }}>
            <div
              onClick={handleSortear}
              style={{
                flex: 1,
                textAlign: 'center',
                padding: '14px 0',
                borderRadius: '14px',
                border: '1px solid rgba(201,242,77,.3)',
                color: '#C9F24D',
                font: '600 15px/1 Barlow, sans-serif',
                cursor: 'pointer',
              }}
            >
              Sortear de novo
            </div>
            <div
              style={{
                flex: 1,
                textAlign: 'center',
                padding: '14px 0',
                borderRadius: '14px',
                background: '#C9F24D',
                color: '#08130E',
                font: '700 15px/1 Barlow, sans-serif',
                cursor: 'pointer',
                opacity: 0.6,
              }}
              title="Em breve"
            >
              Mandar no grupo
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
