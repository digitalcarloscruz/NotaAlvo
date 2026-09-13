import { describe, expect, it } from "vitest";
import { axisFor, chunksForPage, inferDay, parseAnswerKey, parseQuestions } from "../scripts/lib/enem-archive.mjs";

describe("preparação do acervo ENEM", () => {
  it("interpreta gabaritos tabulares e variantes de idioma", () => {
    const answers = parseAnswerKey("1 A D\n2 C E\n6 D\n7 A\n8 B 24 C 40 E");
    expect(answers.get("1:english")).toBe("A");
    expect(answers.get("1:spanish")).toBe("D");
    expect(answers.get("6:common")).toBe("D");
    expect(answers.get("24:common")).toBe("C");
  });

  it("extrai questão moderna com cinco alternativas e resposta", () => {
    const pages = ["LINGUAGENS\nQUESTÃO 01\nUm texto suficientemente longo apresenta uma situação de leitura.\nA primeira opção\nB segunda opção\nC terceira opção\nD quarta opção\nE quinta opção\nQUESTÃO 02\nOutro enunciado suficientemente longo para avaliação.\nA alfa\nB beta\nC gama\nD delta\nE épsilon"];
    const answers = new Map([["1:english", "C"], ["2:english", "A"]]);
    const items = parseQuestions(pages, { year: 2024, day: 1, answers, documentHash: "a".repeat(64) });
    expect(items).toHaveLength(2);
    expect(items[0]).toMatchObject({ number: 1, languageVariant: "english", correctOption: 2, axis: "Linguagens", extractionStatus: "ready" });
    expect(items[0].options).toHaveLength(5);
  });

  it("extrai o padrão legado e classifica a prova interdisciplinar", () => {
    const pages = ["QUESTÕES OBJETIVAS\n01 Um enunciado legado suficientemente longo para ser reconhecido.\n(A) alternativa um\n(B) alternativa dois\n(C) alternativa três\n(D) alternativa quatro\n(E) alternativa cinco"];
    const items = parseQuestions(pages, { year: 1998, day: 1, answers: new Map([["1:common", "B"]]), documentHash: "b".repeat(64) });
    expect(items[0]).toMatchObject({ number: 1, axis: "Interdisciplinar", correctOption: 1 });
  });

  it("infere dia, área e divide páginas longas em trechos pesquisáveis", () => {
    expect(inferDay("prova", "Cadernodeprova_dia2_amarelo.pdf")).toBe(2);
    expect(axisFor(2025, 2, 140)).toBe("Matemática");
    expect(axisFor(2012, 1, 12)).toBe("Ciências Humanas");
    expect(axisFor(2012, 2, 92)).toBe("Linguagens");
    const chunks = chunksForPage(`${"a".repeat(80)}\n\n${"b".repeat(80)}`, 3, 100);
    expect(chunks).toHaveLength(2);
    expect(chunks[0]).toMatchObject({ pageNumber: 3, chunkIndex: 0 });
  });
});

it("preserva texto compartilhado e não o anexa à alternativa anterior", () => {
  const options = "\nA um\nB dois\nC três\nD quatro\nE cinco";
  const pages = [`QUESTÃO 05\nUm enunciado independente suficientemente longo.${options}\nTexto para as questões 6 e 7:\nUma comunidade enfrenta barreiras educacionais.\nQUESTÃO 06\nSegundo o texto, qual problema afeta a comunidade?${options}\nQUESTÃO 07\nConsiderando o texto anterior, qual ação ajuda a comunidade?${options}`];
  const items = parseQuestions(pages, { year: 2024, day: 1, answers: new Map([["6:common", "A"], ["7:common", "B"]]), documentHash: "test" });
  expect(items[0].options[4]).toBe("cinco");
  for (const item of items.slice(1)) {
    expect(item.statement).toContain("Uma comunidade enfrenta barreiras educacionais.");
    expect(item.extractionStatus).toBe("ready");
  }
});

it("encaminha contexto ausente e conteúdo visual para revisão", () => {
  for (const prompt of ["Considerando o texto anterior, qual é a conclusão adequada?", "O gráfico apresenta os resultados da pesquisa realizada."]) {
    const [item] = parseQuestions([`QUESTÃO 06\n${prompt}\nA um\nB dois\nC três\nD quatro\nE cinco`], { year: 2024, day: 1, answers: new Map([["6:common", "A"]]), documentHash: "test" });
    expect(item.extractionStatus).toBe("needs_review");
  }
});

it("does not publish corrupted font extraction or leak page markers", () => {
  const [item] = parseQuestions(["QUESTÃO 06\nUm enunciado com caractere \u0003 corrompido e texto suficiente.\nA um\nB dois", "C três\nD quatro\nE cinco"], { year: 2024, day: 1, answers: new Map([["6:common", "A"]]), documentHash: "test" });
  expect(item.extractionStatus).toBe("needs_review");
  expect(item.options.join(" ")).not.toContain("__ENEM_PAGE_");
});

import { canRepairStatement } from "../scripts/lib/enem-promotion.mjs";
it("repairs only automatic statements with unchanged options and answer indices", () => {
  const existing = { provenance: { validationMethod: "automated_official_extraction" }, options: ["uma opção", "outra opção"], correct_option: 1 };
  const item = { metadata: { parserVersion: 2 }, extraction_status: "ready", options: ["uma\n opção", "outra opção"], correct_option: 1 };
  expect(canRepairStatement(existing, item)).toBe(true);
  expect(canRepairStatement(existing, { ...item, options: ["nova opção", "outra opção"] })).toBe(false);
  expect(canRepairStatement(existing, { ...item, correct_option: 0 })).toBe(false);
  expect(canRepairStatement(existing, { ...item, extraction_status: "needs_review" })).toBe(false);
  expect(canRepairStatement({ ...existing, provenance: {} }, item)).toBe(false);
});
