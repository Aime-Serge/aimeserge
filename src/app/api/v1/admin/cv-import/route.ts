import { NextRequest, NextResponse } from "next/server";
import { generateObject } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { requireAdminApi } from "@/core/domain/admin/guard";
import { validateAdminSession } from "@/core/domain/admin/queries";
import { cvSchema, cvModelSchema, normaliseMonth } from "@/core/domain/admin/cv-schema";
import { RESUME_EXCLUDE } from "@/config/resume";
import { rateLimit } from "@/infrastructure/security/rateLimit";

/**
 * Admin only. Step 1 of "Update from CV": upload a PDF, store it, and read it
 * into structured resume sections. Nothing on the site changes until the admin
 * reviews the preview and applies it (applyCvImport).
 */
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_BYTES = 4 * 1024 * 1024; // Vercel request body limit is 4.5 MB

const RULES = `You turn a CV into structured data for a personal website.
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

export async function POST(request: NextRequest) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const limited = await rateLimit.check(5, 60 * 60 * 1000, "cv_import"); // 5 per hour
  if (!limited.success) return NextResponse.json({ error: "Too many imports. Try again in an hour." }, { status: 429 });

  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "GEMINI_API_KEY is not set, so the CV can't be read." }, { status: 500 });

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Choose a PDF file." }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "The PDF is larger than 4 MB." }, { status: 400 });

  const bytes = new Uint8Array(await file.arrayBuffer());
  // Check the real file signature, not just the name or browser-supplied type.
  if (String.fromCharCode(...bytes.slice(0, 5)) !== "%PDF-") {
    return NextResponse.json({ error: "That file isn't a PDF." }, { status: 400 });
  }

  // Store the CV so the site's "Download CV" button can point to it.
  let cvUrl: string | null = null;
  try {
    const supabase = await validateAdminSession();
    const { data, error } = await supabase.storage
      .from("artifacts")
      .upload(`cv/${Date.now()}-cv.pdf`, bytes, { contentType: "application/pdf", upsert: false });
    if (error) throw error;
    cvUrl = supabase.storage.from("artifacts").getPublicUrl(data.path).data.publicUrl;
  } catch (err) {
    console.error("CV upload failed:", err);
    // Reading can still go ahead; the admin just won't get a new download link.
  }

  try {
    const google = createGoogleGenerativeAI({ apiKey });
    const { object } = await generateObject({
      model: google("gemini-2.5-flash"),
      schema: cvModelSchema,
      system: RULES,
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
        .map((e) => ({ ...e, startDate: opt(e.startDate) ?? "", endDate: e.endDate == null ? null : normaliseMonth(e.endDate) ?? null })),
      educations: object.educations
        .filter((e) => !excluded(e.institution))
        .map((e) => ({ ...e, startDate: opt(e.startDate), endDate: opt(e.endDate) })),
      certificates: object.certificates
        .filter((c) => !excluded(c.provider) && !excluded(c.name))
        .map((c) => ({ ...c, issueDate: opt(c.issueDate) ?? "", expiryDate: opt(c.expiryDate) })),
      achievements: object.achievements,
    };
    // Drop entries without a usable date rather than failing the whole import.
    candidate.experiences = candidate.experiences.filter((e) => e.startDate);
    candidate.certificates = candidate.certificates.filter((c) => c.issueDate);

    const checked = cvSchema.safeParse(candidate);
    if (!checked.success) {
      console.error("CV draft failed validation:", checked.error.issues.slice(0, 3));
      return NextResponse.json({ error: "The CV was read but some entries look wrong. Try again." }, { status: 502 });
    }
    const draft = checked.data;

    return NextResponse.json({ draft, cvUrl }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("CV read failed:", err);
    return NextResponse.json({ error: "Couldn't read the CV. Try again, or check that the PDF has selectable text." }, { status: 502 });
  }
}
