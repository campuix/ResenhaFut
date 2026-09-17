import { Fragment, useState } from 'react'
import { AVATAR_COLORS, iniciais, mesAnoCurto, nivelFmt } from '../lib/format'
import { capacidadesDoPapel } from '../lib/permissoes'

const PAPEIS = [
  { id: 'dono', label: 'Dono' },
  { id: 'admin', label: 'Admin' },
  { id: 'jogador', label: 'Jogador' },
]

function IconeCheck({ cor }) {
  return (
    <div style={{ width: '9px', height: '5px', borderLeft: `2px solid ${cor}`, borderBottom: `2px solid ${cor}`, transform: 'rotate(-45deg) translateY(-1px)' }} />
  )
}

function IconeX({ cor }) {
  return (
    <div style={{ position: 'relative', width: '10px', height: '10px' }}>
      <div style={{ position: 'absolute', top: '50%', left: 0, width: '100%', height: '2px', background: cor, transform: 'rotate(45deg)' }} />
      <div style={{ position: 'absolute', top: '50%', left: 0, width: '100%', height: '2px', background: cor, transform: 'rotate(-45deg)' }} />
    </div>
  )
}

export function AcessosScreen({ userId, grupoData, onAbrirPapel, onFechar }) {
  const { papel: papelViewer, membros } = grupoData
  const isDono = papelViewer === 'dono'
  const [papelSelecionado, setPapelSelecionado] = useState('admin')

  const { resumo, itens } = capacidadesDoPapel(papelSelecionado)

  const donoEadmins = membros.filter((m) => m.papel === 'dono' || m.papel === 'admin')
  const jogadores = membros.filter((m) => m.papel === 'jogador')
  const ordenados = [...donoEadmins, ...jogadores]

  const linhas = ordenados.map((m, i) => {
    const souEu = m.usuario_id === userId
    const nome = souEu ? 'Você' : m.nome
    const isRowAdmin = m.papel === 'dono' || m.papel === 'admin'
    let sub
    if (m.papel === 'dono') {
      sub = souEu ? 'você · criou o grupo' : 'criou o grupo'
    } else if (m.papel === 'admin') {
      sub = m.entrou_como_admin_em ? `admin desde ${mesAnoCurto(new Date(m.entrou_como_admin_em))}` : 'admin'
    } else {
      sub = [m.posicao, nivelFmt(m.nivel) ? `nível ${nivelFmt(m.nivel)}` : null].filter(Boolean).join(' · ')
    }
    return {
      key: m.usuario_id,
      nome,
      ini: souEu ? 'VC' : iniciais(m.nome),
      bg: AVATAR_COLORS[i % AVATAR_COLORS.length],
      sub,
      role: m.papel,
      pillBg: isRowAdmin ? 'rgba(201,242,77,.14)' : 'rgba(234,243,236,.07)',
      pillFg: isRowAdmin ? '#C9F24D' : 'rgba(234,243,236,.6)',
      onClick: () => onAbrirPapel({ usuarioId: m.usuario_id, nome, papelAtual: m.papel }),
    }
  })

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 90,
        background: '#08130E',
        color: '#EAF3EC',
        fontFamily: 'Barlow, sans-serif',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ flex: 'none', padding: '62px 20px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div onClick={onFechar} style={{ font: '600 15px/1 Barlow, sans-serif', color: 'rgba(234,243,236,.72)', cursor: 'pointer' }}>
          Voltar
        </div>
        <div style={{ font: "800 22px/1 'Barlow Condensed', sans-serif" }}>Acessos</div>
        <div style={{ width: '44px' }} />
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '0 20px 34px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', gap: '6px', padding: '5px', borderRadius: '14px', background: '#0F2117', border: '1px solid rgba(234,243,236,.07)' }}>
          {PAPEIS.map((p) => (
            <div
              key={p.id}
              onClick={() => setPapelSelecionado(p.id)}
              style={{
                flex: 1,
                textAlign: 'center',
                padding: '11px 0',
                borderRadius: '10px',
                cursor: 'pointer',
                font: '600 13.5px/1 Barlow, sans-serif',
                background: papelSelecionado === p.id ? 'rgba(201,242,77,.15)' : 'transparent',
                color: papelSelecionado === p.id ? '#C9F24D' : 'rgba(234,243,236,.6)',
              }}
            >
              {p.label}
            </div>
          ))}
        </div>

        <div style={{ borderRadius: '20px', padding: '18px 20px', background: '#0F2117', border: '1px solid rgba(234,243,236,.07)' }}>
          <div style={{ font: '700 15px/1 Barlow, sans-serif' }}>
            O que o {papelSelecionado === 'dono' ? 'dono' : papelSelecionado === 'admin' ? 'admin' : 'jogador'} pode
          </div>
          <div style={{ font: '400 12.5px/1.45 Barlow, sans-serif', color: 'rgba(234,243,236,.7)', margin: '7px 0 16px' }}>{resumo}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '13px' }}>
            {itens.map((item) => (
              <div key={item.acao} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    flex: 'none',
                    width: '22px',
                    height: '22px',
                    borderRadius: '7px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    font: '700 12px/1 Barlow, sans-serif',
                    background: item.permitido ? '#C9F24D' : 'transparent',
                    color: item.permitido ? '#08130E' : '#F2843D',
                    border: item.permitido ? 'none' : '1.5px solid rgba(242,132,61,.55)',
                  }}
                >
                  {item.permitido ? <IconeCheck cor="#08130E" /> : <IconeX cor="#F2843D" />}
                </div>
                <div style={{ flex: 1, font: '500 14.5px/1.3 Barlow, sans-serif', color: item.permitido ? '#EAF3EC' : 'rgba(234,243,236,.6)' }}>
                  {item.acao}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ borderRadius: '20px', padding: '18px 20px', background: '#0F2117', border: '1px solid rgba(234,243,236,.07)' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <div style={{ font: '700 15px/1 Barlow, sans-serif' }}>Quem tem acesso</div>
            <div style={{ font: "500 10px/1 'IBM Plex Mono', monospace", color: 'rgba(234,243,236,.66)' }}>
              {donoEadmins.length} DE {membros.length}
            </div>
          </div>
          <div style={{ font: '400 12.5px/1.45 Barlow, sans-serif', color: 'rgba(234,243,236,.7)', margin: '7px 0 16px' }}>
            {isDono ? 'Toque para trocar o papel. Só você, como dono, promove alguém a admin.' : 'Toque para ver o papel de cada um.'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {linhas.map((m, i) => (
              <Fragment key={m.key}>
                {i === donoEadmins.length && donoEadmins.length > 0 && (
                  <div style={{ height: '1px', background: 'rgba(234,243,236,.08)', margin: '2px 0' }} />
                )}
                <div onClick={m.onClick} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
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
                      background: m.bg,
                      color: '#08130E',
                    }}
                  >
                    {m.ini}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ font: '600 15px/1.2 Barlow, sans-serif' }}>{m.nome}</div>
                    <div style={{ font: '400 11.5px/1.2 Barlow, sans-serif', color: 'rgba(234,243,236,.68)', marginTop: '2px' }}>{m.sub}</div>
                  </div>
                  <div style={{ flex: 'none', padding: '6px 11px', borderRadius: '999px', background: m.pillBg, color: m.pillFg, font: '600 11.5px/1 Barlow, sans-serif' }}>
                    {m.role}
                  </div>
                </div>
              </Fragment>
            ))}
          </div>
        </div>

        {isDono && (
          <div style={{ padding: '16px 18px', borderRadius: '14px', background: 'rgba(242,193,77,.07)', border: '1px solid rgba(242,193,77,.22)' }}>
            <div style={{ font: "500 10px/1 'IBM Plex Mono', monospace", letterSpacing: '.14em', color: '#F2C14D', textTransform: 'uppercase' }}>
              Transferir o grupo
            </div>
            <div style={{ font: '400 12.5px/1.45 Barlow, sans-serif', color: 'rgba(234,243,236,.75)', marginTop: '9px' }}>
              Se você sair da organização, passe a posse para um admin. Você continua jogando, só deixa de mandar.
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
