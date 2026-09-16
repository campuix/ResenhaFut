import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const initialState = { loading: true, error: null, data: null }

export function useProximoJogo(userId) {
  const [state, setState] = useState(initialState)

  const load = useCallback(async () => {
    if (!userId) return
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
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

      const { data: jogo, error: jogoErr } = await supabase
        .from('jogos')
        .select('*')
        .eq('grupo_id', membro.grupo_id)
        .in('status', ['aberto', 'lotado'])
        .order('inicio', { ascending: true })
        .limit(1)
        .maybeSingle()
      if (jogoErr) throw jogoErr
      if (!jogo) {
        setState({ loading: false, error: null, data: { papel: membro.papel, grupoId: membro.grupo_id, semJogo: true } })
        return
      }

      const [presRes, membrosRes, pagRes] = await Promise.all([
        supabase
          .from('presencas')
          .select('usuario_id, situacao, ordem, profiles(nome)')
          .eq('jogo_id', jogo.id)
          .in('situacao', ['confirmado', 'espera'])
          .order('ordem', { ascending: true }),
        supabase.from('membros_publicos').select('usuario_id, nivel, posicao').eq('grupo_id', membro.grupo_id),
        supabase.from('pagamentos').select('usuario_id, situacao').eq('jogo_id', jogo.id),
      ])
      if (presRes.error) throw presRes.error
      if (membrosRes.error) throw membrosRes.error
      if (pagRes.error) throw pagRes.error

      setState({
        loading: false,
        error: null,
        data: {
          papel: membro.papel,
          grupoId: membro.grupo_id,
          jogo,
          presencas: presRes.data ?? [],
          membrosPub: membrosRes.data ?? [],
          pagamentos: pagRes.data ?? [],
        },
      })
    } catch (err) {
      setState({ loading: false, error: err, data: null })
    }
  }, [userId])

  useEffect(() => {
    load()
  }, [load])

  const toggleMinhaPresenca = useCallback(async () => {
    if (!userId || !state.data?.jogo) return
    const { jogo, presencas } = state.data
    const minha = presencas.find((p) => p.usuario_id === userId)

    if (minha) {
      const { error } = await supabase
        .from('presencas')
        .delete()
        .eq('jogo_id', jogo.id)
        .eq('usuario_id', userId)
      if (error) throw error

      if (minha.situacao === 'confirmado') {
        const proximoDaEspera = presencas
          .filter((p) => p.situacao === 'espera' && p.usuario_id !== userId)
          .sort((a, b) => a.ordem - b.ordem)[0]
        if (proximoDaEspera) {
          const { error: promoErr } = await supabase
            .from('presencas')
            .update({ situacao: 'confirmado' })
            .eq('jogo_id', jogo.id)
            .eq('usuario_id', proximoDaEspera.usuario_id)
          if (promoErr) {
            // Sem permissão para promover a espera de outra pessoa (só admin pode) — esperado para jogador comum.
            console.warn('Promoção da espera não aplicada:', promoErr.message)
          }
        }
      }
    } else {
      const confirmadosAtuais = presencas.filter((p) => p.situacao === 'confirmado').length
      const situacao = confirmadosAtuais < jogo.vagas ? 'confirmado' : 'espera'
      const { error } = await supabase.from('presencas').insert({ jogo_id: jogo.id, usuario_id: userId, situacao })
      if (error) throw error
    }

    await load()
  }, [userId, state.data, load])

  const criarJogo = useCallback(
    async (payload) => {
      if (!userId || !state.data?.grupoId) return
      const { error } = await supabase.from('jogos').insert({
        grupo_id: state.data.grupoId,
        criado_por: userId,
        ...payload,
      })
      if (error) throw error
      await load()
    },
    [userId, state.data, load]
  )

  const encerrarJogo = useCallback(async () => {
    if (!state.data?.jogo) return
    const { error } = await supabase.from('jogos').update({ status: 'encerrado' }).eq('id', state.data.jogo.id)
    if (error) throw error
    await load()
  }, [state.data, load])

  return { ...state, refetch: load, toggleMinhaPresenca, criarJogo, encerrarJogo }
}
