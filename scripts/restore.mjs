#!/usr/bin/env node
/*
 * One-shot restore of the backup/*.json full-table dumps into a fresh DB.
 *
 *   node scripts/restore.mjs [--dry-run]
 *
 * Inserts every row VERBATIM (preserving explicit ids) into phrase, suggestion,
 * and correction — in that FK-safe order (correction.phrase_id -> phrase.id).
 * Refuses to run if any target table already has rows. After inserting, resyncs
 * each serial sequence to MAX(id)+1. Reads DATABASE_URL from .env at repo root.
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
config({ path: resolve(repoRoot, ".env") });

const dryRun = process.argv.includes("--dry-run");

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set (check .env at the repo root).");
  process.exit(1);
}

async function withRetry(fn, retries = 5, delayMs = 300) {
  let lastError;
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt < retries - 1)
        await new Promise((r) => setTimeout(r, delayMs * (attempt + 1)));
    }
  }
  throw lastError;
}

const load = (name) =>
  JSON.parse(readFileSync(resolve(repoRoot, "backup", name), "utf8"));

const sql = neon(process.env.DATABASE_URL);
const nn = (v) => (v === undefined ? null : v); // JSON may omit a null column

// Per-table insert (one tagged-template statement each; column sets are fixed).
// Order below is FK-safe: phrase -> suggestion -> correction.
const TABLES = [
  {
    name: "phrase",
    file: "phrase.json",
    count: () => sql`SELECT COUNT(*)::int AS n FROM phrase`,
    seq: () => sql`SELECT setval(pg_get_serial_sequence('phrase','id'), GREATEST((SELECT COALESCE(MAX(id),0) FROM phrase), 1), true)`,
    insert: (r) => sql`
      INSERT INTO phrase (id, title, author, category, phrase_text, error, correction, likes, dislikes)
      VALUES (${r.id}, ${nn(r.title)}, ${nn(r.author)}, ${r.category}, ${r.phrase_text}, ${r.error}, ${r.correction}, ${nn(r.likes) ?? 0}, ${nn(r.dislikes) ?? 0})`,
  },
  {
    name: "suggestion",
    file: "suggestion.json",
    count: () => sql`SELECT COUNT(*)::int AS n FROM suggestion`,
    seq: () => sql`SELECT setval(pg_get_serial_sequence('suggestion','id'), GREATEST((SELECT COALESCE(MAX(id),0) FROM suggestion), 1), true)`,
    insert: (r) => sql`
      INSERT INTO suggestion (id, title, author, category, phrase_text, error, correction, notes, status)
      VALUES (${r.id}, ${nn(r.title)}, ${nn(r.author)}, ${r.category}, ${r.phrase_text}, ${r.error}, ${r.correction}, ${nn(r.notes)}, ${r.status})`,
  },
  {
    name: "correction",
    file: "correction.json",
    count: () => sql`SELECT COUNT(*)::int AS n FROM correction`,
    seq: () => sql`SELECT setval(pg_get_serial_sequence('correction','id'), GREATEST((SELECT COALESCE(MAX(id),0) FROM correction), 1), true)`,
    insert: (r) => sql`
      INSERT INTO correction (id, phrase_id, body, source_url, status, created_at)
      VALUES (${r.id}, ${r.phrase_id}, ${r.body}, ${nn(r.source_url)}, ${r.status}, ${nn(r.created_at)})`,
  },
];

// Guard: never restore over a non-empty table.
for (const t of TABLES) {
  const [{ n }] = await withRetry(t.count);
  if (n > 0) {
    console.error(`Table "${t.name}" already has ${n} row(s). Refusing to restore into a non-empty DB.`);
    process.exit(1);
  }
}

for (const t of TABLES) {
  const rows = load(t.file);
  console.log(`\n${t.name}: ${rows.length} row(s) to insert`);
  if (dryRun) continue;

  let inserted = 0;
  for (const row of rows) {
    await withRetry(() => t.insert(row));
    inserted++;
  }
  console.log(`  ✓ inserted ${inserted}/${rows.length} into ${t.name}`);
  await withRetry(t.seq); // resync serial so future inserts don't collide
}

console.log(dryRun ? "\n--dry-run: no changes made." : "\nRestore complete.");
process.exit(0);
