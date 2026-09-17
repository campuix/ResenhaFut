import { useState } from 'react'
import { FIELD_BOX, GROUP_TITLE, LABEL_STYLE, VALUE_MONO, VALUE_TEXT } from '../lib/fieldStyles'
import { iniciais, mesAnoCurto, nivelFmt } from '../lib/format'

const POSICOES = [
  { id: 'Goleiro', label: 'Goleiro' },
  { id: 'Zaga', label: 'Zaga' },
  { id: 'Meia', label: 'Meia' },
  { id: 'Ataque', label: 'Ataque' },
]

export function PerfilScreen({
  perfilData,
  modo = 'proprio',
  onSalvar,
  onSairDoGrupo,
  onSairDaConta,
  onDefinirNivel,
  onTornarAdmin,
  onRemoverMembro,
  onFechar,
}) {
  const vistoPorAdmin = modo === 'admin'
  const isAdmin = perfilData.papel === 'dono' || perfilData.papel === 'admin'
  const [nome, setNome] = useState(perfilData.nome ?? '')
  const [telefone, setTelefone] = useState(perfilData.telefone ?? '')
  const [chavePix, setChavePix] = useState(perfilData.chavePix ?? '')
  const [posicao, setPosicao] = useState(perfilData.posicao ?? '')
  const [nivelInput, setNivelInput] = useState(String(perfilData.nivel ?? '3.0'))
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  const [confirmandoSair, setConfirmandoSair] = useState(false)
  const [confirmandoRemocao, setConfirmandoRemocao] = useState(false)

  const salvar = async () => {
    setSalvando(true)
    setErro('')
    try {
      if (vistoPorAdmin) {
        await onDefinirNivel(Number(nivelInput))
      } else {
        await onSalvar({
          nome: nome.trim(),
          telefone: telefone.trim() || null,
          chavePix: chavePix.trim() || null,
          posicao: posicao || null,
        })
      }
      onFechar()
    } catch (err) {
      setErro(err.message)
    } finally {
      setSalvando(false)
    }
  }

  const sairDoGrupo = async () => {
    try {
      await onSairDoGrupo()
      onFechar()
    } catch (err) {
      setErro(err.message)
    }
  }

  const tornarAdmin = async () => {
    setErro('')
    try {
      await onTornarAdmin()
      onFechar()
    } catch (err) {
      setErro(err.message)
    }
  }

  const removerMembro = async () => {
    setErro('')
    try {
      await onRemoverMembro()
      onFechar()
    } catch (err) {
      setErro(err.message)
    }
  }

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 90,
        background: '#08130E',
        color: '#EAF3EC',
        fontFamily: 'Barlow, sans-serif',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ flex: 'none', padding: '62px 20px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div onClick={onFechar} style={{ font: '600 15px/1 Barlow, sans-serif', color: 'rgba(234,243,236,.72)', cursor: 'pointer' }}>
          Voltar
        </div>
        <div style={{ font: "800 22px/1 'Barlow Condensed', sans-serif" }}>
          {vistoPorAdmin ? `Perfil de ${perfilData.nome}` : 'Meu perfil'}
        </div>
        <div onClick={salvando ? undefined : salvar} style={{ font: '600 15px/1 Barlow, sans-serif', color: '#C9F24D', cursor: salvando ? 'default' : 'pointer' }}>
          {salvando ? 'Salvando…' : 'Salvar'}
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '0 20px 34px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              flex: 'none',
              width: '76px',
              height: '76px',
              borderRadius: '24px',
              background: '#C9F24D',
              color: '#08130E',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              font: "700 28px/1 'Barlow Condensed', sans-serif",
              letterSpacing: '.03em',
            }}
          >
            {iniciais(perfilData.nome ?? 'Jogador')}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ font: "800 26px/1.05 'Barlow Condensed', sans-serif", letterSpacing: '-.01em' }}>{perfilData.nome}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '9px' }}>
              <div
                style={{
                  padding: '5px 10px',
                  borderRadius: '999px',
                  background: isAdmin ? 'rgba(201,242,77,.16)' : 'rgba(234,243,236,.1)',
                  color: isAdmin ? '#C9F24D' : 'rgba(234,243,236,.75)',
                  font: "500 10px/1 'IBM Plex Mono', monospace",
                  letterSpacing: '.08em',
                }}
              >
                {perfilData.papel === 'dono' ? 'DONO' : perfilData.papel === 'admin' ? 'ADMIN' : 'JOGADOR'}
              </div>
              <div style={{ font: '400 12px/1 Barlow, sans-serif', color: 'rgba(234,243,236,.6)' }}>
                desde {mesAnoCurto(new Date(perfilData.entrouEm))}
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{ flex: 1, padding: '15px 16px', borderRadius: '16px', background: '#0F2117', border: '1px solid rgba(234,243,236,.07)' }}>
            <div style={{ font: "800 26px/1 'Barlow Condensed', sans-serif", color: '#C9F24D' }}>{perfilData.presencasCount}</div>
            <div style={{ font: '400 11.5px/1.25 Barlow, sans-serif', color: 'rgba(234,243,236,.7)', marginTop: '6px' }}>
              presenças em {perfilData.totalEncerrados}
            </div>
          </div>
          <div style={{ flex: 1, padding: '15px 16px', borderRadius: '16px', background: '#0F2117', border: '1px solid rgba(234,243,236,.07)' }}>
            <div style={{ font: "800 26px/1 'Barlow Condensed', sans-serif" }}>{perfilData.faltas ?? 0}</div>
            <div style={{ font: '400 11.5px/1.25 Barlow, sans-serif', color: 'rgba(234,243,236,.7)', marginTop: '6px' }}>
              {perfilData.faltas === 1 ? 'falta no ano' : 'faltas no ano'}
            </div>
          </div>
          <div style={{ flex: 1, padding: '15px 16px', borderRadius: '16px', background: '#0F2117', border: '1px solid rgba(234,243,236,.07)' }}>
            <div style={{ font: "800 26px/1 'Barlow Condensed', sans-serif", color: perfilData.emDia ? '#C9F24D' : '#F2C14D' }}>
              {perfilData.emDia ? 'em dia' : 'devendo'}
            </div>
            <div style={{ font: '400 11.5px/1.25 Barlow, sans-serif', color: 'rgba(234,243,236,.7)', marginTop: '6px' }}>pagamentos</div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '11px' }}>
          <div style={GROUP_TITLE}>{vistoPorAdmin ? 'Dados' : 'Meus dados'}</div>
          {vistoPorAdmin ? (
            <>
              <div style={FIELD_BOX}>
                <div style={LABEL_STYLE}>Nome</div>
                <div style={{ ...VALUE_TEXT, color: 'rgba(234,243,236,.85)' }}>{perfilData.nome}</div>
              </div>
              <div style={FIELD_BOX}>
                <div style={LABEL_STYLE}>Telefone</div>
                <div style={{ ...VALUE_TEXT, color: 'rgba(234,243,236,.85)' }}>{perfilData.telefone || '—'}</div>
              </div>
              <div style={FIELD_BOX}>
                <div style={LABEL_STYLE}>Chave Pix</div>
                <div style={VALUE_MONO}>{perfilData.chavePix || '—'}</div>
              </div>
              <div style={FIELD_BOX}>
                <div style={LABEL_STYLE}>Posição</div>
                <div style={{ ...VALUE_TEXT, color: 'rgba(234,243,236,.85)' }}>{perfilData.posicao || '—'}</div>
              </div>
            </>
          ) : (
            <>
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
                <div style={LABEL_STYLE}>Minha chave Pix</div>
                <input
                  type="text"
                  placeholder="seu@email.com"
                  value={chavePix}
                  onChange={(e) => setChavePix(e.target.value)}
                  style={VALUE_MONO}
                />
              </div>
              <div style={{ display: 'flex', gap: '6px', padding: '5px', borderRadius: '14px', background: '#0F2117', border: '1px solid rgba(234,243,236,.07)' }}>
                {POSICOES.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => setPosicao(p.id)}
                    style={{
                      flex: 1,
                      textAlign: 'center',
                      padding: '11px 0',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      font: '600 13px/1 Barlow, sans-serif',
                      background: posicao === p.id ? 'rgba(201,242,77,.15)' : 'transparent',
                      color: posicao === p.id ? '#C9F24D' : 'rgba(234,243,236,.6)',
                    }}
                  >
                    {p.label}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {vistoPorAdmin ? (
          <div style={FIELD_BOX}>
            <div style={LABEL_STYLE}>Nível no sorteio (1,0 a 5,0)</div>
            <input
              type="number"
              min="1"
              max="5"
              step="0.1"
              value={nivelInput}
              onChange={(e) => setNivelInput(e.target.value)}
              style={{ ...VALUE_TEXT, font: "700 20px/1 'Barlow Condensed', sans-serif", marginTop: '6px' }}
            />
          </div>
        ) : (
          <div style={{ padding: '16px 18px', borderRadius: '14px', background: 'rgba(234,243,236,.04)', border: '1px dashed rgba(234,243,236,.16)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ font: '600 14.5px/1.2 Barlow, sans-serif', color: 'rgba(234,243,236,.8)' }}>Meu nível no sorteio</div>
              <div style={{ font: "700 20px/1 'Barlow Condensed', sans-serif", color: 'rgba(234,243,236,.8)' }}>
                {nivelFmt(perfilData.nivel) ?? '—'}
              </div>
            </div>
            <div style={{ font: '400 12px/1.45 Barlow, sans-serif', color: 'rgba(234,243,236,.62)', marginTop: '8px' }}>
              Quem define é o admin. Serve só para equilibrar os times e ninguém edita o próprio.
            </div>
          </div>
        )}

        {erro && <div style={{ font: '400 12.5px Barlow, sans-serif', color: '#F2843D' }}>{erro}</div>}

        {vistoPorAdmin ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '4px' }}>
            {perfilData.papel === 'jogador' && (
              <div
                onClick={tornarAdmin}
                style={{
                  padding: '15px',
                  borderRadius: '14px',
                  textAlign: 'center',
                  background: '#C9F24D',
                  color: '#08130E',
                  font: '700 15px/1 Barlow, sans-serif',
                  cursor: 'pointer',
                }}
              >
                Tornar admin
              </div>
            )}
            {perfilData.papel !== 'dono' &&
              (confirmandoRemocao ? (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <div
                    onClick={removerMembro}
                    style={{ flex: 1, padding: '15px', borderRadius: '14px', textAlign: 'center', background: '#F2843D', color: '#1A0E06', font: '700 14px/1 Barlow, sans-serif', cursor: 'pointer' }}
                  >
                    Confirmar remoção
                  </div>
                  <div
                    onClick={() => setConfirmandoRemocao(false)}
                    style={{ flex: 1, padding: '15px', borderRadius: '14px', textAlign: 'center', border: '1px solid rgba(234,243,236,.14)', color: 'rgba(234,243,236,.75)', font: '600 14px/1 Barlow, sans-serif', cursor: 'pointer' }}
                  >
                    Cancelar
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => setConfirmandoRemocao(true)}
                  style={{
                    padding: '15px',
                    borderRadius: '14px',
                    textAlign: 'center',
                    border: '1px solid rgba(242,132,61,.35)',
                    color: '#F2843D',
                    font: '600 15px/1 Barlow, sans-serif',
                    cursor: 'pointer',
                  }}
                >
                  Remover do grupo
                </div>
              ))}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '4px' }}>
            <div
              onClick={onSairDaConta}
              style={{
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
            {confirmandoSair ? (
              <div style={{ display: 'flex', gap: '8px' }}>
                <div
                  onClick={sairDoGrupo}
                  style={{ flex: 1, padding: '15px', borderRadius: '14px', textAlign: 'center', background: '#F2843D', color: '#1A0E06', font: '700 14px/1 Barlow, sans-serif', cursor: 'pointer' }}
                >
                  Confirmar saída
                </div>
                <div
                  onClick={() => setConfirmandoSair(false)}
                  style={{ flex: 1, padding: '15px', borderRadius: '14px', textAlign: 'center', border: '1px solid rgba(234,243,236,.14)', color: 'rgba(234,243,236,.75)', font: '600 14px/1 Barlow, sans-serif', cursor: 'pointer' }}
                >
                  Cancelar
                </div>
              </div>
            ) : (
              <div
                onClick={() => setConfirmandoSair(true)}
                style={{
                  padding: '15px',
                  borderRadius: '14px',
                  textAlign: 'center',
                  border: '1px solid rgba(242,132,61,.35)',
                  color: '#F2843D',
                  font: '600 15px/1 Barlow, sans-serif',
                  cursor: 'pointer',
                }}
              >
                Sair do grupo
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
