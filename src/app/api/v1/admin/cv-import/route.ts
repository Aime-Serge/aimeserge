import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/core/domain/admin/guard";
import { validateAdminSession } from "@/core/domain/admin/queries";
import { rateLimit } from "@/infrastructure/security/rateLimit";
import { readCv, isPdf } from "@/core/domain/admin/cv-reader";

/**
 * Admin only. Step 1 of "Update from CV": upload a PDF, store it, and read it
 * into structured resume sections. Nothing on the site changes until the admin
 * reviews the preview and applies it (applyCvImport).
 */
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_BYTES = 4 * 1024 * 1024; // Vercel request body limit is 4.5 MB

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
  if (!isPdf(bytes)) {
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
    const draft = await readCv(bytes, apiKey);
    return NextResponse.json({ draft, cvUrl }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("CV read failed:", err);
    const message = err instanceof Error && err.message.startsWith("The CV") ? err.message : "Couldn't read the CV. Try again, or check that the PDF has selectable text.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
