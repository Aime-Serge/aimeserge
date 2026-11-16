#!/usr/bin/env node
/**
 * Checks that the website, the database and the admin are set up correctly.
 *
 *   npm run check:setup                      # read-only checks
 *   npm run check:setup -- --write-test      # also add, read and remove a test entry
 *   npm run check:setup -- --site https://aimeserge.vercel.app   # also check the live site
 *   npm run check:setup -- --email-test     # also send yourself a test "new message" email
 *
 * Reads keys from .env.local (never uploaded). Prints no secret values.
 */
import { createClient } from "@supabase/supabase-js";
import nextEnv from "@next/env";

nextEnv.loadEnvConfig(process.cwd(), true, { info: () => {}, error: console.error });

const args = process.argv.slice(2);
const WRITE_TEST = args.includes("--write-test");
const siteIdx = args.indexOf("--site");
const SITE = siteIdx >= 0 ? args[siteIdx + 1] : null;
const EMAIL_TEST = args.includes("--email-test");

let failures = 0;
let warnings = 0;
const ok = (msg) => console.log(`  ✓ ${msg}`);
const bad = (msg, fix) => { failures++; console.log(`  ✗ ${msg}${fix ? `\n      → ${fix}` : ""}`); };
const warn = (msg, fix) => { warnings++; console.log(`  ! ${msg}${fix ? `\n      → ${fix}` : ""}`); };
const section = (t) => console.log(`\n${t}`);

const env = (k) => process.env[k]?.trim() || "";

// ─── 1. Settings ─────────────────────────────────────────────────────────
section("1. Settings (.env.local)");
const URL_ = env("NEXT_PUBLIC_SUPABASE_URL");
const ANON = env("NEXT_PUBLIC_SUPABASE_ANON_KEY");
const SERVICE = env("SUPABASE_SERVICE_ROLE_KEY");
const ADMIN_EMAIL = env("ADMIN_EMAIL");

const where = "Supabase → Project Settings → API";
if (/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(URL_)) ok("Supabase address");
else bad("NEXT_PUBLIC_SUPABASE_URL is missing or not a Supabase address", `Copy "Project URL" from ${where}`);
ANON ? ok("Public (anon) key") : bad("NEXT_PUBLIC_SUPABASE_ANON_KEY is missing", `Copy the "anon public" key from ${where}`);
SERVICE ? ok("Service role key") : bad("SUPABASE_SERVICE_ROLE_KEY is missing", `Copy the "service_role" key from ${where}. Keep it secret.`);
if (SERVICE && SERVICE === ANON) bad("The service role key is the same as the anon key", "They must be the two different keys from the API page");
/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(ADMIN_EMAIL) ? ok("Admin email") : bad("ADMIN_EMAIL is missing or not an email", "Use the email you will sign in to /admin with");
env("JWT_SECRET").length >= 32 ? ok("Sign-in secret (32+ characters)") : bad("JWT_SECRET is missing or shorter than 32 characters", "Generate one: openssl rand -base64 48");
env("NEXT_PUBLIC_SITE_URL") ? ok("Site address") : warn("NEXT_PUBLIC_SITE_URL is not set", "Set it to https://aimeserge.vercel.app");
env("GEMINI_API_KEY") || env("GOOGLE_GENERATIVE_AI_API_KEY") ? ok("AI key (CV import, assistant)") : warn("GEMINI_API_KEY is not set", "Needed for CV import and the site assistant");
env("CRON_SECRET") ? ok("Refresh secret (CV automation)") : warn("CRON_SECRET is not set", "Needed for the CV automation to refresh pages");
const NOTIFY = env("INQUIRY_NOTIFY_EMAIL") || ADMIN_EMAIL;
env("RESEND_API_KEY")
  ? ok(`Contact-form emails go to ${NOTIFY || "(no address set)"}`)
  : warn("RESEND_API_KEY is not set: contact messages are saved but not emailed to you", "Create a free key at resend.com → API Keys");
if (env("RESEND_API_KEY") && !env("RESEND_FROM_EMAIL")) warn("Using Resend's test sender: emails reach only the address you signed up to Resend with, and visitors get no confirmation", "Verify your domain in Resend, then set RESEND_FROM_EMAIL");

if (!URL_ || !ANON || !SERVICE) {
  console.log("\nStopping: the database can't be checked without the three Supabase values above.");
  process.exit(1);
}

const opts = { auth: { persistSession: false, autoRefreshToken: false } };
const pub = createClient(URL_, ANON, opts);   // what visitors' pages use
const admin = createClient(URL_, SERVICE, opts); // what the admin uses

// ─── 2. Connection and tables ────────────────────────────────────────────
section("2. Database connection and content");
const TABLES = [
  ["profile", "Homepage intro"], ["projects", "Projects"], ["research", "Research"],
  ["articles", "Blog articles"], ["experiences", "Experience"], ["educations", "Education"],
  ["certificates", "Certificates"], ["achievements", "Awards"], ["organizations", "Organisations"],
  ["contacts", "Messages"], ["knowledge", "Assistant knowledge"], ["security_logs", "Security log"],
];
let connected = false;
const missing = [];
for (const [t, label] of TABLES) {
  const { count, error } = await admin.from(t).select("*", { count: "exact", head: true });
  if (error) {
    if (/relation|does not exist|schema cache/i.test(error.message)) missing.push(t);
    else if (/invalid api key|jwt|apikey/i.test(error.message)) { bad("The service role key was rejected", `Copy it again from ${where}`); break; }
    else bad(`${label}: ${error.message}`);
    continue;
  }
  connected = true;
  ok(`${label}: ${count} ${count === 1 ? "entry" : "entries"}`);
}
if (missing.length) {
  bad(`Missing tables: ${missing.join(", ")}`,
    missing.length > 6
      ? "This database is new. Run: DATABASE_URL='…' bash scripts/apply-db-migrations.sh --all"
      : "Run: DATABASE_URL='…' bash scripts/apply-db-migrations.sh");
}
if (!connected) {
  console.log("\nStopping: couldn't read the database.");
  process.exit(1);
}

// ─── 3. What visitors can and can't see ──────────────────────────────────
section("3. Visitor access (security rules)");
{
  const { error } = await pub.from("projects").select("id").limit(1);
  error ? bad(`Visitors can't read projects: ${error.message}`, "Check the anon key, then run the migrations") : ok("Visitors can read published content");

  const { data: leaked, error: cErr } = await pub.from("contacts").select("id").limit(1);
  if (!cErr && leaked?.length) bad("Visitors can read contact messages", "Run the migrations: 20261109120000_rls_lockdown.sql locks this down");
  else ok("Contact messages are private");

  const { count: drafts } = await admin.from("articles").select("*", { count: "exact", head: true }).eq("status", "DRAFT");
  if (drafts) {
    const { data: seen } = await pub.from("articles").select("id").eq("status", "DRAFT").limit(1);
    seen?.length ? bad("Visitors can read draft articles", "Run the migrations (RLS lockdown)") : ok("Draft articles are hidden from visitors");
  }
}

// ─── 4. Search, storage, admin account ───────────────────────────────────
section("4. Search, file uploads and admin account");
{
  const { error } = await admin.rpc("search_site", { q: "software", max_results: 1 });
  error ? bad(`Site search function: ${error.message}`, "Run the migrations (20261109140000_full_text_search.sql)") : ok("Site search works");

  const { data: bucket, error: bErr } = await admin.storage.getBucket("artifacts");
  if (bErr || !bucket) bad("Upload storage 'artifacts' doesn't exist", "Run the migrations (20261116120000_storage_artifacts_bucket.sql)");
  else bucket.public ? ok("Upload storage is ready") : warn("Upload storage is private, so uploaded PDFs and images won't open for visitors", "Run the migrations, or make the 'artifacts' bucket public in Supabase → Storage");

  const { data: users, error: uErr } = await admin.auth.admin.listUsers({ perPage: 1000 });
  const me = users?.users?.find((u) => u.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase());
  if (uErr) bad(`Couldn't list sign-in accounts: ${uErr.message}`);
  else if (!me) bad(`No sign-in account for ${ADMIN_EMAIL}`, "Supabase → Authentication → Users → Add user → Create new user (tick 'Auto confirm'). Use a strong password.");
  else if (!me.email_confirmed_at) bad(`The account ${ADMIN_EMAIL} isn't confirmed`, "Supabase → Authentication → Users → confirm the user");
  else ok(`Admin sign-in account exists for ${ADMIN_EMAIL}`);
}

// ─── 5. Optional: write test ─────────────────────────────────────────────
if (WRITE_TEST) {
  section("5. Write test (adds, reads and removes a test entry)");
  const slug = `setup-check-${Date.now()}`;
  const { data: row, error } = await admin.from("projects").insert({
    slug, title: "Setup check (temporary)", description: "Temporary row created by scripts/check-setup.mjs.",
    category: "Test", is_visible: false, featured: false,
  }).select("id").single();
  if (error) bad(`Couldn't add a project: ${error.message}`);
  else {
    ok("Admin can add content");
    const { data: hidden } = await pub.from("projects").select("id").eq("id", row.id);
    hidden?.length ? bad("A hidden project is visible to visitors", "Check the projects read policy") : ok("Hidden content stays hidden from visitors");
    const { error: uErr } = await admin.from("projects").update({ title: "Setup check (edited)" }).eq("id", row.id);
    uErr ? bad(`Couldn't edit: ${uErr.message}`) : ok("Admin can edit content");
    const { error: dErr } = await admin.from("projects").delete().eq("id", row.id);
    dErr ? bad(`Couldn't delete the test entry (slug ${slug}): ${dErr.message}`) : ok("Admin can delete content (test entry removed)");
  }
  const path = `setup-check/${Date.now()}.txt`;
  const { error: upErr } = await admin.storage.from("artifacts").upload(path, new Blob(["ok"], { type: "text/plain" }), { contentType: "text/plain" });
  if (upErr) {
    // The bucket only allows PDFs and images, so text is expected to be refused; try a tiny PNG.
    const png = Uint8Array.from(atob("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="), (c) => c.charCodeAt(0));
    const p2 = path.replace(/\.txt$/, ".png");
    const { error: e2 } = await admin.storage.from("artifacts").upload(p2, png, { contentType: "image/png" });
    if (e2) bad(`Couldn't upload a file: ${e2.message}`);
    else { ok("Admin can upload files"); await admin.storage.from("artifacts").remove([p2]); }
  } else { ok("Admin can upload files"); await admin.storage.from("artifacts").remove([path]); }
}

// ─── Optional: email test ────────────────────────────────────────────────
if (EMAIL_TEST) {
  section("Email test (sends one email to you)");
  if (!env("RESEND_API_KEY")) bad("RESEND_API_KEY is not set");
  else {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${env("RESEND_API_KEY")}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: env("RESEND_FROM_EMAIL") || "Aime Serge website <onboarding@resend.dev>",
        to: NOTIFY,
        subject: "Test: contact-form emails work",
        text: "This is a test from scripts/check-setup.mjs. New contact-form messages will arrive like this.",
      }),
    });
    const j = await r.json().catch(() => ({}));
    r.ok ? ok(`Test email sent to ${NOTIFY}. Check your inbox (and spam).`)
      : bad(`Resend refused the email: ${j.message || r.status}`, /testing emails|own email/i.test(j.message || "") ? "With the test sender, INQUIRY_NOTIFY_EMAIL must be your Resend sign-up email" : "Check RESEND_API_KEY");
  }
}

// ─── 6. Optional: live site ──────────────────────────────────────────────
if (SITE) {
  section(`6. Live site (${SITE})`);
  try {
    const r = await fetch(new URL("/api/v1/health", SITE), { cache: "no-store" });
    const h = await r.json();
    if (h.database === "connected") ok(`Live site is connected; pages show ${h.content === "database" ? "database content" : "built-in content (no visible projects in the database yet)"}`);
    else if (h.database === "not_configured") bad("Live site has no database settings", "Add the variables in Vercel → Settings → Environment Variables (Production), then redeploy");
    else bad("Live site can't reach the database", "Check the Supabase values in Vercel match .env.local, then redeploy");
  } catch (e) {
    bad(`Couldn't reach ${SITE}: ${e.message}`);
  }
}

console.log(`\n${failures ? `✗ ${failures} problem${failures === 1 ? "" : "s"} to fix` : "✓ All checks passed"}${warnings ? `, ${warnings} optional item${warnings === 1 ? "" : "s"}` : ""}.`);
process.exit(failures ? 1 : 0);
