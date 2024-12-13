import {
  getPhraseById,
  likePhrase,
  dislikePhrase,
  removeLike,
  removeDislike,
  getRandomPhrase,
} from "@/actions/phraseAction";
import Phrase from "@/components/phrase";
import { notFound } from "next/navigation";

interface Props {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: Props) {
  const phrase = await getPhraseById(Number(params.id));

  return {
    title: phrase
      ? `Nitipicking #${phrase.id} - ${phrase.category}`
      : "Nitipicking - Sentence Not Found",
    description: phrase?.phrase_text || "Sentence Not Found",
  };
}

export default async function PhrasePage({ params }: Props) {
  const id = Number(params.id);

  if (isNaN(id)) {
    notFound();
  }

  const phrase = await getPhraseById(id);
  if (!phrase) {
    notFound();
  }

  return (
    <main>
      <Phrase
        phrase={phrase}
        likePhrase={likePhrase}
        dislikePhrase={dislikePhrase}
        getRandomPhrase={getRandomPhrase}
        removeLike={removeLike}
        removeDislike={removeDislike}
      />
    </main>
  );
}
