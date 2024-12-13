"use server";
import { db } from "@/db/drizzle";
import { suggestion } from "@/db/schema";
import { validateInput } from "@/utils/validate";

export const addSuggestion = async (
  author: string,
  category: string,
  phrase_text: string,
  error: string,
  correction: string,
  notes: string
) => {
  if (
    !validateInput({ author, category, phrase_text, error, correction, notes })
  ) {
    throw new Error("Invalid input");
  }

  try {
    await db.insert(suggestion).values({
      author: author.slice(0, 50),
      category: category,
      phrase_text: phrase_text.trim(),
      error: error.trim(),
      correction: correction.trim(),
      notes: notes?.trim(),
    });
  } catch (error) {
    console.error("Database error:", error);
    throw new Error("Failed to add suggestion");
  }
};
