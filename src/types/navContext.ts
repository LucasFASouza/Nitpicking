// Contexto de navegação contextual: define qual subconjunto de frases o
// prev/next do detalhe deve percorrer. Curtidas/descurtidas vêm do localStorage
// e são resolvidas no cliente; categoria/busca/all são derivados no servidor.
export type NavContext =
  | { type: "all" }
  | { type: "liked" }
  | { type: "disliked" }
  | { type: "category"; value: string }
  | { type: "search"; value: string };
