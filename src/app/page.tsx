import type { SearchParams } from "nuqs/server";
import {
  getData,
  getPhrasesByCategory,
  searchPhrases,
} from "@/actions/phraseAction";
import BrowseView from "@/components/browse-view";
import { browseParamsCache, PAGE_SIZE } from "@/lib/searchParams";

export const dynamic = "force-dynamic";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { page, category, sort, q } = await browseParamsCache.parse(
    searchParams
  );

  const phrases = q
    ? await searchPhrases(q, sort, category)
    : category
    ? await getPhrasesByCategory(category, sort)
    : await getData(sort);

  const pageCount = Math.max(1, Math.ceil(phrases.length / PAGE_SIZE));
  const currentPage = Math.min(Math.max(1, page), pageCount);
  const start = (currentPage - 1) * PAGE_SIZE;
  const pagePhrases = phrases.slice(start, start + PAGE_SIZE);

  return (
    <main>
      <BrowseView
        phrases={pagePhrases}
        currentPage={currentPage}
        pageCount={pageCount}
      />
    </main>
  );
}
