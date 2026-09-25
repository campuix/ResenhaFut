import { useEffect, useState } from 'react'
import { waLink } from '../lib/share'
import { Sheet } from './Sheet'

const ROLE_OPTIONS = [
  { id: 'dono', label: 'Dono do grupo', desc: 'Tudo: cria e apaga o grupo, promove admins, encerra a pelada.' },
  { id: 'admin', label: 'Admin', desc: 'Marca jogo, confirma pagamento, gerencia membros e vê faltas.' },
  { id: 'jogador', label: 'Jogador', desc: 'Confirma presença, sorteia times, declara o próprio pagamento.' },
]

const COPY = {
  convite: ['Chamar a resenha', 'Manda o link no grupo. Quem confirmar entra na lista; cheio, vai pra espera.'],
  cobrar: ['Cobrar no grupo', 'A mensagem já vai com o valor e quantos ainda estão devendo.'],
  responsavel: ['Responsável pelo Pix', 'Quem administra o rateio desta partida. Só essa pessoa consegue cadastrar a própria chave.'],
  papel: 'Admin marca jogo, confirma pagamento e mexe no grupo. Só o dono promove outro admin.',
}

function ConviteBody({ link }) {
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '11px' }}>
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
  )
}

function CobrarBody({ mensagem }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '11px' }}>
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
  )
}

function PapelBody({ papelAtual, podeMudarPapel, onSetPapel, onRemover, onVerPerfil }) {
  const [confirmandoRemocao, setConfirmandoRemocao] = useState(false)
  const opcaoAtual = ROLE_OPTIONS.find((r) => r.id === papelAtual)

  return (
    <>
      <div onClick={onVerPerfil} style={{ marginBottom: '14px', font: '600 13px/1 Barlow, sans-serif', color: '#C9F24D', cursor: 'pointer' }}>
        Ver perfil completo →
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
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
    </>
  )
}

function ResponsavelBody({ membros, responsavelId, onEscolher }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
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
  )
}

export function BottomSheet({ sheet, onClose, convite, cobrar, papel, responsavel }) {
  const [rendered, setRendered] = useState(sheet ? { sheet, convite, cobrar, papel, responsavel } : null)

  useEffect(() => {
    if (sheet) setRendered({ sheet, convite, cobrar, papel, responsavel })
  }, [sheet, convite, cobrar, papel, responsavel])

  if (!rendered) return null

  let title = ''
  let sub = ''
  let content = null

  if (rendered.sheet === 'convite') {
    ;[title, sub] = COPY.convite
    content = <ConviteBody link={rendered.convite.link} />
  } else if (rendered.sheet === 'cobrar') {
    ;[title, sub] = COPY.cobrar
    content = <CobrarBody mensagem={rendered.cobrar.mensagem} />
  } else if (rendered.sheet === 'papel') {
    title = `Papel de ${rendered.papel.nome}`
    sub = COPY.papel
    content = (
      <PapelBody
        papelAtual={rendered.papel.papelAtual}
        podeMudarPapel={rendered.papel.podeMudarPapel}
        onSetPapel={rendered.papel.onSetPapel}
        onRemover={rendered.papel.onRemover}
        onVerPerfil={rendered.papel.onVerPerfil}
      />
    )
  } else if (rendered.sheet === 'responsavel') {
    ;[title, sub] = COPY.responsavel
    content = (
      <ResponsavelBody
        membros={rendered.responsavel.membros}
        responsavelId={rendered.responsavel.responsavelId}
        onEscolher={rendered.responsavel.onEscolher}
      />
    )
  }

  return (
    <Sheet open={Boolean(sheet)} onClose={onClose} title={title} sub={sub} onExited={() => setRendered(null)}>
      {content}
    </Sheet>
  )
}
