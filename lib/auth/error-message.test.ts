import { expect, it } from "vitest";
import { friendlyAuthError } from "./error-message";
it("distingue provedor desativado, cadastro existente e senha fraca", () => {
  expect(friendlyAuthError({ code: "email_provider_disabled", message: "Email signups are disabled" })).toContain("desativados");
  expect(friendlyAuthError({ message: "Email signups are disabled" })).toContain("desativados");
  expect(friendlyAuthError({ code: "signup_disabled", message: "disabled" })).toContain("novas contas");
  expect(friendlyAuthError({ code: "user_already_exists", message: "error" })).toContain("Clique em Entrar");
  expect(friendlyAuthError({ code: "weak_password", message: "error" })).toContain("requisitos");
});
it("não expõe detalhes internos ou dados presentes na mensagem bruta", () => {
  expect(friendlyAuthError({ message: "internal details user@example.com" })).not.toContain("user@example.com");
});
