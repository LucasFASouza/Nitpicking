CREATE TABLE "phrase" (
	"id" serial PRIMARY KEY NOT NULL,
	"author" text,
	"category" text NOT NULL,
	"phrase_text" text NOT NULL,
	"error" text NOT NULL,
	"correction" text NOT NULL,
	"likes" integer DEFAULT 0 NOT NULL,
	"dislikes" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "suggestion" (
	"id" serial PRIMARY KEY NOT NULL,
	"author" text,
	"category" text NOT NULL,
	"phrase_text" text NOT NULL,
	"error" text NOT NULL,
	"correction" text NOT NULL,
	"notes" text,
	"status" text DEFAULT 'In analysis' NOT NULL
);
