import { getRandomPhrase } from "@/actions/phraseAction";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function Home() {
  const phrase = await getRandomPhrase([]);

  if (!phrase) {
    return <div>No phrases found</div>;
  }

  redirect(`/${phrase.id}`);
}
