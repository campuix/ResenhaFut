import { useState } from 'react'
import { AVATAR_COLORS, iniciais } from '../lib/format'

export function RateioScreen({ userId, rateioData, onToggle, onCobrar, onTrocarResponsavel, onSalvarChavePix }) {
  const { isAdmin, custoTotal, perHead, confirmados, pagamentos, responsavelId, responsavelNome, chavePix } = rateioData
  const [editandoChave, setEditandoChave] = useState(false)
  const [chaveInput, setChaveInput] = useState('')
  const [salvando, setSalvando] = useState(false)

  const abrirEdicaoChave = () => {
    setChaveInput(chavePix ?? '')
    setEditandoChave(true)
  }

  const salvarChave = async () => {
    setSalvando(true)
    try {
      await onSalvarChavePix(chaveInput.trim())
      setEditandoChave(false)
    } finally {
      setSalvando(false)
    }
  }

  const paidCount = confirmados.filter((p) => pagamentos[p.usuario_id] === 'confirmado').length
  const openCount = confirmados.length - paidCount
  const paidTotal = paidCount * perHead
  const paidPct = Math.min(100, (paidTotal / Math.max(1, custoTotal)) * 100) + '%'

  const payTitle = isAdmin ? 'Confirmar pagamentos' : 'Quem já acertou'
  const payHint = isAdmin
    ? 'Quem declarou aparece em laranja: toque para confirmar o recebimento.'
    : 'Você declara que pagou; o admin confirma. Os outros são só leitura.'

  const linhas = confirmados.map((p, i) => {
    const situacao = pagamentos[p.usuario_id] ?? 'aberto'
    const souEu = p.usuario_id === userId
    const nome = souEu ? 'Você' : (p.profiles?.nome ?? 'Jogador')

    let pill, pillBg, pillFg
    if (situacao === 'confirmado') {
      pill = 'pago'
      pillBg = 'rgba(201,242,77,.14)'
      pillFg = '#C9F24D'
    } else if (situacao === 'declarado') {
      if (isAdmin) {
        pill = 'confirmar'
        pillBg = '#F2C14D'
        pillFg = '#1A1708'
      } else {
        pill = 'aguardando'
        pillBg = 'rgba(242,193,77,.14)'
        pillFg = '#F2C14D'
      }
    } else {
      pill = souEu ? 'já paguei' : `R$ ${perHead}`
      pillBg = 'rgba(242,193,77,.14)'
      pillFg = '#F2C14D'
    }

    const canTap = isAdmin || (souEu && situacao !== 'confirmado')

    return {
      key: p.usuario_id,
      nome,
      ini: souEu ? 'VC' : iniciais(nome),
      bg: AVATAR_COLORS[i % AVATAR_COLORS.length],
      pill,
      pillBg,
      pillFg,
      cursor: canTap ? 'pointer' : 'default',
      onClick: canTap ? () => onToggle(p.usuario_id, situacao) : undefined,
    }
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div
        style={{
          borderRadius: '24px',
          padding: '22px',
          background: 'linear-gradient(160deg,#33290F 0%,#1A1708 75%)',
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
          Rateio da quadra
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px', marginTop: '12px' }}>
          <div style={{ font: "800 46px/.9 'Barlow Condensed', sans-serif" }}>R$ {paidTotal}</div>
          <div style={{ font: '600 15px/1 Barlow, sans-serif', color: 'rgba(234,243,236,.7)', paddingBottom: '5px' }}>
            de R$ {custoTotal}
          </div>
        </div>
        <div
          style={{
            height: '6px',
            borderRadius: '999px',
            background: 'rgba(234,243,236,.12)',
            margin: '16px 0 10px',
            overflow: 'hidden',
          }}
        >
          <div style={{ height: '100%', borderRadius: '999px', background: '#F2C14D', width: paidPct }} />
        </div>
        <div style={{ font: '400 12.5px/1 Barlow, sans-serif', color: 'rgba(234,243,236,.7)' }}>
          {paidCount} pagaram · {openCount} devendo R$ {perHead}
        </div>

        <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid rgba(234,243,236,.12)' }}>
          <div
            style={{
              font: "500 10px/1 'IBM Plex Mono', monospace",
              letterSpacing: '.14em',
              color: '#F2C14D',
              textTransform: 'uppercase',
            }}
          >
            Pix para pagar
          </div>
          {editandoChave ? (
            <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <input
                autoFocus
                type="text"
                value={chaveInput}
                onChange={(e) => setChaveInput(e.target.value)}
                placeholder="CPF, e-mail, telefone ou chave aleatória"
                style={{
                  padding: '11px 13px',
                  borderRadius: '10px',
                  border: '1px solid rgba(234,243,236,.15)',
                  background: '#08130E',
                  color: '#EAF3EC',
                  font: '400 14px Barlow, sans-serif',
                  outline: 'none',
                }}
              />
              <div style={{ display: 'flex', gap: '8px' }}>
                <div
                  onClick={salvando ? undefined : salvarChave}
                  style={{
                    flex: 1,
                    textAlign: 'center',
                    padding: '10px',
                    borderRadius: '10px',
                    background: '#C9F24D',
                    color: '#08130E',
                    font: '700 13px/1 Barlow, sans-serif',
                    cursor: salvando ? 'default' : 'pointer',
                    opacity: salvando ? 0.7 : 1,
                  }}
                >
                  {salvando ? 'Salvando…' : 'Salvar'}
                </div>
                <div
                  onClick={() => setEditandoChave(false)}
                  style={{
                    flex: 1,
                    textAlign: 'center',
                    padding: '10px',
                    borderRadius: '10px',
                    border: '1px solid rgba(234,243,236,.14)',
                    color: 'rgba(234,243,236,.75)',
                    font: '600 13px/1 Barlow, sans-serif',
                    cursor: 'pointer',
                  }}
                >
                  Cancelar
                </div>
              </div>
            </div>
          ) : (
            <>
              <div style={{ font: '600 15px/1.3 Barlow, sans-serif', marginTop: '6px' }}>
                {chavePix || 'chave ainda não cadastrada'}
              </div>
              <div style={{ font: '400 12px/1.3 Barlow, sans-serif', color: 'rgba(234,243,236,.7)', marginTop: '2px' }}>
                responsável: {responsavelNome ?? '—'}
              </div>
              <div style={{ display: 'flex', gap: '16px', marginTop: '9px' }}>
                {isAdmin && (
                  <span
                    onClick={onTrocarResponsavel}
                    style={{ font: '600 12px/1 Barlow, sans-serif', color: '#F2C14D', cursor: 'pointer' }}
                  >
                    trocar responsável
                  </span>
                )}
                {userId === responsavelId && (
                  <span
                    onClick={abrirEdicaoChave}
                    style={{ font: '600 12px/1 Barlow, sans-serif', color: '#F2C14D', cursor: 'pointer' }}
                  >
                    {chavePix ? 'editar minha chave' : 'cadastrar minha chave'}
                  </span>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <div
        style={{
          borderRadius: '20px',
          padding: '18px 20px',
          background: '#0F2117',
          border: '1px solid rgba(234,243,236,.07)',
        }}
      >
        <div style={{ font: '700 15px/1 Barlow, sans-serif' }}>{payTitle}</div>
        <div style={{ font: '400 12.5px/1.45 Barlow, sans-serif', color: 'rgba(234,243,236,.7)', margin: '6px 0 15px' }}>
          {payHint}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {linhas.length === 0 && (
            <div style={{ font: '400 13px/1.4 Barlow, sans-serif', color: 'rgba(234,243,236,.6)' }}>
              Ninguém confirmou presença ainda.
            </div>
          )}
          {linhas.map((l) => (
            <div
              key={l.key}
              onClick={l.onClick}
              style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: l.cursor }}
            >
              <div
                style={{
                  flex: 'none',
                  width: '34px',
                  height: '34px',
                  borderRadius: '11px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  font: "700 12px/1 'Barlow Condensed', sans-serif",
                  background: l.bg,
                  color: '#08130E',
                }}
              >
                {l.ini}
              </div>
              <div style={{ flex: 1, font: '600 15px/1.2 Barlow, sans-serif' }}>{l.nome}</div>
              <div
                style={{
                  flex: 'none',
                  padding: '6px 11px',
                  borderRadius: '999px',
                  font: '600 11.5px/1 Barlow, sans-serif',
                  background: l.pillBg,
                  color: l.pillFg,
                }}
              >
                {l.pill}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        onClick={openCount > 0 ? onCobrar : undefined}
        style={{
          borderRadius: '16px',
          padding: '16px',
          textAlign: 'center',
          background: '#C9F24D',
          color: '#08130E',
          font: '700 16px/1 Barlow, sans-serif',
          cursor: openCount > 0 ? 'pointer' : 'default',
          opacity: openCount > 0 ? 1 : 0.5,
        }}
      >
        Cobrar os {openCount} devedores
      </div>
    </div>
  )
}
