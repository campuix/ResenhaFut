export const AVATAR_COLORS = ['#C9F24D', '#8FD46A', '#6FC79B', '#5FBFC4', '#A9DE5C', '#7BCF83']

const MESES = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ']

export function iniciais(nome) {
  return nome
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('')
}

export function nivelFmt(n) {
  if (n === null || n === undefined) return null
  return Number(n).toFixed(1).replace('.', ',')
}

export function mesAbrev(date) {
  return MESES[date.getMonth()]
}

export function diaSemanaMaiusculo(date) {
  return new Intl.DateTimeFormat('pt-BR', { weekday: 'long' }).format(date).toUpperCase()
}

export function faixaHorario(inicio, duracaoMin) {
  const fim = new Date(inicio.getTime() + duracaoMin * 60000)
  const fmt = (d) => `${String(d.getHours()).padStart(2, '0')}h${String(d.getMinutes()).padStart(2, '0')}`
  return `${fmt(inicio)} — ${fmt(fim)}`
}

export function mesAnoCurto(date) {
  const mes = MESES[date.getMonth()].toLowerCase()
  const ano = String(date.getFullYear()).slice(-2)
  return `${mes}/${ano}`
}
