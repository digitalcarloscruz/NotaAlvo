import { legacyQuestions } from "./landing-quiz-v1";
import { challengeQuestions } from "./landing-quiz-v2";
export const QUIZ_VERSION = 2;
export const QUIZ_STORAGE_KEY = "nota-alvo-enem-quiz-v1";
export const QUIZ_AREAS = ["Linguagens", "Matemática", "Ciências Humanas", "Ciências da Natureza"] as const;
export type QuizArea = typeof QUIZ_AREAS[number];
export type QuizQuestion = { id: string; area: QuizArea; topic: string; text: string; options: string[]; answer: number; explanation: string; topicId?: string; difficulty?: "Média" | "Difícil" | "Muito difícil"; source?: { archiveItemId: string; year: number; day: number; number: number; application: string; booklet: string; url: string } };

export const landingQuestions = challengeQuestions;
export function getQuizQuestions(version: number): QuizQuestion[] {
  return version === 1 ? legacyQuestions : version === 2 ? challengeQuestions : [];
}

export type QuizAttempt = { version: number; answers: (number | null)[] };
export function parseQuizAttempt(value: unknown): QuizAttempt | null {
  if (!value || typeof value !== "object") return null;
  const candidate = value as Partial<QuizAttempt>;
  const questions = getQuizQuestions(candidate.version ?? 0);
  if (!questions.length || !Array.isArray(candidate.answers) || candidate.answers.length !== questions.length) return null;
  if (!candidate.answers.every((answer, i) => answer === null || (Number.isInteger(answer) && answer >= 0 && answer < questions[i].options.length))) return null;
  return { version: candidate.version!, answers: candidate.answers };
}
export function evaluateQuiz(answers: (number | null)[], version = QUIZ_VERSION) {
  const attempt = parseQuizAttempt({ version, answers });
  if (!attempt || attempt.answers.some(answer => answer === null)) return null;
  const questions = getQuizQuestions(version);
  const areas = QUIZ_AREAS.map(area => {
    const items = questions.map((question, index) => ({ question, index })).filter(item => item.question.area === area);
    const correct = items.filter(({ question, index }) => question.answer === answers[index]).length;
    return { area, correct, total: items.length, reviewTopics: items.filter(({ question, index }) => question.answer !== answers[index]).map(({ question }) => question.topic) };
  });
  return { correct: areas.reduce((sum, area) => sum + area.correct, 0), total: questions.length, areas };
}
