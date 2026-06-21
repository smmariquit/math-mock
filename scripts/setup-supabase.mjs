#!/usr/bin/env node
/**
 * Creates exam_sessions via Supabase Management API.
 * Usage: SUPABASE_ACCESS_TOKEN=sbp_... node scripts/setup-supabase.mjs
 */

const PROJECT_REF = "bsqhmgkagwvjesrlegqx";
const token = process.env.SUPABASE_ACCESS_TOKEN;

if (!token) {
  console.error("Set SUPABASE_ACCESS_TOKEN (from https://supabase.com/dashboard/account/tokens)");
  process.exit(1);
}

const sql = await import("node:fs/promises").then((fs) =>
  fs.readFile(new URL("../supabase/setup.sql", import.meta.url), "utf8"),
);

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
  console.error("Failed:", res.status, body);
  process.exit(1);
}

console.log("Tables created successfully.");
console.log(body);
