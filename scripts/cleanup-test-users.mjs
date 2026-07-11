/**
 * Löscht alle Auth-Benutzer und zugehörige Daten (Cascade).
 * Benötigt SUPABASE_SERVICE_ROLE_KEY in .env
 *
 * Usage: node scripts/cleanup-test-users.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "../.env");

if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    "Fehler: NEXT_PUBLIC_SUPABASE_URL und SUPABASE_SERVICE_ROLE_KEY müssen gesetzt sein."
  );
  console.error("Service Role Key: Supabase Dashboard → Settings → API → service_role");
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function listAllUsers() {
  const users = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) throw error;
    users.push(...data.users);
    if (data.users.length < perPage) break;
    page += 1;
  }

  return users;
}

async function main() {
  console.log("Lade Benutzer…");
  const users = await listAllUsers();
  console.log(`${users.length} Benutzer gefunden.`);

  if (users.length === 0) {
    console.log("Nichts zu löschen.");
    return;
  }

  for (const user of users) {
    console.log(`Lösche ${user.email ?? user.id}…`);
    const { error } = await admin.auth.admin.deleteUser(user.id);
    if (error) {
      console.error(`  Fehler: ${error.message}`);
    } else {
      console.log("  OK");
    }
  }

  console.log("Cleanup abgeschlossen.");
}

main().catch((err) => {
  console.error("Cleanup fehlgeschlagen:", err);
  process.exit(1);
});
