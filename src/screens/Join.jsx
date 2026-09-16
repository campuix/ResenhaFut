import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { CenterMessage } from '../components/CenterMessage'

function Shell({ children }) {
  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '22px',
        padding: '0 24px',
        background: '#08130E',
        color: '#EAF3EC',
        fontFamily: 'Barlow, sans-serif',
      }}
    >
      {children}
    </div>
  )
}

function Eyebrow({ children }) {
  return (
    <div
      style={{
        font: "500 10px/1 'IBM Plex Mono', monospace",
        letterSpacing: '.14em',
        color: 'rgba(234,243,236,.68)',
        textTransform: 'uppercase',
        textAlign: 'center',
      }}
    >
      {children}
    </div>
  )
}

export function JoinScreen({ slug }) {
  const session = useAuth()
  const [grupo, setGrupo] = useState(undefined)
  const [jaMembro, setJaMembro] = useState(false)
  const [checandoMembro, setCheckandoMembro] = useState(true)
  const [entrando, setEntrando] = useState(false)
  const [erro, setErro] = useState('')
  const [email, setEmail] = useState('')
  const [linkStatus, setLinkStatus] = useState('idle')

  useEffect(() => {
    let cancelado = false
    supabase.rpc('grupo_publico', { p_slug: slug }).then(({ data, error }) => {
      if (cancelado) return
      if (error || !data || data.length === 0) {
        setGrupo(null)
      } else {
        setGrupo(data[0])
      }
    })
    return () => {
      cancelado = true
    }
  }, [slug])

  useEffect(() => {
    if (session === undefined || grupo === undefined) return
    if (session === null || grupo === null) {
      setCheckandoMembro(false)
      return
    }
    let cancelado = false
    setCheckandoMembro(true)
    supabase
      .from('membros')
      .select('usuario_id')
      .eq('grupo_id', grupo.id)
      .eq('usuario_id', session.user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelado) return
        setJaMembro(Boolean(data))
        setCheckandoMembro(false)
      })
    return () => {
      cancelado = true
    }
  }, [session, grupo])

  useEffect(() => {
    if (session && grupo && jaMembro) {
      window.location.href = '/'
    }
  }, [session, grupo, jaMembro])

  const enviarLinkMagico = async (e) => {
    e.preventDefault()
    if (!email) return
    setLinkStatus('sending')
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.href },
    })
    setLinkStatus(error ? 'error' : 'sent')
  }

  const entrarNoGrupo = async () => {
    setEntrando(true)
    setErro('')
    try {
      const { error } = await supabase
        .from('membros')
        .insert({ grupo_id: grupo.id, usuario_id: session.user.id, papel: 'jogador' })
      if (error) throw error
      window.location.href = '/'
    } catch (err) {
      setErro(err.message)
      setEntrando(false)
    }
  }

  if (grupo === undefined || session === undefined || checandoMembro) {
    return <CenterMessage>Carregando convite…</CenterMessage>
  }

  if (grupo === null) {
    return (
      <Shell>
        <Eyebrow>Resenha Fut</Eyebrow>
        <div style={{ font: "800 24px/1.2 'Barlow Condensed', sans-serif", textAlign: 'center' }}>
          Esse link de convite não existe ou não é mais válido.
        </div>
      </Shell>
    )
  }

  if (session === null) {
    return (
      <Shell>
        <div style={{ textAlign: 'center' }}>
          <Eyebrow>Convite para</Eyebrow>
          <div style={{ font: "800 30px/1.1 'Barlow Condensed', sans-serif", marginTop: '8px' }}>{grupo.nome}</div>
          {grupo.cidade && (
            <div style={{ font: '400 13px/1.4 Barlow, sans-serif', color: 'rgba(234,243,236,.7)', marginTop: '4px' }}>
              {grupo.cidade}
            </div>
          )}
        </div>

        {linkStatus === 'sent' ? (
          <div style={{ textAlign: 'center', font: '400 14px/1.5 Barlow, sans-serif', color: 'rgba(234,243,236,.75)' }}>
            Manda um link mágico pro seu e-mail. Abre o link em <strong>{email}</strong> para entrar no grupo.
          </div>
        ) : (
          <form
            onSubmit={enviarLinkMagico}
            style={{ width: '100%', maxWidth: '340px', display: 'flex', flexDirection: 'column', gap: '12px' }}
          >
            <input
              type="email"
              required
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                padding: '14px 16px',
                borderRadius: '14px',
                border: '1px solid rgba(234,243,236,.15)',
                background: '#0F2117',
                color: '#EAF3EC',
                font: '400 15px Barlow, sans-serif',
                outline: 'none',
              }}
            />
            <button
              type="submit"
              disabled={linkStatus === 'sending'}
              style={{
                padding: '15px 20px',
                borderRadius: '14px',
                border: 'none',
                background: '#C9F24D',
                color: '#08130E',
                font: '700 15px Barlow, sans-serif',
                cursor: linkStatus === 'sending' ? 'default' : 'pointer',
                opacity: linkStatus === 'sending' ? 0.7 : 1,
              }}
            >
              {linkStatus === 'sending' ? 'Enviando…' : 'Receber link mágico e entrar'}
            </button>
            {linkStatus === 'error' && (
              <div style={{ font: '400 12.5px Barlow, sans-serif', color: '#F2843D' }}>
                Não deu para enviar o link. Tenta de novo.
              </div>
            )}
          </form>
        )}
      </Shell>
    )
  }

  return (
    <Shell>
      <div style={{ textAlign: 'center' }}>
        <Eyebrow>Convite para</Eyebrow>
        <div style={{ font: "800 30px/1.1 'Barlow Condensed', sans-serif", marginTop: '8px' }}>{grupo.nome}</div>
        {grupo.cidade && (
          <div style={{ font: '400 13px/1.4 Barlow, sans-serif', color: 'rgba(234,243,236,.7)', marginTop: '4px' }}>
            {grupo.cidade}
          </div>
        )}
      </div>
      <div
        onClick={entrando ? undefined : entrarNoGrupo}
        style={{
          padding: '16px 26px',
          borderRadius: '14px',
          background: '#C9F24D',
          color: '#08130E',
          font: '700 16px/1 Barlow, sans-serif',
          cursor: entrando ? 'default' : 'pointer',
          opacity: entrando ? 0.7 : 1,
        }}
      >
        {entrando ? 'Entrando…' : 'Entrar no grupo'}
      </div>
      {erro && <div style={{ font: '400 12.5px Barlow, sans-serif', color: '#F2843D' }}>{erro}</div>}
    </Shell>
  )
}
