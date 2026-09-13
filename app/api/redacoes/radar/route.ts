import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { radarWeek } from "@/lib/essay/radar";
import { generateWeeklyRadar } from "@/lib/essay/radar-service";

export const maxDuration = 60;
export async function GET() {
  const session = await createClient();
  const { data: auth } = session ? await session.auth.getUser() : { data: { user: null } };
  if (!session || !auth.user) return NextResponse.json({ error: "Entre para consultar o radar semanal." }, { status: 401 });
  const { data, error } = await session.from("essay_radar_weeks").select("payload").eq("week_start", radarWeek()).maybeSingle();
  if (error) return NextResponse.json({ error: "O radar semanal está temporariamente indisponível. Os temas de treino continuam disponíveis." }, { status: 503 });
  return NextResponse.json({ data: data?.payload ?? null });
}
export async function POST() {
  const session = await createClient();
  const { data } = session ? await session.auth.getUser() : { data: { user: null } };
  if (!data.user) return NextResponse.json({ error: "Entre para consultar o radar semanal." }, { status: 401 });
  try {
    const result = await generateWeeklyRadar();
    return NextResponse.json(result, { status: result.pending ? 202 : 200 });
  } catch {
    return NextResponse.json({ error: "Não foi possível concluir a pesquisa com fontes recentes. Use os temas de treino e tente novamente mais tarde." }, { status: 503 });
  }
}
