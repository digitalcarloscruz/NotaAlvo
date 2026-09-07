import { expect, it } from "vitest";
import { quizMessage } from "./quiz-message";

it("orienta fundamentos, consistência e aprofundamento nos limites de cada faixa", () => {
  for (const score of [0, 5]) expect(quizMessage(score).description).toContain("fundamentos");
  for (const score of [6, 9]) expect(quizMessage(score).title).toContain("consistente");
  for (const score of [10, 11]) expect(quizMessage(score).description).toContain("erros pontuais");
  const perfect = quizMessage(12);
  expect(perfect.description).toContain("acertou todos");
  expect(perfect.description).toContain("redação");
  expect(perfect.cta).toBe("Quero meu próximo desafio →");
  expect(perfect.description).not.toContain("erros");
});

it("não gera uma mensagem para uma pontuação inválida", () => {
  for (const score of [-1, 13, 1.5, NaN]) expect(() => quizMessage(score)).toThrow();
});
