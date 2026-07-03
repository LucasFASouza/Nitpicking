// Sintaxe da barra de busca: um token `author:"..."` filtra por autor exato
// (aspas porque os autores têm espaços e "&"); o texto restante casa em
// phrase_text/title. Compartilhado entre a server action de busca e os
// componentes client (link do autor, rótulos) para manter tudo em sincronia.

export interface ParsedQuery {
  author: string | null;
  text: string;
}

// Captura `author:"nome com espaços"` / `author=Nome` (`:` ou `=`, com ou sem aspas).
const AUTHOR_TOKEN = /author[:=](?:"([^"]*)"|(\S+))/i;

export function parseSearchQuery(query: string): ParsedQuery {
  const match = query.match(AUTHOR_TOKEN);
  if (!match) return { author: null, text: query.trim() };

  const author = (match[1] ?? match[2] ?? "").trim();
  const text = (
    query.slice(0, match.index) + query.slice(match.index! + match[0].length)
  ).trim();

  return { author: author.length > 0 ? author : null, text };
}

// Remove o prefixo "By " para rótulos e busca (ex.: "By Rachel Tan" → "Rachel Tan").
export function stripByPrefix(author: string): string {
  return author.replace(/^by\s+/i, "").trim();
}

// Monta o token de busca por autor para links: sem o "By " e com aspas (autores
// têm espaços e "&"). O nome sem "By " vira um LIKE, então clicar num co-autor
// ("A & B") também traz as frases em que a pessoa aparece sozinha ou com outros.
export function authorQuery(author: string): string {
  return `author:"${stripByPrefix(author)}"`;
}
