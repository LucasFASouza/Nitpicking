"use server";
import { db } from "@/db/drizzle";
import { suggestion } from "@/db/schema";

export const getData = async () => {
  const data = await db.select().from(suggestion);
  return data;
};

export const addSuggestion = async (
  author: string,
  category: string,
  phrase_text: string,
  error: string,
  correction: string,
  notes: string
) => {
  await db.insert(suggestion).values({
    author: author,
    category: category,
    phrase_text: phrase_text,
    error: error,
    correction: correction,
    notes: notes,
  });
};
