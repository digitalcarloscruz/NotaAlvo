import { expect, it } from "vitest";
import { ENEM_EXPRESS, isEnemExpressAvailable } from "./enem-express";

it("ends the single-payment offer after the last regular exam day in São Paulo", () => {
  expect(ENEM_EXPRESS.amountCents).toBe(9700);
  expect(isEnemExpressAvailable(Date.parse("2026-11-16T02:59:59Z"))).toBe(true);
  expect(isEnemExpressAvailable(Date.parse("2026-11-16T03:00:00Z"))).toBe(false);
});
