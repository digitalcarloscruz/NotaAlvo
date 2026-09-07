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
    answers[1] = (landingQuestions[1].answer + 1) % 5;
    answers[3] = (landingQuestions[3].answer + 1) % 5;
    const result = evaluateQuiz(answers)!;
    expect(result.correct).toBe(10);
    expect(result.total).toBe(12);
    expect(result.areas.find(area => area.area === "Matemática")?.reviewTopics).toEqual([landingQuestions[1].topic]);
    expect(result.areas.find(area => area.area === "Ciências da Natureza")?.reviewTopics).toEqual([landingQuestions[3].topic]);
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

it("preserva o gabarito da versão anterior sem reinterpretar respostas", () => {
  const answers = [1,3,2,4,0,3,4,1,2,4,0,1];
  expect(parseQuizAttempt({ version: 1, answers })?.version).toBe(1);
  expect(evaluateQuiz(answers, 1)?.correct).toBe(12);
  expect(evaluateQuiz(answers, QUIZ_VERSION)?.correct).not.toBe(12);
  expect(evaluateQuiz(answers, 99)).toBeNull();
});

it("distribui os níveis editoriais por área e conserva os gabaritos conferidos", () => {
  for (const area of QUIZ_AREAS) {
    expect(landingQuestions.filter(q => q.area === area).map(q => q.difficulty)).toEqual(["Média", "Difícil", "Muito difícil"]);
  }
  expect(landingQuestions.map(q => q.answer)).toEqual([4,1,0,4,0,1,2,3,1,1,0,3]);
  for (const q of landingQuestions) {
    expect(q.source?.archiveItemId).toBeTruthy();
    expect(q.topicId).toBeTruthy();
    expect(q.options).toHaveLength(5);
    expect(q.text + q.options.join(" ")).not.toMatch(/__ENEM_PAGE_|\*010|\*020|[\x00-\x08\x0e-\x1f]/);
  }
});
