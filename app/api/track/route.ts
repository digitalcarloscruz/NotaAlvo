import { NextResponse } from "next/server";
import { z } from "zod";
import { FUNNEL_EVENTS } from "@/lib/analytics/funnel";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
const schema = z.object({ visitorId: z.string().min(8).max(64), event: z.enum(FUNNEL_EVENTS), path: z.string().max(200).optional() });

export async function POST(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin) return new NextResponse(null, { status: 403 });
  const body = await request.text();
  if (body.length > 1000) return new NextResponse(null, { status: 413 });
  let input;
  try { input = schema.safeParse(JSON.parse(body)); } catch { return new NextResponse(null, { status: 422 }); }
  if (!input.success) return new NextResponse(null, { status: 422 });
  const admin = createAdminClient();
  if (!admin) return new NextResponse(null, { status: 204 });
  await admin.from("funnel_events").insert({ visitor_id: input.data.visitorId, event: input.data.event, path: input.data.path ?? null });
  return new NextResponse(null, { status: 204 });
}
