import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { withJwtRetry } from '../lib/retry'

const initialState = { loading: true, error: null, data: null }

export function useHistorico(userId) {
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

      const isAdmin = membro.papel === 'dono' || membro.papel === 'admin'

      const { data: jogos, error: jogosErr } = await supabase
        .from('jogos')
        .select('id, inicio, local, quadra')
        .eq('grupo_id', membro.grupo_id)
        .eq('status', 'encerrado')
        .order('inicio', { ascending: false })
      if (jogosErr) throw jogosErr

      const jogoIds = (jogos ?? []).map((j) => j.id)
      const anoAtual = new Date().getFullYear()
      const peladasNoAno = (jogos ?? []).filter((j) => new Date(j.inicio).getFullYear() === anoAtual).length

      let contagemPorJogo = new Map()
      if (jogoIds.length > 0) {
        const { data: presencas, error: presErr } = await supabase
          .from('presencas')
          .select('jogo_id, usuario_id')
          .in('jogo_id', jogoIds)
          .eq('situacao', 'confirmado')
        if (presErr) throw presErr
        for (const p of presencas ?? []) {
          contagemPorJogo.set(p.jogo_id, (contagemPorJogo.get(p.jogo_id) ?? 0) + 1)
        }
      }

      let statB = 0
      if (isAdmin) {
        const { data: membrosPub, error: membrosErr } = await supabase
          .from('membros_publicos')
          .select('faltas')
          .eq('grupo_id', membro.grupo_id)
        if (membrosErr) throw membrosErr
        statB = (membrosPub ?? []).reduce((acc, m) => acc + (m.faltas ?? 0), 0)
      } else if (jogoIds.length > 0) {
        const { count, error: minhasErr } = await supabase
          .from('presencas')
          .select('jogo_id', { count: 'exact', head: true })
          .eq('usuario_id', userId)
          .eq('situacao', 'confirmado')
          .in('jogo_id', jogoIds)
        if (minhasErr) throw minhasErr
        statB = count ?? 0
      }

      setState({
        loading: false,
        error: null,
        data: {
          papel: membro.papel,
          isAdmin,
          peladasNoAno,
          anoAtual,
          statB,
          jogos: (jogos ?? []).map((j) => ({ ...j, confirmados: contagemPorJogo.get(j.id) ?? 0 })),
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

  return { ...state, refetch: load }
}
