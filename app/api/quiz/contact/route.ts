import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { quizContactSchema } from "@/lib/enem/quiz-contact";
import { evaluateQuiz, parseQuizAttempt } from "@/lib/enem/landing-quiz";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export async function POST(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin) return NextResponse.json({ error: "Origem inválida." }, { status: 403 });
  const body = await request.text();
  if (body.length > 6000) return NextResponse.json({ error: "Dados inválidos." }, { status: 413 });
  let input;
  try { input = JSON.parse(body); } catch { return NextResponse.json({ error: "Dados inválidos." }, { status: 422 }); }
  const contact = quizContactSchema.safeParse(input?.contact);
  const attempt = parseQuizAttempt(input?.attempt);
  const result = attempt && evaluateQuiz(attempt.answers, attempt.version);
  if (!contact.success || !result || input?.website) return NextResponse.json({ error: "Confira seus dados e conclua o quiz." }, { status: 422 });
  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "Não foi possível salvar. Tente novamente." }, { status: 503 });
  const fingerprint = createHash("sha256").update(contact.data.email + JSON.stringify(attempt)).digest("hex");
  const { error } = await admin.from("enem_quiz_contacts").upsert({
    ...contact.data, phone: contact.data.phone || null, fingerprint, attempt, result,
    privacy_version: "2026-09-07", updated_at: new Date().toISOString(),
  }, { onConflict: "fingerprint" });
  if (error) return NextResponse.json({ error: "Não foi possível salvar seus dados. Tente novamente em instantes." }, { status: 503 });
  return NextResponse.json({ result }, { headers: { "Cache-Control": "no-store" } });
}

export async function GET() {
  const { createClient } = await import("@/lib/supabase/server");
  const session = await createClient();
  const admin = createAdminClient();
  const auth = session && await session.auth.getUser();
  const user = auth?.data.user;
  if (!user || !admin) return NextResponse.json({ error: "Entre na sua conta para recuperar o quiz." }, { status: 401 });
  // Email is self-declared when signup confirmation is disabled. Never claim a lead by email.
  const { data, error } = await admin.from("asaas_orders").select("id,attempt").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (error) return NextResponse.json({ error: "Não foi possível recuperar o quiz." }, { status: 503 });
  return NextResponse.json({ data }, { headers: { "Cache-Control": "private, no-store" } });
}
