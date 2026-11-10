import { generateObject } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { cvSchema, cvModelSchema, normaliseMonth, type CvData } from "./cv-schema";
import { RESUME_EXCLUDE } from "@/config/resume";

/**
 * Reads a CV PDF into structured resume sections with Gemini, then checks the
 * result in code (dates, lengths, exclusion list). Throws if the result fails
 * the checks, so a bad read never reaches the site.
 * Shared by the /admin import and the automatic GitHub sync (scripts/cv-sync.ts).
 */
export const CV_RULES = `You turn a CV into structured data for a personal website.
- Copy facts exactly: organisation names, titles, dates. Never invent anything.
- Dates as YYYY-MM (or YYYY if no month). Ongoing roles: endDate null.
- employmentType: INTERNSHIP for internships, VOLUNTEER for volunteer roles, PART_TIME for ambassador/part-time, otherwise FULL_TIME.
- Founder or co-founder roles listed in the headline or summary with a start date are experiences too.
- Rewrite each description in plain, simple English for non-technical readers, first person, 1–3 sentences.
- Remove percentages and impact numbers unless the CV says where they come from. Keep rankings like "top 1%" and counts like "15+ projects".
- Certificates come from education/training programmes and the certifications list; merge duplicates.
- Achievements are awards and competition placings.
- Leave out references, phone numbers, emails and hobbies.
- Leave out anything from these organisations: ${RESUME_EXCLUDE.join(", ") || "none"}.`;

export function isPdf(bytes: Uint8Array) {
  return String.fromCharCode(...bytes.slice(0, 5)) === "%PDF-";
}

export async function readCv(bytes: Uint8Array, apiKey: string): Promise<CvData> {
  if (!isPdf(bytes)) throw new Error("That file isn't a PDF.");

  const google = createGoogleGenerativeAI({ apiKey });
  const { object } = await generateObject({
    model: google("gemini-2.5-flash"),
    schema: cvModelSchema,
    system: CV_RULES,
    messages: [{
      role: "user",
      content: [
        { type: "text", text: "Read this CV." },
        { type: "file", data: bytes, mediaType: "application/pdf" },
      ],
    }],
  });

  // Enforce the exclusion list in code too, not only in the prompt.
  const excluded = (name?: string) => RESUME_EXCLUDE.some((x) => name?.toLowerCase().includes(x.toLowerCase()));
  const opt = (v?: string | null) => normaliseMonth(v) ?? undefined;
  const candidate = {
    experiences: object.experiences
      .filter((e) => !excluded(e.organization))
      .map((e) => ({ ...e, startDate: opt(e.startDate) ?? "", endDate: e.endDate == null ? null : normaliseMonth(e.endDate) ?? null }))
      .filter((e) => e.startDate),
    educations: object.educations
      .filter((e) => !excluded(e.institution))
      .map((e) => ({ ...e, startDate: opt(e.startDate), endDate: opt(e.endDate) })),
    certificates: object.certificates
      .filter((c) => !excluded(c.provider) && !excluded(c.name))
      .map((c) => ({ ...c, issueDate: opt(c.issueDate) ?? "", expiryDate: opt(c.expiryDate) }))
      .filter((c) => c.issueDate),
    achievements: object.achievements,
  };

  const checked = cvSchema.safeParse(candidate);
  if (!checked.success) {
    const first = checked.error.issues[0];
    throw new Error(`The CV was read but an entry failed the checks (${first?.path.join(".")}: ${first?.message}).`);
  }
  // A CV with no roles at all is almost certainly a bad read.
  if (!checked.data.experiences.length) throw new Error("No experience was found in the CV, so nothing was changed.");
  return checked.data;
}
