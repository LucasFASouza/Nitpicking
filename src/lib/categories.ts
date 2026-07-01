// Lista fixa de categorias, compartilhada entre o formulário de contribuição
// e os controles de filtro da listagem.
export const categories = [
  "Games",
  "Anime & Manga",
  "Comics & Superheroes",
  "Cartoons & TV",
  "Fantasy",
  "Sci-Fi",
  "Science & Nature",
  "Music & Real World",
] as const;

export type Category = (typeof categories)[number];
