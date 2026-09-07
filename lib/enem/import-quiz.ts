import { getQuizQuestions, parseQuizAttempt, evaluateQuiz } from "./landing-quiz";
import { recordAnswer, recalculatePlan } from "@/lib/domain/adaptive-engine";
import type { RotaState } from "@/lib/domain/rota";
const topics = ["LING.INTERPRETACAO", "MAT.PROBLEMAS", "HUM.GEOGRAFIA", "NAT.FISICA", "LING.INTERPRETACAO", "MAT.PROBLEMAS", "HUM.HISTORIA", "NAT.QUIMICA", "LING.INTERPRETACAO", "MAT.PROBLEMAS", "HUM.FILOSOFIA_SOCIOLOGIA", "NAT.BIOLOGIA"];
export function importQuiz(state: RotaState, id: string, value: unknown, now = new Date()) {
  const attempt = parseQuizAttempt(value);
  if (state.importedQuizId || !attempt || !evaluateQuiz(attempt.answers, attempt.version) || state.profile.onboardingCompleted && state.profile.career !== "enem-2026") return state;
  let next = structuredClone(state);
  next.profile = { ...next.profile, career: "enem-2026", careerLabel: "ENEM 2026", notice: "published", examDate: "2026-11-08", interests: ["educacional"] };
  const stats = structuredClone(next.stats);
  getQuizQuestions(attempt.version).forEach((q, index) => {
    next = recordAnswer(next, { ...q, id: `landing:${q.id}`, topicId: q.topicId ?? topics[index], axis: q.area, difficulty: q.difficulty === "Média" ? "Média" : q.difficulty ? "Difícil" : "Fácil" }, attempt.answers[index]!, "diagnostic", new Date(now.getTime() + index));
  });
  next.stats = stats; // Lead import is not daily study or a source of repeatable XP.
  next.importedQuizId = id;
  next.diagnostic = { active: false, answered: 12, target: 12, completedAt: now.toISOString() };
  return recalculatePlan(next, "Quiz inicial reaproveitado como evidência de baixa confiança; novas questões confirmarão as prioridades.", now);
}
