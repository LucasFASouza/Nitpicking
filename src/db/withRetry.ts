// O driver HTTP do Neon pode falhar de forma transitória por timeout de conexão
// (ex.: rotas IPv6 instáveis no ambiente local -> "fetch failed" / ETIMEDOUT).
// Este helper repete a operação algumas vezes com um pequeno backoff antes de
// desistir, deixando as leituras/escritas resilientes a essas falhas passageiras.
export async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delayMs = 300
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt < retries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delayMs * (attempt + 1)));
      }
    }
  }

  throw lastError;
}
