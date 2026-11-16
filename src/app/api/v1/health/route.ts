import { NextRequest, NextResponse } from "next/server";
import { createPublicSupabaseClient } from "@/infrastructure/database/server";
import { rateLimit } from "@/infrastructure/security/rateLimit";

/**
 * Public, minimal status check: is the site connected to its database, and
 * do pages show database content or the built-in fallback?
 * Reveals no keys, hosts or error details.
 */
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous";
  if (!(await rateLimit.check(30, 60_000, `health:${ip}`)).success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const configured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY));
  let database: "connected" | "not_configured" | "unreachable" = configured ? "unreachable" : "not_configured";
  let content: "database" | "built-in" = "built-in";

  if (configured) {
    try {
      const db = createPublicSupabaseClient();
      const [profile, projects] = await Promise.all([
        db.from("profile").select("id", { count: "exact", head: true }),
        db.from("projects").select("id", { count: "exact", head: true }).eq("is_visible", true),
      ]);
      if (!profile.error && !projects.error) {
        database = "connected";
        content = (projects.count ?? 0) > 0 ? "database" : "built-in";
      }
    } catch {
      /* stays "unreachable" */
    }
  }

  return NextResponse.json(
    { database, content, checkedAt: new Date().toISOString() },
    { status: database === "connected" ? 200 : 503, headers: { "Cache-Control": "no-store" } },
  );
}
