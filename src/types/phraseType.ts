export type PhraseType = {
  id: number;
  title: string;
  author: string | null;
  category: string;
  phrase_text: string;
  error: string;
  correction: string;
  likes: number;
  dislikes: number;
};
