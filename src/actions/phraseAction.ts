"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db/drizzle";
import { phrase } from "@/db/schema";
import { sql } from "drizzle-orm/sql";
import { cache } from "react";

export const getData = cache(async () => {
  const data = await db.select().from(phrase);
  return data;
});

export const getIds = cache(async () => {
  const data = await db
    .select()
    .from(phrase)
    .orderBy(sql`id`);
  return data.map((p) => p.id);
});

export const getRandomPhrase = async (except: string[]) => {
  const data = await db
    .select()
    .from(phrase)
    .where(except.length > 0 ? sql`id NOT IN (${except})` : sql`true`)
    .orderBy(sql`random()`)
    .limit(1);
  return data[0];
};

export const getPhraseById = cache(async (id: number) => {
  try {
    const data = await db
      .select()
      .from(phrase)
      .where(eq(phrase.id, id))
      .limit(1);

    return data[0] || null;
  } catch (error) {
    console.error("Error fetching phrase:", error);
    return null;
  }
});

export const likePhrase = async (id: number) => {
  await db
    .update(phrase)
    .set({
      likes: sql`${phrase.likes} + 1`,
    })
    .where(eq(phrase.id, id));

  revalidatePath(`/${id}`);
};

export const dislikePhrase = async (id: number) => {
  await db
    .update(phrase)
    .set({
      dislikes: sql`${phrase.dislikes} + 1`,
    })
    .where(eq(phrase.id, id));

  revalidatePath(`/${id}`);
};

export const removeLike = async (id: number) => {
  await db
    .update(phrase)
    .set({
      likes: sql`${phrase.likes} - 1`,
    })
    .where(eq(phrase.id, id));

  revalidatePath(`/${id}`);
};

export const removeDislike = async (id: number) => {
  await db
    .update(phrase)
    .set({
      dislikes: sql`${phrase.dislikes} - 1`,
    })
    .where(eq(phrase.id, id));

  revalidatePath(`/${id}`);
};
