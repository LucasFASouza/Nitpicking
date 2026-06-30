"use server";

import { and, eq, ilike, inArray, notInArray, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db/drizzle";
import { phrase } from "@/db/schema";
import { sql } from "drizzle-orm/sql";
import { cache } from "react";
import type { NavContext } from "@/types/navContext";

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
  const exceptIds = except.map(Number).filter((n) => !Number.isNaN(n));
  const data = await db
    .select()
    .from(phrase)
    .where(exceptIds.length > 0 ? notInArray(phrase.id, exceptIds) : undefined)
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

export const getPhrasesByCategory = cache(async (category: string) => {
  const data = await db
    .select()
    .from(phrase)
    .where(eq(phrase.category, category))
    .orderBy(sql`id`);
  return data;
});

// Busca as frases dos ids informados, preservando a ordem do array de entrada
// (ex.: a ordem dos likes/dislikes salvos no localStorage).
export const getPhrasesByIds = async (ids: number[]) => {
  if (ids.length === 0) return [];

  const data = await db
    .select()
    .from(phrase)
    .where(inArray(phrase.id, ids));

  const byId = new Map(data.map((p) => [p.id, p]));
  return ids
    .map((id) => byId.get(id))
    .filter((p): p is (typeof data)[number] => p !== undefined);
};

// Escapa os curingas de LIKE para que o termo seja tratado como texto literal.
const escapeLike = (term: string) => term.replace(/[\\%_]/g, (c) => `\\${c}`);

// Busca por termos no corpo e no título da frase. Cada termo precisa casar (AND);
// dentro de um termo, casa em phrase_text OU title (case-insensitive).
export const searchPhrases = cache(async (query: string) => {
  const terms = query.trim().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [];

  const conditions = terms.map((term) => {
    const pattern = `%${escapeLike(term)}%`;
    return or(ilike(phrase.phrase_text, pattern), ilike(phrase.title, pattern));
  });

  const data = await db
    .select()
    .from(phrase)
    .where(and(...conditions))
    .orderBy(sql`id`);
  return data;
});

// Lista ordenada de ids de um contexto derivável no servidor (categoria/busca/all).
// Curtidas/descurtidas vêm do localStorage e são resolvidas no cliente.
export const getIdsForContext = async (
  ctx: NavContext
): Promise<number[]> => {
  switch (ctx.type) {
    case "category": {
      const rows = await getPhrasesByCategory(ctx.value);
      return rows.map((p) => p.id);
    }
    case "search": {
      const rows = await searchPhrases(ctx.value);
      return rows.map((p) => p.id);
    }
    default:
      return getIds();
  }
};

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
      likes: sql`GREATEST(${phrase.likes} - 1, 0)`,
    })
    .where(eq(phrase.id, id));

  revalidatePath(`/${id}`);
};

export const removeDislike = async (id: number) => {
  await db
    .update(phrase)
    .set({
      dislikes: sql`GREATEST(${phrase.dislikes} - 1, 0)`,
    })
    .where(eq(phrase.id, id));

  revalidatePath(`/${id}`);
};
