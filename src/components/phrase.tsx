"use client";
import { FC, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Button from "@/components/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ContextBanner from "@/components/context-banner";
import CorrectionModal from "@/components/correction-modal";
import { getContextIds } from "@/actions/phraseAction";
import { PhraseType } from "@/types/phraseType";
import { SortOption } from "@/lib/searchParams";
import {
  authorQuery,
  parseSearchQuery,
  stripByPrefix,
} from "@/lib/searchQuery";
import {
  faArrowLeft,
  faArrowRight,
  faShuffle,
  faThumbsDown as faThumbsDownSolid,
  faThumbsUp as faThumbsUpSolid,
} from "@fortawesome/free-solid-svg-icons";
import {
  faThumbsDown,
  faThumbsUp,
  faEye,
  faEyeSlash,
} from "@fortawesome/free-regular-svg-icons";

interface Props {
  phrase: PhraseType;
  likePhrase: (id: number) => Promise<void>;
  dislikePhrase: (id: number) => Promise<void>;
  removeLike: (id: number) => Promise<void>;
  removeDislike: (id: number) => Promise<void>;
  getRandomPhrase: (except: string[]) => Promise<PhraseType | null>;
}

interface EventParams {
  action: string;
  category: string;
  label: string;
  value: number;
}

declare global {
  interface Window {
    gtag: (
      event: string,
      action: string,
      params: { event_category: string; event_label: string; value: number },
    ) => void;
  }
}

const Phrase: FC<Props> = ({
  phrase,
  likePhrase,
  dislikePhrase,
  getRandomPhrase,
  removeLike,
  removeDislike,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [showCorrection, setShowCorrection] = useState(false);
  const [contextIds, setContextIds] = useState<number[]>([]);
  const [likedIds, setLikedIds] = useState<number[]>([]);
  const [dislikedIds, setDislikedIds] = useState<number[]>([]);

  const router = useRouter();

  // Contexto de navegação (filtro/ordem com que o usuário chegou da listagem).
  const searchParams = useSearchParams();
  const category = searchParams.get("category");
  const sort = (searchParams.get("sort") as SortOption) || "id";
  const q = searchParams.get("q") || "";
  const ctxQuery = searchParams.toString();

  const event = ({ action, category, label, value }: EventParams) => {
    window.gtag("event", action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  };

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        const ids = await getContextIds(category, sort, q);
        if (mounted) setContextIds(ids);

        const savedLikedIds = localStorage.getItem("likedIds");
        const savedDislikedIds = localStorage.getItem("dislikedIds");

        if (mounted) {
          if (savedLikedIds) setLikedIds(JSON.parse(savedLikedIds));
          if (savedDislikedIds) setDislikedIds(JSON.parse(savedDislikedIds));
        }
      } catch (error) {
        console.error("Error loading data:", error);
      }

      if (mounted) setIsLoading(false);
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, [category, sort, q]);

  const handleLike = async (id: number) => {
    if (likedIds.includes(id)) {
      // Unlike if already liked
      await removeLike(id);
      const newLikedIds = likedIds.filter((lId) => lId !== id);
      setLikedIds(newLikedIds);
      localStorage.setItem("likedIds", JSON.stringify(newLikedIds));
      return;
    }

    // Remove dislike if exists
    if (dislikedIds.includes(id)) {
      await removeDislike(id);
      const newDislikedIds = dislikedIds.filter((dId) => dId !== id);
      setDislikedIds(newDislikedIds);
      localStorage.setItem("dislikedIds", JSON.stringify(newDislikedIds));
    }

    // Add like
    await likePhrase(id);
    const newLikedIds = [...likedIds, id];
    setLikedIds(newLikedIds);
    localStorage.setItem("likedIds", JSON.stringify(newLikedIds));
  };

  const handleDislike = async (id: number) => {
    if (dislikedIds.includes(id)) {
      // Remove dislike if already disliked
      await removeDislike(id);
      const newDislikedIds = dislikedIds.filter((dId) => dId !== id);
      setDislikedIds(newDislikedIds);
      localStorage.setItem("dislikedIds", JSON.stringify(newDislikedIds));
      return;
    }

    // Remove like if exists
    if (likedIds.includes(id)) {
      await removeLike(id);
      const newLikedIds = likedIds.filter((lId) => lId !== id);
      setLikedIds(newLikedIds);
      localStorage.setItem("likedIds", JSON.stringify(newLikedIds));
    }

    // Add dislike
    await dislikePhrase(id);
    const newDislikedIds = [...dislikedIds, id];
    setDislikedIds(newDislikedIds);
    localStorage.setItem("dislikedIds", JSON.stringify(newDislikedIds));
  };

  const handleToggleDetails = () => {
    if (!hasInteracted) {
      setHasInteracted(true);
      event({
        action: "reveal_error",
        category: "interaction statement",
        label: "User revealed the error",
        value: phrase.id,
      });
    }
    setShowDetails(!showDetails);
  };

  const randomPhrase = async () => {
    try {
      event({
        action: "random_phrase",
        category: "interaction statement",
        label: "User navigated to a random phrase",
        value: phrase.id,
      });

      const newPhrase = await getRandomPhrase([phrase.id.toString()]);
      if (newPhrase) {
        router.push(`/${newPhrase.id}`);
      } else {
        console.error("No new phrase found");
        router.push(`/${phrase.id}`);
      }
    } catch (error) {
      console.error("Error fetching next phrase:", error);
      router.push(`/${phrase.id}`);
    }
  };

  const navigatePhrase = async (next: boolean) => {
    if (contextIds.length === 0) return;

    // Navega pela lista do contexto (filtro/ordem) com wraparound, preservando
    // os params na URL para manter a navegação dentro do mesmo subconjunto.
    const currentIndex = contextIds.indexOf(phrase.id);
    const baseIndex = currentIndex === -1 ? 0 : currentIndex;
    const nextIndex =
      (baseIndex + (next ? 1 : -1) + contextIds.length) % contextIds.length;
    const newId = contextIds[nextIndex];

    event({
      action: "navigate_phrase",
      category: "interaction statement",
      label: next
        ? "User navigated to next phrase"
        : "User navigated to previous phrase",
      value: newId,
    });

    router.push(ctxQuery ? `/${newId}?${ctxQuery}` : `/${newId}`);
  };

  const renderText = () => {
    const errorIndex = phrase.phrase_text.indexOf(phrase.error);
    if (errorIndex === -1)
      return (
        <p className="text-sm sm:text-xl italic pb-8 sm:pb-12">
          <span className="font-bold">{phrase.title} — </span>
          {phrase.phrase_text}
        </p>
      );

    const beforeError = phrase.phrase_text.slice(0, errorIndex);
    const afterError = phrase.phrase_text.slice(
      errorIndex + phrase.error.length,
    );

    return (
      <p className="text-sm sm:text-xl italic pb-8 sm:pb-12">
        <span className="font-bold">{phrase.title} — </span>
        {beforeError}
        <span
          className={
            !hasInteracted
              ? ""
              : showDetails
                ? "highlight-animation"
                : "unhighlight-animation"
          }
        >
          {phrase.error}
        </span>
        {afterError}
      </p>
    );
  };

  if (isLoading)
    return (
      <div className="container mx-auto px-4">
        {/* Banner */}
        <div className="h-4 w-40 bg-neutral-200 animate-pulse mb-2" />

        {/* Navigation Buttons */}
        <div className="flex items-center gap-4 sm:gap-6 py-2 sm:py-4 justify-center">
          <div className="button-shadowed border-black border-2 w-11 h-11 sm:w-14 sm:h-14" />
          <div className="button-shadowed border-black border-2 w-11 h-11 sm:w-14 sm:h-14" />
          <div className="button-shadowed border-black border-2 w-11 h-11 sm:w-14 sm:h-14" />
        </div>

        {/* Main Content */}
        <div className="flex items-center py-2 sm:py-4 justify-around">
          <div className="box-shadowed border-black border-2 p-4 sm:p-6 w-[95%] sm:w-[85%] md:w-2/3">
            <div className="space-y-3 pb-8 sm:pb-12 animate-pulse">
              <div className="h-4 sm:h-5 w-full bg-neutral-200" />
              <div className="h-4 sm:h-5 w-full bg-neutral-200" />
              <div className="h-4 sm:h-5 w-5/6 bg-neutral-200" />
              <div className="h-4 sm:h-5 w-2/3 bg-neutral-200" />
            </div>
            <div className="animate-pulse flex items-end justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-5 w-12 bg-neutral-200" />
                <div className="h-5 w-12 bg-neutral-200" />
              </div>
              <div className="space-y-2">
                <div className="h-3 w-28 bg-neutral-200 ml-auto" />
                <div className="h-3 w-20 bg-neutral-200 ml-auto" />
              </div>
            </div>
          </div>
        </div>

        {/* Reveal correction */}
        <div className="flex items-center py-4 justify-center">
          <div className="button-shadowed border-black border-2 w-11 h-11 sm:w-14 sm:h-14" />
        </div>
      </div>
    );

  const currentIndex = contextIds.indexOf(phrase.id);
  const position = currentIndex >= 0 ? currentIndex + 1 : null;
  // Rótulo do contexto (busca de texto, autor e/ou categoria), sem vazar o token
  // cru `author:"..."`. Ex.: “frog” · by Rachel Tan · History & Mythology.
  const { author: ctxAuthor, text: ctxText } = parseSearchQuery(q);
  const contextLabel =
    [
      ctxText ? `“${ctxText}”` : null,
      ctxAuthor ? `by ${stripByPrefix(ctxAuthor)}` : null,
      category,
    ]
      .filter(Boolean)
      .join(" · ") || null;
  const backHref = ctxQuery ? `/?${ctxQuery}` : "/";
  // Link para a home já filtrada pela categoria da frase.
  const categoryHref = `/?${new URLSearchParams({
    category: phrase.category,
  }).toString()}`;
  // Link para a home com o filtro de autor (token author:"..." na busca).
  const authorHref = phrase.author
    ? `/?${new URLSearchParams({ q: authorQuery(phrase.author) }).toString()}`
    : null;

  return (
    <div className="container mx-auto px-4">
      <ContextBanner
        backHref={backHref}
        label={contextLabel}
        position={position}
        total={contextIds.length}
      />

      {/* Navigation Buttons */}
      <div className="flex items-center gap-4 sm:gap-6 py-2 sm:py-4 justify-center">
        <Button
          icon={faArrowLeft}
          ariaLabel="Previous phrase"
          onClick={() => {
            navigatePhrase(false);
          }}
        />
        <Button
          icon={faShuffle}
          ariaLabel="Random phrase"
          onClick={randomPhrase}
        />
        <Button
          icon={faArrowRight}
          ariaLabel="Next phrase"
          onClick={() => {
            navigatePhrase(true);
          }}
        />
      </div>

      {/* Main Content */}
      <div className="flex items-center py-2 sm:py-4 justify-around">
        <div className="box-shadowed border-black border-2 p-4 sm:p-6 w-[95%] sm:w-[85%] md:w-2/3">
          {renderText()}

          <div className="text-end">
            <div
              className={`grid transition-all duration-300 ease-out ${
                showDetails
                  ? "grid-rows-[1fr] opacity-100"
                  : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <p className="transition-all duration-300 ease-out text-sm sm:text-xl">
                  {phrase.correction}
                </p>
              </div>
            </div>

            {/* Like/dislike inline, com o sweep amarelo do highlight-link no hover. */}
            <div className="flex items-end justify-between gap-4 pt-4 sm:pt-12">
              <div className="flex items-center gap-4 text-sm sm:text-lg text-foreground">
                <button
                  onClick={() => handleLike(phrase.id)}
                  aria-label={
                    likedIds.includes(phrase.id) ? "Remove like" : "Like"
                  }
                  aria-pressed={likedIds.includes(phrase.id)}
                  className={`highlight-link flex items-center gap-2 px-1 ${
                    likedIds.includes(phrase.id) ? "font-semibold" : ""
                  }`}
                >
                  <FontAwesomeIcon
                    icon={
                      likedIds.includes(phrase.id)
                        ? faThumbsUpSolid
                        : faThumbsUp
                    }
                  />
                  {phrase.likes}
                </button>

                <button
                  onClick={() => handleDislike(phrase.id)}
                  aria-label={
                    dislikedIds.includes(phrase.id)
                      ? "Remove dislike"
                      : "Dislike"
                  }
                  aria-pressed={dislikedIds.includes(phrase.id)}
                  className={`highlight-link flex items-center gap-2 px-1 ${
                    dislikedIds.includes(phrase.id) ? "font-semibold" : ""
                  }`}
                >
                  <FontAwesomeIcon
                    icon={
                      dislikedIds.includes(phrase.id)
                        ? faThumbsDownSolid
                        : faThumbsDown
                    }
                  />
                  {phrase.dislikes}
                </button>

                {showDetails && (
                  <div>
                    <button
                      type="button"
                      onClick={() => setShowCorrection(true)}
                      className="highlight-link text-xs sm:text-sm"
                    >
                      Um, actually&hellip; this isn&apos;t quite right?
                    </button>
                  </div>
                )}
              </div>

              <div>
                <h2 className="text-xs sm:text-base">
                  #{phrase.id} -{" "}
                  <Link
                    href={categoryHref}
                    className="highlight-link font-semibold"
                  >
                    {phrase.category}
                  </Link>
                </h2>

                <p className="text-xs sm:text-base">
                  {phrase.author && authorHref ? (
                    <Link href={authorHref} className="highlight-link">
                      {phrase.author}
                    </Link>
                  ) : (
                    phrase.author
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reveal correction */}
      <div className="flex items-center py-4 justify-center">
        <Button
          icon={showDetails ? faEyeSlash : faEye}
          ariaLabel={showDetails ? "Hide correction" : "Reveal correction"}
          onClick={handleToggleDetails}
        />
      </div>

      <CorrectionModal
        phraseId={phrase.id}
        open={showCorrection}
        onClose={() => setShowCorrection(false)}
      />
    </div>
  );
};

export default Phrase;
