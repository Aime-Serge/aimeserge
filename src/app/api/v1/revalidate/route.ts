import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { revalidateContent } from "@/infrastructure/cache/content";

/**
 * Purges cached pages after content changes outside the admin dashboard
 * (used by the automatic CV sync). Protected by CRON_SECRET as a bearer token.
 */
export const dynamic = "force-dynamic";

const ALLOWED = new Set(["experiences", "educations", "certificates", "achievements", "profile", "projects"]);

function authorised(header: string | null) {
  const secret = process.env.CRON_SECRET;
  if (!secret || !header) return false;
  const a = Buffer.from(header);
  const b = Buffer.from(`Bearer ${secret}`);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: NextRequest) {
  if (!authorised(request.headers.get("authorization"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json().catch(() => ({}));
  const tables: string[] = Array.isArray(body?.tables) ? body.tables.filter((t: unknown) => typeof t === "string" && ALLOWED.has(t)) : [];
  tables.forEach((t) => revalidateContent(t));
  return NextResponse.json({ revalidated: tables });
}
