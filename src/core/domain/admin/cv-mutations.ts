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
import { writeCvToDb } from "./cv-db";
import type { ActionResult } from "./content-mutations";

const applySchema = z.object({
  draft: cvSchema,
  sections: z.array(z.enum(CV_SECTIONS)).min(1, "Choose at least one section."),
  cvUrl: z.string().url().startsWith("https://").max(500).nullable().optional(),
});

async function applyCvImportBase(input: { draft: CvData; sections: CvSection[]; cvUrl?: string | null }): Promise<ActionResult> {
  try {
    const db = await validateAdminSession();
    const parsed = applySchema.safeParse(input);
    if (!parsed.success) return { success: false, message: parsed.error.issues[0]?.message || "The preview is invalid. Read the CV again." };
    const { draft, sections, cvUrl } = parsed.data;
    const done = await writeCvToDb(db, draft, sections, cvUrl);
    sections.forEach((s) => revalidateContent(s));
    if (cvUrl) revalidateContent("profile");
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
