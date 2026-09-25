import { useState } from 'react'
import { useAuth } from './hooks/useAuth'
import { useProximoJogo } from './hooks/useProximoJogo'
import { useSorteio } from './hooks/useSorteio'
import { useRateio } from './hooks/useRateio'
import { useGrupo } from './hooks/useGrupo'
import { useHistorico } from './hooks/useHistorico'
import { useMeuPerfil } from './hooks/useMeuPerfil'
import { usePerfilMembro } from './hooks/usePerfilMembro'
import { useGarantirNomeCompleto } from './hooks/useGarantirNomeCompleto'
import { supabase, supabaseConfigured } from './lib/supabase'
import { Header } from './components/Header'
import { TabBar } from './components/TabBar'
import { BottomSheet } from './components/BottomSheet'
import { CenterMessage } from './components/CenterMessage'
import { ErrorScreen } from './components/ErrorScreen'
import { LoginScreen } from './screens/Login'
import { JoinScreen } from './screens/Join'
import { PrivacidadeScreen, TermosScreen } from './screens/Legal'
import { NomeCompletoScreen } from './screens/NomeCompleto'
import { ProximoJogoScreen } from './screens/ProximoJogo'
import { SorteioScreen } from './screens/Sorteio'
import { RateioScreen } from './screens/Rateio'
import { GrupoScreen } from './screens/Grupo'
import { HistoricoScreen } from './screens/Historico'
import { MeusDadosScreen } from './screens/MeusDados'
import { CriarJogoScreen } from './screens/CriarJogo'
import { PerfilScreen } from './screens/Perfil'
import { AcessosScreen } from './screens/Acessos'
import { mesAbrev } from './lib/format'

const TAB_TITLES = {
  jogo: 'Próximo jogo',
  times: 'Sorteio',
  caixa: 'Rateio',
  grupo: 'Grupo',
  hist: 'Perfil',
}

function AppShell({ userId, userEmail }) {
  const [tab, setTab] = useState('jogo')
  const {
    loading,
    error,
    data,
    toggleMinhaPresenca,
    criarJogo,
    editarJogo,
    cancelarJogo,
    encerrarJogo,
    refetch: refetchJogo,
  } = useProximoJogo(userId)
  const [toggling, setToggling] = useState(false)
  const {
    loading: sorteioLoading,
    error: sorteioError,
    data: sorteioData,
    sortear,
    refetch: refetchSorteio,
  } = useSorteio(userId)
  const {
    loading: rateioLoading,
    error: rateioError,
    data: rateioData,
    alternarPagamento,
    definirResponsavel,
    salvarMinhaChavePix,
    refetch: refetchRateio,
  } = useRateio(userId)
  const {
    loading: grupoLoading,
    error: grupoError,
    data: grupoData,
    setPapel,
    removerMembro,
    refetch: refetchGrupo,
  } = useGrupo(userId)
  const { loading: histLoading, error: histError, data: histData, refetch: refetchHist } = useHistorico(userId)
  const { loading: perfilLoading, error: perfilError, data: perfilData, salvarDados, sairDoGrupo } = useMeuPerfil(userId)

  const [sheet, setSheet] = useState(null)
  const [papelSel, setPapelSel] = useState(null)
  const [formJogo, setFormJogo] = useState(null)
  const [perfilAberto, setPerfilAberto] = useState(false)
  const [meusDadosAberto, setMeusDadosAberto] = useState(false)
  const [acessosAberto, setAcessosAberto] = useState(false)
  const [verPerfilMembro, setVerPerfilMembro] = useState(false)

  const {
    data: perfilMembroData,
    definirNivel: definirNivelMembro,
    tornarAdmin: tornarAdminMembro,
    removerMembro: removerMembroDoPerfil,
  } = usePerfilMembro(grupoData?.grupoId, verPerfilMembro ? papelSel?.usuarioId : null)

  const handleTogglePagamento = async (usuarioId, situacaoAtual) => {
    try {
      await alternarPagamento(usuarioId, situacaoAtual)
    } catch (err) {
      alert('Não deu para atualizar o pagamento: ' + err.message)
    }
  }

  const closeSheet = () => {
    setSheet(null)
    setPapelSel(null)
  }

  const handleAbrirPapel = (sel) => {
    setPapelSel(sel)
    setSheet('papel')
  }

  const handleSetPapel = async (novoPapel) => {
    try {
      await setPapel(papelSel.usuarioId, novoPapel)
      closeSheet()
    } catch (err) {
      alert('Não deu para mudar o papel: ' + err.message)
    }
  }

  const handleRemoverMembro = async () => {
    try {
      await removerMembro(papelSel.usuarioId)
      closeSheet()
    } catch (err) {
      alert('Não deu para remover do grupo: ' + err.message)
    }
  }

  const handleVerPerfilMembro = () => {
    setSheet(null)
    setVerPerfilMembro(true)
  }

  const handleFecharPerfilMembro = () => {
    setVerPerfilMembro(false)
    setPapelSel(null)
  }

  const handleTornarAdminMembro = async () => {
    await tornarAdminMembro()
    await refetchGrupo()
  }

  const handleRemoverMembroDoPerfil = async () => {
    await removerMembroDoPerfil()
    await refetchGrupo()
  }

  const handleEscolherResponsavel = async (usuarioId) => {
    try {
      await definirResponsavel(usuarioId)
      closeSheet()
    } catch (err) {
      alert('Não deu para trocar o responsável: ' + err.message)
    }
  }

  const handleSalvarChavePix = async (chave) => {
    try {
      await salvarMinhaChavePix(chave)
    } catch (err) {
      alert('Não deu para salvar a chave Pix: ' + err.message)
      throw err
    }
  }

  const handleToggle = async () => {
    setToggling(true)
    try {
      await toggleMinhaPresenca()
    } catch (err) {
      alert('Não deu para atualizar sua presença: ' + err.message)
    } finally {
      setToggling(false)
    }
  }

  const handleSalvarJogo = async (payload, { avisarGrupo }) => {
    if (formJogo === 'editar') {
      await editarJogo(payload)
    } else {
      await criarJogo(payload)
      if (avisarGrupo) setSheet('convite')
    }
    setFormJogo(null)
  }

  const handleCancelarJogoDestrutivo = async () => {
    await cancelarJogo()
    setFormJogo(null)
  }

  const handleEncerrarJogo = async () => {
    try {
      await encerrarJogo()
    } catch (err) {
      alert('Não deu para encerrar o jogo: ' + err.message)
    }
  }

  const handleSairDoGrupo = async () => {
    await sairDoGrupo()
  }

  const handleSalvarDadosPessoais = async ({ nome, telefone, chavePix, posicao, novoEmail }) => {
    await salvarDados({ nome, telefone, chavePix, posicao })
    if (novoEmail) {
      const { error } = await supabase.auth.updateUser({ email: novoEmail })
      if (error) throw error
    }
  }

  const papel = data?.papel
  const eyebrow = data?.jogo ? `Fut de ${mesAbrev(new Date(data.jogo.inicio)).toLowerCase()}` : 'Resenha Fut'

  let jogoContent
  if (loading) {
    jogoContent = <CenterMessage>Carregando…</CenterMessage>
  } else if (error) {
    jogoContent = <ErrorScreen mensagem={error.message} onTentarNovamente={refetchJogo} />
  } else if (data?.semGrupo) {
    jogoContent = <CenterMessage>Você ainda não faz parte de um grupo.</CenterMessage>
  } else if (data?.semJogo) {
    jogoContent =
      data.papel === 'dono' || data.papel === 'admin' ? (
        <div style={{ borderRadius: '20px', padding: '44px 24px', background: '#0F2117', border: '1px dashed rgba(201,242,77,.25)', textAlign: 'center' }}>
          <div style={{ font: "800 22px/1.2 'Barlow Condensed', sans-serif" }}>Nenhum jogo marcado</div>
          <div style={{ font: '400 13.5px/1.45 Barlow, sans-serif', color: 'rgba(234,243,236,.7)', marginTop: '8px' }}>
            Marca a próxima pelada pra galera começar a confirmar presença.
          </div>
          <div
            onClick={() => setFormJogo('criar')}
            style={{ marginTop: '22px', display: 'inline-block', padding: '15px 26px', borderRadius: '14px', background: '#C9F24D', color: '#08130E', font: '700 16px/1 Barlow, sans-serif', cursor: 'pointer' }}
          >
            Marcar jogo
          </div>
        </div>
      ) : (
        <CenterMessage>Nenhum jogo marcado no momento.</CenterMessage>
      )
  } else if (data) {
    jogoContent = (
      <ProximoJogoScreen
        userId={userId}
        jogoData={data}
        onToggle={handleToggle}
        toggling={toggling}
        onEncerrar={handleEncerrarJogo}
        onEditar={() => setFormJogo('editar')}
        onCriarOutro={() => setFormJogo('criar')}
      />
    )
  }

  let timesContent
  if (sorteioLoading) {
    timesContent = <CenterMessage>Carregando…</CenterMessage>
  } else if (sorteioError) {
    timesContent = <ErrorScreen mensagem={sorteioError.message} onTentarNovamente={refetchSorteio} />
  } else if (sorteioData?.semGrupo) {
    timesContent = <CenterMessage>Você ainda não faz parte de um grupo.</CenterMessage>
  } else if (sorteioData?.semJogo) {
    timesContent = <CenterMessage>Nenhum jogo marcado no momento.</CenterMessage>
  } else if (sorteioData) {
    timesContent = <SorteioScreen userId={userId} sorteioData={sorteioData} onSortear={sortear} />
  }

  let caixaContent
  if (rateioLoading) {
    caixaContent = <CenterMessage>Carregando…</CenterMessage>
  } else if (rateioError) {
    caixaContent = <ErrorScreen mensagem={rateioError.message} onTentarNovamente={refetchRateio} />
  } else if (rateioData?.semGrupo) {
    caixaContent = <CenterMessage>Você ainda não faz parte de um grupo.</CenterMessage>
  } else if (rateioData?.semJogo) {
    caixaContent = <CenterMessage>Nenhum jogo marcado no momento.</CenterMessage>
  } else if (rateioData) {
    caixaContent = (
      <RateioScreen
        userId={userId}
        rateioData={rateioData}
        onToggle={handleTogglePagamento}
        onCobrar={() => setSheet('cobrar')}
        onTrocarResponsavel={() => setSheet('responsavel')}
        onSalvarChavePix={handleSalvarChavePix}
      />
    )
  }

  let grupoContent
  if (grupoLoading) {
    grupoContent = <CenterMessage>Carregando…</CenterMessage>
  } else if (grupoError) {
    grupoContent = <ErrorScreen mensagem={grupoError.message} onTentarNovamente={refetchGrupo} />
  } else if (grupoData?.semGrupo) {
    grupoContent = <CenterMessage>Você ainda não faz parte de um grupo.</CenterMessage>
  } else if (grupoData) {
    grupoContent = (
      <GrupoScreen
        userId={userId}
        grupoData={grupoData}
        onAbrirPapel={handleAbrirPapel}
        onConvidar={() => setSheet('convite')}
        onAbrirAcessos={() => setAcessosAberto(true)}
      />
    )
  }

  let histContent
  if (histLoading) {
    histContent = <CenterMessage>Carregando…</CenterMessage>
  } else if (histError) {
    histContent = <ErrorScreen mensagem={histError.message} onTentarNovamente={refetchHist} />
  } else if (histData?.semGrupo) {
    histContent = <CenterMessage>Você ainda não faz parte de um grupo.</CenterMessage>
  } else if (histData) {
    histContent = (
      <HistoricoScreen
        historicoData={histData}
        perfilData={perfilData}
        onAbrirMeusDados={() => setMeusDadosAberto(true)}
        onSairDaConta={() => supabase.auth.signOut()}
      />
    )
  }

  const conviteLink = grupoData?.conviteSlug ? `${window.location.origin}/j/${grupoData.conviteSlug}` : ''

  let cobrarMensagem = ''
  if (rateioData?.confirmados && data?.jogo) {
    const paidCount = rateioData.confirmados.filter((p) => rateioData.pagamentos[p.usuario_id] === 'confirmado').length
    const openCount = rateioData.confirmados.length - paidCount
    const jogoDate = new Date(data.jogo.inicio)
    const dd = String(jogoDate.getDate()).padStart(2, '0')
    const mm = String(jogoDate.getMonth() + 1).padStart(2, '0')
    cobrarMensagem = `Fechou a de ${dd}/${mm}: R$ ${rateioData.perHead} por cabeça. Faltam ${openCount}.`
    if (rateioData.chavePix) {
      cobrarMensagem += ` Pix de ${rateioData.responsavelNome}: ${rateioData.chavePix} 👇`
    }
  }

  return (
    <div
      style={{
        height: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        background: '#08130E',
        color: '#EAF3EC',
        fontFamily: 'Barlow, sans-serif',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Header
        eyebrow={eyebrow.toUpperCase()}
        title={TAB_TITLES[tab]}
        papel={papel}
        onConvidar={() => setSheet('convite')}
        onAbrirPerfil={() => setPerfilAberto(true)}
      />
      <div style={{ flex: 1, overflow: 'auto', padding: '0 20px 120px' }}>
        {tab === 'jogo' && jogoContent}
        {tab === 'times' && timesContent}
        {tab === 'caixa' && caixaContent}
        {tab === 'grupo' && grupoContent}
        {tab === 'hist' && histContent}
      </div>
      <TabBar tab={tab} onChange={setTab} />

      <BottomSheet
        sheet={sheet}
        onClose={closeSheet}
        convite={{ link: conviteLink }}
        cobrar={{ mensagem: cobrarMensagem }}
        papel={
          papelSel
            ? {
                nome: papelSel.nome,
                papelAtual: papelSel.papelAtual,
                podeMudarPapel:
                  grupoData?.papel === 'dono' && !(papelSel.usuarioId === userId && papelSel.papelAtual === 'dono'),
                onSetPapel: handleSetPapel,
                onRemover: handleRemoverMembro,
                onVerPerfil: handleVerPerfilMembro,
              }
            : null
        }
        responsavel={{
          membros: grupoData?.membros?.map((m) => ({
            usuario_id: m.usuario_id,
            nome: m.usuario_id === userId ? 'Você' : m.nome,
          })) ?? [],
          responsavelId: rateioData?.responsavelId,
          onEscolher: handleEscolherResponsavel,
        }}
      />

      {formJogo && (
        <CriarJogoScreen
          mode={formJogo}
          jogoExistente={formJogo === 'editar' ? data?.jogo : null}
          vagasConfirmadas={
            formJogo === 'editar' ? data?.presencas?.filter((p) => p.situacao === 'confirmado').length : null
          }
          onSalvar={handleSalvarJogo}
          onFechar={() => setFormJogo(null)}
          onCancelarJogo={handleCancelarJogoDestrutivo}
        />
      )}

      {perfilAberto && perfilData && !perfilData.semGrupo && (
        <PerfilScreen
          perfilData={perfilData}
          onSalvar={salvarDados}
          onSairDoGrupo={handleSairDoGrupo}
          onSairDaConta={() => supabase.auth.signOut()}
          onFechar={() => setPerfilAberto(false)}
        />
      )}

      {meusDadosAberto && perfilData && !perfilData.semGrupo && (
        <MeusDadosScreen
          perfilData={perfilData}
          email={userEmail}
          onSalvar={handleSalvarDadosPessoais}
          onFechar={() => setMeusDadosAberto(false)}
        />
      )}

      {verPerfilMembro && perfilMembroData && (
        <PerfilScreen
          perfilData={perfilMembroData}
          modo="admin"
          onDefinirNivel={definirNivelMembro}
          onTornarAdmin={handleTornarAdminMembro}
          onRemoverMembro={handleRemoverMembroDoPerfil}
          onFechar={handleFecharPerfilMembro}
        />
      )}

      {acessosAberto && grupoData && !grupoData.semGrupo && (
        <AcessosScreen
          userId={userId}
          grupoData={grupoData}
          onAbrirPapel={(sel) => {
            setAcessosAberto(false)
            handleAbrirPapel(sel)
          }}
          onFechar={() => setAcessosAberto(false)}
        />
      )}
    </div>
  )
}

export default function App() {
  const session = useAuth()

  if (!supabaseConfigured) {
    return (
      <CenterMessage>
        Faltam as variáveis <code>VITE_SUPABASE_URL</code> e <code>VITE_SUPABASE_ANON_KEY</code> no arquivo{' '}
        <code>.env</code> (veja <code>.env.example</code>). Depois de criar o <code>.env</code>, reinicie o servidor
        de desenvolvimento.
      </CenterMessage>
    )
  }

  if (window.location.pathname === '/privacidade') {
    return <PrivacidadeScreen />
  }
  if (window.location.pathname === '/termos') {
    return <TermosScreen />
  }

  const matchConvite = window.location.pathname.match(/^\/j\/([^/]+)/)
  if (matchConvite) {
    return <JoinScreen slug={matchConvite[1]} />
  }

  if (session === undefined) {
    return <CenterMessage>Carregando…</CenterMessage>
  }

  if (session === null) {
    return <LoginScreen />
  }

  return <AppComSessao session={session} />
}

function AppComSessao({ session }) {
  const [nomeStatus, marcarNomeResolvido] = useGarantirNomeCompleto(session)

  if (nomeStatus === 'checking') {
    return <CenterMessage>Carregando…</CenterMessage>
  }

  if (nomeStatus === 'precisa-nome') {
    return <NomeCompletoScreen userId={session.user.id} onEntrar={marcarNomeResolvido} />
  }

  return (
    <div style={{ minHeight: '100dvh', background: '#08130E' }}>
      <div style={{ maxWidth: '480px', margin: '0 auto', minHeight: '100dvh', position: 'relative' }}>
        <AppShell userId={session.user.id} userEmail={session.user.email} />
      </div>
    </div>
  )
}
