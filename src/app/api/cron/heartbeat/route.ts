import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/infrastructure/database/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const authorization = request.headers.get("authorization");

  if (!cronSecret || authorization !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase.rpc("record_system_heartbeat");

  if (error) {
    console.error("System heartbeat failed:", error.message);
    return NextResponse.json({ error: "Heartbeat failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, heartbeat: data });
}