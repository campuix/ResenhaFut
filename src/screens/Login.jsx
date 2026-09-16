import { useState } from 'react'
import { supabase } from '../lib/supabase'

export function LoginScreen() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle') // idle | sending | sent | error
  const [errorMsg, setErrorMsg] = useState('')

  const enviar = async (e) => {
    e.preventDefault()
    if (!email) return
    setStatus('sending')
    setErrorMsg('')
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    })
    if (error) {
      setStatus('error')
      setErrorMsg(error.message)
    } else {
      setStatus('sent')
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
        <div style={{ font: "800 30px/1 'Barlow Condensed', sans-serif", marginTop: '8px' }}>Entrar</div>
      </div>

      {status === 'sent' ? (
        <div style={{ textAlign: 'center', font: '400 14px/1.5 Barlow, sans-serif', color: 'rgba(234,243,236,.75)' }}>
          Manda um link mágico pro seu e-mail. Abre o link em <strong>{email}</strong> para entrar.
        </div>
      ) : (
        <form onSubmit={enviar} style={{ width: '100%', maxWidth: '340px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
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
            disabled={status === 'sending'}
            style={{
              padding: '15px 20px',
              borderRadius: '14px',
              border: 'none',
              background: '#C9F24D',
              color: '#08130E',
              font: '700 15px Barlow, sans-serif',
              cursor: status === 'sending' ? 'default' : 'pointer',
              opacity: status === 'sending' ? 0.7 : 1,
            }}
          >
            {status === 'sending' ? 'Enviando…' : 'Receber link mágico'}
          </button>
          {status === 'error' && (
            <div style={{ font: '400 12.5px Barlow, sans-serif', color: '#F2843D' }}>{errorMsg}</div>
          )}
        </form>
      )}
    </div>
  )
}
