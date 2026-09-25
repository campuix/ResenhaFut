import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { N_TIMES, VESTS, embaralhar, serpentina } from '../lib/vests'
import { withJwtRetry } from '../lib/retry'

const initialState = { loading: true, error: null, data: null }

export function useSorteio(userId) {
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

      const { data: jogo, error: jogoErr } = await supabase
        .from('jogos')
        .select('id')
        .eq('grupo_id', membro.grupo_id)
        .in('status', ['aberto', 'lotado'])
        .order('inicio', { ascending: true })
        .limit(1)
        .maybeSingle()
      if (jogoErr) throw jogoErr
      if (!jogo) {
        setState({ loading: false, error: null, data: { papel: membro.papel, semJogo: true } })
        return
      }

      const [presRes, membrosRes, timesRes] = await Promise.all([
        supabase
          .from('presencas')
          .select('usuario_id, profiles(nome)')
          .eq('jogo_id', jogo.id)
          .eq('situacao', 'confirmado'),
        supabase.from('membros_publicos').select('usuario_id, nivel').eq('grupo_id', membro.grupo_id),
        supabase
          .from('times')
          .select('id, nome, cor, sorteado_em, time_jogadores(usuario_id, profiles(nome))')
          .eq('jogo_id', jogo.id)
          .order('sorteado_em', { ascending: true }),
      ])
      if (presRes.error) throw presRes.error
      if (membrosRes.error) throw membrosRes.error
      if (timesRes.error) throw timesRes.error

      setState({
        loading: false,
        error: null,
        data: {
          papel: membro.papel,
          jogoId: jogo.id,
          confirmados: presRes.data ?? [],
          membrosPub: membrosRes.data ?? [],
          timesSalvos: timesRes.data ?? [],
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

  const sortear = useCallback(
    async (mode) => {
      if (!userId || !state.data?.jogoId) return
      const { jogoId, confirmados, membrosPub } = state.data
      const nivelMap = new Map(membrosPub.map((m) => [m.usuario_id, Number(m.nivel)]))
      const jogadores = confirmados.map((p) => ({
        usuario_id: p.usuario_id,
        nivel: nivelMap.get(p.usuario_id) ?? 3,
      }))

      const ordenados = mode === 'eq' ? jogadores.slice().sort((a, b) => b.nivel - a.nivel) : embaralhar(jogadores)
      const buckets = serpentina(ordenados, N_TIMES)
      const agora = new Date().toISOString()

      // Best-effort: só remove o sorteio anterior se a policy permitir (quem sorteou ou admin).
      await supabase.from('times').delete().eq('jogo_id', jogoId)

      const novasLinhas = buckets.map((_, i) => ({
        jogo_id: jogoId,
        nome: VESTS[i % VESTS.length].nome,
        cor: VESTS[i % VESTS.length].bg,
        sorteado_por: userId,
        sorteado_em: agora,
      }))
      const { data: timesInseridos, error: timesErr } = await supabase.from('times').insert(novasLinhas).select('id')
      if (timesErr) throw timesErr

      const linhasJogadores = timesInseridos.flatMap((t, i) =>
        buckets[i].map((p) => ({ time_id: t.id, usuario_id: p.usuario_id }))
      )
      if (linhasJogadores.length > 0) {
        const { error: tjErr } = await supabase.from('time_jogadores').insert(linhasJogadores)
        if (tjErr) throw tjErr
      }

      await load()
    },
    [userId, state.data, load]
  )

  return { ...state, refetch: load, sortear }
}
