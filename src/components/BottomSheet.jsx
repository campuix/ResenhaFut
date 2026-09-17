import { useState } from 'react'
import { waLink } from '../lib/share'

const ROLE_OPTIONS = [
  { id: 'dono', label: 'Dono do grupo', desc: 'Tudo: cria e apaga o grupo, promove admins, encerra a pelada.' },
  { id: 'admin', label: 'Admin', desc: 'Marca jogo, confirma pagamento, gerencia membros e vê faltas.' },
  { id: 'jogador', label: 'Jogador', desc: 'Confirma presença, sorteia times, declara o próprio pagamento.' },
]

const COPY = {
  convite: ['Chamar a resenha', 'Manda o link no grupo. Quem confirmar entra na lista; cheio, vai pra espera.'],
  cobrar: ['Cobrar no grupo', 'A mensagem já vai com o valor e quantos ainda estão devendo.'],
}

function SheetShell({ title, sub, onClose, children }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 70,
        background: 'rgba(4,10,7,.6)',
        display: 'flex',
        alignItems: 'flex-end',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          borderRadius: '28px 28px 0 0',
          background: '#10231A',
          borderTop: '1px solid rgba(201,242,77,.2)',
          padding: '26px 22px 44px',
          animation: 'rf-in .28s ease both',
        }}
      >
        <div
          style={{
            width: '40px',
            height: '4px',
            borderRadius: '99px',
            background: 'rgba(234,243,236,.2)',
            margin: '0 auto 20px',
          }}
        />
        <div style={{ font: "800 25px/1.1 'Barlow Condensed', sans-serif", letterSpacing: '-.01em' }}>{title}</div>
        <div style={{ font: '400 13.5px/1.45 Barlow, sans-serif', color: 'rgba(234,243,236,.7)', marginTop: '7px' }}>
          {sub}
        </div>
        {children}
      </div>
    </div>
  )
}

function ConviteSheet({ link, onClose }) {
  const [copiado, setCopiado] = useState(false)

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(link)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    } catch {
      // clipboard indisponível (ex.: contexto não seguro) — sem feedback, sem quebrar a tela
    }
  }

  return (
    <SheetShell title={COPY.convite[0]} sub={COPY.convite[1]} onClose={onClose}>
      <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '11px' }}>
        <div
          style={{
            padding: '15px 17px',
            borderRadius: '14px',
            background: '#08130E',
            border: '1px solid rgba(234,243,236,.1)',
            font: "400 13px/1 'IBM Plex Mono', monospace",
            color: 'rgba(234,243,236,.65)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {link}
        </div>
        <a
          href={waLink(`Chamada pra resenha! Confirma sua presença: ${link}`)}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            padding: '16px',
            borderRadius: '14px',
            textAlign: 'center',
            background: '#C9F24D',
            color: '#08130E',
            font: '700 16px/1 Barlow, sans-serif',
            display: 'block',
            textDecoration: 'none',
          }}
        >
          Compartilhar no WhatsApp
        </a>
        <div
          onClick={copiar}
          style={{
            padding: '16px',
            borderRadius: '14px',
            textAlign: 'center',
            border: '1px solid rgba(234,243,236,.14)',
            color: 'rgba(234,243,236,.75)',
            font: '600 15px/1 Barlow, sans-serif',
            cursor: 'pointer',
          }}
        >
          {copiado ? 'Link copiado!' : 'Copiar link'}
        </div>
      </div>
    </SheetShell>
  )
}

function CobrarSheet({ mensagem, onClose }) {
  return (
    <SheetShell title={COPY.cobrar[0]} sub={COPY.cobrar[1]} onClose={onClose}>
      <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '11px' }}>
        <div
          style={{
            padding: '16px 18px',
            borderRadius: '14px',
            background: '#08130E',
            border: '1px solid rgba(234,243,236,.1)',
            font: '400 14px/1.5 Barlow, sans-serif',
            color: 'rgba(234,243,236,.7)',
          }}
        >
          {mensagem}
        </div>
        <a
          href={waLink(mensagem)}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            padding: '16px',
            borderRadius: '14px',
            textAlign: 'center',
            background: '#C9F24D',
            color: '#08130E',
            font: '700 16px/1 Barlow, sans-serif',
            display: 'block',
            textDecoration: 'none',
          }}
        >
          Enviar no grupo
        </a>
      </div>
    </SheetShell>
  )
}

function PapelSheet({ nome, papelAtual, podeMudarPapel, onSetPapel, onRemover, onClose }) {
  const [confirmandoRemocao, setConfirmandoRemocao] = useState(false)
  const opcaoAtual = ROLE_OPTIONS.find((r) => r.id === papelAtual)

  return (
    <SheetShell
      title={`Papel de ${nome}`}
      sub="Admin marca jogo, confirma pagamento e mexe no grupo. Só o dono promove outro admin."
      onClose={onClose}
    >
      <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {podeMudarPapel ? (
          ROLE_OPTIONS.map((r) => (
            <div
              key={r.id}
              onClick={() => onSetPapel(r.id)}
              style={{
                padding: '15px 17px',
                borderRadius: '14px',
                cursor: 'pointer',
                background: r.id === papelAtual ? 'rgba(201,242,77,.08)' : 'rgba(234,243,236,.05)',
                border: `1px solid ${r.id === papelAtual ? 'rgba(201,242,77,.3)' : 'rgba(234,243,236,.12)'}`,
              }}
            >
              <div style={{ font: '700 15px/1 Barlow, sans-serif', color: r.id === papelAtual ? '#C9F24D' : '#EAF3EC' }}>
                {r.label}
              </div>
              <div style={{ font: '400 12px/1.4 Barlow, sans-serif', color: 'rgba(234,243,236,.68)', marginTop: '5px' }}>
                {r.desc}
              </div>
            </div>
          ))
        ) : (
          <div style={{ padding: '15px 17px', borderRadius: '14px', background: 'rgba(234,243,236,.05)', border: '1px solid rgba(234,243,236,.12)' }}>
            <div style={{ font: '700 15px/1 Barlow, sans-serif', color: '#C9F24D' }}>{opcaoAtual?.label ?? papelAtual}</div>
            <div style={{ font: '400 12px/1.4 Barlow, sans-serif', color: 'rgba(234,243,236,.68)', marginTop: '5px' }}>
              {papelAtual === 'dono'
                ? 'Pra deixar de ser dono, transfira o grupo pra outro admin primeiro.'
                : 'Só o dono muda esse papel.'}
            </div>
          </div>
        )}
        {papelAtual !== 'dono' && (confirmandoRemocao ? (
          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
            <div
              onClick={onRemover}
              style={{
                flex: 1,
                padding: '15px',
                borderRadius: '14px',
                textAlign: 'center',
                background: '#F2843D',
                color: '#1A0E06',
                font: '700 14px/1 Barlow, sans-serif',
                cursor: 'pointer',
              }}
            >
              Confirmar remoção
            </div>
            <div
              onClick={() => setConfirmandoRemocao(false)}
              style={{
                flex: 1,
                padding: '15px',
                borderRadius: '14px',
                textAlign: 'center',
                border: '1px solid rgba(234,243,236,.14)',
                color: 'rgba(234,243,236,.75)',
                font: '600 14px/1 Barlow, sans-serif',
                cursor: 'pointer',
              }}
            >
              Cancelar
            </div>
          </div>
        ) : (
          <div
            onClick={() => setConfirmandoRemocao(true)}
            style={{
              marginTop: '4px',
              padding: '15px',
              borderRadius: '14px',
              textAlign: 'center',
              border: '1px solid rgba(242,132,61,.35)',
              color: '#F2843D',
              font: '600 14px/1 Barlow, sans-serif',
              cursor: 'pointer',
            }}
          >
            Remover do grupo
          </div>
        ))}
      </div>
    </SheetShell>
  )
}

function ResponsavelSheet({ membros, responsavelId, onEscolher, onClose }) {
  return (
    <SheetShell
      title="Responsável pelo Pix"
      sub="Quem administra o rateio desta partida. Só essa pessoa consegue cadastrar a própria chave."
      onClose={onClose}
    >
      <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {membros.map((m) => (
          <div
            key={m.usuario_id}
            onClick={() => onEscolher(m.usuario_id)}
            style={{
              padding: '15px 17px',
              borderRadius: '14px',
              cursor: 'pointer',
              background: m.usuario_id === responsavelId ? 'rgba(201,242,77,.08)' : 'rgba(234,243,236,.05)',
              border: `1px solid ${m.usuario_id === responsavelId ? 'rgba(201,242,77,.3)' : 'rgba(234,243,236,.12)'}`,
            }}
          >
            <div
              style={{
                font: '700 15px/1 Barlow, sans-serif',
                color: m.usuario_id === responsavelId ? '#C9F24D' : '#EAF3EC',
              }}
            >
              {m.nome}
            </div>
          </div>
        ))}
      </div>
    </SheetShell>
  )
}

export function BottomSheet({ sheet, onClose, convite, cobrar, papel, responsavel }) {
  if (!sheet) return null
  if (sheet === 'convite') return <ConviteSheet link={convite.link} onClose={onClose} />
  if (sheet === 'cobrar') return <CobrarSheet mensagem={cobrar.mensagem} onClose={onClose} />
  if (sheet === 'papel') {
    return (
      <PapelSheet
        nome={papel.nome}
        papelAtual={papel.papelAtual}
        podeMudarPapel={papel.podeMudarPapel}
        onSetPapel={papel.onSetPapel}
        onRemover={papel.onRemover}
        onClose={onClose}
      />
    )
  }
  if (sheet === 'responsavel') {
    return (
      <ResponsavelSheet
        membros={responsavel.membros}
        responsavelId={responsavel.responsavelId}
        onEscolher={responsavel.onEscolher}
        onClose={onClose}
      />
    )
  }
  return null
}
