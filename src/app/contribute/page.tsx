"use client";

import { useState } from "react";
import { addSuggestion } from "@/actions/suggestionAction";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane } from "@fortawesome/free-regular-svg-icons";
import { categories } from "@/lib/categories";

const inputClass =
  "w-full border-2 border-black p-2 text-sm focus:shadow-[3px_3px] focus:outline-none sm:p-3 sm:text-base";

export default function ContributePage() {
  const [formData, setFormData] = useState({
    author: "",
    title: "",
    category: "",
    phrase_text: "",
    error: "",
    correction: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      await addSuggestion(
        formData.author,
        formData.title,
        formData.category,
        formData.phrase_text,
        formData.error,
        formData.correction,
        formData.notes
      );

      setFormData({
        author: "",
        title: "",
        category: "",
        phrase_text: "",
        error: "",
        correction: "",
        notes: "",
      });

      alert("Thank you for your contribution!");
      window.location.href = "/";
    } catch (error) {
      console.error("Error submitting suggestion:", error);
      alert("Error submitting your suggestion. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <main>
      <div className="flex items-center gap-4 sm:gap-6 py-2 sm:py-4">
        <div className="box-shadowed border-black border-2 p-4 sm:p-6 w-[95%] sm:w-[85%] md:w-2/3 mx-auto">
          <h1 className="text-lg sm:text-2xl mb-2 sm:mb-4">Suggest a nitpick</h1>

          <div className="py-2 sm:py-4">
            <p className="mb-6 text-sm text-neutral-600 sm:text-base">
              Found an interesting mistake in pop culture? Help us grow our
              collection by submitting your own nitpick!
            </p>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="author" className="mb-1 block text-sm">
                  Your username{" "}
                  <span className="text-neutral-600">(optional)</span>
                </label>
                <input
                  type="text"
                  id="author"
                  value={formData.author}
                  onChange={(e) =>
                    setFormData({ ...formData, author: e.target.value })
                  }
                  className={inputClass}
                />
              </div>

              <div className="mb-4">
                <label htmlFor="category" className="mb-1 block text-sm">
                  Category *
                </label>
                <select
                  id="category"
                  required
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className={inputClass}
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label htmlFor="title" className="mb-1 block text-sm">
                  Title *{" "}
                  <span className="text-neutral-600">
                    (what is this statement about? E.g., Star Wars, Naruto etc.)
                  </span>
                </label>
                <input
                  type="text"
                  id="title"
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className={inputClass}
                />
              </div>

              <div className="mb-4">
                <label htmlFor="phrase_text" className="mb-1 block text-sm">
                  Sentence *
                </label>
                <textarea
                  id="phrase_text"
                  required
                  value={formData.phrase_text}
                  onChange={(e) =>
                    setFormData({ ...formData, phrase_text: e.target.value })
                  }
                  className={`${inputClass} h-24`}
                />
              </div>

              <div className="mb-4">
                <label htmlFor="error" className="mb-1 block text-sm">
                  Error *{" "}
                  <span className="text-neutral-600">
                    (what part of the sentence is wrong?)
                  </span>
                </label>
                <input
                  type="text"
                  id="error"
                  required
                  value={formData.error}
                  onChange={(e) =>
                    setFormData({ ...formData, error: e.target.value })
                  }
                  className={inputClass}
                />
              </div>

              <div className="mb-4">
                <label htmlFor="correction" className="mb-1 block text-sm">
                  Correction *
                </label>
                <input
                  type="text"
                  id="correction"
                  required
                  value={formData.correction}
                  onChange={(e) =>
                    setFormData({ ...formData, correction: e.target.value })
                  }
                  className={inputClass}
                />
              </div>

              <div className="mb-4">
                <label htmlFor="notes" className="mb-1 block text-sm">
                  Additional notes{" "}
                  <span className="text-neutral-600">(optional)</span>
                </label>
                <textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  className={`${inputClass} h-24`}
                />
              </div>

              <div className="flex items-center justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  aria-label="Submit suggestion"
                  className="button-shadowed flex aspect-square w-11 items-center justify-center border-2 border-black active:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-40 sm:w-12"
                >
                  <FontAwesomeIcon
                    icon={faPaperPlane}
                    className="fa-fw text-base sm:text-xl"
                  />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
