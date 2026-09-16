export const VESTS = [
  { nome: 'Colete limão', bg: '#C9F24D', fg: '#08130E' },
  { nome: 'Sem colete', bg: '#F2843D', fg: '#1A0E06' },
  { nome: 'Colete preto', bg: '#1C2A22', fg: '#EAF3EC' },
]

export const N_TIMES = 3

export function serpentina(lista, n) {
  const buckets = Array.from({ length: n }, () => [])
  lista.forEach((p, i) => {
    const round = Math.floor(i / n)
    const slot = round % 2 ? n - 1 - (i % n) : i % n
    buckets[slot].push(p)
  })
  return buckets
}

export function embaralhar(lista) {
  const arr = lista.slice()
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}
