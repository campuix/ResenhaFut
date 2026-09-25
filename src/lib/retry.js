// A Supabase às vezes emite um token novo (refresh) com "iat" que ainda parece no
// futuro pro relógio do banco por uma fração de segundo — erro transitório, não algo
// que o app causou. Uma segunda tentativa logo depois resolve na quase totalidade dos casos.
export function isJwtFutureError(err) {
  return typeof err?.message === 'string' && /issued at future/i.test(err.message)
}

export async function withJwtRetry(attempt) {
  try {
    return await attempt()
  } catch (err) {
    if (!isJwtFutureError(err)) throw err
    await new Promise((resolve) => setTimeout(resolve, 1000))
    return await attempt()
  }
}
