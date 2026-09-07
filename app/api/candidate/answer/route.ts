import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const answerSchema = z.object({
  questionId: z.string().uuid(),
  selectedOption: z.number().int().min(0).max(25),
  idempotencyKey: z.string().uuid(),
  responseTimeMs: z.number().int().min(0).max(3_600_000).nullable().optional(),
  diagnosticSessionId: z.string().uuid().nullable().optional(),
  reviewId: z.string().uuid().nullable().optional(),
});

import { createInitialState, calculatePriorities } from "@/lib/domain/adaptive-engine";
import type { RotaState } from "@/lib/domain/rota";

async function refreshRecommendations(admin: NonNullable<ReturnType<typeof createAdminClient>>, userId: string) {
  const { data: rows } = await admin.from("topic_mastery")
    .select("topic_id,mastery_score,confidence,questions_answered,correct_answers,wrong_answers,last_question_at,topics(stable_code,name,subjects(name))")
    .eq("user_id", userId).gt("questions_answered", 0);
  if (!rows?.length) return;
  const { data: saved } = await admin.from("candidate_states").select("state").eq("user_id", userId).maybeSingle();
  const state = (saved?.state as RotaState | undefined) ?? createInitialState();
  const topicCode = (row: typeof rows[number]) => {
    const topic = Array.isArray(row.topics) ? row.topics[0] : row.topics;
    const aliases: Record<string,string> = { "LINGUAGENS.INTERPRETACAO": "LING.INTERPRETACAO", "CONHECIMENTOS_GERAIS.CIDADANIA": "GERAL.CIDADANIA" };
    return aliases[topic?.stable_code ?? ""] ?? topic?.stable_code ?? "";
  };
  for (const row of rows) {
    const current = state.mastery[topicCode(row)];
    if (current) state.mastery[topicCode(row)] = { ...current, score: Number(row.mastery_score)/100, confidence: Number(row.confidence), evidenceCount: row.questions_answered, correct: row.correct_answers, wrong: row.wrong_answers, lastAnsweredAt: row.last_question_at };
  }
  const profilePriorities = calculatePriorities(state);
  const ranked = rows.map((row) => {
    const mastery = Number(row.mastery_score) || 0;
    const confidence = Number(row.confidence) || 0;
    const answered = Number(row.questions_answered) || 0;
    const wrong = Number(row.wrong_answers) || 0;
    const topicPriority = profilePriorities.find(item => item.id === topicCode(row));
    const score = topicPriority?.priority ?? 50;
    const factors = { sharedModelPriority: score };
    const action = answered < 3 || mastery < 50 ? "learn" : wrong >= Number(row.correct_answers) || mastery < 75 ? "practice" : "review";
    const topic = Array.isArray(row.topics) ? row.topics[0] : row.topics;
    return { topicId: row.topic_id, examId: null, action, priorityScore: score, masteryScore: mastery, confidence, questionsAnswered: answered, factors,
      reasonCode: `shared_adaptive_v2.${action}`, reason: topicPriority?.reason ?? `Domínio de ${Math.round(mastery)}%, confiança de ${Math.round(confidence * 100)}% e ${answered} resposta${answered === 1 ? "" : "s"} registrada${answered === 1 ? "" : "s"}.`,
      topicCode: topic?.stable_code ?? "", topic: topic?.name ?? "Tópico" };
  }).sort((a, b) => b.priorityScore - a.priorityScore).slice(0, 7).map((item, index) => ({ ...item, rank: index + 1,
    evidence: { masteryScore: item.masteryScore, confidence: item.confidence, questionsAnswered: item.questionsAnswered } }));
  await admin.rpc("replace_adaptive_recommendations", { p_user_id: userId, p_items: ranked });
}

export async function POST(request: Request) {
  const session = await createClient();
  const admin = createAdminClient();
  if (!session || !admin) return NextResponse.json({ error: "Serviço de respostas indisponível." }, { status: 503 });
  const { data: auth } = await session.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "Entre para registrar sua resposta." }, { status: 401 });
  const parsed = answerSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Resposta inválida." }, { status: 422 });
  let reviewDueAt: string | null = null;
  if (parsed.data.reviewId) {
    const { data: review } = await admin.from("review_queue").select("id,question_id,due_at").eq("id", parsed.data.reviewId).eq("user_id", auth.user.id).eq("status", "scheduled").maybeSingle();
    if (review) reviewDueAt = review.due_at;
    if (!review || new Date(review.due_at) > new Date() || review.question_id !== parsed.data.questionId) return NextResponse.json({ error: "Revisão indisponível." }, { status: 404 });
  }

  const { data, error } = await admin.rpc("record_question_answer", {
    p_user_id: auth.user.id,
    p_question_id: parsed.data.questionId,
    p_selected_option: parsed.data.selectedOption,
    p_idempotency_key: parsed.data.idempotencyKey,
    p_response_time_ms: parsed.data.responseTimeMs ?? null,
    p_diagnostic_session_id: parsed.data.diagnosticSessionId ?? null,
  });
  if (error) {
    const known = error.message.includes("question_not_available") ? 404
      : error.message.includes("invalid_selected_option") ? 422
        : error.message.includes("idempotency_conflict") ? 409 : 500;
    return NextResponse.json({ error: known === 500 ? "Não foi possível registrar a resposta." : error.message }, { status: known });
  }
  const result = data?.[0];
  if (!result) return NextResponse.json({ error: "Resposta não confirmada." }, { status: 500 });
  if (parsed.data.reviewId && !result.correct) await admin.from("review_queue").delete().eq("user_id", auth.user.id).eq("source_answer_id", result.answer_id);
  if (parsed.data.reviewId && !result.correct && !result.already_recorded) {
    await admin.from("review_queue").update({ interval_step: 1, due_at: new Date(Date.now() + 86400000).toISOString(), last_reviewed_at: new Date().toISOString() }).eq("id", parsed.data.reviewId).eq("user_id", auth.user.id).eq("due_at", reviewDueAt!);
  }
  await refreshRecommendations(admin, auth.user.id);
  await admin.from("pilot_events").upsert({
    user_id: auth.user.id,
    event_type: "question_answered",
    event_key: `answer:${result.answer_id}`,
    metadata: { correct: Boolean(result.correct), diagnostic: Boolean(parsed.data.diagnosticSessionId), review: Boolean(parsed.data.reviewId) },
  }, { onConflict: "user_id,event_key", ignoreDuplicates: true });
  return NextResponse.json({
    data: {
      answerId: result.answer_id,
      correct: result.correct,
      correctOption: result.correct_option,
      explanation: result.explanation,
      alreadyRecorded: result.already_recorded,
    },
  }, { status: result.already_recorded ? 200 : 201 });
}
