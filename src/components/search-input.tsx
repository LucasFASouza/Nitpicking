"use client";

import { FC, useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

interface Props {
  // Valor vindo da URL (q). A digitação é local; o push é debounced.
  value: string;
  onChange: (value: string) => void;
}

const SearchInput: FC<Props> = ({ value, onChange }) => {
  const [text, setText] = useState(value);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const lastPushed = useRef(value);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reflete mudanças externas reais (ex.: voltar/avançar do navegador), sem
  // sobrescrever o que o usuário está digitando (ignora o "eco" do próprio push).
  useEffect(() => {
    if (value !== lastPushed.current) {
      lastPushed.current = value;
      setText(value);
    }
  }, [value]);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    []
  );

  const handleChange = (next: string) => {
    setText(next);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      lastPushed.current = next;
      onChangeRef.current(next);
    }, 350);
  };

  // Limpa imediatamente (sem debounce).
  const handleClear = () => {
    if (timer.current) clearTimeout(timer.current);
    setText("");
    lastPushed.current = "";
    onChangeRef.current("");
  };

  return (
    <div className="relative w-full">
      <input
        type="text"
        value={text}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Search in the sentences…"
        className="border-2 border-black bg-background pl-3 pr-9 py-2 text-sm w-full focus:outline-none focus:shadow-[3px_3px]"
      />
      {text && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear search"
          className="absolute right-2 top-1/2 -translate-y-1/2 px-1 text-xs text-neutral-400 hover:text-neutral-600"
        >
          <FontAwesomeIcon icon={faXmark} className="fa-fw" />
        </button>
      )}
    </div>
  );
};

export default SearchInput;
