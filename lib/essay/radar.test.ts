import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { expect, it } from "vitest";
import { radarWeek, validateRadarSources, radarSchema } from "./radar";

it("uses Monday UTC across year boundaries", () => {
  expect(radarWeek(new Date("2027-01-03T23:59:59Z"))).toBe("2026-12-28");
  expect(radarWeek(new Date("2027-01-04T00:00:00Z"))).toBe("2027-01-04");
});
it("rejects invented, old and future source dates", () => {
  const make = (url: string, publishedAt: string) => ({ title: "Desafios para ampliar a educação no Brasil", reason: "A pesquisa permite analisar barreiras educacionais.", historicalConnection: "Educação apareceu em propostas anteriores.", axes: ["Acesso à escola", "Permanência escolar"], exercise: "Escreva uma tese e dois argumentos.", sources: [{ title: "Pesquisa publicada", url, publishedAt }] });
  const input = radarSchema.parse({ themes: [make("https://gov.br/real", "2026-09-12"), make("https://gov.br/invented", "2026-09-12"), make("https://gov.br/old", "2026-08-01"), make("https://gov.br/future", "2026-09-15")] });
  const result = validateRadarSources(input, [{ url: "https://gov.br/real", date: "2026-09-12" }, { url: "https://gov.br/old", date: "2026-08-01" }, { url: "https://gov.br/future", date: "2026-09-15" }], new Date("2026-09-13T12:00:00Z"));
  expect(result.themes).toHaveLength(1);
  expect(result.themes[0].sources[0].url).toBe("https://gov.br/real");
});
it("leases only one generation and caps failed retries", async () => {
  const db = new PGlite();
  try {
    await db.exec("create role anon; create role authenticated; create role service_role;");
    await db.exec(readFileSync("supabase/migrations/20260913120000_essay_radar.sql", "utf8"));
    const claim = async () => (await db.query<{ claimed: boolean }>("select claim_essay_radar_week('2026-09-07') as claimed")).rows[0].claimed;
    expect(await claim()).toBe(true);
    expect(await claim()).toBe(false);
    await db.exec("update essay_radar_weeks set lease_until=now()-interval '1 minute'");
    expect(await claim()).toBe(true);
    await db.exec("update essay_radar_weeks set lease_until=now()-interval '1 minute'");
    expect(await claim()).toBe(true);
    await db.exec("update essay_radar_weeks set lease_until=now()-interval '1 minute'");
    expect(await claim()).toBe(false);
    await db.exec("update essay_radar_weeks set attempts=1,payload='{}'");
    expect(await claim()).toBe(false);
  } finally { await db.close(); }
});
