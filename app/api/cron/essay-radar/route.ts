import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { generateWeeklyRadar } from "@/lib/essay/radar-service";
export const maxDuration = 60;
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const actual = Buffer.from(request.headers.get("authorization") ?? "");
  const expected = Buffer.from(`Bearer ${secret ?? ""}`);
  if (!secret || actual.length !== expected.length || !timingSafeEqual(actual, expected)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const result = await generateWeeklyRadar();
    return NextResponse.json({ ok: Boolean(result.data), pending: Boolean(result.pending) }, { status: result.pending ? 202 : 200 });
  } catch { return NextResponse.json({ error: "Radar generation failed" }, { status: 503 }); }
}
