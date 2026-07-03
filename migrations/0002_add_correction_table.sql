CREATE TABLE "correction" (
	"id" serial PRIMARY KEY NOT NULL,
	"phrase_id" integer NOT NULL,
	"body" text NOT NULL,
	"source_url" text,
	"status" text DEFAULT 'In analysis' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "correction" ADD CONSTRAINT "correction_phrase_id_phrase_id_fk" FOREIGN KEY ("phrase_id") REFERENCES "public"."phrase"("id") ON DELETE no action ON UPDATE no action;