import type { Metadata } from "next";
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

async function resolveParams(params: { id: string }) {
  return Promise.resolve(params);
}

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const resolvedParams = await resolveParams(params);
  const phrase = await getPhraseById(Number(resolvedParams.id));

  return {
    title: phrase
      ? `Nitipicking #${phrase.id} - ${phrase.category}`
      : "Nitipicking - Sentence Not Found",
    description: phrase?.phrase_text || "Sentence Not Found",
  };
}

export default async function PhrasePage({
  params,
}: {
  params: { id: string };
}) {
  const resolvedParams = await resolveParams(params);
  const id = Number(resolvedParams.id);

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
