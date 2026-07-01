"use server";

import { and, asc, desc, eq, ilike, inArray, notInArray, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db/drizzle";
import { withRetry } from "@/db/withRetry";
import { phrase } from "@/db/schema";
import { sql } from "drizzle-orm/sql";
import { cache } from "react";
import type { SortOption } from "@/lib/searchParams";

// Expressão de ordenação da listagem. Padrão: id ascendente.
function orderByFor(sort: SortOption) {
  switch (sort) {
    case "likes":
      return [desc(phrase.likes), asc(phrase.id)];
    case "dislikes":
      return [desc(phrase.dislikes), asc(phrase.id)];
    default:
      return [asc(phrase.id)];
  }
}

export const getData = cache(async (sort: SortOption = "id") => {
  const data = await withRetry(() =>
    db
      .select()
      .from(phrase)
      .orderBy(...orderByFor(sort))
  );
  return data;
});

export const getIds = cache(async () => {
  const data = await withRetry(() =>
    db
      .select()
      .from(phrase)
      .orderBy(sql`id`)
  );
  return data.map((p) => p.id);
});

export const getRandomPhrase = async (except: string[]) => {
  const exceptIds = except.map(Number).filter((n) => !Number.isNaN(n));
  const data = await withRetry(() =>
    db
      .select()
      .from(phrase)
      .where(exceptIds.length > 0 ? notInArray(phrase.id, exceptIds) : undefined)
      .orderBy(sql`random()`)
      .limit(1)
  );
  return data[0];
};

export const getPhraseById = cache(async (id: number) => {
  try {
    const data = await withRetry(() =>
      db
        .select()
        .from(phrase)
        .where(eq(phrase.id, id))
        .limit(1)
    );

    return data[0] || null;
  } catch (error) {
    console.error("Error fetching phrase:", error);
    return null;
  }
});

export const getPhrasesByCategory = cache(
  async (category: string, sort: SortOption = "id") => {
    const data = await withRetry(() =>
      db
        .select()
        .from(phrase)
        .where(eq(phrase.category, category))
        .orderBy(...orderByFor(sort))
    );
    return data;
  }
);

// Busca as frases dos ids informados, preservando a ordem do array de entrada
// (ex.: a ordem dos likes/dislikes salvos no localStorage).
export const getPhrasesByIds = async (ids: number[]) => {
  if (ids.length === 0) return [];

  const data = await withRetry(() =>
    db
      .select()
      .from(phrase)
      .where(inArray(phrase.id, ids))
  );

  const byId = new Map(data.map((p) => [p.id, p]));
  return ids
    .map((id) => byId.get(id))
    .filter((p): p is (typeof data)[number] => p !== undefined);
};

// Escapa os curingas de LIKE para que o termo seja tratado como texto literal.
const escapeLike = (term: string) => term.replace(/[\\%_]/g, (c) => `\\${c}`);

// Busca por termos no corpo e no título da frase. Cada termo precisa casar (AND);
// dentro de um termo, casa em phrase_text OU title (case-insensitive).
export const searchPhrases = cache(
  async (query: string, sort: SortOption = "id", category: string | null = null) => {
    const terms = query.trim().split(/\s+/).filter(Boolean);
    if (terms.length === 0) return [];

    const conditions = terms.map((term) => {
      const pattern = `%${escapeLike(term)}%`;
      return or(ilike(phrase.phrase_text, pattern), ilike(phrase.title, pattern));
    });

    if (category) conditions.push(eq(phrase.category, category));

    const data = await withRetry(() =>
      db
        .select()
        .from(phrase)
        .where(and(...conditions))
        .orderBy(...orderByFor(sort))
    );
    return data;
  }
);

// Lista ordenada de ids de um contexto (categoria/busca/ordenação), espelhando
// exatamente a seleção da home — usada pela navegação contextual do detalhe.
export const getContextIds = cache(
  async (
    category: string | null = null,
    sort: SortOption = "id",
    q: string = ""
  ): Promise<number[]> => {
    const rows = q
      ? await searchPhrases(q, sort, category)
      : category
      ? await getPhrasesByCategory(category, sort)
      : await getData(sort);
    return rows.map((p) => p.id);
  }
);

export const likePhrase = async (id: number) => {
  await withRetry(() =>
    db
      .update(phrase)
      .set({
        likes: sql`${phrase.likes} + 1`,
      })
      .where(eq(phrase.id, id))
  );

  revalidatePath(`/${id}`);
};

export const dislikePhrase = async (id: number) => {
  await withRetry(() =>
    db
      .update(phrase)
      .set({
        dislikes: sql`${phrase.dislikes} + 1`,
      })
      .where(eq(phrase.id, id))
  );

  revalidatePath(`/${id}`);
};

export const removeLike = async (id: number) => {
  await withRetry(() =>
    db
      .update(phrase)
      .set({
        likes: sql`GREATEST(${phrase.likes} - 1, 0)`,
      })
      .where(eq(phrase.id, id))
  );

  revalidatePath(`/${id}`);
};

export const removeDislike = async (id: number) => {
  await withRetry(() =>
    db
      .update(phrase)
      .set({
        dislikes: sql`GREATEST(${phrase.dislikes} - 1, 0)`,
      })
      .where(eq(phrase.id, id))
  );

  revalidatePath(`/${id}`);
};
