import { useState } from 'react'
import { AVATAR_COLORS, diaSemanaMaiusculo, faixaHorario, iniciais, mesAbrev, nivelFmt } from '../lib/format'

export function ProximoJogoScreen({ userId, jogoData, onToggle, toggling, onEncerrar }) {
  const [showAll, setShowAll] = useState(false)
  const [confirmandoEncerrar, setConfirmandoEncerrar] = useState(false)
  const { jogo, presencas, membrosPub, pagamentos, papel } = jogoData
  const isAdmin = papel === 'dono' || papel === 'admin'

  const membrosMap = new Map(membrosPub.map((m) => [m.usuario_id, m]))
  const pagMap = new Map(pagamentos.map((p) => [p.usuario_id, p.situacao]))

  const confirmados = presencas.filter((p) => p.situacao === 'confirmado')
  const espera = presencas.filter((p) => p.situacao === 'espera')
  const vagas = jogo.vagas
  const nConfirmed = confirmados.length
  const free = Math.max(0, vagas - nConfirmed)
  const perHead = Math.round(Number(jogo.custo_total) / Math.max(1, nConfirmed))

  const minha = presencas.find((p) => p.usuario_id === userId)
  const estouDentro = Boolean(minha)
  const estouNaEspera = minha?.situacao === 'espera'

  const jogadores = confirmados.map((p, i) => {
    const m = membrosMap.get(p.usuario_id)
    const nome = p.profiles?.nome ?? 'Jogador'
    const souEu = p.usuario_id === userId
    const nivel = nivelFmt(m?.nivel)
    const sub = [m?.posicao, nivel ? `nível ${nivel}` : null].filter(Boolean).join(' · ')
    const pagoSituacao = pagMap.get(p.usuario_id)
    const tag = souEu ? 'VOCÊ' : pagoSituacao === 'confirmado' ? 'PAGO' : 'DEVE'
    const tagColor = souEu ? '#C9F24D' : pagoSituacao === 'confirmado' ? 'rgba(234,243,236,.62)' : '#F2C14D'
    return {
      key: p.usuario_id,
      nome: souEu ? 'Você' : nome,
      iniciais: souEu ? 'VC' : iniciais(nome),
      bg: AVATAR_COLORS[i % AVATAR_COLORS.length],
      sub,
      tag,
      tagColor,
    }
  })

  const shown = showAll ? jogadores : jogadores.slice(0, 5)
  const inicio = new Date(jogo.inicio)

  const cta = estouNaEspera
    ? {
        label: 'Você está na espera',
        hint: 'toque para sair da espera',
        bg: 'rgba(242,193,77,.12)',
        fg: '#F2C14D',
        bd: 'rgba(242,193,77,.4)',
      }
    : estouDentro
      ? {
          label: 'Você está dentro',
          hint: 'toque para desistir',
          bg: 'rgba(201,242,77,.12)',
          fg: '#C9F24D',
          bd: 'rgba(201,242,77,.4)',
        }
      : {
          label: 'Tô dentro',
          hint: free > 0 ? `${free} ${free === 1 ? 'vaga' : 'vagas'}` : 'lista de espera',
          bg: '#C9F24D',
          fg: '#08130E',
          bd: '#C9F24D',
        }

  const listColor = free === 0 ? '#F2C14D' : '#C9F24D'
  const fillPct = Math.min(100, (nConfirmed / Math.max(1, vagas)) * 100) + '%'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div
        style={{
          position: 'relative',
          borderRadius: '24px',
          padding: '22px',
          background: 'linear-gradient(160deg,#16351F 0%,#0E2417 70%)',
          border: '1px solid rgba(201,242,77,.16)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            right: '-40px',
            top: '-40px',
            width: '150px',
            height: '150px',
            border: '1px solid rgba(201,242,77,.13)',
            borderRadius: '50%',
          }}
        />
        <div
          style={{
            position: 'absolute',
            right: '-90px',
            top: '-90px',
            width: '250px',
            height: '250px',
            border: '1px solid rgba(201,242,77,.07)',
            borderRadius: '50%',
          }}
        />
        <div
          style={{
            font: "500 10px/1 'IBM Plex Mono', monospace",
            letterSpacing: '.14em',
            color: '#C9F24D',
            textTransform: 'uppercase',
          }}
        >
          {diaSemanaMaiusculo(inicio)} · mensal
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', marginTop: '10px' }}>
          <div style={{ font: "800 68px/.82 'Barlow Condensed', sans-serif", letterSpacing: '-.02em' }}>
            {inicio.getDate()}
          </div>
          <div style={{ paddingBottom: '6px' }}>
            <div
              style={{
                font: "700 19px/1 'Barlow Condensed', sans-serif",
                letterSpacing: '.04em',
                textTransform: 'uppercase',
              }}
            >
              {mesAbrev(inicio)}
            </div>
            <div style={{ font: '600 15px/1.2 Barlow, sans-serif', color: 'rgba(234,243,236,.6)', marginTop: '3px' }}>
              {faixaHorario(inicio, jogo.duracao_min)}
            </div>
          </div>
        </div>
        <div style={{ height: '1px', background: 'rgba(234,243,236,.1)', margin: '18px 0 14px' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
          <div>
            <div style={{ font: '600 16px/1.2 Barlow, sans-serif' }}>{jogo.local}</div>
            {jogo.quadra && (
              <div style={{ font: '400 13px/1.3 Barlow, sans-serif', color: 'rgba(234,243,236,.7)', marginTop: '3px' }}>
                {jogo.quadra}
              </div>
            )}
          </div>
          <div style={{ textAlign: 'right', flex: 'none' }}>
            <div style={{ font: "700 22px/1 'Barlow Condensed', sans-serif", color: '#F2C14D' }}>R$ {perHead}</div>
            <div style={{ font: '400 11px/1 Barlow, sans-serif', color: 'rgba(234,243,236,.68)', marginTop: '4px' }}>
              por cabeça
            </div>
          </div>
        </div>
      </div>

      <div
        onClick={toggling ? undefined : onToggle}
        style={{
          cursor: toggling ? 'default' : 'pointer',
          opacity: toggling ? 0.7 : 1,
          borderRadius: '18px',
          padding: '17px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: cta.bg,
          color: cta.fg,
          border: `1px solid ${cta.bd}`,
        }}
      >
        <span style={{ font: '700 17px/1 Barlow, sans-serif' }}>{cta.label}</span>
        <span style={{ font: "500 12px/1 'IBM Plex Mono', monospace", opacity: 0.6 }}>{cta.hint}</span>
      </div>

      <div
        style={{
          borderRadius: '20px',
          padding: '18px 20px',
          background: '#0F2117',
          border: '1px solid rgba(234,243,236,.07)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <div style={{ font: '700 15px/1 Barlow, sans-serif' }}>Lista de presença</div>
          <div
            style={{
              font: "700 15px/1 'Barlow Condensed', sans-serif",
              letterSpacing: '.03em',
              color: listColor,
            }}
          >
            {nConfirmed}/{vagas}
          </div>
        </div>
        <div
          style={{
            height: '6px',
            borderRadius: '999px',
            background: 'rgba(234,243,236,.1)',
            margin: '12px 0 16px',
            overflow: 'hidden',
          }}
        >
          <div style={{ height: '100%', borderRadius: '999px', background: '#C9F24D', width: fillPct }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '11px' }}>
          {shown.length === 0 && (
            <div style={{ font: '400 13px/1.4 Barlow, sans-serif', color: 'rgba(234,243,236,.6)' }}>
              Ninguém confirmou ainda.
            </div>
          )}
          {shown.map((p) => (
            <div key={p.key} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  flex: 'none',
                  width: '36px',
                  height: '36px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  font: "700 13px/1 'Barlow Condensed', sans-serif",
                  letterSpacing: '.04em',
                  background: p.bg,
                  color: '#08130E',
                }}
              >
                {p.iniciais}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ font: '600 15px/1.2 Barlow, sans-serif' }}>{p.nome}</div>
                {p.sub && (
                  <div style={{ font: '400 11.5px/1.2 Barlow, sans-serif', color: 'rgba(234,243,236,.68)', marginTop: '2px' }}>
                    {p.sub}
                  </div>
                )}
              </div>
              <div style={{ flex: 'none', font: "500 10px/1 'IBM Plex Mono', monospace", color: p.tagColor }}>
                {p.tag}
              </div>
            </div>
          ))}
        </div>
        {jogadores.length > 5 && (
          <div
            onClick={() => setShowAll((v) => !v)}
            style={{ marginTop: '16px', textAlign: 'center', font: '600 13px/1 Barlow, sans-serif', color: '#C9F24D', cursor: 'pointer' }}
          >
            {showAll ? 'Mostrar menos' : `Ver todos os ${jogadores.length}`}
          </div>
        )}
      </div>

      {free === 0 && espera.length > 0 && (
        <div
          style={{
            borderRadius: '20px',
            padding: '16px 20px',
            background: 'rgba(242,193,77,.07)',
            border: '1px solid rgba(242,193,77,.22)',
          }}
        >
          <div
            style={{
              font: "500 10px/1 'IBM Plex Mono', monospace",
              letterSpacing: '.14em',
              color: '#F2C14D',
              textTransform: 'uppercase',
            }}
          >
            Lista de espera
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '9px', marginTop: '13px' }}>
            {espera.map((p, i) => (
              <div key={p.usuario_id} style={{ display: 'flex', alignItems: 'center', gap: '11px' }}>
                <div style={{ flex: 'none', width: '26px', font: "700 14px/1 'Barlow Condensed', sans-serif", color: 'rgba(242,193,77,.8)' }}>
                  {i + 1}º
                </div>
                <div style={{ flex: 1, font: '600 14px/1.2 Barlow, sans-serif', color: 'rgba(234,243,236,.85)' }}>
                  {p.usuario_id === userId ? 'Você' : (p.profiles?.nome ?? 'Jogador')}
                </div>
                <div style={{ font: '400 11px/1 Barlow, sans-serif', color: 'rgba(234,243,236,.66)' }}>entra se vagar</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {isAdmin && (
        <div style={{ textAlign: 'center', marginTop: '4px' }}>
          {confirmandoEncerrar ? (
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <span
                onClick={onEncerrar}
                style={{ font: '600 12.5px/1 Barlow, sans-serif', color: '#F2843D', cursor: 'pointer' }}
              >
                confirmar encerramento
              </span>
              <span
                onClick={() => setConfirmandoEncerrar(false)}
                style={{ font: '600 12.5px/1 Barlow, sans-serif', color: 'rgba(234,243,236,.5)', cursor: 'pointer' }}
              >
                cancelar
              </span>
            </div>
          ) : (
            <span
              onClick={() => setConfirmandoEncerrar(true)}
              style={{ font: '500 11.5px/1 Barlow, sans-serif', color: 'rgba(234,243,236,.4)', cursor: 'pointer' }}
            >
              encerrar esse jogo
            </span>
          )}
        </div>
      )}
    </div>
  )
}
