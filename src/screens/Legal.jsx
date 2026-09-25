const CONTATO_EMAIL = 'campos.lucas95@gmail.com'

function LegalShell({ title, children }) {
  return (
    <div
      style={{
        minHeight: '100dvh',
        background: '#08130E',
        color: '#EAF3EC',
        fontFamily: 'Barlow, sans-serif',
      }}
    >
      <div style={{ maxWidth: '560px', margin: '0 auto', padding: '40px 24px 64px' }}>
        <a
          href="/"
          style={{
            font: '600 13px/1 Barlow, sans-serif',
            color: 'rgba(234,243,236,.68)',
            textDecoration: 'none',
          }}
        >
          ← Voltar
        </a>

        <div style={{ marginTop: '18px' }}>
          <div
            style={{
              font: "500 10px/1 'IBM Plex Mono', monospace",
              letterSpacing: '.14em',
              color: 'rgba(234,243,236,.68)',
              textTransform: 'uppercase',
            }}
          >
            Resenha Fut
          </div>
          <div style={{ font: "800 30px/1.1 'Barlow Condensed', sans-serif", letterSpacing: '-.01em', marginTop: '8px' }}>
            {title}
          </div>
        </div>

        <div style={{ marginTop: '28px', display: 'flex', flexDirection: 'column', gap: '22px' }}>{children}</div>

        <div
          style={{
            marginTop: '40px',
            paddingTop: '18px',
            borderTop: '1px solid rgba(234,243,236,.07)',
            font: '400 11.5px/1.5 Barlow, sans-serif',
            color: 'rgba(234,243,236,.5)',
          }}
        >
          Última atualização: setembro de 2026.
        </div>
      </div>
    </div>
  )
}

function Secao({ titulo, children }) {
  return (
    <section>
      <div
        style={{
          font: "700 18px/1.2 'Barlow Condensed', sans-serif",
          color: '#C9F24D',
          marginBottom: '8px',
        }}
      >
        {titulo}
      </div>
      <div style={{ font: '400 14px/1.6 Barlow, sans-serif', color: 'rgba(234,243,236,.78)' }}>{children}</div>
    </section>
  )
}

export function PrivacidadeScreen() {
  return (
    <LegalShell title="Política de Privacidade">
      <div style={{ font: '400 14px/1.6 Barlow, sans-serif', color: 'rgba(234,243,236,.78)' }}>
        O Resenha Fut é um app pra organizar as peladas de um grupo de amigos: marcar presença, sortear os times e
        acompanhar quem já pagou. Esta página explica de um jeito simples o que a gente guarda sobre você e por quê.
      </div>

      <Secao titulo="Quais dados a gente guarda">
        Nome, e-mail, telefone e chave Pix (quando você cadastra), sua presença confirmada nos jogos, e os pagamentos
        que você mesmo declara como feitos. É só isso — nada de dados que você não colocou no app.
      </Secao>

      <Secao titulo="Pra que esses dados servem">
        Só pra organizar as peladas do seu grupo: saber quem vai jogar, sortear os times, calcular quanto cada um
        paga e mostrar quem já acertou a grana. Nenhum dado é usado pra outra coisa além disso.
      </Secao>

      <Secao titulo="Onde os dados ficam">
        Tudo fica guardado no Supabase, um serviço de banco de dados na nuvem, com acesso protegido por login. A
        gente não guarda nada em planilha, e-mail ou qualquer outro lugar solto.
      </Secao>

      <Secao titulo="A gente vende ou compartilha seus dados?">
        Não. Seus dados não são vendidos nem compartilhados com terceiros, nunca. Eles ficam só entre você e o seu
        grupo dentro do app.
      </Secao>

      <Secao titulo="Login com Google">
        Se você entrar com sua conta Google, a gente usa só o seu nome e e-mail pra criar seu perfil — nada mais é
        acessado da sua conta Google.
      </Secao>

      <Secao titulo="Como pedir pra apagar sua conta">
        É só mandar um e-mail pra{' '}
        <a href={`mailto:${CONTATO_EMAIL}`} style={{ color: '#C9F24D' }}>
          {CONTATO_EMAIL}
        </a>{' '}
        pedindo a exclusão da sua conta. A gente remove seus dados do sistema.
      </Secao>
    </LegalShell>
  )
}

export function TermosScreen() {
  return (
    <LegalShell title="Termos de Uso">
      <div style={{ font: '400 14px/1.6 Barlow, sans-serif', color: 'rgba(234,243,236,.78)' }}>
        Regras simples pra usar o Resenha Fut de boa. Ao criar uma conta ou entrar em um grupo, você concorda com o
        que está aqui.
      </div>

      <Secao titulo="O que é o app">
        O Resenha Fut ajuda grupos de amigos a organizar suas peladas: confirmar presença, sortear times e controlar
        quem já pagou a quadra. Não é uma plataforma de pagamentos — os valores são só declarados por cada jogador,
        o app não processa nem intermedia nenhuma transação.
      </Secao>

      <Secao titulo="Sua conta">
        Você é responsável pelas informações que cadastra (nome, telefone, chave Pix). Mantenha seus dados
        atualizados e não compartilhe seu acesso com outras pessoas.
      </Secao>

      <Secao titulo="Grupos e administração">
        Quem cria um grupo vira o dono e pode promover admins, mudar papéis e remover membros. Admins podem marcar
        jogos, confirmar pagamentos e gerenciar a lista de jogadores. Use essas permissões com responsabilidade.
      </Secao>

      <Secao titulo="Uso adequado">
        Use o app só pra organizar suas próprias peladas. Não é permitido usar o Resenha Fut pra golpes, cobranças
        falsas ou qualquer atividade que prejudique outros usuários.
      </Secao>

      <Secao titulo="Sem garantias">
        O app é oferecido "como está", sem garantia de disponibilidade contínua. Ele pode passar por manutenções,
        mudanças ou, eventualmente, sair do ar.
      </Secao>

      <Secao titulo="Contato">
        Dúvidas, problemas ou pedidos relacionados à sua conta:{' '}
        <a href={`mailto:${CONTATO_EMAIL}`} style={{ color: '#C9F24D' }}>
          {CONTATO_EMAIL}
        </a>
        .
      </Secao>
    </LegalShell>
  )
}
