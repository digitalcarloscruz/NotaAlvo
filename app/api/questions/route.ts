import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

import { TOPICS } from "@/lib/domain/adaptive-engine";

const querySchema = z.object({
  topic: z.string().max(100).optional(),
  page: z.coerce.number().int().min(0).max(1000).default(0),
  career: z.string().max(80).default("enem-2026"),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

const difficultyLabel: Record<string, "Fácil" | "Média" | "Difícil"> = {
  easy: "Fácil",
  medium: "Média",
  hard: "Difícil",
};

const adaptiveTopicAliases: Record<string, string> = {
  "LINGUAGENS.INTERPRETACAO": "LING.INTERPRETACAO",
  "CONHECIMENTOS_GERAIS.CIDADANIA": "GERAL.CIDADANIA",
};

export async function GET(request: Request) {
  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ error: "Banco de questões indisponível." }, { status: 503 });
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "Entre para acessar questões validadas." }, { status: 401 });
  const parsed = querySchema.safeParse(Object.fromEntries(new URL(request.url).searchParams));
  if (!parsed.success) return NextResponse.json({ error: "Filtros inválidos." }, { status: 400 });

  const buildQuery = () => supabase
    .from("questions")
    .select("id,subject,topic,statement,options,difficulty,source_type,exams!inner(role,exam_year,organizer),question_axes(name),question_topics(is_primary,topics(stable_code)),question_sources(source_name,source_url,official),question_source_links(relation,content_sources(title,url,rights_status))")
    .eq("status", "published")
    .eq("validation_status", "validated")
    .order("created_at", { ascending: false })
    .range(parsed.data.page * parsed.data.limit, (parsed.data.page + 1) * parsed.data.limit - 1);
  const selectedTopic = TOPICS.find(topic => topic.id === parsed.data.topic);
  const subjects = selectedTopic ? [selectedTopic.subject] : parsed.data.career === "enem-2026" ? ["Linguagens", "Matemática", "Ciências Humanas", "Ciências da Natureza"] : [];
  const perSubject = Math.max(1, Math.ceil(parsed.data.limit / Math.max(1, subjects.length)));
  const { data: answered } = await supabase.from("user_answers").select("question_id").eq("user_id", auth.user.id).order("answered_at", { ascending: false }).limit(500);
  const seen = [...new Set((answered ?? []).map(item => item.question_id))];
  const selections = subjects.length ? subjects : [null];
  const responses = await Promise.all(selections.map(async subject => {
    let query = buildQuery();
    if (parsed.data.career === "enem-2026") query = query.ilike("exams.role", "%ENEM%").eq("source_type", "official_exam");
    if (subject) query = query.eq("subject", subject);
    if (seen.length) query = query.not("id", "in", `(${seen.join(",")})`);
    return await query.range(parsed.data.page * perSubject, (parsed.data.page + 1) * perSubject - 1);
  }));
  const error = responses.find(response => response.error)?.error;
  const data = responses.flatMap(response => response.data ?? []);
  if (error) return NextResponse.json({ error: "Não foi possível carregar o banco de questões." }, { status: 500 });

  return NextResponse.json({
    data: (data ?? []).map((item) => {
      const exam = Array.isArray(item.exams) ? item.exams[0] : item.exams;
      const axis = Array.isArray(item.question_axes) ? item.question_axes[0] : item.question_axes;
      const sources = Array.isArray(item.question_sources) ? item.question_sources : [];
      const linkedSources = (Array.isArray(item.question_source_links) ? item.question_source_links : []).map((link) => Array.isArray(link.content_sources) ? link.content_sources[0] : link.content_sources).filter(Boolean);
      const normalizedSource = sources.find((candidate) => candidate.official) ?? sources[0];
      const linkedSource = linkedSources.find((candidate) => candidate?.rights_status === "official") ?? linkedSources[0];
      const topicLinks = Array.isArray(item.question_topics) ? item.question_topics : [];
      const primaryTopic = topicLinks.find((candidate) => candidate.is_primary) ?? topicLinks[0];
      const normalizedTopic = Array.isArray(primaryTopic?.topics) ? primaryTopic.topics[0] : primaryTopic?.topics;
      const source = normalizedSource ? { name: normalizedSource.source_name, url: normalizedSource.source_url, official: normalizedSource.official || item.source_type === "official_exam" }
        : linkedSource ? { name: linkedSource.title, url: linkedSource.url, official: linkedSource.rights_status === "official" } : null;
      return {
        id: item.id,
        axis: axis?.name ?? item.subject,
        exam: exam ? `${exam.role} ${exam.exam_year}` : "Questão validada",
        difficulty: difficultyLabel[item.difficulty ?? "medium"] ?? "Média",
        topic: item.topic ?? item.subject,
        topicId: normalizedTopic?.stable_code ? (adaptiveTopicAliases[normalizedTopic.stable_code] ?? normalizedTopic.stable_code) : undefined,
        text: item.statement,
        options: Array.isArray(item.options) ? item.options : [],
        sourceType: item.source_type,
        source,
      };
    }),
  });
}
