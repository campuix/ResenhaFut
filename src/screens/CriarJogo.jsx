import { useState } from 'react'

const FIELD_BOX = {
  padding: '15px 16px',
  borderRadius: '14px',
  background: '#0F2117',
  border: '1px solid rgba(234,243,236,.1)',
}
const LABEL_STYLE = {
  font: '400 10.5px/1 Barlow, sans-serif',
  color: 'rgba(234,243,236,.6)',
}
const VALUE_TEXT = {
  border: 'none',
  outline: 'none',
  background: 'transparent',
  color: '#EAF3EC',
  width: '100%',
  padding: 0,
  marginTop: '7px',
  font: '600 16px/1 Barlow, sans-serif',
}
const VALUE_NUMBER = {
  ...VALUE_TEXT,
  marginTop: '6px',
  font: "700 20px/1 'Barlow Condensed', sans-serif",
}
const VALUE_MONO = {
  ...VALUE_TEXT,
  marginTop: '8px',
  color: 'rgba(234,243,236,.85)',
  font: "500 14px/1 'IBM Plex Mono', monospace",
}
const GROUP_TITLE = {
  font: "500 10px/1 'IBM Plex Mono', monospace",
  letterSpacing: '.14em',
  color: 'rgba(234,243,236,.68)',
  textTransform: 'uppercase',
}

const RECORRENCIA_OPCOES = [
  { id: 'unica', label: 'Só esta' },
  { id: 'mensal', label: 'Todo mês' },
  { id: 'semanal', label: 'Toda semana' },
]

function Field({ label, children, flex, width }) {
  return (
    <div style={{ ...FIELD_BOX, flex: width ? 'none' : (flex ?? 1), width }}>
      <div style={LABEL_STYLE}>{label}</div>
      {children}
    </div>
  )
}

function hojeISO() {
  return new Date().toISOString().slice(0, 10)
}

export function CriarJogoScreen({ mode, jogoExistente, vagasConfirmadas, onSalvar, onFechar, onCancelarJogo }) {
  const editando = mode === 'editar'

  const inicioExistente = jogoExistente ? new Date(jogoExistente.inicio) : null
  const [data, setData] = useState(
    inicioExistente ? inicioExistente.toISOString().slice(0, 10) : hojeISO()
  )
  const [hora, setHora] = useState(
    inicioExistente
      ? `${String(inicioExistente.getHours()).padStart(2, '0')}:${String(inicioExistente.getMinutes()).padStart(2, '0')}`
      : '20:00'
  )
  const [recorrencia, setRecorrencia] = useState(jogoExistente?.recorrencia ?? 'mensal')
  const [local, setLocal] = useState(jogoExistente?.local ?? '')
  const [quadra, setQuadra] = useState(jogoExistente?.quadra ?? '')
  const [tipo, setTipo] = useState(jogoExistente?.tipo ?? '')
  const [vagas, setVagas] = useState(jogoExistente?.vagas ?? 15)
  const [custoTotal, setCustoTotal] = useState(jogoExistente?.custo_total ?? '')
  const [chavePix, setChavePix] = useState(jogoExistente?.chave_pix ?? '')
  const [recado, setRecado] = useState(jogoExistente?.recado ?? '')

  const [avisoVagas, setAvisoVagas] = useState(false)
  const [confirmandoCancelarJogo, setConfirmandoCancelarJogo] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')

  const inicioDate = data && hora ? new Date(`${data}T${hora}`) : null
  const valido =
    inicioDate &&
    inicioDate.getTime() > Date.now() &&
    local.trim().length > 0 &&
    Number(vagas) >= 2 &&
    Number(custoTotal || 0) >= 0

  const porCabecaPrevisto = Math.round(Number(custoTotal || 0) / Math.max(1, Number(vagas) || 1))

  const montarPayload = () => ({
    inicio: inicioDate.toISOString(),
    duracao_min: jogoExistente?.duracao_min ?? 120,
    recorrencia,
    local: local.trim(),
    quadra: quadra.trim() || null,
    tipo: tipo.trim() || null,
    vagas: Number(vagas),
    custo_total: Number(custoTotal || 0),
    chave_pix: chavePix.trim() || null,
    recado: recado.trim() || null,
  })

  const salvar = async (avisarGrupo) => {
    if (!valido || enviando) return
    if (editando && vagasConfirmadas != null && Number(vagas) < vagasConfirmadas && !avisoVagas) {
      setAvisoVagas(true)
      return
    }
    setEnviando(true)
    setErro('')
    try {
      await onSalvar(montarPayload(), { avisarGrupo })
    } catch (err) {
      setErro(err.message)
    } finally {
      setEnviando(false)
    }
  }

  const cancelarJogo = async () => {
    try {
      await onCancelarJogo()
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
      <div
        style={{
          flex: 'none',
          padding: '62px 20px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div onClick={onFechar} style={{ font: '600 15px/1 Barlow, sans-serif', color: 'rgba(234,243,236,.72)', cursor: 'pointer' }}>
          Cancelar
        </div>
        <div style={{ font: "800 22px/1 'Barlow Condensed', sans-serif", letterSpacing: '-.01em' }}>
          {editando ? 'Editar jogo' : 'Novo jogo'}
        </div>
        <div
          onClick={() => salvar(false)}
          style={{
            font: '600 15px/1 Barlow, sans-serif',
            color: valido ? '#C9F24D' : 'rgba(234,243,236,.3)',
            cursor: valido ? 'pointer' : 'default',
          }}
        >
          Salvar
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '0 20px 30px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '11px' }}>
          <div style={GROUP_TITLE}>Quando</div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Field label="Data">
              <input type="date" value={data} onChange={(e) => setData(e.target.value)} style={VALUE_TEXT} />
            </Field>
            <Field label="Início" width="118px">
              <input type="time" value={hora} onChange={(e) => setHora(e.target.value)} style={VALUE_TEXT} />
            </Field>
          </div>
          <div style={{ display: 'flex', gap: '6px', padding: '5px', borderRadius: '14px', background: '#0F2117', border: '1px solid rgba(234,243,236,.07)' }}>
            {RECORRENCIA_OPCOES.map((op) => (
              <div
                key={op.id}
                onClick={() => setRecorrencia(op.id)}
                style={{
                  flex: 1,
                  textAlign: 'center',
                  padding: '11px 0',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  font: '600 13.5px/1 Barlow, sans-serif',
                  background: recorrencia === op.id ? 'rgba(201,242,77,.15)' : 'transparent',
                  color: recorrencia === op.id ? '#C9F24D' : 'rgba(234,243,236,.6)',
                }}
              >
                {op.label}
              </div>
            ))}
          </div>
          <div style={{ font: '400 12px/1.45 Barlow, sans-serif', color: 'rgba(234,243,236,.6)' }}>
            Mensal cria o jogo na mesma semana e dia do mês seguinte, depois de encerrado este. Semanal cria 7 dias
            depois.
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '11px' }}>
          <div style={GROUP_TITLE}>Onde</div>
          <Field label="Local">
            <input
              type="text"
              placeholder="Arena Boa Bola"
              value={local}
              onChange={(e) => setLocal(e.target.value)}
              style={VALUE_TEXT}
            />
          </Field>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Field label="Quadra">
              <input
                type="text"
                placeholder="Quadra 2"
                value={quadra}
                onChange={(e) => setQuadra(e.target.value)}
                style={VALUE_TEXT}
              />
            </Field>
            <Field label="Tipo">
              <input
                type="text"
                placeholder="Society"
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                style={VALUE_TEXT}
              />
            </Field>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '11px' }}>
          <div style={GROUP_TITLE}>Vagas e dinheiro</div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Field label="Vagas">
              <input
                type="number"
                min="2"
                value={vagas}
                onChange={(e) => setVagas(e.target.value)}
                style={VALUE_NUMBER}
              />
            </Field>
            <Field label="Custo da quadra">
              <input
                type="number"
                min="0"
                step="1"
                placeholder="420"
                value={custoTotal}
                onChange={(e) => setCustoTotal(e.target.value)}
                style={VALUE_NUMBER}
              />
            </Field>
          </div>
          <div
            style={{
              padding: '16px 18px',
              borderRadius: '14px',
              background: 'rgba(242,193,77,.07)',
              border: '1px solid rgba(242,193,77,.22)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ font: '400 13px/1.35 Barlow, sans-serif', color: 'rgba(234,243,236,.75)', maxWidth: '190px' }}>
              Com as {Number(vagas) || 0} vagas cheias, cada um paga
            </div>
            <div style={{ font: "800 26px/1 'Barlow Condensed', sans-serif", color: '#F2C14D' }}>R$ {porCabecaPrevisto}</div>
          </div>
          <Field label="Chave Pix para receber">
            <input
              type="text"
              placeholder="seu@email.com"
              value={chavePix}
              onChange={(e) => setChavePix(e.target.value)}
              style={VALUE_MONO}
            />
          </Field>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '11px' }}>
          <div style={GROUP_TITLE}>Recado (opcional)</div>
          <div style={{ ...FIELD_BOX, minHeight: '66px' }}>
            <textarea
              placeholder="Leve colete claro e escuro. Portão fecha 20h15."
              value={recado}
              onChange={(e) => setRecado(e.target.value)}
              rows={2}
              style={{
                border: 'none',
                outline: 'none',
                background: 'transparent',
                resize: 'none',
                color: '#EAF3EC',
                width: '100%',
                padding: 0,
                font: '400 14.5px/1.45 Barlow, sans-serif',
              }}
            />
          </div>
        </div>

        {avisoVagas && (
          <div
            style={{
              padding: '14px 16px',
              borderRadius: '14px',
              background: 'rgba(242,132,61,.1)',
              border: '1px solid rgba(242,132,61,.3)',
              font: '400 13px/1.4 Barlow, sans-serif',
              color: 'rgba(234,243,236,.85)',
            }}
          >
            Reduzir para {vagas} vagas deixa gente de fora — hoje há {vagasConfirmadas} confirmados. Toque em
            "Salvar" de novo para confirmar assim mesmo.
          </div>
        )}

        {erro && <div style={{ font: '400 12.5px Barlow, sans-serif', color: '#F2843D' }}>{erro}</div>}

        {editando && (
          <div style={{ marginTop: '-6px' }}>
            {confirmandoCancelarJogo ? (
              <div style={{ display: 'flex', gap: '8px' }}>
                <div
                  onClick={cancelarJogo}
                  style={{
                    flex: 1,
                    padding: '15px',
                    borderRadius: '14px',
                    textAlign: 'center',
                    background: '#F2843D',
                    color: '#1A0E06',
                    font: '700 14px/1 Barlow, sans-serif',
                    cursor: 'pointer',
                  }}
                >
                  Confirmar cancelamento
                </div>
                <div
                  onClick={() => setConfirmandoCancelarJogo(false)}
                  style={{
                    flex: 1,
                    padding: '15px',
                    borderRadius: '14px',
                    textAlign: 'center',
                    border: '1px solid rgba(234,243,236,.14)',
                    color: 'rgba(234,243,236,.75)',
                    font: '600 14px/1 Barlow, sans-serif',
                    cursor: 'pointer',
                  }}
                >
                  Voltar
                </div>
              </div>
            ) : (
              <div
                onClick={() => setConfirmandoCancelarJogo(true)}
                style={{
                  padding: '15px',
                  borderRadius: '14px',
                  textAlign: 'center',
                  border: '1px solid rgba(242,132,61,.35)',
                  color: '#F2843D',
                  font: '600 14px/1 Barlow, sans-serif',
                  cursor: 'pointer',
                }}
              >
                Cancelar este jogo
              </div>
            )}
          </div>
        )}
      </div>

      {!editando && (
        <div
          style={{
            flex: 'none',
            padding: '14px 20px 34px',
            background: '#08130E',
            borderTop: '1px solid rgba(234,243,236,.07)',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          <div
            onClick={() => salvar(true)}
            style={{
              padding: '17px',
              borderRadius: '16px',
              textAlign: 'center',
              background: '#C9F24D',
              color: '#08130E',
              font: '700 17px/1 Barlow, sans-serif',
              cursor: valido && !enviando ? 'pointer' : 'default',
              opacity: valido ? 1 : 0.5,
            }}
          >
            {enviando ? 'Publicando…' : 'Publicar e chamar o grupo'}
          </div>
          <div
            onClick={() => salvar(false)}
            style={{
              textAlign: 'center',
              font: '600 13px/1 Barlow, sans-serif',
              color: 'rgba(234,243,236,.6)',
              cursor: valido && !enviando ? 'pointer' : 'default',
            }}
          >
            Salvar sem avisar ninguém
          </div>
        </div>
      )}
    </div>
  )
}
