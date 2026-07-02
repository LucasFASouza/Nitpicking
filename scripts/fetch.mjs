#!/usr/bin/env node
/*
 * Reads from the Neon DB for the `suggestion-editor` agent (companion to push.mjs).
 *
 * The agent's workflow is: refresh the local phrase backup ONCE, pull the pending
 * suggestion queue, then do all dedup/maxid work locally against the backup file
 * (no per-phrase network calls). So this script does exactly two things:
 *
 *   node scripts/fetch.mjs backup [--out backup/phrase.json]
 *       Downloads EVERY published phrase and (re)writes it to backup/phrase.json,
 *       sorted by id. Run this first. Prints a one-line summary to stdout.
 *
 *   node scripts/fetch.mjs suggestions [--status "In analysis"] [--id N] [--ids 1,2,3]
 *       The pending queue to triage. Defaults to status "In analysis"; pass --status
 *       to override, or --id/--ids for specific rows. Returns ALL fields (id, title,
 *       author, category, phrase_text, error, correction, notes, status) as JSON on
 *       stdout — read notes/category/title too, not just phrase_text.
 *
 * Both commands hit the network. Reads DATABASE_URL from .env at the repo root.
 */

import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
config({ path: resolve(repoRoot, ".env") });

const args = process.argv.slice(2);
const cmd = args.find((a) => !a.startsWith("--"));
const flag = (name) => {
  const i = args.indexOf(`--${name}`);
  return i !== -1 && args[i + 1] && !args[i + 1].startsWith("--") ? args[i + 1] : undefined;
};

if (!cmd) {
  console.error("Usage: node scripts/fetch.mjs <backup|suggestions> [--out F] [--status S] [--id N] [--ids 1,2]");
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
  if (cmd === "backup") {
    const rel = flag("out") ?? "backup/phrase.json";
    const path = resolve(repoRoot, rel);
    const rows = await withRetry(
      () => sql`
        SELECT id, author, category, phrase_text, error, correction, likes, dislikes, title
        FROM phrase
        ORDER BY id`
    );
    writeFileSync(path, JSON.stringify(rows, null, 2) + "\n");
    const maxid = rows.reduce((m, r) => Math.max(m, Number(r.id)), 0);
    out({ written: rows.length, maxid, path: rel });
  } else if (cmd === "suggestions") {
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
  } else {
    console.error(`Unknown command "${cmd}". Use backup | suggestions.`);
    process.exit(1);
  }
} catch (e) {
  console.error(`Query failed: ${e.message}`);
  process.exit(1);
}
