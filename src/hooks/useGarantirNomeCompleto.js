import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'

// 'checking' | 'ok' | 'precisa-nome'
// Reverifica sempre que o app abre ou volta a ficar visível — não só logo após o
// login — porque uma sessão antiga (de antes desta correção) nunca passa pelo
// login de novo, só reabre o app.
export function useGarantirNomeCompleto(session) {
  const [status, setStatus] = useState('checking')
  const sessionRef = useRef(session)
  sessionRef.current = session

  const verificar = useCallback(async () => {
    const sessaoAtual = sessionRef.current
    if (!sessaoAtual) return

    const { data, error } = await supabase.from('profiles').select('nome').eq('id', sessaoAtual.user.id).single()
    if (sessionRef.current !== sessaoAtual) return
    if (error) {
      setStatus('ok')
      return
    }

    const prefixoEmail = sessaoAtual.user.email?.split('@')[0] ?? ''
    const precisaNome = !data.nome || data.nome === prefixoEmail
    if (!precisaNome) {
      setStatus('ok')
      return
    }

    const meta = sessaoAtual.user.user_metadata ?? {}
    const nomeDoProvedor = meta.full_name || meta.name
    if (nomeDoProvedor && nomeDoProvedor !== prefixoEmail) {
      const { error: updErr } = await supabase.from('profiles').update({ nome: nomeDoProvedor }).eq('id', sessaoAtual.user.id)
      if (sessionRef.current !== sessaoAtual) return
      setStatus(updErr ? 'precisa-nome' : 'ok')
      return
    }

    setStatus('precisa-nome')
  }, [])

  useEffect(() => {
    if (!session) {
      setStatus('checking')
      return
    }
    verificar()
  }, [session, verificar])

  useEffect(() => {
    if (!session) return
    const onVisivel = () => {
      if (document.visibilityState === 'visible') verificar()
    }
    document.addEventListener('visibilitychange', onVisivel)
    window.addEventListener('focus', onVisivel)
    return () => {
      document.removeEventListener('visibilitychange', onVisivel)
      window.removeEventListener('focus', onVisivel)
    }
  }, [session, verificar])

  const marcarResolvido = () => setStatus('ok')

  return [status, marcarResolvido]
}
