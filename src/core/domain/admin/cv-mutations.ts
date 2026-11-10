"use server";

/**
 * Step 2 of "Update from CV": write the reviewed resume to the database.
 * Each chosen section is replaced as a whole, so the site matches the CV exactly.
 * Admin only (public endpoint, so the session is checked first).
 */
import { z } from "zod";
import { validateAdminSession } from "./queries";
import { withShield } from "@/infrastructure/security/shield";
import { revalidateContent } from "@/infrastructure/cache/content";
import { cvSchema, CV_SECTIONS, type CvData, type CvSection } from "./cv-schema";
import type { ActionResult } from "./content-mutations";

const applySchema = z.object({
  draft: cvSchema,
  sections: z.array(z.enum(CV_SECTIONS)).min(1, "Choose at least one section."),
  cvUrl: z.string().url().startsWith("https://").max(500).nullable().optional(),
});

/** "2026-03" -> "2026-03-01", "2026" -> "2026-01-01" (DATE columns). */
const toDate = (d?: string | null) => (d ? (d.length === 4 ? `${d}-01-01` : `${d}-01`) : null);

type Db = Awaited<ReturnType<typeof validateAdminSession>>;

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

async function applyCvImportBase(input: { draft: CvData; sections: CvSection[]; cvUrl?: string | null }): Promise<ActionResult> {
  try {
    const db = await validateAdminSession();
    const parsed = applySchema.safeParse(input);
    if (!parsed.success) return { success: false, message: parsed.error.issues[0]?.message || "The preview is invalid. Read the CV again." };
    const { draft, sections, cvUrl } = parsed.data;
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
      revalidateContent("experiences");
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
      revalidateContent("educations");
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
      revalidateContent("certificates");
      done.push(`${draft.certificates.length} certificates`);
    }

    if (sections.includes("achievements")) {
      await replaceAll(db, "achievements", draft.achievements.map((a) => ({
        title: a.title,
        issuer: a.issuer || null,
        achieved_date: a.date || null,
      })));
      revalidateContent("achievements");
      done.push(`${draft.achievements.length} achievements`);
    }

    if (cvUrl) {
      const { data: row } = await db.from("profile").select("id").eq("id", 1).maybeSingle();
      if (row) {
        const { error } = await db.from("profile").update({ cv_url: cvUrl, updated_at: new Date().toISOString() }).eq("id", 1);
        if (error) throw error;
        revalidateContent("profile");
        done.push("the Download CV link");
      }
    }

    return { success: true, message: `Website updated: ${done.join(", ")}.` };
  } catch (err) {
    console.error("applyCvImport failed:", err);
    return { success: false, message: err instanceof Error ? err.message : "Couldn't update the website." };
  }
}

const shieldedApply = withShield("cv_import_apply", applyCvImportBase, { limit: 10, auditLog: true });
export async function applyCvImport(input: { draft: CvData; sections: CvSection[]; cvUrl?: string | null }) {
  return shieldedApply(input);
}
