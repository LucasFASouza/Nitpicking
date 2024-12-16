"use client";

import { useState } from "react";
import { addSuggestion } from "@/actions/suggestionAction";
import Button from "@/components/button";
import { faPaperPlane } from "@fortawesome/free-regular-svg-icons";

const categories = [
  "Others",
  "Cinema and TV",
  "Games",
  "Comics",
  "Books",
  "Music",
  "Science",
] as const;

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
    }
  };

  return (
    <main>
      <div className="flex items-center gap-4 sm:gap-6 py-2 sm:py-4">
        <div className="box-shadowed border-black border-2 p-4 sm:p-6 w-[95%] sm:w-[85%] md:w-2/3 mx-auto">
          <h1 className="text-xl sm:text-2xl mb-2 sm:mb-4">Contribute</h1>

          <div className="space-y-4 text-base sm:text-lg py-2 sm:py-4">
            <p>
              Found an interesting mistake in pop culture? Help us grow our
              collection by submitting your own nitpick!
            </p>

            <form
              onSubmit={handleSubmit}
              className="space-y-4 sm:space-y-6 mt-4 sm:mt-6"
            >
              <div>
                <label htmlFor="author" className="block mb-2">
                  Your username (optional)
                </label>
                <input
                  type="text"
                  id="author"
                  value={formData.author}
                  onChange={(e) =>
                    setFormData({ ...formData, author: e.target.value })
                  }
                  className="w-full border-2 border-black p-2 sm:p-3 text-sm sm:text-base"
                />
              </div>

              <div>
                <label htmlFor="category" className="block mb-2">
                  Category *
                </label>
                <select
                  id="category"
                  required
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full border-2 border-black p-2 sm:p-3 text-sm sm:text-base"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="title" className="block mb-2">
                  Title (what is this statement about? E.g., "Star Wars",
                  "Naruto" etc.) *
                </label>
                <input
                  type="text"
                  id="title"
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full border-2 border-black p-2 sm:p-3 text-sm sm:text-base"
                />
              </div>

              <div>
                <label htmlFor="phrase_text" className="block mb-2">
                  Sentence *
                </label>
                <textarea
                  id="phrase_text"
                  required
                  value={formData.phrase_text}
                  onChange={(e) =>
                    setFormData({ ...formData, phrase_text: e.target.value })
                  }
                  className="w-full border-2 border-black p-2 sm:p-3 h-20 sm:h-24 text-sm sm:text-base"
                />
              </div>

              <div>
                <label htmlFor="error" className="block mb-2">
                  Error (what part of the sentence is wrong?) *
                </label>
                <input
                  type="text"
                  id="error"
                  required
                  value={formData.error}
                  onChange={(e) =>
                    setFormData({ ...formData, error: e.target.value })
                  }
                  className="w-full border-2 border-black p-2 sm:p-3 text-sm sm:text-base"
                />
              </div>

              <div>
                <label htmlFor="correction" className="block mb-2">
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
                  className="w-full border-2 border-black p-2 sm:p-3 text-sm sm:text-base"
                />
              </div>

              <div>
                <label htmlFor="notes" className="block mb-2">
                  Additional Notes
                </label>
                <textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  className="w-full border-2 border-black p-2 sm:p-3 h-20 sm:h-24 text-sm sm:text-base"
                />
              </div>

              <div className="flex justify-end items-end pt-4 sm:pt-6">
                <Button
                  icon={faPaperPlane}
                  onClick={() => {}}
                  className="text-lg sm:text-xl"
                />
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
