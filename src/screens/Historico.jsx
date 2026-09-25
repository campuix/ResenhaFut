import { useState } from 'react'
import { mesAbrev } from '../lib/format'
import { FIELD_BOX, GROUP_TITLE, LABEL_STYLE, VALUE_MONO, VALUE_TEXT } from '../lib/fieldStyles'

function DadosPessoais({ perfilData, email, onSalvar }) {
  const [nome, setNome] = useState(perfilData?.nome ?? '')
  const [telefone, setTelefone] = useState(perfilData?.telefone ?? '')
  const [chavePix, setChavePix] = useState(perfilData?.chavePix ?? '')
  const [novoEmail, setNovoEmail] = useState(email ?? '')
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  const [aviso, setAviso] = useState('')

  const salvar = async () => {
    setSalvando(true)
    setErro('')
    setAviso('')
    try {
      const emailMudou = novoEmail.trim() && novoEmail.trim() !== email
      await onSalvar({
        nome: nome.trim(),
        telefone: telefone.trim() || null,
        chavePix: chavePix.trim() || null,
        novoEmail: emailMudou ? novoEmail.trim() : null,
      })
      setAviso(
        emailMudou
          ? 'Dados salvos. Enviamos um link de confirmação pro novo e-mail — até você confirmar, o login continua com o e-mail antigo.'
          : 'Dados salvos.'
      )
    } catch (err) {
      setErro(err.message)
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '11px' }}>
      <div style={GROUP_TITLE}>Dados pessoais</div>
      <div style={FIELD_BOX}>
        <div style={LABEL_STYLE}>Nome</div>
        <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} style={VALUE_TEXT} />
      </div>
      <div style={FIELD_BOX}>
        <div style={LABEL_STYLE}>Telefone</div>
        <input
          type="tel"
          placeholder="(11) 99999-0000"
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
          style={VALUE_TEXT}
        />
      </div>
      <div style={FIELD_BOX}>
        <div style={LABEL_STYLE}>E-mail</div>
        <input type="email" value={novoEmail} onChange={(e) => setNovoEmail(e.target.value)} style={VALUE_TEXT} />
      </div>
      <div style={FIELD_BOX}>
        <div style={LABEL_STYLE}>Chave Pix</div>
        <input
          type="text"
          placeholder="seu@email.com"
          value={chavePix}
          onChange={(e) => setChavePix(e.target.value)}
          style={VALUE_MONO}
        />
      </div>
      {erro && <div style={{ font: '400 12.5px Barlow, sans-serif', color: '#F2843D' }}>{erro}</div>}
      {aviso && <div style={{ font: '400 12.5px Barlow, sans-serif', color: '#C9F24D' }}>{aviso}</div>}
      <div
        onClick={salvando ? undefined : salvar}
        style={{
          marginTop: '2px',
          padding: '15px',
          borderRadius: '14px',
          textAlign: 'center',
          background: '#C9F24D',
          color: '#08130E',
          font: '700 15px/1 Barlow, sans-serif',
          cursor: salvando ? 'default' : 'pointer',
          opacity: salvando ? 0.7 : 1,
        }}
      >
        {salvando ? 'Salvando…' : 'Salvar dados'}
      </div>
    </div>
  )
}

export function HistoricoScreen({ historicoData, perfilData, email, onSalvarDadosPessoais, onSairDaConta }) {
  const { isAdmin, peladasNoAno, anoAtual, statB, jogos } = historicoData
  const statBLabel = isAdmin ? 'faltas no grupo' : 'suas presenças'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {perfilData && !perfilData.semGrupo && (
        <DadosPessoais perfilData={perfilData} email={email} onSalvar={onSalvarDadosPessoais} />
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <div
            style={{
              flex: 1,
              borderRadius: '18px',
              padding: '16px',
              background: '#0F2117',
              border: '1px solid rgba(234,243,236,.07)',
            }}
          >
            <div style={{ font: "800 30px/1 'Barlow Condensed', sans-serif", color: '#C9F24D' }}>{peladasNoAno}</div>
            <div style={{ font: '400 12px/1.2 Barlow, sans-serif', color: 'rgba(234,243,236,.7)', marginTop: '5px' }}>
              peladas em {anoAtual}
            </div>
          </div>
          <div
            style={{
              flex: 1,
              borderRadius: '18px',
              padding: '16px',
              background: '#0F2117',
              border: '1px solid rgba(234,243,236,.07)',
            }}
          >
            <div style={{ font: "800 30px/1 'Barlow Condensed', sans-serif", color: '#C9F24D' }}>{statB}</div>
            <div style={{ font: '400 12px/1.2 Barlow, sans-serif', color: 'rgba(234,243,236,.7)', marginTop: '5px' }}>
              {statBLabel}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '11px' }}>
          {jogos.length === 0 && (
            <div style={{ font: '400 13px/1.4 Barlow, sans-serif', color: 'rgba(234,243,236,.6)', textAlign: 'center' }}>
              Nenhuma pelada encerrada ainda.
            </div>
          )}
          {jogos.map((j) => {
            const data = new Date(j.inicio)
            return (
              <div
                key={j.id}
                style={{
                  borderRadius: '18px',
                  padding: '16px 18px',
                  background: '#0F2117',
                  border: '1px solid rgba(234,243,236,.07)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                }}
              >
                <div style={{ flex: 'none', textAlign: 'center', width: '40px' }}>
                  <div style={{ font: "800 21px/1 'Barlow Condensed', sans-serif" }}>{data.getDate()}</div>
                  <div
                    style={{
                      font: "500 9px/1 'IBM Plex Mono', monospace",
                      letterSpacing: '.1em',
                      color: 'rgba(234,243,236,.66)',
                      marginTop: '4px',
                    }}
                  >
                    {mesAbrev(data)}
                  </div>
                </div>
                <div style={{ width: '1px', alignSelf: 'stretch', background: 'rgba(234,243,236,.1)' }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ font: '600 14.5px/1.2 Barlow, sans-serif' }}>
                    {j.local}
                    {j.quadra ? ` · ${j.quadra}` : ''}
                  </div>
                  <div style={{ font: '400 11.5px/1.2 Barlow, sans-serif', color: 'rgba(234,243,236,.68)', marginTop: '3px' }}>
                    {j.confirmados} {j.confirmados === 1 ? 'jogador' : 'jogadores'}
                  </div>
                </div>
                <div style={{ flex: 'none', font: '600 12px/1 Barlow, sans-serif', color: '#C9F24D', cursor: 'pointer' }} title="Em breve">
                  Súmula
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div style={{ paddingTop: '4px', borderTop: '1px solid rgba(234,243,236,.07)' }}>
        <div
          onClick={onSairDaConta}
          style={{
            marginTop: '20px',
            padding: '15px',
            borderRadius: '14px',
            textAlign: 'center',
            border: '1px solid rgba(234,243,236,.14)',
            color: 'rgba(234,243,236,.75)',
            font: '600 15px/1 Barlow, sans-serif',
            cursor: 'pointer',
          }}
        >
          Sair da conta
        </div>
      </div>
    </div>
  )
}
