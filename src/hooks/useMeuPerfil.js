import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { withJwtRetry } from '../lib/retry'

const initialState = { loading: true, error: null, data: null }

export function useMeuPerfil(userId) {
  const [state, setState] = useState(initialState)

  const load = useCallback(async () => {
    if (!userId) return
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      await withJwtRetry(async () => {
      const [perfilRes, membroRes] = await Promise.all([
        supabase.from('profiles').select('nome, telefone, chave_pix').eq('id', userId).single(),
        supabase
          .from('membros')
          .select('grupo_id, papel, nivel, posicao, faltas, entrou_em')
          .eq('usuario_id', userId)
          .limit(1)
          .maybeSingle(),
      ])
      if (perfilRes.error) throw perfilRes.error
      if (membroRes.error) throw membroRes.error

      const membro = membroRes.data
      if (!membro) {
        setState({ loading: false, error: null, data: { semGrupo: true } })
        return
      }

      const { data: jogosEncerrados, error: jogosErr } = await supabase
        .from('jogos')
        .select('id')
        .eq('grupo_id', membro.grupo_id)
        .eq('status', 'encerrado')
      if (jogosErr) throw jogosErr
      const idsEncerrados = (jogosEncerrados ?? []).map((j) => j.id)

      let presencasCount = 0
      if (idsEncerrados.length > 0) {
        const { count, error: presErr } = await supabase
          .from('presencas')
          .select('jogo_id', { count: 'exact', head: true })
          .eq('usuario_id', userId)
          .eq('situacao', 'confirmado')
          .in('jogo_id', idsEncerrados)
        if (presErr) throw presErr
        presencasCount = count ?? 0
      }

      const { data: jogoAtivo } = await supabase
        .from('jogos')
        .select('id')
        .eq('grupo_id', membro.grupo_id)
        .in('status', ['aberto', 'lotado'])
        .order('inicio', { ascending: true })
        .limit(1)
        .maybeSingle()

      let emDia = true
      if (jogoAtivo) {
        const { data: pagamento } = await supabase
          .from('pagamentos')
          .select('situacao')
          .eq('jogo_id', jogoAtivo.id)
          .eq('usuario_id', userId)
          .maybeSingle()
        emDia = !pagamento || pagamento.situacao === 'confirmado'
      }

      setState({
        loading: false,
        error: null,
        data: {
          nome: perfilRes.data.nome,
          telefone: perfilRes.data.telefone,
          chavePix: perfilRes.data.chave_pix,
          papel: membro.papel,
          nivel: membro.nivel,
          posicao: membro.posicao,
          faltas: membro.faltas,
          entrouEm: membro.entrou_em,
          grupoId: membro.grupo_id,
          totalEncerrados: idsEncerrados.length,
          presencasCount,
          emDia,
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

  const salvarDados = useCallback(
    async ({ nome, telefone, chavePix, posicao }) => {
      if (!userId || !state.data?.grupoId) return
      const [perfilRes, membroRes] = await Promise.all([
        supabase.from('profiles').update({ nome, telefone, chave_pix: chavePix }).eq('id', userId),
        supabase.from('membros').update({ posicao }).eq('grupo_id', state.data.grupoId).eq('usuario_id', userId),
      ])
      if (perfilRes.error) throw perfilRes.error
      if (membroRes.error) throw membroRes.error
      await load()
    },
    [userId, state.data, load]
  )

  const sairDoGrupo = useCallback(async () => {
    if (!userId || !state.data?.grupoId) return
    const { error } = await supabase.from('membros').delete().eq('grupo_id', state.data.grupoId).eq('usuario_id', userId)
    if (error) throw error
    await load()
  }, [userId, state.data, load])

  return { ...state, refetch: load, salvarDados, sairDoGrupo }
}
