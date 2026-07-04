#!/usr/bin/env node
/**
 * Run a SQL migration file against the linked Supabase project.
 * Usage: SUPABASE_ACCESS_TOKEN=sbp_... node scripts/run-migration.mjs supabase/migrations/003_add_exam_id.sql
 */

import fs from "node:fs/promises";

const PROJECT_REF = "bsqhmgkagwvjesrlegqx";
const token = process.env.SUPABASE_ACCESS_TOKEN;
const migrationPath = process.argv[2];

if (!token) {
  console.error("Set SUPABASE_ACCESS_TOKEN (https://supabase.com/dashboard/account/tokens)");
  process.exit(1);
}

if (!migrationPath) {
  console.error("Usage: node scripts/run-migration.mjs <path-to.sql>");
  process.exit(1);
}

const sql = await fs.readFile(new URL(`../${migrationPath}`, import.meta.url), "utf8");

const res = await fetch(
  `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`,
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: sql }),
  },
);

const body = await res.text();
if (!res.ok) {
  console.error("Migration failed:", res.status, body);
  process.exit(1);
}

console.log(`Migration applied: ${migrationPath}`);
if (body && body !== "[]") console.log(body);
