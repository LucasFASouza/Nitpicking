import { getRandomPhrase } from "@/actions/phraseAction";

export const dynamic = "force-dynamic";

export default async function Home() {
  const phrase = await getRandomPhrase([]);

  const redirectPage = (id: number) => {
    window.location.href = `/${id}`;
  };

  if (!phrase) {
    return <div>No phrases found</div>;
  }

  redirectPage(phrase.id);
}
