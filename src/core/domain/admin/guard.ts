import { NextResponse } from "next/server";
import { validateAdminSession } from "./queries";

/**
 * Route-handler guard. Middleware skips /api, so every admin API route
 * must call this itself. Returns a 401 response, or null when the caller is the admin.
 */
export async function requireAdminApi(): Promise<NextResponse | null> {
  try {
    await validateAdminSession();
    return null;
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: { "Cache-Control": "no-store" } });
  }
}
