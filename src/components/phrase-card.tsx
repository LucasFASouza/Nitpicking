import { FC } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faThumbsUp,
  faThumbsDown,
} from "@fortawesome/free-regular-svg-icons";
import { PhraseType } from "@/types/phraseType";

interface Props {
  phrase: PhraseType;
  // Recebido como prop para permitir anexar o contexto de navegação (Etapa 4).
  href: string;
}

const PhraseCard: FC<Props> = ({ phrase, href }) => {
  return (
    <Link
      href={href}
      className="button-shadowed border-black border-2 p-4 flex flex-col gap-3 h-full"
    >
      <div>
        <h2 className="text-lg leading-tight">{phrase.title}</h2>
        <p className="text-xs text-neutral-600">
          #{phrase.id} · {phrase.category}
        </p>
      </div>

      <p className="text-sm italic line-clamp-4 flex-1">{phrase.phrase_text}</p>

      <div className="flex gap-4 text-xs text-neutral-600">
        <span className="flex items-center gap-1">
          <FontAwesomeIcon icon={faThumbsUp} /> {phrase.likes}
        </span>
        <span className="flex items-center gap-1">
          <FontAwesomeIcon icon={faThumbsDown} /> {phrase.dislikes}
        </span>
      </div>
    </Link>
  );
};

export default PhraseCard;
