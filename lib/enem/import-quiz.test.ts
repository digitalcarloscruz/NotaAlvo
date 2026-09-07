import { expect, it } from "vitest";
import { createInitialState, completeOnboarding, recordAnswer, recalculatePlan, recordLocalReview } from "@/lib/domain/adaptive-engine";
import { importQuiz } from "./import-quiz";
import { landingQuestions, QUIZ_VERSION } from "./landing-quiz";
const now = new Date("2026-09-07T08:00:00Z");
const attempt = { version: QUIZ_VERSION, answers: landingQuestions.map(q => (q.answer + 1) % 5) };
it("imports all quiz topics once without XP and survives onboarding", () => {
  const state = importQuiz(createInitialState(now), "contact-1", attempt, now);
  expect(state.profile.career).toBe("enem-2026");
  expect(state.answers).toHaveLength(12);
  expect(state.stats.xp).toBe(0);
  expect(state.reviewQueue).toHaveLength(12);
  expect(state.reviewQueue.every(item => item.options?.length === 5 && item.explanation)).toBe(true);
  expect(importQuiz(state, "contact-1", attempt, now)).toBe(state);
  const completed = completeOnboarding(state, state.profile, now);
  for (const [id, mastery] of Object.entries(state.mastery)) if (mastery.evidenceCount) expect(completed.mastery[id]).toEqual(mastery);
  expect(completed.diagnostic.active).toBe(false);
});
it("preserves an existing non-ENEM journey and rejects incomplete quizzes", () => {
  const state = createInitialState(now); state.profile.onboardingCompleted = true;
  expect(importQuiz(state, "1", attempt, now)).toBe(state);
  expect(importQuiz(createInitialState(now), "1", { ...attempt, answers: [null] }, now).answers).toHaveLength(0);
});
it("schedules study even with one available day and honors period", () => {
  const state = createInitialState(now); state.profile.availableDays = [1]; state.profile.preferredPeriod = "evening";
  const plan = recalculatePlan(state, "test", now).plan;
  expect(plan).toHaveLength(1); expect(plan[0].type).not.toBe("weekly_checkin");
  expect(new Date(plan[0].scheduledFor).getHours()).toBe(19);
  expect(plan[0].minutes).toBeLessThanOrEqual(state.profile.weeklyHours * 60);
});
it("orders mixed weekdays and does not duplicate a confirmed server answer", () => {
  const state = createInitialState(now); state.profile.availableDays = [0, 6, 2, 1];
  const dates = recalculatePlan(state, "test", now).plan.map(t => t.scheduledFor);
  expect(dates).toEqual([...dates].sort());
  const q = { ...landingQuestions[0], axis: "Linguagens", difficulty: "Fácil" as const, evidenceId: "answer-1" };
  const updated = recordAnswer(state, q, q.answer, "practice", now);
  expect(recordAnswer(updated, q, q.answer, "practice", now)).toBe(updated);
});
it("requires a due review and reschedules correct answers without duplicating items", () => {
  const state = importQuiz(createInitialState(now), "1", attempt, now);
  const item = state.reviewQueue[0];
  expect(recordLocalReview(state, item.id, item.answer!, now)).toBe(state);
  const later = new Date(now.getTime() + 2 * 86400000);
  const reviewed = recordLocalReview(state, item.id, item.answer!, later);
  expect(reviewed.reviewQueue).toHaveLength(12);
  expect(reviewed.reviewQueue.find(r => r.id === item.id)?.intervalDays).toBe(7);
  expect(reviewed.answers).toHaveLength(13);
});
it("never exceeds the weekly budget when all days are available", () => {
  const state = createInitialState(now);
  state.profile.weeklyHours = 2; state.profile.availableDays = [0,1,2,3,4,5,6];
  expect(recalculatePlan(state, "test", now).plan.reduce((sum, task) => sum+task.minutes,0)).toBeLessThanOrEqual(120);
});
it("editing onboarding does not award XP again or reset recorded mastery", () => {
  const base = importQuiz(createInitialState(now), "quiz", attempt, now);
  const first = completeOnboarding(base, base.profile, now);
  const second = completeOnboarding(first, { ...first.profile, weeklyHours: 4 }, now);
  expect(second.stats.xp).toBe(first.stats.xp);
  expect(second.mastery["MAT.PROBLEMAS"]).toEqual(first.mastery["MAT.PROBLEMAS"]);
});
it("changes the first-week priorities according to actual quiz mistakes", () => {
  const correct = landingQuestions.map(q => q.answer);
  const mathErrors = landingQuestions.map((q, i) => q.area === "Matemática" ? (q.answer+1)%5 : correct[i]);
  const natureErrors = landingQuestions.map((q, i) => q.area === "Ciências da Natureza" ? (q.answer+1)%5 : correct[i]);
  const math = importQuiz(createInitialState(now), "math", {version: QUIZ_VERSION, answers: mathErrors}, now);
  const nature = importQuiz(createInitialState(now), "nature", {version: QUIZ_VERSION, answers: natureErrors}, now);
  expect(math.mastery["MAT.PROBLEMAS"].score).toBeLessThan(nature.mastery["MAT.PROBLEMAS"].score);
  expect(math.plan[0].topicId).not.toBe(nature.plan[0].topicId);
});
