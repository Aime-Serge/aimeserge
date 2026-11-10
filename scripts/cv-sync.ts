/**
 * Automatic CV sync. Run by .github/workflows/cv-sync.yml whenever a PDF in
 * cv/ is pushed to main (or by hand: GEMINI_API_KEY=... npx tsx scripts/cv-sync.ts).
 *
 *  1. Picks the most recently committed PDF in cv/.
 *  2. Reads it with Gemini and checks the result (same rules as /admin import).
 *     If anything fails the checks, it stops and the site is left unchanged.
 *  3. Publishes the PDF as /cv/Aime_Serge_Ukobizaba_CV.pdf (the Download CV button).
 *  4. Writes src/config/resume.generated.json (the Resume page uses it).
 *  5. If database secrets are set, replaces the resume tables too and purges
 *     the site's cache, so the database (which wins over the file) matches.
 *  6. Posts a summary to Discord if DISCORD_WEBHOOK_URL is set.
 */
import { execFileSync } from "node:child_process";
import { appendFileSync, copyFileSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { createClient } from "@supabase/supabase-js";
import { readCv } from "../src/core/domain/admin/cv-reader";
import { writeCvToDb } from "../src/core/domain/admin/cv-db";
import { CV_SECTIONS, type CvData } from "../src/core/domain/admin/cv-schema";

const CV_DIR = "cv";
const PUBLIC_CV = "public/cv/Aime_Serge_Ukobizaba_CV.pdf";
const CV_URL = "/cv/Aime_Serge_Ukobizaba_CV.pdf";
const OUT = "src/config/resume.generated.json";
const SITE_URL = (process.env.SITE_URL || "https://aimeserge.vercel.app").replace(/\/$/, "");

function latestPdf(): string {
  const files = readdirSync(CV_DIR).filter((f) => f.toLowerCase().endsWith(".pdf")).map((f) => join(CV_DIR, f));
  if (!files.length) throw new Error(`No PDF found in ${CV_DIR}/.`);
  const committedAt = (f: string) => {
    try { return Number(execFileSync("git", ["log", "-1", "--format=%ct", "--", f]).toString().trim()) || 0; }
    catch { return 0; }
  };
  return files
    .map((f) => ({ f, t: committedAt(f) || statSync(f).mtimeMs / 1000 }))
    .sort((a, b) => b.t - a.t)[0].f;
}

function summary(d: CvData, file: string) {
  return [
    `CV: ${file}`,
    `Experience (${d.experiences.length}): ${d.experiences.map((e) => `${e.title}, ${e.organization}`).join("; ")}`,
    `Education (${d.educations.length}): ${d.educations.map((e) => e.institution).join("; ")}`,
    `Certificates: ${d.certificates.length} · Achievements: ${d.achievements.length}`,
  ].join("\n");
}

async function notify(text: string) {
  const url = process.env.DISCORD_WEBHOOK_URL;
  if (!url) return;
  await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content: text.slice(0, 1900) }) })
    .catch((e) => console.warn("Discord notification failed:", e));
}

async function main() {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set (add it as a GitHub Actions secret).");

  const file = latestPdf();
  console.log(`Reading ${file}…`);
  const bytes = new Uint8Array(readFileSync(file));
  if (bytes.length > 10 * 1024 * 1024) throw new Error("The CV is larger than 10 MB.");

  const data = await readCv(bytes, apiKey);

  mkdirSync("public/cv", { recursive: true });
  copyFileSync(file, PUBLIC_CV);
  writeFileSync(OUT, JSON.stringify({ generatedAt: new Date().toISOString(), source: file, cvUrl: CV_URL, data }, null, 2) + "\n");

  const lines = [summary(data, file)];

  const dbUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const dbKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (dbUrl && dbKey) {
    const db = createClient(dbUrl, dbKey, { auth: { persistSession: false } });
    const done = await writeCvToDb(db, data, CV_SECTIONS, `${SITE_URL}${CV_URL}`);
    lines.push(`Database updated: ${done.join(", ")}.`);
    if (process.env.CRON_SECRET) {
      const res = await fetch(`${SITE_URL}/api/v1/revalidate`, {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.CRON_SECRET}`, "Content-Type": "application/json" },
        body: JSON.stringify({ tables: [...CV_SECTIONS, "profile"] }),
      }).catch(() => null);
      lines.push(res?.ok ? "Site cache refreshed." : "Couldn't refresh the site cache; pages update within 24 hours.");
    }
  } else {
    lines.push("No database secrets: the Resume page will use the new data after the next deploy.");
  }

  const text = lines.join("\n");
  console.log(text);
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, `## Website updated from CV\n\n\`\`\`\n${text}\n\`\`\`\n`);
  await notify(`✅ Website updated from your CV\n${text}`);
}

main().catch(async (err) => {
  const msg = err instanceof Error ? err.message : String(err);
  console.error(`CV sync failed: ${msg}`);
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, `## CV sync failed\n\n${msg}\n\nThe website was not changed.\n`);
  await notify(`⚠️ CV sync failed, website not changed: ${msg}`);
  process.exit(1);
});
