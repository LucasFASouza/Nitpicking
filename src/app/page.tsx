import {
  getRandomPhrase,
  likePhrase,
  dislikePhrase,
} from "@/actions/phraseAction";
import Phrase from "@/components/phrase";

export default async function Home() {
  const data = await getRandomPhrase();

  return (
    <Phrase
      phrase={data}
      likePhrase={likePhrase}
      dislikePhrase={dislikePhrase}
    />
  );
}
