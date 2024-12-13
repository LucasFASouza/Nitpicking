"use client";
import { FC, useState, useEffect } from "react";
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
  likePhrase: (id: number) => void;
  dislikePhrase: (id: number) => void;
  removeLike: (id: number) => void;
  removeDislike: (id: number) => void;
  getRandomPhrase: (except: string[]) => Promise<PhraseType | null>;
  getIds: () => Promise<number[]>;
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
  }, []);

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
    if (!hasInteracted) setHasInteracted(true);
    setShowDetails(!showDetails);
  };

  const randomPhrase = async () => {
    try {
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
    console.log("All ids", allIds);
    console.log("Current index", phrase.id);
    console.log(next ? "Next" : "Previous");

    let newIndex = next ? phrase.id + 1 : phrase.id - 1;
    if (newIndex < 1) newIndex = allIds[allIds.length - 1];
    if (newIndex > allIds[allIds.length - 1]) newIndex = 1;

    console.log("New index", newIndex);

    router.push(`/${newIndex}`);
  };

  const renderText = () => {
    const errorIndex = phrase.phrase_text.indexOf(phrase.error);
    if (errorIndex === -1)
      return <p className="text-2xl italic">{phrase.phrase_text}</p>;

    const beforeError = phrase.phrase_text.slice(0, errorIndex);
    const afterError = phrase.phrase_text.slice(
      errorIndex + phrase.error.length
    );

    return (
      <p className="text-2xl italic pb-12">
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
          className="text-lg sm:text-xl"
        />
        <Button
          icon={faShuffle}
          onClick={randomPhrase}
          className="text-lg sm:text-xl"
        />
        <Button
          icon={faArrowRight}
          onClick={() => {
            navigatePhrase(true);
          }}
          className="text-lg sm:text-xl"
        />
      </div>

      {/* Main Content */}
      <div className="flex items-center py-2 sm:py-4 justify-around">
        <div className="border-black border-2 p-4 sm:p-6 w-[95%] sm:w-[85%] md:w-2/3">
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
            <p>
              {phrase.author}
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-4 sm:gap-6 py-2 sm:py-4 justify-center">
        <Button
          icon={
            dislikedIds.includes(phrase.id) ? faThumbsDownSolid : faThumbsDown
          }
          onClick={() => handleDislike(phrase.id)}
          className="text-lg sm:text-xl"
        />
        <Button
          icon={showDetails ? faEyeSlash : faEye}
          onClick={handleToggleDetails}
          className="text-lg sm:text-xl"
        />
        <Button
          icon={likedIds.includes(phrase.id) ? faThumbsUpSolid : faThumbsUp}
          onClick={() => handleLike(phrase.id)}
          className="text-lg sm:text-xl"
        />
      </div>
    </div>
  );
};

export default Phrase;
