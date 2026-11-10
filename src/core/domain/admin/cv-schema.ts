import { z } from "zod";

/** Structured resume read from a CV. Shared by the import route, the apply action and the admin UI. */
const month = z.string().regex(/^\d{4}(-\d{2})?$/, "Use YYYY or YYYY-MM");
const text = (max: number) => z.string().trim().max(max);

export const cvSchema = z.object({
  experiences: z.array(z.object({
    organization: text(120).min(1),
    title: text(120).min(1),
    employmentType: z.enum(["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP", "FREELANCE", "VOLUNTEER"]),
    location: text(120).optional(),
    startDate: month,
    endDate: month.nullable().optional(),
    description: text(1200),
  })).max(40),
  educations: z.array(z.object({
    institution: text(120).min(1),
    degree: text(160).min(1),
    fieldOfStudy: text(160).optional(),
    startDate: month.optional(),
    endDate: month.optional(),
    grade: text(40).optional(),
    description: text(800).optional(),
  })).max(20),
  certificates: z.array(z.object({
    name: text(200).min(1),
    provider: text(120).min(1),
    issueDate: month,
    expiryDate: month.optional(),
    description: text(800),
  })).max(60),
  achievements: z.array(z.object({
    title: text(200).min(1),
    issuer: text(120).optional(),
    date: text(20).optional(),
  })).max(30),
});

export type CvData = z.infer<typeof cvSchema>;
export const CV_SECTIONS = ["experiences", "educations", "certificates", "achievements"] as const;
export type CvSection = (typeof CV_SECTIONS)[number];

/** Looser shape for the AI to fill (no regex or length rules, which Gemini rejects). Normalised, then checked with cvSchema. */
const s = z.string();
export const cvModelSchema = z.object({
  experiences: z.array(z.object({
    organization: s, title: s,
    employmentType: z.enum(["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP", "FREELANCE", "VOLUNTEER"]),
    location: s.optional(), startDate: s, endDate: s.nullable().optional(), description: s,
  })),
  educations: z.array(z.object({
    institution: s, degree: s, fieldOfStudy: s.optional(), startDate: s.optional(), endDate: s.optional(),
    grade: s.optional(), description: s.optional(),
  })),
  certificates: z.array(z.object({ name: s, provider: s, issueDate: s, expiryDate: s.optional(), description: s })),
  achievements: z.array(z.object({ title: s, issuer: s.optional(), date: s.optional() })),
});

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

/** "Aug 2026", "2026-8", "08/2026", "2026" -> "2026-08" / "2026". "Current"/"Present" -> null. */
export function normaliseMonth(v?: string | null): string | null | undefined {
  if (v == null) return v;
  const t = v.trim().toLowerCase();
  if (!t || /^(current|present|now|ongoing|today)$/.test(t)) return null;
  const year = t.match(/(19|20)\d{2}/)?.[0];
  if (!year) return undefined;
  const name = MONTHS.findIndex((m) => t.includes(m));
  const num = t.match(/(?:^|\D)(\d{1,2})(?:\D|$)/)?.[1];
  const m = name >= 0 ? name + 1 : num && +num >= 1 && +num <= 12 ? +num : 0;
  return m ? `${year}-${String(m).padStart(2, "0")}` : year;
}
