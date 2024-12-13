import { getRandomPhrase } from "@/actions/phraseAction";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function Home() {
  const phrase = await getRandomPhrase([]);

  if (!phrase) {
    return <div className="text-2xl text-center py-24">No sentences found</div>;
  }

  redirect(`/${phrase.id}`);
}
