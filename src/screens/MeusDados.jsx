import { useState } from 'react'
import { FIELD_BOX, GROUP_TITLE, LABEL_STYLE, VALUE_MONO, VALUE_TEXT } from '../lib/fieldStyles'
import { nivelFmt } from '../lib/format'

const POSICOES = [
  { id: 'Goleiro', label: 'Goleiro' },
  { id: 'Zaga', label: 'Zaga' },
  { id: 'Meia', label: 'Meia' },
  { id: 'Ataque', label: 'Ataque' },
]

export function MeusDadosScreen({ perfilData, email, onSalvar, onFechar }) {
  const [nome, setNome] = useState(perfilData.nome ?? '')
  const [telefone, setTelefone] = useState(perfilData.telefone ?? '')
  const [novoEmail, setNovoEmail] = useState(email ?? '')
  const [chavePix, setChavePix] = useState(perfilData.chavePix ?? '')
  const [posicao, setPosicao] = useState(perfilData.posicao ?? '')
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  const [aviso, setAviso] = useState('')

  const mudou =
    nome.trim() !== (perfilData.nome ?? '') ||
    telefone.trim() !== (perfilData.telefone ?? '') ||
    novoEmail.trim() !== (email ?? '') ||
    chavePix.trim() !== (perfilData.chavePix ?? '') ||
    posicao !== (perfilData.posicao ?? '')

  const salvar = async () => {
    if (!mudou || salvando) return
    setSalvando(true)
    setErro('')
    setAviso('')
    try {
      const emailMudou = novoEmail.trim() && novoEmail.trim() !== email
      await onSalvar({
        nome: nome.trim(),
        telefone: telefone.trim() || null,
        chavePix: chavePix.trim() || null,
        posicao: posicao || null,
        novoEmail: emailMudou ? novoEmail.trim() : null,
      })
      if (emailMudou) {
        setAviso(
          'Dados salvos. Enviamos um link de confirmação pro novo e-mail — a troca só vale depois de você confirmar por lá.'
        )
        setSalvando(false)
      } else {
        onFechar()
      }
    } catch (err) {
      setErro(err.message)
      setSalvando(false)
    }
  }

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
      <div
        style={{
          flex: 'none',
          padding: '62px 20px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div onClick={onFechar} style={{ font: '600 15px/1 Barlow, sans-serif', color: 'rgba(234,243,236,.72)', cursor: 'pointer' }}>
          Voltar
        </div>
        <div style={{ font: "800 22px/1 'Barlow Condensed', sans-serif", letterSpacing: '-.01em' }}>Meus dados</div>
        <div
          onClick={salvar}
          style={{
            font: '600 15px/1 Barlow, sans-serif',
            color: mudou ? '#C9F24D' : 'rgba(234,243,236,.3)',
            cursor: mudou && !salvando ? 'pointer' : 'default',
          }}
        >
          {salvando ? 'Salvando…' : 'Salvar'}
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '0 20px 34px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '11px' }}>
          <div style={GROUP_TITLE}>Meus dados</div>
          <div style={FIELD_BOX}>
            <div style={LABEL_STYLE}>Nome</div>
            <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} style={VALUE_TEXT} />
          </div>
          <div style={FIELD_BOX}>
            <div style={LABEL_STYLE}>Telefone</div>
            <input
              type="tel"
              placeholder="(11) 99999-0000"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              style={VALUE_TEXT}
            />
          </div>
          <div style={FIELD_BOX}>
            <div style={LABEL_STYLE}>E-mail</div>
            <input type="email" value={novoEmail} onChange={(e) => setNovoEmail(e.target.value)} style={VALUE_TEXT} />
          </div>
          <div style={FIELD_BOX}>
            <div style={LABEL_STYLE}>Minha chave Pix</div>
            <input
              type="text"
              placeholder="seu@email.com"
              value={chavePix}
              onChange={(e) => setChavePix(e.target.value)}
              style={VALUE_MONO}
            />
          </div>
          <div style={{ display: 'flex', gap: '6px', padding: '5px', borderRadius: '14px', background: '#0F2117', border: '1px solid rgba(234,243,236,.07)' }}>
            {POSICOES.map((p) => (
              <div
                key={p.id}
                onClick={() => setPosicao(p.id)}
                style={{
                  flex: 1,
                  textAlign: 'center',
                  padding: '11px 0',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  font: '600 13px/1 Barlow, sans-serif',
                  background: posicao === p.id ? 'rgba(201,242,77,.15)' : 'transparent',
                  color: posicao === p.id ? '#C9F24D' : 'rgba(234,243,236,.6)',
                }}
              >
                {p.label}
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: '16px 18px', borderRadius: '14px', background: 'rgba(234,243,236,.04)', border: '1px dashed rgba(234,243,236,.16)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ font: '600 14.5px/1.2 Barlow, sans-serif', color: 'rgba(234,243,236,.8)' }}>Meu nível no sorteio</div>
            <div style={{ font: "700 20px/1 'Barlow Condensed', sans-serif", color: 'rgba(234,243,236,.8)' }}>
              {nivelFmt(perfilData.nivel) ?? '—'}
            </div>
          </div>
          <div style={{ font: '400 12px/1.45 Barlow, sans-serif', color: 'rgba(234,243,236,.62)', marginTop: '8px' }}>
            Quem define é o admin. Serve só para equilibrar os times e ninguém edita o próprio.
          </div>
        </div>

        {erro && <div style={{ font: '400 12.5px Barlow, sans-serif', color: '#F2843D' }}>{erro}</div>}
        {aviso && <div style={{ font: '400 12.5px/1.5 Barlow, sans-serif', color: '#C9F24D' }}>{aviso}</div>}
      </div>
    </div>
  )
}
