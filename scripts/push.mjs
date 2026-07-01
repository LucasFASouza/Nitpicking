#!/usr/bin/env node
/*
 * Applies a review JSON (produced by the `suggestion-editor` agent) to the Neon DB:
 *   - inserts each accepted `formatted` phrase into the `phrase` table, and
 *   - updates the matching `suggestion` row's `status`:
 *       accepted (inserted)  -> "Done"
 *       REJECT               -> "Rejected"
 *       DUPLICATE            -> "Rejected"  (but never downgrades a row already "Done",
 *                                            e.g. an already-published original)
 *       REVIEW               -> left untouched (needs a human decision)
 *
 * Usage (run from the repo root):
 *   node scripts/push.mjs <review-file.json> [--dry-run] [--include-review] [--no-status]
 *
 *   --include-review  also treat REVIEW entries as accepted (insert + mark Done)
 *   --dry-run         print the planned inserts/status changes, write nothing
 *   --no-status       insert phrases only; do NOT touch the suggestion table
 *
 * Curate the review file first (delete/edit entries). `id`, `likes`, `dislikes` on
 * phrase are set by the DB. Status updates match `suggestion.id` to `source_id`.
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";

const scriptDir = dirname(fileURLToPath(import.meta.url));
// .env lives at the repo root (one level up from this folder).
config({ path: resolve(scriptDir, "..", ".env") });

const args = process.argv.slice(2);
const file = args.find((a) => !a.startsWith("--"));
const dryRun = args.includes("--dry-run");
const includeReview = args.includes("--include-review");
const noStatus = args.includes("--no-status");

if (!file) {
  console.error(
    "Usage: node scripts/push.mjs <review-file.json> [--dry-run] [--include-review] [--no-status]"
  );
  process.exit(1);
}
if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set (check .env at the repo root).");
  process.exit(1);
}

let reviews;
try {
  reviews = JSON.parse(readFileSync(file, "utf8"));
} catch (e) {
  console.error(`Could not read/parse ${file}: ${e.message}`);
  process.exit(1);
}
if (!Array.isArray(reviews)) {
  console.error("Expected the review file to be a JSON array.");
  process.exit(1);
}

const ACCEPTED = new Set(["ACCEPT", "ACCEPT-WITH-EDITS"]);
const allowed = includeReview ? new Set([...ACCEPTED, "REVIEW"]) : ACCEPTED;
const REQUIRED = ["author", "category", "phrase_text", "error", "correction", "title"];

const toPush = []; // accepted -> insert phrase + mark Done
const toReject = []; // REJECT or DUPLICATE -> mark Rejected (unless already Done)
const left = []; // REVIEW / unpushable -> untouched

for (const r of reviews) {
  const missing = r.formatted
    ? REQUIRED.filter((k) => !r.formatted[k] || !String(r.formatted[k]).trim())
    : [];

  if (allowed.has(r.verdict) && r.formatted && missing.length === 0) {
    toPush.push(r);
  } else if (r.verdict === "REJECT" || r.verdict === "DUPLICATE") {
    toReject.push(r);
  } else {
    const why = !r.formatted
      ? `${r.verdict} (no payload)`
      : missing.length
      ? `missing fields: ${missing.join(", ")}`
      : r.verdict === "REVIEW"
      ? "REVIEW (use --include-review to accept)"
      : r.verdict;
    left.push({ id: r.source_id, title: r.formatted?.title ?? r.verdict, why });
  }
}

console.log(
  `\n${reviews.length} review(s) · ${toPush.length} to insert · ` +
    `${toReject.length} to reject · ${left.length} left untouched` +
    (noStatus ? " (status updates OFF)" : "")
);

if (toPush.length) {
  console.log("\nInsert phrase + mark suggestion Done:");
  for (const r of toPush) {
    const f = r.formatted;
    if (!f.phrase_text.includes(f.error))
      console.log(`  ! #${r.source_id} "${f.title}" — WARNING: error is not a verbatim substring of phrase_text`);
    console.log(`  • #${r.source_id} [${f.category}] "${f.title}"`);
  }
}
if (!noStatus && toReject.length) {
  console.log("\nMark suggestion Rejected (REJECT + DUPLICATE; keeps rows already Done):");
  for (const r of toReject)
    console.log(`  • #${r.source_id} [${r.verdict}] — ${r.reason ?? ""}`);
}
if (left.length) {
  console.log("\nLeft untouched:");
  for (const l of left) console.log(`  – #${l.id} "${l.title}" — ${l.why}`);
}

if (dryRun) {
  console.log("\n--dry-run: no changes made.");
  process.exit(0);
}
if (toPush.length === 0 && (noStatus || toReject.length === 0)) {
  console.log("\nNothing to do.");
  process.exit(0);
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

// The `phrase` table was seeded with explicit ids, so its serial sequence can lag
// behind MAX(id) and make INSERTs collide on the primary key. Resync it first
// (idempotent): sets nextval to MAX(id)+1.
if (toPush.length) {
  await withRetry(
    () => sql`SELECT setval(pg_get_serial_sequence('phrase','id'), GREATEST((SELECT COALESCE(MAX(id),0) FROM phrase), 1), true)`
  );
}

// Sets status. For "Rejected" we never downgrade a row already "Done"
// (an already-published original shouldn't be flipped to Rejected).
async function setStatus(id, status) {
  if (noStatus || typeof id !== "number") return 0;
  const rows =
    status === "Rejected"
      ? await withRetry(
          () => sql`UPDATE suggestion SET status = ${status} WHERE id = ${id} AND status <> 'Done' RETURNING id`
        )
      : await withRetry(
          () => sql`UPDATE suggestion SET status = ${status} WHERE id = ${id} RETURNING id`
        );
  return rows.length; // number of rows actually changed
}

let inserted = 0;
let rejected = 0;
let failed = 0;

console.log("");
for (const r of toPush) {
  const f = r.formatted;
  try {
    const rows = await withRetry(
      () => sql`
        INSERT INTO phrase (title, author, category, phrase_text, error, correction)
        VALUES (${f.title}, ${f.author}, ${f.category}, ${f.phrase_text}, ${f.error}, ${f.correction})
        RETURNING id
      `
    );
    inserted++;
    console.log(`  ✓ inserted phrase #${rows[0].id} "${f.title}"`);
    const changed = await setStatus(r.source_id, "Done"); // only after a successful insert
    if (!noStatus && !changed)
      console.log(`      (suggestion #${r.source_id} not found — status unchanged)`);
  } catch (e) {
    failed++;
    console.error(`  ✗ "${f.title}" failed: ${e.message}`);
  }
}

let keptDone = 0;
if (!noStatus) {
  for (const r of toReject) {
    try {
      const changed = await setStatus(r.source_id, "Rejected");
      if (changed) {
        rejected++;
        console.log(`  ⊘ suggestion #${r.source_id} [${r.verdict}] → Rejected`);
      } else {
        keptDone++;
        console.log(`  – suggestion #${r.source_id} [${r.verdict}] kept (already Done / not found)`);
      }
    } catch (e) {
      failed++;
      console.error(`  ✗ reject #${r.source_id} failed: ${e.message}`);
    }
  }
}

console.log(
  `\nInserted ${inserted}/${toPush.length}` +
    (noStatus
      ? ""
      : ` · rejected ${rejected}/${toReject.length}` +
        (keptDone ? ` · ${keptDone} kept Done` : "")) +
    (failed ? ` · ${failed} failed` : "")
);
process.exit(failed ? 1 : 0);
