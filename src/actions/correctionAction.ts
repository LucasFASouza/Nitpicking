"use server";
import { db } from "@/db/drizzle";
import { correction } from "@/db/schema";

const MAX_BODY = 1000;
const MAX_URL = 300;
// Mesma checagem defensiva do validateInput das suggestions.
const DANGEROUS = /<script|javascript:|data:/i;

// Registra a correção de um usuário sobre uma frase já publicada. Só o texto
// livre (`body`) é obrigatório; `source_url` é opcional (http/https). Entra na
// fila com status "In analysis" pro agente `correction-editor` triar.
export const addCorrection = async (
  phrase_id: number,
  body: string,
  source_url: string
) => {
  const trimmedBody = body?.trim() ?? "";
  const trimmedUrl = source_url?.trim() ?? "";

  if (!Number.isInteger(phrase_id) || phrase_id <= 0)
    throw new Error("Invalid phrase");
  if (trimmedBody.length < 3 || trimmedBody.length > MAX_BODY)
    throw new Error("Invalid correction");
  if (trimmedUrl.length > MAX_URL) throw new Error("Invalid source");
  if (trimmedUrl && !/^https?:\/\//i.test(trimmedUrl))
    throw new Error("Invalid source URL");
  if (DANGEROUS.test(trimmedBody) || DANGEROUS.test(trimmedUrl))
    throw new Error("Invalid input");

  try {
    await db.insert(correction).values({
      phrase_id,
      body: trimmedBody.slice(0, MAX_BODY),
      source_url: trimmedUrl ? trimmedUrl.slice(0, MAX_URL) : null,
    });
  } catch (error) {
    console.error("Database error:", error);
    throw new Error("Failed to add correction");
  }
};
