import { z } from "zod";

export const QUIZ_CONTACT_KEY = "nota-alvo-quiz-contact-v1";
export const quizContactSchema = z.object({
  name: z.string().trim().min(2, "Informe seu nome.").max(120),
  email: z.string().trim().email("Informe um e-mail válido.").max(254).transform(value => value.toLowerCase()),
  phone: z.string().trim().max(24).default("").refine(value => !value || /^\+?[\d\s().-]+$/.test(value) && value.replace(/\D/g, "").length >= 10 && value.replace(/\D/g, "").length <= 15, "Confira seu telefone ou deixe em branco."),
});
