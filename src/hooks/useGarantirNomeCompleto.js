import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

// 'checking' | 'ok' | 'precisa-nome'
export function useGarantirNomeCompleto(session) {
  const [status, setStatus] = useState('checking')

  useEffect(() => {
    if (!session) {
      setStatus('checking')
      return
    }
    let cancelado = false

    async function verificar() {
      const { data, error } = await supabase.from('profiles').select('nome').eq('id', session.user.id).single()
      if (cancelado) return
      if (error) {
        setStatus('ok')
        return
      }

      const prefixoEmail = session.user.email?.split('@')[0] ?? ''
      const precisaNome = !data.nome || data.nome === prefixoEmail
      if (!precisaNome) {
        setStatus('ok')
        return
      }

      const meta = session.user.user_metadata ?? {}
      const nomeDoProvedor = meta.full_name || meta.name
      if (nomeDoProvedor && nomeDoProvedor !== prefixoEmail) {
        const { error: updErr } = await supabase.from('profiles').update({ nome: nomeDoProvedor }).eq('id', session.user.id)
        if (cancelado) return
        setStatus(updErr ? 'precisa-nome' : 'ok')
        return
      }

      setStatus('precisa-nome')
    }

    verificar()
    return () => {
      cancelado = true
    }
  }, [session])

  const marcarResolvido = () => setStatus('ok')

  return [status, marcarResolvido]
}
