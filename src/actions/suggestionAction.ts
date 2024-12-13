"use server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db/drizzle";
import { suggestion } from "@/db/schema";
import { sql } from "drizzle-orm/sql";

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

export const updateSuggestion = async (id: number, status: string) => {
  await db
    .update(suggestion)
    .set({
      status: status,
    })
    .where(eq(suggestion.id, id));

  revalidatePath("/");
};

export const deleteSuggestion = async (id: number) => {
  await db.delete(suggestion).where(eq(suggestion.id, id));

  revalidatePath("/");
};
