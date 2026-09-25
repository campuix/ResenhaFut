import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { withJwtRetry } from '../lib/retry'

const initialState = { loading: true, error: null, data: null }

export function useGrupo(userId) {
  const [state, setState] = useState(initialState)

  const load = useCallback(async () => {
    if (!userId) return
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      await withJwtRetry(async () => {
      const { data: membro, error: membroErr } = await supabase
        .from('membros')
        .select('grupo_id, papel')
        .eq('usuario_id', userId)
        .limit(1)
        .maybeSingle()
      if (membroErr) throw membroErr
      if (!membro) {
        setState({ loading: false, error: null, data: { semGrupo: true } })
        return
      }

      const [membrosRes, grupoRes] = await Promise.all([
        supabase
          .from('membros_publicos')
          .select('usuario_id, papel, nivel, posicao, entrou_em, entrou_como_admin_em, faltas')
          .eq('grupo_id', membro.grupo_id)
          .order('entrou_em', { ascending: true }),
        supabase.from('grupos').select('convite_slug').eq('id', membro.grupo_id).single(),
      ])
      if (membrosRes.error) throw membrosRes.error
      if (grupoRes.error) throw grupoRes.error

      const membrosPub = membrosRes.data
      const ids = (membrosPub ?? []).map((m) => m.usuario_id)
      const { data: perfis, error: perfisErr } = await supabase.from('profiles').select('id, nome').in('id', ids)
      if (perfisErr) throw perfisErr
      const nomeMap = new Map((perfis ?? []).map((p) => [p.id, p.nome]))

      setState({
        loading: false,
        error: null,
        data: {
          papel: membro.papel,
          grupoId: membro.grupo_id,
          conviteSlug: grupoRes.data?.convite_slug,
          membros: (membrosPub ?? []).map((m) => ({ ...m, nome: nomeMap.get(m.usuario_id) ?? 'Jogador' })),
        },
      })
      })
    } catch (err) {
      setState({ loading: false, error: err, data: null })
    }
  }, [userId])

  useEffect(() => {
    load()
  }, [load])

  const setPapel = useCallback(
    async (usuarioId, novoPapel) => {
      if (!state.data?.grupoId) return
      const membroAtual = state.data.membros?.find((m) => m.usuario_id === usuarioId)
      const payload = { papel: novoPapel }
      if (novoPapel === 'admin' && membroAtual?.papel !== 'admin' && membroAtual?.papel !== 'dono') {
        payload.entrou_como_admin_em = new Date().toISOString()
      }
      const { error } = await supabase
        .from('membros')
        .update(payload)
        .eq('grupo_id', state.data.grupoId)
        .eq('usuario_id', usuarioId)
      if (error) throw error
      await load()
    },
    [state.data, load]
  )

  const removerMembro = useCallback(
    async (usuarioId) => {
      if (!state.data?.grupoId) return
      const { error } = await supabase
        .from('membros')
        .delete()
        .eq('grupo_id', state.data.grupoId)
        .eq('usuario_id', usuarioId)
      if (error) throw error
      await load()
    },
    [state.data, load]
  )

  return { ...state, refetch: load, setPapel, removerMembro }
}
