import { expect, test } from "@playwright/test";

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
  await expect(page.getByRole("heading", { name: "Áreas para olhar com mais atenção" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Já sou aluno →" })).toHaveAttribute("href", "https://app.notaalvo.com.br/entrar");
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
