"use client";
import { FC, useState, useEffect } from "react";
import Button from "@/components/button";
import { PhraseType } from "@/types/phraseType";
import {
  faArrowLeft,
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
}

const Phrase: FC<Props> = ({
  phrase,
  likePhrase,
  dislikePhrase,
  getRandomPhrase,
  removeLike,
  removeDislike,
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [likedIds, setLikedIds] = useState<number[]>([]);
  const [dislikedIds, setDislikedIds] = useState<number[]>([]);

  useEffect(() => {
    const savedLikedIds = localStorage.getItem("likedIds");
    const savedDislikedIds = localStorage.getItem("dislikedIds");

    if (savedLikedIds) setLikedIds(JSON.parse(savedLikedIds));
    if (savedDislikedIds) setDislikedIds(JSON.parse(savedDislikedIds));
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

  const nextPhrase = async () => {
    try {
      const newPhrase = await getRandomPhrase([phrase.id.toString()]);
      if (newPhrase) {
        window.location.href = `/${newPhrase.id}`;
      } else {
        console.error("No new phrase found");
        window.location.href = `/${phrase.id}`;
      }
    } catch (error) {
      console.error("Error fetching next phrase:", error);
      window.location.href = `/${phrase.id}`;
    }
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

  return (
    <div>
      <div className="flex items-center py-4 justify-around">
        <Button icon={faArrowLeft} onClick={() => window.history.back()} />

        <div className="border-black border-2 p-6 w-2/3">
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
                <p className="transition-all duration-300 ease-out text-xl">
                  {phrase.correction}
                </p>
              </div>
            </div>

            <h2 className="pt-12">
              #{phrase.id} - {phrase.category}
            </h2>
          </div>
        </div>
        <Button icon={faShuffle} onClick={nextPhrase} />
      </div>

      <div className="flex items-center gap-6 py-4 justify-center">
        <Button
          icon={
            dislikedIds.includes(phrase.id) ? faThumbsDownSolid : faThumbsDown
          }
          onClick={() => handleDislike(phrase.id)}
        />
        <Button
          icon={showDetails ? faEyeSlash : faEye}
          onClick={handleToggleDetails}
        />
        <Button
          icon={likedIds.includes(phrase.id) ? faThumbsUpSolid : faThumbsUp}
          onClick={() => handleLike(phrase.id)}
        />
      </div>
    </div>
  );
};

export default Phrase;
