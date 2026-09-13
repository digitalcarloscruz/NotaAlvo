import { expect, test } from "@playwright/test";

test("study chapters, reference search and historical theme feed the editor", async ({ page }) => {
  await page.goto("/app/redacoes");
  await page.getByRole("button", { name: "Capítulos de estudo", exact: true }).click();
  await expect(page.locator(".essay-chapters details")).toHaveCount(10);
  await page.getByRole("button", { name: "Repertório", exact: true }).click();
  await page.getByLabel("Buscar autor, obra ou tema").fill("Freire");
  await expect(page.locator(".reference-grid article")).toHaveCount(1);
  await expect(page.getByRole("heading", { name: "Paulo Freire" })).toBeVisible();
  await page.getByRole("button", { name: "Temas anteriores", exact: true }).click();
  await page.getByLabel("Buscar ano ou assunto").fill("2025");
  await page.getByLabel("Aplicação", { exact: true }).selectOption("Regular");
  await page.getByRole("button", { name: "Treinar este tema →" }).click();
  await expect(page.getByLabel("Editar tema ou escrever outro")).toHaveValue("Perspectivas acerca do envelhecimento na sociedade brasileira");
});

test("radar failure preserves editorial practice and a fetched suggestion opens the editor", async ({ page }) => {
  await page.route("**/api/redacoes/radar", route => route.fulfill({ status: 503, json: { error: "Pesquisa temporariamente indisponível." } }));
  await page.goto("/app/redacoes");
  await page.getByRole("button", { name: "Radar IA", exact: true }).click();
  await expect(page.getByText("Pesquisa temporariamente indisponível.")).toBeVisible();
  await expect(page.locator(".essay-theme-list article")).toHaveCount(12);
  await page.getByRole("button", { name: "Treinar este tema →" }).first().click();
  await expect(page.getByLabel("Editar tema ou escrever outro")).toHaveValue("Desafios para combater a desinformação científica no Brasil");
});

for (const width of [390, 1280]) {
  test(`study pages fit at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/app/redacoes");
    await page.getByRole("button", { name: "Capítulos de estudo", exact: true }).click();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: testInfo.outputPath(`chapters-${width}.png`), fullPage: true });
    await page.getByRole("button", { name: "Laboratório IA", exact: true }).click();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}

test("answer highlights immediately, locks navigation and recovers from request failure", async ({ page }) => {
  await page.route("**/api/questions?**", route => route.fulfill({ json: { data: [{ id: "00000000-0000-4000-8000-000000000006", text: "Texto de apoio completo.\n\nQual alternativa responde ao problema apresentado?", axis: "Linguagens", exam: "ENEM 2024", topic: "Interpretação", difficulty: "Média", options: ["Primeira", "Segunda", "Terceira", "Quarta", "Quinta"] }] } }));
  let release!: () => void;
  let captured = false;
  const gate = new Promise<void>(resolve => { release = resolve; });
  await page.route("**/api/candidate/answer", async route => { captured = true; await gate; await route.fulfill({ status: 503, json: { error: "Tente novamente." } }); });
  await page.goto("/app/questoes");
  await expect(page.locator(".question-statement")).toContainText("Texto de apoio completo.");
  const option = page.locator(".alternative").first();
  await option.click();
  await expect(option).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("button", { name: "Próxima →", exact: true })).toBeDisabled();
  await expect(page.getByText(/Registrando resposta/)).toBeVisible();
  expect(captured).toBe(true);
  release();
  await expect(page.getByText("Tente novamente.")).toBeVisible();
  await expect(option).toBeEnabled();
  await expect(option).toHaveAttribute("aria-pressed", "false");
});
