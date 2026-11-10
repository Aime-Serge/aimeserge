import type { SupabaseClient } from "@supabase/supabase-js";
import type { CvData, CvSection } from "./cv-schema";

/**
 * Writes a checked resume to the database. Each chosen section is replaced as a
 * whole, so the site matches the CV exactly. No Next.js imports, so the
 * automatic GitHub sync (scripts/cv-sync.ts) can use it too.
 * Returns a short list of what changed.
 */
/** "2026-03" -> "2026-03-01", "2026" -> "2026-01-01" (DATE columns). */
const toDate = (d?: string | null) => (d ? (d.length === 4 ? `${d}-01-01` : `${d}-01`) : null);

type Db = SupabaseClient;

async function orgIds(db: Db, names: string[]): Promise<Map<string, string>> {
  const unique = [...new Set(names.map((n) => n.trim()))];
  const { data: existing, error } = await db.from("organizations").select("id, name").in("name", unique);
  if (error) throw error;
  const map = new Map((existing ?? []).map((o: { id: string; name: string }) => [o.name, o.id]));
  const missing = unique.filter((n) => !map.has(n));
  if (missing.length) {
    const { data: created, error: e2 } = await db.from("organizations").insert(missing.map((name) => ({ name }))).select("id, name");
    if (e2) throw e2;
    (created ?? []).forEach((o: { id: string; name: string }) => map.set(o.name, o.id));
  }
  return map;
}

/** Delete every row, then insert the new ones. */
async function replaceAll(db: Db, table: string, rows: object[]) {
  const { error } = await db.from(table).delete().not("id", "is", null);
  if (error) throw error;
  if (rows.length) {
    const { error: e2 } = await db.from(table).insert(rows);
    if (e2) throw e2;
  }
}

export async function writeCvToDb(db: Db, draft: CvData, sections: readonly CvSection[], cvUrl?: string | null): Promise<string[]> {
  const done: string[] = [];

  if (sections.includes("experiences")) {
    const ids = await orgIds(db, draft.experiences.map((e) => e.organization));
    await replaceAll(db, "experiences", draft.experiences.map((e) => ({
      company_id: ids.get(e.organization.trim()),
      title: e.title,
      employment_type: e.employmentType,
      location: e.location || null,
      location_type: "ON_SITE",
      start_date: toDate(e.startDate),
      end_date: toDate(e.endDate),
      description: e.description,
    })));
    done.push(`${draft.experiences.length} roles`);
  }

  if (sections.includes("educations")) {
    const ids = await orgIds(db, draft.educations.map((e) => e.institution));
    await replaceAll(db, "educations", draft.educations.map((e) => ({
      institution_id: ids.get(e.institution.trim()),
      degree: e.degree,
      field_of_study: e.fieldOfStudy || null,
      start_date: toDate(e.startDate),
      end_date: toDate(e.endDate),
      grade: e.grade || null,
      description: e.description || null,
    })));
    done.push(`${draft.educations.length} education entries`);
  }

  if (sections.includes("certificates")) {
    const ids = await orgIds(db, draft.certificates.map((c) => c.provider));
    await replaceAll(db, "certificates", draft.certificates.map((c) => ({
      name: c.name,
      provider: c.provider,
      issuer_id: ids.get(c.provider.trim()),
      issue_date: c.issueDate,
      expiration_date: c.expiryDate ? toDate(c.expiryDate) : null,
      description: c.description,
    })));
    done.push(`${draft.certificates.length} certificates`);
  }

  if (sections.includes("achievements")) {
    await replaceAll(db, "achievements", draft.achievements.map((a) => ({
      title: a.title,
      issuer: a.issuer || null,
      achieved_date: a.date || null,
    })));
    done.push(`${draft.achievements.length} achievements`);
  }

  if (cvUrl) {
    const { data: row } = await db.from("profile").select("id").eq("id", 1).maybeSingle();
    if (row) {
      const { error } = await db.from("profile").update({ cv_url: cvUrl, updated_at: new Date().toISOString() }).eq("id", 1);
      if (error) throw error;
      done.push("the Download CV link");
    }
  }
  return done;
}
