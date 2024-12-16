import { integer, text, pgTable, serial } from "drizzle-orm/pg-core";

export const phrase = pgTable("phrase", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
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
  title: text("title").notNull(),
  author: text("author"),
  category: text("category").notNull(),
  phrase_text: text("phrase_text").notNull(),
  error: text("error").notNull(),
  correction: text("correction").notNull(),
  notes: text("notes"),
  status: text("status").default("In analysis").notNull(),
});
