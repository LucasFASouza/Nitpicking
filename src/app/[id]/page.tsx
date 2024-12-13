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

type Params = Promise<{ id: string }>;
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export async function generateMetadata(props: {
  params: Params;
  searchParams: SearchParams;
}) {
  const params = await props.params;
  const id = params.id;

  return {
    title: `Nitipicking #${id}`,
    description: "Find and correct the error",
  };
}

export default async function PhrasePage(props: {
  params: Params;
  searchParams: SearchParams;
}) {
  const params = await props.params;
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
