// Primeiro dia do ENEM 2026, à meia-noite em Brasília.
const ENEM_FIRST_DAY = Date.parse("2026-11-08T03:00:00.000Z");

export function daysUntilEnem(now = Date.now()) {
  return Math.ceil((ENEM_FIRST_DAY - now) / 86_400_000);
}
