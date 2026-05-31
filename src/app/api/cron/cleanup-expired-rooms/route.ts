import { NextResponse } from "next/server";
import { cleanupExpiredRooms } from "@/server/cleanup-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.error("Expired room cleanup failed: CRON_SECRET is not configured");
    return NextResponse.json({ error: "Cron secret is not configured" }, { status: 500 });
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await cleanupExpiredRooms();

  return NextResponse.json({
    ok: true,
    ...result
  });
}
