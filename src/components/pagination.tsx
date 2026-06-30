import { FC } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";

interface Props {
  currentPage: number;
  pageCount: number;
  onGo: (page: number) => void;
  disabled?: boolean;
}

// Janela em volta da atual, sempre com primeira e última: 1 … n-1 n n+1 … N.
function getPageItems(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const items: (number | "ellipsis")[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  if (start > 2) items.push("ellipsis");
  for (let p = start; p <= end; p++) items.push(p);
  if (end < total - 1) items.push("ellipsis");

  items.push(total);
  return items;
}

const cell =
  "border-2 border-black flex items-center justify-center w-8 h-8 text-xs sm:w-10 sm:h-10 sm:text-sm";
const interactive =
  "button-shadowed bg-background disabled:opacity-30 disabled:cursor-not-allowed";

const Pagination: FC<Props> = ({ currentPage, pageCount, onGo, disabled }) => {
  if (pageCount <= 1) return null;

  return (
    <nav
      aria-label="Pagination"
      className="flex flex-wrap items-center justify-center gap-1 sm:gap-3 pt-10 pb-2"
    >
      <button
        className={`${cell} ${interactive}`}
        onClick={() => onGo(currentPage - 1)}
        disabled={disabled || currentPage <= 1}
        aria-label="Previous page"
      >
        <FontAwesomeIcon icon={faArrowLeft} className="fa-fw" />
      </button>

      {getPageItems(currentPage, pageCount).map((item, i) =>
        item === "ellipsis" ? (
          <span
            key={`e${i}`}
            className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center"
          >
            …
          </span>
        ) : item === currentPage ? (
          // Página atual: invertida (fundo escuro, sem sombra) = selecionada.
          <span
            key={item}
            aria-current="page"
            className={`${cell} bg-foreground text-background`}
          >
            {item}
          </span>
        ) : (
          <button
            key={item}
            className={`${cell} ${interactive}`}
            onClick={() => onGo(item)}
            disabled={disabled}
          >
            {item}
          </button>
        )
      )}

      <button
        className={`${cell} ${interactive}`}
        onClick={() => onGo(currentPage + 1)}
        disabled={disabled || currentPage >= pageCount}
        aria-label="Next page"
      >
        <FontAwesomeIcon icon={faArrowRight} className="fa-fw" />
      </button>
    </nav>
  );
};

export default Pagination;
