import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { FIELD_BOX, LABEL_STYLE, VALUE_TEXT } from '../lib/fieldStyles'

export function NomeCompletoScreen({ userId, onEntrar }) {
  const [nome, setNome] = useState('')
  const [sobrenome, setSobrenome] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  const valido = nome.trim().length > 0 && sobrenome.trim().length > 0

  const entrar = async () => {
    if (!valido || salvando) return
    setSalvando(true)
    setErro('')
    try {
      const nomeCompleto = `${nome.trim()} ${sobrenome.trim()}`
      const { error } = await supabase.from('profiles').update({ nome: nomeCompleto }).eq('id', userId)
      if (error) throw error
      onEntrar()
    } catch (err) {
      setErro(err.message)
      setSalvando(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '22px',
        padding: '0 24px',
        background: '#08130E',
        color: '#EAF3EC',
        fontFamily: 'Barlow, sans-serif',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            font: "500 10px/1 'IBM Plex Mono', monospace",
            letterSpacing: '.14em',
            color: 'rgba(234,243,236,.68)',
            textTransform: 'uppercase',
          }}
        >
          Resenha Fut
        </div>
        <div style={{ font: "800 26px/1.2 'Barlow Condensed', sans-serif", marginTop: '8px' }}>
          Como te chamam no fut?
        </div>
      </div>

      <div style={{ width: '100%', maxWidth: '340px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={FIELD_BOX}>
          <div style={LABEL_STYLE}>Nome</div>
          <input
            type="text"
            autoFocus
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            style={VALUE_TEXT}
          />
        </div>
        <div style={FIELD_BOX}>
          <div style={LABEL_STYLE}>Sobrenome</div>
          <input
            type="text"
            value={sobrenome}
            onChange={(e) => setSobrenome(e.target.value)}
            style={VALUE_TEXT}
          />
        </div>
        <div
          onClick={entrar}
          style={{
            marginTop: '4px',
            padding: '15px 20px',
            borderRadius: '14px',
            textAlign: 'center',
            background: valido ? '#C9F24D' : 'rgba(201,242,77,.3)',
            color: '#08130E',
            font: '700 15px Barlow, sans-serif',
            cursor: valido && !salvando ? 'pointer' : 'default',
          }}
        >
          {salvando ? 'Entrando…' : 'Entrar'}
        </div>
        {erro && <div style={{ font: '400 12.5px Barlow, sans-serif', color: '#F2843D' }}>{erro}</div>}
      </div>
    </div>
  )
}
