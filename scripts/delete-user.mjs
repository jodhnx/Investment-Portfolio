/**
 * Löscht einen einzelnen Auth-Benutzer inkl. Cascade-Daten.
 * Benötigt SUPABASE_SERVICE_ROLE_KEY in .env
 *
 * Usage: node scripts/delete-user.mjs benst2018@gmail.com
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

const email = process.argv[2];
if (!email) {
  console.error("Usage: node scripts/delete-user.mjs <email>");
  process.exit(1);
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

async function main() {
  let page = 1;
  let user = null;

  while (!user) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 100 });
    if (error) throw error;
    user = data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
    if (data.users.length < 100) break;
    page += 1;
  }

  if (!user) {
    console.log(`Kein Benutzer mit E-Mail ${email} gefunden.`);
    return;
  }

  console.log(`Lösche ${user.email} (${user.id})…`);
  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) {
    console.error(`Fehler: ${error.message}`);
    process.exit(1);
  }
  console.log("Benutzer und zugehörige Daten (Cascade) gelöscht.");
}

main().catch((err) => {
  console.error("Löschen fehlgeschlagen:", err);
  process.exit(1);
});
