export function waLink(texto) {
  return `https://wa.me/?text=${encodeURIComponent(texto)}`
}
