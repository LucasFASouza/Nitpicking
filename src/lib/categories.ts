// Lista fixa de categorias, compartilhada entre o formulário de contribuição
// e os controles de filtro da listagem.
export const categories = [
  "Anime & Manga",
  "Cartoons & TV",
  "Comics & Superheroes",
  "Fantasy",
  "Games",
  "Sci-Fi",
  "History & Mythology",
  "Science & Technology",
] as const;

export type Category = (typeof categories)[number];
