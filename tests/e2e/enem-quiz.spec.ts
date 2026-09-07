import { expect, test } from "@playwright/test";
import { landingQuestions, evaluateQuiz, QUIZ_VERSION, QUIZ_STORAGE_KEY } from "../../lib/enem/landing-quiz";

test.beforeEach(async ({ page }) => {
  await page.route("**/api/billing/status", route => route.fulfill({ status: 401, json: { status: "unauthenticated" } }));
  await page.route("**/api/quiz/contact", route => {
    const { attempt } = route.request().postDataJSON();
    return route.fulfill({ json: { result: evaluateQuiz(attempt.answers, attempt.version) } });
  });
});

test("quiz exige uma resposta, retoma escolhas e abre a prévia", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Começar meu quiz →" }).click();
  await expect(page.getByRole("button", { name: "Próxima →" })).toBeDisabled();
  await page.getByRole("radio").nth(1).check();
  await page.reload();
  await page.getByRole("button", { name: "Retomar meu quiz →" }).click();
  await expect(page.getByText("Questão 2 de 12", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Voltar", exact: true }).click();
  await expect(page.getByRole("radio").nth(1)).toBeChecked();
  await page.getByRole("button", { name: "Próxima →" }).click();
  for (let index = 1; index < 12; index++) {
    await page.getByRole("radio").first().check();
    await page.getByRole("button", { name: index === 11 ? "Concluir e continuar →" : "Próxima →" }).click();
  }
  await expect(page).toHaveURL(/\/resultadodoquiz$/);
  await expect(page.getByRole("heading", { name: "Seu resultado está pronto." })).toBeVisible();
  await page.getByLabel("Seu nome").fill("Ana Teste");
  await page.getByLabel("E-mail", { exact: true }).fill("ana@example.com");
  await page.getByRole("button", { name: "Ver meus acertos e o que revisar →" }).click();
  await expect(page.locator("#meu-resultado .quiz-score")).toBeVisible();
  const details = page.locator(".quiz-answer-preview").first();
  await expect(page.locator(".quiz-answer-preview")).toHaveCount(2);
  await expect(page.getByRole("link", { name: "Fazer matrícula →", exact: true })).toHaveAttribute("href", "/matricula");
  await expect(details.getByText(/Resposta correta:/)).toBeVisible();
  await expect(page.getByRole("link", { name: "Já sou aluno →" })).toHaveAttribute("href", "/entrar");
});

test("resultado sem tentativa completa permite voltar ao quiz", async ({ page }) => {
  await page.goto("/resultadodoquiz");
  await expect(page.getByRole("heading", { name: "Seu diagnóstico começa no quiz." })).toBeVisible();
  await expect(page.getByRole("link", { name: "Ir para o quiz →" })).toHaveAttribute("href", "/#quiz");
});

for (const width of [390, 1280]) {
  test(`landing e quiz cabem na tela de ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await expect(page.getByRole("button", { name: "Começar meu quiz →" })).toBeEnabled();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.screenshot({ path: testInfo.outputPath(`landing-${width}.png`), fullPage: true });
    await page.getByRole("button", { name: "Começar meu quiz →" }).click();
    await expect(page.getByRole("radio")).toHaveCount(5);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.screenshot({ path: testInfo.outputPath(`quiz-${width}.png`), fullPage: true });
  });
}

for (const version of [1, QUIZ_VERSION]) {
  test(`resultado perfeito da versão ${version} propõe o próximo desafio`, async ({ page }) => {
    const answers = version === 1 ? [1,3,2,4,0,3,4,1,2,4,0,1] : landingQuestions.map(q => q.answer);
    await page.addInitScript(({ key, attempt }) => sessionStorage.setItem(key, JSON.stringify(attempt)), { key: QUIZ_STORAGE_KEY, attempt: { version, answers } });
    await page.goto("/resultadodoquiz");
    await page.getByLabel("Seu nome").fill("Ana Teste");
    await page.getByLabel("E-mail", { exact: true }).fill("ana@example.com");
    await page.getByRole("button", { name: "Ver meus acertos e o que revisar →" }).click();
    await expect(page.getByRole("link", { name: "Quero meu próximo desafio →" })).toHaveAttribute("href", "#matricula");
    await expect(page.locator(".quiz-score strong").first()).toHaveText("12");
    await expect(page.locator(".quiz-answer-preview")).toHaveCount(0);
    await expect(page.getByText(/Acertar esta amostra não dispensa/)).toBeVisible();
    await page.reload();
    await expect(page.locator(".quiz-score strong").first()).toHaveText("12");
  });
}
