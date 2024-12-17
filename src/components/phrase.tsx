"use client";
import { FC, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/button";
import { PhraseType } from "@/types/phraseType";
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
  getIds: () => Promise<number[]>;
}

interface EventParams {
  action: string;
  category: string;
  label: string;
  value: number;
}

const Phrase: FC<Props> = ({
  phrase,
  likePhrase,
  dislikePhrase,
  getRandomPhrase,
  removeLike,
  removeDislike,
  getIds,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [allIds, setAllIds] = useState<number[]>([]);
  const [likedIds, setLikedIds] = useState<number[]>([]);
  const [dislikedIds, setDislikedIds] = useState<number[]>([]);

  const router = useRouter();

  const event = ({ action, category, label, value }: EventParams) => {
    (window as any).gtag("event", action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  };

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        const ids = await getIds();
        if (mounted) setAllIds(ids);

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
  }, [getIds]);

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
    let newIndex = next ? phrase.id + 1 : phrase.id - 1;
    if (newIndex < 1) newIndex = allIds[allIds.length - 1];
    if (newIndex > allIds[allIds.length - 1]) newIndex = 1;

    event({
      action: "navigate_phrase",
      category: "interaction statement",
      label: next
        ? "User navigated to next phrase"
        : "User navigated to previous phrase",
      value: newIndex,
    });

    router.push(`/${newIndex}`);
  };

  const renderText = () => {
    const errorIndex = phrase.phrase_text.indexOf(phrase.error);
    if (errorIndex === -1)
      return (
        <p className="text-base sm:text-xl italic pb-12">
          <span className="font-bold">{phrase.title} — </span>
          {phrase.phrase_text}
        </p>
      );

    const beforeError = phrase.phrase_text.slice(0, errorIndex);
    const afterError = phrase.phrase_text.slice(
      errorIndex + phrase.error.length
    );

    return (
      <p className="text-base sm:text-xl italic pb-12">
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
    return <div className="text-2xl text-center py-24">Loading...</div>;

  return (
    <div className="container mx-auto px-4">
      {/* Navigation Buttons */}
      <div className="flex items-center gap-4 sm:gap-6 py-2 sm:py-4 justify-center">
        <Button
          icon={faArrowLeft}
          onClick={() => {
            navigatePhrase(false);
          }}
        />
        <Button icon={faShuffle} onClick={randomPhrase} />
        <Button
          icon={faArrowRight}
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
                <p className="transition-all duration-300 ease-out text-base sm:text-xl">
                  {phrase.correction}
                </p>
              </div>
            </div>

            <h2 className="pt-6 sm:pt-12 text-sm sm:text-base">
              #{phrase.id} - {phrase.category}
            </h2>

            <p className="text-sm sm:text-base">{phrase.author}</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-start gap-4 sm:gap-6 py-4 justify-center">
        <div className="flex flex-col items-center gap-2">
          <Button
            icon={
              dislikedIds.includes(phrase.id) ? faThumbsDownSolid : faThumbsDown
            }
            onClick={() => handleDislike(phrase.id)}
          />
          {phrase.dislikes}
        </div>

        <Button
          icon={showDetails ? faEyeSlash : faEye}
          onClick={handleToggleDetails}
        />

        <div className="flex flex-col items-center gap-2">
          <Button
            icon={likedIds.includes(phrase.id) ? faThumbsUpSolid : faThumbsUp}
            onClick={() => handleLike(phrase.id)}
          />
          {phrase.likes}
        </div>
      </div>
    </div>
  );
};

export default Phrase;
