"use server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db/drizzle";
import { phrase } from "@/db/schema";
import { sql } from "drizzle-orm/sql";

export const getData = async () => {
  const data = await db.select().from(phrase);
  return data;
};

export const getRandomPhrase = async () => {
  const data = await db.select().from(phrase).orderBy(sql`random()`).limit(1);
  return data[0];
}

export const addPhrase = async (
  id: number,
  author: string,
  category: string,
  phrase_text: string,
  error: string,
  correction: string
) => {
  await db.insert(phrase).values({
    id: id,
    author: author,
    category: category,
    phrase_text: phrase_text,
    error: error,
    correction: correction,
  });
};

export const deletePhrase = async (id: number) => {
  await db.delete(phrase).where(eq(phrase.id, id));

  revalidatePath("/");
};

export const likePhrase = async (id: number) => {
  await db
    .update(phrase)
    .set({
      likes: sql`${phrase.likes} + 1`,
    })
    .where(eq(phrase.id, id));

  revalidatePath("/");
};

export const dislikePhrase = async (id: number) => {
  await db
    .update(phrase)
    .set({
      dislikes: sql`${phrase.dislikes} + 1`,
    })
    .where(eq(phrase.id, id));

  revalidatePath("/");
};
