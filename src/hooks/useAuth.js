import { useEffect, useState } from 'react'
import { supabase, supabaseConfigured } from '../lib/supabase'

// undefined = ainda carregando; null = sem sessão; objeto = logado
export function useAuth() {
  const [session, setSession] = useState(undefined)

  useEffect(() => {
    if (!supabaseConfigured) return
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  return session
}
