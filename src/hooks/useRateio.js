import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const initialState = { loading: true, error: null, data: null }

export function useRateio(userId) {
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
        .select('id, custo_total, criado_por, responsavel_pagamento')
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

      const responsavelId = jogo.responsavel_pagamento ?? jogo.criado_por

      const [presRes, pagRes, respMembroRes, respPerfilRes] = await Promise.all([
        supabase
          .from('presencas')
          .select('usuario_id, ordem, profiles(nome)')
          .eq('jogo_id', jogo.id)
          .eq('situacao', 'confirmado')
          .order('ordem', { ascending: true }),
        supabase.from('pagamentos').select('usuario_id, situacao').eq('jogo_id', jogo.id),
        supabase
          .from('membros')
          .select('chave_pix')
          .eq('grupo_id', membro.grupo_id)
          .eq('usuario_id', responsavelId)
          .maybeSingle(),
        supabase.from('profiles').select('nome').eq('id', responsavelId).maybeSingle(),
      ])
      if (presRes.error) throw presRes.error
      if (pagRes.error) throw pagRes.error
      if (respMembroRes.error) throw respMembroRes.error
      if (respPerfilRes.error) throw respPerfilRes.error

      const isAdmin = membro.papel === 'dono' || membro.papel === 'admin'
      const confirmados = presRes.data ?? []
      const nConfirmed = confirmados.length
      const perHead = Math.round(Number(jogo.custo_total) / Math.max(1, nConfirmed))
      const pagMap = new Map((pagRes.data ?? []).map((p) => [p.usuario_id, p.situacao]))

      // O schema não tem um passo de "lançar rateio": o admin cria as cobranças em aberto
      // na primeira vez que abre a tela, para os confirmados que ainda não têm linha.
      if (isAdmin && nConfirmed > 0) {
        const faltando = confirmados.filter((p) => !pagMap.has(p.usuario_id))
        if (faltando.length > 0) {
          const linhas = faltando.map((p) => ({
            jogo_id: jogo.id,
            usuario_id: p.usuario_id,
            situacao: 'aberto',
            valor: perHead,
          }))
          const { error: seedErr } = await supabase.from('pagamentos').upsert(linhas, { onConflict: 'jogo_id,usuario_id' })
          if (seedErr) {
            console.warn('Não foi possível lançar o rateio automaticamente:', seedErr.message)
          } else {
            faltando.forEach((p) => pagMap.set(p.usuario_id, 'aberto'))
          }
        }
      }

      setState({
        loading: false,
        error: null,
        data: {
          papel: membro.papel,
          isAdmin,
          grupoId: membro.grupo_id,
          jogoId: jogo.id,
          custoTotal: Number(jogo.custo_total),
          perHead,
          confirmados,
          pagamentos: Object.fromEntries(pagMap),
          responsavelId,
          responsavelNome: respPerfilRes.data?.nome ?? null,
          chavePix: respMembroRes.data?.chave_pix ?? null,
        },
      })
    } catch (err) {
      setState({ loading: false, error: err, data: null })
    }
  }, [userId])

  useEffect(() => {
    load()
  }, [load])

  const alternarPagamento = useCallback(
    async (usuarioId, situacaoAtual) => {
      if (!userId || !state.data?.jogoId) return
      const { jogoId, isAdmin, perHead } = state.data

      const novaSituacao = isAdmin
        ? situacaoAtual === 'confirmado'
          ? 'aberto'
          : 'confirmado'
        : situacaoAtual === 'declarado'
          ? 'aberto'
          : 'declarado'

      const payload = { jogo_id: jogoId, usuario_id: usuarioId, situacao: novaSituacao, valor: perHead }
      if (novaSituacao === 'declarado') payload.declarado_em = new Date().toISOString()
      if (novaSituacao === 'confirmado') {
        payload.confirmado_por = userId
        payload.confirmado_em = new Date().toISOString()
      }

      const { error } = await supabase.from('pagamentos').upsert(payload, { onConflict: 'jogo_id,usuario_id' })
      if (error) throw error
      await load()
    },
    [userId, state.data, load]
  )

  const definirResponsavel = useCallback(
    async (usuarioId) => {
      if (!state.data?.jogoId) return
      const { error } = await supabase
        .from('jogos')
        .update({ responsavel_pagamento: usuarioId })
        .eq('id', state.data.jogoId)
      if (error) throw error
      await load()
    },
    [state.data, load]
  )

  const salvarMinhaChavePix = useCallback(
    async (chave) => {
      if (!userId || !state.data?.grupoId) return
      const { error } = await supabase
        .from('membros')
        .update({ chave_pix: chave })
        .eq('grupo_id', state.data.grupoId)
        .eq('usuario_id', userId)
      if (error) throw error
      await load()
    },
    [userId, state.data, load]
  )

  return { ...state, refetch: load, alternarPagamento, definirResponsavel, salvarMinhaChavePix }
}
