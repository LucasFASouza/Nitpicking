#!/usr/bin/env node
/*
 * Reads from the Neon DB for the `suggestion-editor` agent (companion to push.mjs).
 * Everything is printed to stdout as JSON so the agent can parse it.
 *
 * Usage (run from the repo root):
 *   node scripts/fetch.mjs suggestions [--status "In analysis"] [--id N] [--ids 1,2,3]
 *   node scripts/fetch.mjs phrases --grep "<term>"        # dedup search (ILIKE, published phrases)
 *   node scripts/fetch.mjs phrase --id N                  # one published phrase by id
 *   node scripts/fetch.mjs maxid                          # { "maxid": N } — current max phrase id
 *
 *   suggestions : pending submissions to triage. Defaults to status "In analysis";
 *                 pass --status to override, or --id/--ids to fetch specific rows.
 *                 Returns ALL fields (id, title, author, category, phrase_text,
 *                 error, correction, notes, status) — read notes/category/title too.
 *   phrases     : published phrases for duplicate detection. --grep matches the term
 *                 (case-insensitive) against title/phrase_text/error/correction.
 *   maxid       : the highest published phrase id (for the provisional next id).
 *
 * Reads DATABASE_URL from .env at the repo root, same as push.mjs.
 */

import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";

const scriptDir = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(scriptDir, "..", ".env") });

const args = process.argv.slice(2);
const cmd = args.find((a) => !a.startsWith("--"));
const flag = (name) => {
  const i = args.indexOf(`--${name}`);
  return i !== -1 && args[i + 1] && !args[i + 1].startsWith("--") ? args[i + 1] : undefined;
};

if (!cmd) {
  console.error(
    "Usage: node scripts/fetch.mjs <suggestions|phrases|phrase|maxid> [--status S] [--id N] [--ids 1,2] [--grep term]"
  );
  process.exit(1);
}
if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set (check .env at the repo root).");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

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

const out = (v) => process.stdout.write(JSON.stringify(v, null, 2) + "\n");

try {
  if (cmd === "suggestions") {
    const id = flag("id");
    const ids = flag("ids");
    const status = flag("status") ?? "In analysis";
    let rows;
    if (id) {
      rows = await withRetry(() => sql`SELECT * FROM suggestion WHERE id = ${Number(id)}`);
    } else if (ids) {
      const list = ids.split(",").map((n) => Number(n.trim())).filter((n) => !Number.isNaN(n));
      rows = await withRetry(() => sql`SELECT * FROM suggestion WHERE id = ANY(${list}) ORDER BY id`);
    } else {
      rows = await withRetry(() => sql`SELECT * FROM suggestion WHERE status = ${status} ORDER BY id`);
    }
    out(rows);
  } else if (cmd === "phrases") {
    const grep = flag("grep");
    if (!grep) {
      console.error('phrases requires --grep "<term>" (avoid dumping the whole table).');
      process.exit(1);
    }
    const like = `%${grep}%`;
    const rows = await withRetry(
      () => sql`
        SELECT id, title, category, phrase_text, error, correction
        FROM phrase
        WHERE title ILIKE ${like} OR phrase_text ILIKE ${like}
           OR error ILIKE ${like} OR correction ILIKE ${like}
        ORDER BY id`
    );
    out(rows);
  } else if (cmd === "phrase") {
    const id = flag("id");
    if (!id) {
      console.error("phrase requires --id N.");
      process.exit(1);
    }
    const rows = await withRetry(() => sql`SELECT * FROM phrase WHERE id = ${Number(id)}`);
    out(rows[0] ?? null);
  } else if (cmd === "maxid") {
    const rows = await withRetry(() => sql`SELECT COALESCE(MAX(id), 0) AS maxid FROM phrase`);
    out({ maxid: Number(rows[0].maxid) });
  } else {
    console.error(`Unknown command "${cmd}". Use suggestions | phrases | phrase | maxid.`);
    process.exit(1);
  }
} catch (e) {
  console.error(`Query failed: ${e.message}`);
  process.exit(1);
}
