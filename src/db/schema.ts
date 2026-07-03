import { integer, text, pgTable, serial, timestamp } from "drizzle-orm/pg-core";

export const phrase = pgTable("phrase", {
  id: serial("id").primaryKey(),
  title: text("title").notNull().default("Um, Actually..."),
  author: text("author"),
  category: text("category").notNull(),
  phrase_text: text("phrase_text").notNull(),
  error: text("error").notNull(),
  correction: text("correction").notNull(),
  likes: integer("likes").default(0).notNull(),
  dislikes: integer("dislikes").default(0).notNull(),
});

export const suggestion = pgTable("suggestion", {
  id: serial("id").primaryKey(),
  title: text("title").notNull().default("Um, Actually..."),
  author: text("author"),
  category: text("category").notNull(),
  phrase_text: text("phrase_text").notNull(),
  error: text("error").notNull(),
  correction: text("correction").notNull(),
  notes: text("notes"),
  status: text("status").default("In analysis").notNull(),
});

// Correções enviadas por usuários sobre uma frase JÁ publicada (o usuário
// nitpicka o nitpick). Triadas pelo agente `correction-editor`, que reescreve a
// frase alvo. `phrase_id` aponta pra frase corrigida; `body` é o texto livre do
// usuário; `source_url` é opcional; `status` segue o mesmo ciclo de `suggestion`.
export const correction = pgTable("correction", {
  id: serial("id").primaryKey(),
  phrase_id: integer("phrase_id")
    .notNull()
    .references(() => phrase.id),
  body: text("body").notNull(),
  source_url: text("source_url"),
  status: text("status").default("In analysis").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});
