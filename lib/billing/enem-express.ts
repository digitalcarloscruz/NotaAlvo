export const ENEM_EXPRESS = {
  code: "enem-express-2026",
  name: "ENEM Express",
  amountCents: 9700,
  description: "Todos os recursos inteligentes de IA da Nota Alvo para acelerar sua preparação até o ENEM 2026.",
  // End of the final regular exam day in America/Sao_Paulo.
  accessEndsAt: "2026-11-16T03:00:00.000Z",
  accessEndLabel: "15 de novembro de 2026",
} as const;

export function isEnemExpressAvailable(now = Date.now()) {
  return now < Date.parse(ENEM_EXPRESS.accessEndsAt);
}
