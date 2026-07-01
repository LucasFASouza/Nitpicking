"use client";

import { FC, useTransition } from "react";
import { useQueryStates } from "nuqs";
import PhraseCard from "@/components/phrase-card";
import Pagination from "@/components/pagination";
import BrowseControls from "@/components/browse-controls";
import { browseParsers } from "@/lib/searchParams";
import { PhraseType } from "@/types/phraseType";

interface Props {
  phrases: PhraseType[];
  currentPage: number;
  pageCount: number;
  total: number;
}

// Card vazio pulsante com o mesmo estilo do PhraseCard, exibido durante o loading.
const SkeletonCard = () => (
  <div
    aria-hidden
    className="button-shadowed border-black border-2 p-4 flex flex-col gap-3 h-full animate-pulse"
  >
    <div className="space-y-2">
      <div className="h-5 w-2/3 bg-neutral-200" />
      <div className="h-3 w-1/3 bg-neutral-200" />
    </div>
    <div className="space-y-2 flex-1">
      <div className="h-3 w-full bg-neutral-200" />
      <div className="h-3 w-full bg-neutral-200" />
      <div className="h-3 w-5/6 bg-neutral-200" />
    </div>
    <div className="h-3 w-1/4 bg-neutral-200" />
  </div>
);

const BrowseView: FC<Props> = ({ phrases, currentPage, pageCount, total }) => {
  // Um único useTransition cobre todas as navegações (página, categoria, sort),
  // então o skeleton aparece em qualquer mudança.
  const [isPending, startTransition] = useTransition();
  const [{ category, sort, q }, setParams] = useQueryStates(browseParsers, {
    shallow: false,
    scroll: true,
    startTransition,
  });

  // Trocar de filtro/ordem sempre reinicia para a página 1.
  const goPage = (page: number) => setParams({ page: page <= 1 ? null : page });
  const changeCategory = (value: string | null) =>
    setParams({ category: value, page: null });
  const changeSort = (value: typeof sort) =>
    setParams({ sort: value, page: null });
  // Busca: o debounce vive no SearchInput; aqui só não rolamos pro topo.
  const changeSearch = (value: string) =>
    setParams({ q: value || null, page: null }, { scroll: false });

  // Contagem de resultados do filtro/busca atual (conjunto inteiro, não só a página),
  // combinando busca E categoria quando ambos estão ativos.
  const countLabel =
    q || category
      ? `${total} ${total === 1 ? "result" : "results"}` +
        (q ? ` for “${q}”` : "") +
        (category ? ` in ${category}` : "")
      : `${total} ${total === 1 ? "sentence" : "sentences"}`;

  // href do card carregando o contexto atual, para a navegação contextual em /[id].
  const cardHref = (id: number) => {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (sort !== "id") params.set("sort", sort);
    if (q) params.set("q", q);
    if (currentPage > 1) params.set("page", String(currentPage));
    const qs = params.toString();
    return qs ? `/${id}?${qs}` : `/${id}`;
  };

  return (
    <>
      <BrowseControls
        search={q}
        category={category}
        sort={sort}
        disabled={isPending}
        onSearchChange={changeSearch}
        onCategoryChange={changeCategory}
        onSortChange={changeSort}
      />

      {!isPending && phrases.length === 0 ? (
        <p className="text-center py-24 text-xl">
          No sentences found for this filter.
        </p>
      ) : (
        <>
          {!isPending && (
            <p className="text-sm text-neutral-600 mb-3">{countLabel}</p>
          )}

          <div
            aria-busy={isPending}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {isPending
              ? Array.from({ length: phrases.length || 8 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))
              : phrases.map((phrase) => (
                  <PhraseCard
                    key={phrase.id}
                    phrase={phrase}
                    href={cardHref(phrase.id)}
                    highlight={q}
                  />
                ))}
          </div>

          <Pagination
            currentPage={currentPage}
            pageCount={pageCount}
            onGo={goPage}
            disabled={isPending}
          />
        </>
      )}
    </>
  );
};

export default BrowseView;
