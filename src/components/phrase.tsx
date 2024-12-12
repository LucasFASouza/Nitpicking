"use client";
import { ChangeEvent, FC, useState } from "react";
import { PhraseType } from "@/types/phraseType";

interface Props {
  phrase: PhraseType;
  likePhrase: (id: number) => void;
  dislikePhrase: (id: number) => void;
}

const Phrase: FC<Props> = ({ phrase, likePhrase, dislikePhrase }) => {
  const [showDetails, setShowDetails] = useState(false);

  const handleToggleDetails = () => {
    setShowDetails(!showDetails);
  };

  return (
    <div>
      <h2>{phrase.category}</h2>
      <p>{phrase.phrase_text}</p>

      {phrase.author && <p>by: {phrase.author}</p>}

      {showDetails && (
        <>
          <p>Error: {phrase.error}</p>
          <p>Correction: {phrase.correction}</p>
        </>
      )}

      <br />

      <p>Likes: {phrase.likes}</p>
      <p>Dislikes: {phrase.dislikes}</p>

      <br />

      <button onClick={handleToggleDetails}>
        {showDetails ? "Hide Details" : "Show Details"}
      </button>

      <br />
      <br />

      <button onClick={() => likePhrase(phrase.id)}>Like</button>

      <br />

      <button onClick={() => dislikePhrase(phrase.id)}>Dislike</button>
    </div>
  );
};

export default Phrase;
