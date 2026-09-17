import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const initialState = { loading: true, error: null, data: null }

export function usePerfilMembro(grupoId, usuarioId) {
  const [state, setState] = useState(initialState)

  const load = useCallback(async () => {
    if (!grupoId || !usuarioId) return
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      const [perfilRes, membroRes] = await Promise.all([
        supabase.from('profiles').select('nome, telefone, chave_pix').eq('id', usuarioId).single(),
        supabase
          .from('membros')
          .select('papel, nivel, posicao, faltas, entrou_em')
          .eq('grupo_id', grupoId)
          .eq('usuario_id', usuarioId)
          .maybeSingle(),
      ])
      if (perfilRes.error) throw perfilRes.error
      if (membroRes.error) throw membroRes.error

      const membro = membroRes.data
      if (!membro) {
        setState({ loading: false, error: null, data: null })
        return
      }

      const { data: jogosEncerrados, error: jogosErr } = await supabase
        .from('jogos')
        .select('id')
        .eq('grupo_id', grupoId)
        .eq('status', 'encerrado')
      if (jogosErr) throw jogosErr
      const idsEncerrados = (jogosEncerrados ?? []).map((j) => j.id)

      let presencasCount = 0
      if (idsEncerrados.length > 0) {
        const { count, error: presErr } = await supabase
          .from('presencas')
          .select('jogo_id', { count: 'exact', head: true })
          .eq('usuario_id', usuarioId)
          .eq('situacao', 'confirmado')
          .in('jogo_id', idsEncerrados)
        if (presErr) throw presErr
        presencasCount = count ?? 0
      }

      const { data: jogoAtivo } = await supabase
        .from('jogos')
        .select('id')
        .eq('grupo_id', grupoId)
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
          .eq('usuario_id', usuarioId)
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
          totalEncerrados: idsEncerrados.length,
          presencasCount,
          emDia,
        },
      })
    } catch (err) {
      setState({ loading: false, error: err, data: null })
    }
  }, [grupoId, usuarioId])

  useEffect(() => {
    load()
  }, [load])

  const definirNivel = useCallback(
    async (nivel) => {
      if (!grupoId || !usuarioId) return
      const { error } = await supabase
        .from('membros')
        .update({ nivel })
        .eq('grupo_id', grupoId)
        .eq('usuario_id', usuarioId)
      if (error) throw error
      await load()
    },
    [grupoId, usuarioId, load]
  )

  const tornarAdmin = useCallback(async () => {
    if (!grupoId || !usuarioId) return
    const { error } = await supabase
      .from('membros')
      .update({ papel: 'admin', entrou_como_admin_em: new Date().toISOString() })
      .eq('grupo_id', grupoId)
      .eq('usuario_id', usuarioId)
    if (error) throw error
    await load()
  }, [grupoId, usuarioId, load])

  const removerMembro = useCallback(async () => {
    if (!grupoId || !usuarioId) return
    const { error } = await supabase.from('membros').delete().eq('grupo_id', grupoId).eq('usuario_id', usuarioId)
    if (error) throw error
  }, [grupoId, usuarioId])

  return { ...state, refetch: load, definirNivel, tornarAdmin, removerMembro }
}
