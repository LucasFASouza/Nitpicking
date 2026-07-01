import {
  createSearchParamsCache,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server";

// Quantos cards por página na listagem (múltiplo de 1/2/3 colunas).
export const PAGE_SIZE = 24;

// Opções de ordenação da listagem.
export const SORT_OPTIONS = ["id", "likes", "dislikes"] as const;
export type SortOption = (typeof SORT_OPTIONS)[number];

// Parsers compartilhados entre o server component (home) e os controles client.
// `category` nulo = todas as categorias; `sort` padrão = id (ascendente).
export const browseParsers = {
  page: parseAsInteger.withDefault(1),
  category: parseAsString,
  sort: parseAsStringEnum([...SORT_OPTIONS]).withDefault("id"),
  q: parseAsString.withDefault(""),
};

export const browseParamsCache = createSearchParamsCache(browseParsers);
