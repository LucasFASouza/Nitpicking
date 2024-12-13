// app/contribute/page.tsx
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
        formData.category,
        formData.phrase_text,
        formData.error,
        formData.correction,
        formData.notes
      );

      setFormData({
        author: "",
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
      <div className="flex items-center gap-6 py-4">
        <div className="border-black border-2 p-6 w-2/3 mx-auto">
          <h1 className="mb-2">Contribute</h1>

          <div className="space-y-4 text-lg py-4">
            <p>
              Found an interesting mistake in pop culture? Help us grow our
              collection by submitting your own nitpick!
            </p>

            <form onSubmit={handleSubmit} className="space-y-6 mt-6">
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
                  className="w-full border-2 border-black p-2"
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
                  className="w-full border-2 border-black p-2"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
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
                  className="w-full border-2 border-black p-2 h-24"
                />
              </div>

              <div>
                <label htmlFor="error" className="block mb-2">
                  Error (What part of the sentence is wrong?) *
                </label>
                <input
                  type="text"
                  id="error"
                  required
                  value={formData.error}
                  onChange={(e) =>
                    setFormData({ ...formData, error: e.target.value })
                  }
                  className="w-full border-2 border-black p-2"
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
                  className="w-full border-2 border-black p-2"
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
                  className="w-full border-2 border-black p-2 h-24"
                />
              </div>

              <div className="flex justify-end items-end pt-4">
                <Button
                  icon={faPaperPlane}
                  onClick={() => {}}
                  className="submit-button"
                />
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
