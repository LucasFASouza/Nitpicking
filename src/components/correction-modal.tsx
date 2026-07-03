"use client";

import { FC, useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { faPaperPlane } from "@fortawesome/free-regular-svg-icons";
import { addCorrection } from "@/actions/correctionAction";

interface Props {
  phraseId: number;
  open: boolean;
  onClose: () => void;
}

const MAX_BODY = 1000;

const CorrectionModal: FC<Props> = ({ phraseId, open, onClose }) => {
  const [body, setBody] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">(
    "idle"
  );

  const panelRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  // Reset ao (re)abrir e foca o textarea.
  useEffect(() => {
    if (!open) return;
    setBody("");
    setSourceUrl("");
    setStatus("idle");
    const t = setTimeout(() => bodyRef.current?.focus(), 0);
    return () => clearTimeout(t);
  }, [open]);

  // ESC fecha; Tab fica preso dentro do painel (foco não escapa pro fundo).
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;
      const focusables = panelRef.current.querySelectorAll<HTMLElement>(
        'button, textarea, input, a[href], [tabindex]:not([tabindex="-1"])'
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const canSend = body.trim().length >= 3 && status !== "sending";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSend) return;
    setStatus("sending");
    try {
      await addCorrection(phraseId, body, sourceUrl);
      setStatus("done");
    } catch (err) {
      console.error("Error submitting correction:", err);
      setStatus("error");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="correction-title"
        className="box-shadowed relative w-full max-w-md border-2 border-black bg-background p-5 sm:p-6"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="button-shadowed-sm absolute right-3 top-3 flex aspect-square w-8 items-center justify-center border-2 border-black active:bg-neutral-200"
        >
          <FontAwesomeIcon icon={faXmark} className="fa-fw" />
        </button>

        {status === "done" ? (
          <div className="py-4 text-center">
            <h2 id="correction-title" className="mb-2">
              Thanks, nitpicker!
            </h2>
            <p className="text-sm sm:text-base">
              We&apos;ll take a look at your correction.
            </p>
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={onClose}
                className="button-shadowed border-2 border-black px-4 py-2 text-sm active:bg-neutral-200"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <h2 id="correction-title" className="mb-1 pr-8">
              Um, actually&hellip;
            </h2>
            <p className="mb-4 text-sm text-neutral-600">
              Spotted a mistake in this nitpick? Tell us what&apos;s off &mdash;
              we read every one.
            </p>

            <div className="mb-4">
              <label htmlFor="correction-body" className="mb-1 block text-sm">
                What&apos;s wrong with it?
              </label>
              <textarea
                id="correction-body"
                ref={bodyRef}
                required
                maxLength={MAX_BODY}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="h-24 w-full border-2 border-black p-2 text-sm focus:shadow-[3px_3px] focus:outline-none sm:p-3 sm:text-base"
              />
              <p className="mt-1 text-right text-xs text-neutral-600">
                {body.length} / {MAX_BODY}
              </p>
            </div>

            <div className="mb-4">
              <label htmlFor="correction-source" className="mb-1 block text-sm">
                Source link <span className="text-neutral-600">(optional)</span>
              </label>
              <input
                id="correction-source"
                type="url"
                inputMode="url"
                placeholder="https://…"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                className="w-full border-2 border-black p-2 text-sm focus:shadow-[3px_3px] focus:outline-none sm:p-3 sm:text-base"
              />
            </div>

            {status === "error" && (
              <p className="mb-3 text-sm text-red-600">
                Something went wrong. Please try again.
              </p>
            )}

            <div className="flex items-center justify-end">
              <button
                type="submit"
                disabled={!canSend}
                aria-label="Send correction"
                className="button-shadowed flex aspect-square w-11 items-center justify-center border-2 border-black active:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-40 sm:w-12"
              >
                <FontAwesomeIcon
                  icon={faPaperPlane}
                  className="fa-fw text-base sm:text-xl"
                />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CorrectionModal;
