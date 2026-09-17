import { AVATAR_COLORS, iniciais, mesAnoCurto, nivelFmt } from '../lib/format'

export function GrupoScreen({ userId, grupoData, onAbrirPapel, onConvidar, onAbrirAcessos }) {
  const { papel, membros } = grupoData
  const isAdmin = papel === 'dono' || papel === 'admin'
  const admins = membros.filter((m) => m.papel === 'dono' || m.papel === 'admin').length
  const groupMeta = `${membros.length} MEMBROS · ${admins} ADMINS`
  const groupHint = isAdmin
    ? 'Toque em alguém para mudar o papel ou tirar do grupo. Faltas só aparecem para admins.'
    : 'Quem organiza aparece com a etiqueta admin. Só admins mudam papéis.'

  const linhas = membros.map((m, i) => {
    const souEu = m.usuario_id === userId
    const nome = souEu ? 'Você' : m.nome
    const isRowAdmin = m.papel === 'dono' || m.papel === 'admin'
    const sub = isAdmin
      ? `${m.faltas ?? 0} ${m.faltas === 1 ? 'falta' : 'faltas'} no ano · entrou em ${mesAnoCurto(new Date(m.entrou_em))}`
      : [m.posicao, nivelFmt(m.nivel) ? `nível ${nivelFmt(m.nivel)}` : null].filter(Boolean).join(' · ')

    return {
      key: m.usuario_id,
      usuarioId: m.usuario_id,
      nome,
      ini: souEu ? 'VC' : iniciais(m.nome),
      bg: AVATAR_COLORS[i % AVATAR_COLORS.length],
      sub,
      role: m.papel,
      pillBg: isRowAdmin ? 'rgba(201,242,77,.14)' : 'rgba(234,243,236,.07)',
      pillFg: isRowAdmin ? '#C9F24D' : 'rgba(234,243,236,.6)',
    }
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div
        style={{
          borderRadius: '20px',
          padding: '18px 20px',
          background: '#0F2117',
          border: '1px solid rgba(234,243,236,.07)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <div style={{ font: '700 15px/1 Barlow, sans-serif' }}>Membros</div>
          <div style={{ font: "500 10px/1 'IBM Plex Mono', monospace", color: 'rgba(234,243,236,.66)' }}>{groupMeta}</div>
        </div>
        <div style={{ font: '400 12.5px/1.45 Barlow, sans-serif', color: 'rgba(234,243,236,.7)', margin: '7px 0 16px' }}>
          {groupHint}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {linhas.map((m) => (
            <div
              key={m.key}
              onClick={isAdmin ? () => onAbrirPapel({ usuarioId: m.usuarioId, nome: m.nome, papelAtual: m.role }) : undefined}
              style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: isAdmin ? 'pointer' : 'default' }}
            >
              <div
                style={{
                  flex: 'none',
                  width: '34px',
                  height: '34px',
                  borderRadius: '11px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  font: "700 12px/1 'Barlow Condensed', sans-serif",
                  background: m.bg,
                  color: '#08130E',
                }}
              >
                {m.ini}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ font: '600 15px/1.2 Barlow, sans-serif' }}>{m.nome}</div>
                <div style={{ font: '400 11.5px/1.2 Barlow, sans-serif', color: 'rgba(234,243,236,.68)', marginTop: '2px' }}>
                  {m.sub}
                </div>
              </div>
              <div
                style={{
                  flex: 'none',
                  padding: '6px 11px',
                  borderRadius: '999px',
                  font: '600 11.5px/1 Barlow, sans-serif',
                  background: m.pillBg,
                  color: m.pillFg,
                }}
              >
                {m.role}
              </div>
            </div>
          ))}
        </div>
      </div>

      {isAdmin && (
        <div
          onClick={onConvidar}
          style={{
            borderRadius: '16px',
            padding: '16px',
            textAlign: 'center',
            background: '#C9F24D',
            color: '#08130E',
            font: '700 16px/1 Barlow, sans-serif',
            cursor: 'pointer',
          }}
        >
          Convidar por link
        </div>
      )}

      {isAdmin && (
        <div
          onClick={onAbrirAcessos}
          style={{
            textAlign: 'center',
            font: '600 13px/1 Barlow, sans-serif',
            color: 'rgba(234,243,236,.6)',
            cursor: 'pointer',
          }}
        >
          Ver acessos
        </div>
      )}
    </div>
  )
}
