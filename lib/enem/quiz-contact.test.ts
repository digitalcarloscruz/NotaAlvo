import { expect, it } from "vitest";
import { quizContactSchema } from "./quiz-contact";

it("normalizes contact information and allows an omitted telephone", () => {
  expect(quizContactSchema.parse({ name: " Ana Silva ", email: " ANA@example.com " })).toEqual({ name: "Ana Silva", email: "ana@example.com", phone: "" });
  expect(quizContactSchema.safeParse({ name: "Ana", email: "ana@example.com", phone: "+55 (31) 99999-1234" }).success).toBe(true);
});
it("rejects missing identity, malformed email and invalid telephone", () => {
  for (const contact of [{ name: " ", email: "ana@example.com" }, { name: "Ana", email: "invalid" }, { name: "Ana", email: "ana@example.com", phone: "abc" }]) expect(quizContactSchema.safeParse(contact).success).toBe(false);
});
