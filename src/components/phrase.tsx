"use client";
import { ChangeEvent, FC, useState } from "react";
import { PhraseType } from "@/types/phraseType";

interface Props {
  phrase: PhraseType;
  likePhrase: (id: number) => void;
  dislikePhrase: (id: number) => void;
  getRandomPhrase: (except: string[]) => Promise<PhraseType | null>;
}

const Phrase: FC<Props> = ({
  phrase,
  likePhrase,
  dislikePhrase,
  getRandomPhrase,
}) => {
  const [showDetails, setShowDetails] = useState(false);

  const handleToggleDetails = () => {
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

  return (
    <div>
      <h2>{phrase.category}</h2>
      <p>{phrase.phrase_text}</p>

      {phrase.author && <p>by: {phrase.author}</p>}

      {showDetails && (
        <>
          <br />
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

      <br />
      <br />

      <button onClick={() => window.history.back()}>Go Back</button>
      <br />
      <button onClick={nextPhrase}>Next</button>
    </div>
  );
};

export default Phrase;
