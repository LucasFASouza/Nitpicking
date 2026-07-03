import { FC, ReactNode } from "react";
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
  // Termos da busca a destacar no corpo da frase.
  highlight?: string;
}

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Destaca (com <mark> amarelo) as ocorrências dos termos da busca no texto.
function highlightTerms(text: string, query?: string): ReactNode {
  const terms = (query ?? "").trim().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return text;

  const lowered = new Set(terms.map((t) => t.toLowerCase()));
  const regex = new RegExp(`(${terms.map(escapeRegExp).join("|")})`, "gi");

  return text.split(regex).map((part, i) =>
    lowered.has(part.toLowerCase()) ? (
      <mark key={i} className="bg-[#fef08a] text-inherit">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

const PhraseCard: FC<Props> = ({ phrase, href, highlight }) => {
  return (
    <Link
      href={href}
      className="button-shadowed border-black border-2 p-3 sm:p-4 flex flex-col gap-2 sm:gap-3 h-full"
    >
      <div>
        <h2 className="text-sm sm:text-lg leading-tight">
          {highlightTerms(phrase.title, highlight)}
        </h2>
        <p className="text-[11px] sm:text-xs text-neutral-600">
          #{phrase.id} · {phrase.category}
        </p>
      </div>

      <p className="text-xs sm:text-sm italic line-clamp-3 sm:line-clamp-4 flex-1">
        {highlightTerms(phrase.phrase_text, highlight)}
      </p>

      <div className="flex items-center justify-between gap-3 text-[11px] sm:text-xs text-neutral-600">
        <div className="flex gap-3 sm:gap-4">
          <span className="flex items-center gap-1">
            <FontAwesomeIcon icon={faThumbsUp} /> {phrase.likes}
          </span>
          <span className="flex items-center gap-1">
            <FontAwesomeIcon icon={faThumbsDown} /> {phrase.dislikes}
          </span>
        </div>
        {phrase.author && (
          <span className="truncate">— {phrase.author}</span>
        )}
      </div>
    </Link>
  );
};

export default PhraseCard;
