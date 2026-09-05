import { describe, expect, it } from "vitest";
import { evaluateQuiz, landingQuestions, parseQuizAttempt, QUIZ_AREAS, QUIZ_VERSION } from "./landing-quiz";

describe("diagnóstico público ENEM", () => {
  it("rejeita respostas incompletas, índices inválidos e versões antigas", () => {
    expect(evaluateQuiz(landingQuestions.map(() => null))).toBeNull();
    expect(evaluateQuiz([0])).toBeNull();
    expect(evaluateQuiz(landingQuestions.map(() => 5))).toBeNull();
    expect(evaluateQuiz(landingQuestions.map(() => -1))).toBeNull();
    expect(parseQuizAttempt({ version: 0, answers: landingQuestions.map(() => 0) })).toBeNull();
    expect(parseQuizAttempt({ version: QUIZ_VERSION, answers: landingQuestions.map(() => "0") })).toBeNull();
  });
  it("identifica os tópicos errados e soma as áreas sem inventar nota TRI", () => {
    const answers = landingQuestions.map(question => question.answer);
    answers[1] = 0;
    answers[3] = 0;
    const result = evaluateQuiz(answers)!;
    expect(result.correct).toBe(10);
    expect(result.total).toBe(12);
    expect(result.areas.find(area => area.area === "Matemática")?.reviewTopics).toEqual(["Porcentagem"]);
    expect(result.areas.find(area => area.area === "Ciências da Natureza")?.reviewTopics).toEqual(["Energia cinética"]);
    expect(result.areas.find(area => area.area === "Linguagens")?.correct).toBe(3);
  });
  it("mantém as quatro áreas equilibradas e trata os extremos", () => {
    for (const area of QUIZ_AREAS) expect(landingQuestions.filter(question => question.area === area)).toHaveLength(3);
    const perfect = evaluateQuiz(landingQuestions.map(question => question.answer))!;
    expect(perfect.correct).toBe(12);
    expect(perfect.areas.every(area => area.reviewTopics.length === 0)).toBe(true);
    expect(evaluateQuiz(landingQuestions.map(question => (question.answer + 1) % 5))?.correct).toBe(0);
  });
});
