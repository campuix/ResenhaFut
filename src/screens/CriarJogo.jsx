import { useState } from 'react'

const inputStyle = {
  padding: '13px 15px',
  borderRadius: '12px',
  border: '1px solid rgba(234,243,236,.15)',
  background: '#08130E',
  color: '#EAF3EC',
  font: '400 15px Barlow, sans-serif',
  outline: 'none',
  width: '100%',
}

const labelStyle = {
  font: "500 10px/1 'IBM Plex Mono', monospace",
  letterSpacing: '.1em',
  color: 'rgba(234,243,236,.6)',
  textTransform: 'uppercase',
  marginBottom: '7px',
  display: 'block',
}

function hojeISO() {
  const d = new Date()
  return d.toISOString().slice(0, 10)
}

export function CriarJogoScreen({ onCriar }) {
  const [data, setData] = useState(hojeISO())
  const [hora, setHora] = useState('20:00')
  const [duracao, setDuracao] = useState(120)
  const [local, setLocal] = useState('')
  const [quadra, setQuadra] = useState('')
  const [vagas, setVagas] = useState(15)
  const [custoTotal, setCustoTotal] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')

  const enviar = async (e) => {
    e.preventDefault()
    if (!local.trim()) {
      setErro('Informe o local do jogo.')
      return
    }
    setErro('')
    setEnviando(true)
    try {
      const inicio = new Date(`${data}T${hora}`)
      await onCriar({
        inicio: inicio.toISOString(),
        duracao_min: Number(duracao) || 120,
        local: local.trim(),
        quadra: quadra.trim() || null,
        vagas: Number(vagas) || 15,
        custo_total: Number(custoTotal) || 0,
      })
    } catch (err) {
      setErro(err.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div
      style={{
        borderRadius: '20px',
        padding: '22px 20px',
        background: '#0F2117',
        border: '1px solid rgba(234,243,236,.07)',
      }}
    >
      <div style={{ font: "800 22px/1.1 'Barlow Condensed', sans-serif" }}>Marcar a próxima pelada</div>
      <div style={{ font: '400 13px/1.4 Barlow, sans-serif', color: 'rgba(234,243,236,.7)', marginTop: '6px' }}>
        Preenche os dados do jogo. Assim que salvar, todo mundo já pode confirmar presença.
      </div>

      <form onSubmit={enviar} style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '20px' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Data</label>
            <input type="date" required value={data} onChange={(e) => setData(e.target.value)} style={inputStyle} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Horário</label>
            <input type="time" required value={hora} onChange={(e) => setHora(e.target.value)} style={inputStyle} />
          </div>
        </div>

        <div>
          <label style={labelStyle}>Duração (minutos)</label>
          <input
            type="number"
            min="30"
            step="15"
            value={duracao}
            onChange={(e) => setDuracao(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>Local</label>
          <input
            type="text"
            required
            placeholder="Arena Boa Bola"
            value={local}
            onChange={(e) => setLocal(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>Quadra (opcional)</label>
          <input
            type="text"
            placeholder="Quadra 2 · society"
            value={quadra}
            onChange={(e) => setQuadra(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Vagas</label>
            <input
              type="number"
              min="2"
              value={vagas}
              onChange={(e) => setVagas(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Custo total (R$)</label>
            <input
              type="number"
              min="0"
              step="1"
              placeholder="420"
              value={custoTotal}
              onChange={(e) => setCustoTotal(e.target.value)}
              style={inputStyle}
            />
          </div>
        </div>

        {erro && <div style={{ font: '400 12.5px Barlow, sans-serif', color: '#F2843D' }}>{erro}</div>}

        <button
          type="submit"
          disabled={enviando}
          style={{
            padding: '15px',
            borderRadius: '14px',
            border: 'none',
            background: '#C9F24D',
            color: '#08130E',
            font: '700 16px Barlow, sans-serif',
            cursor: enviando ? 'default' : 'pointer',
            opacity: enviando ? 0.7 : 1,
          }}
        >
          {enviando ? 'Marcando…' : 'Marcar jogo'}
        </button>
      </form>
    </div>
  )
}
