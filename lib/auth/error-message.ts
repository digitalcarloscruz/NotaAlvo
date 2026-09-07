type AuthFailure = { code?: string; message: string };

export function friendlyAuthError(error: AuthFailure) {
  const { code, message } = error;
  if (code === "email_provider_disabled" || /email (signups|sign-ups|logins|provider).*disabled/i.test(message)) return "O cadastro e login por e-mail estão desativados no serviço de autenticação. Entre em contato com o suporte para habilitar o acesso.";
  if (code === "signup_disabled" || /signups? (are |is )?disabled/i.test(message)) return "O cadastro de novas contas está desativado. Entre em contato com o suporte.";
  if (code === "user_already_exists" || code === "email_exists" || /already registered|already been registered/i.test(message)) return "Este e-mail já possui uma conta. Clique em Entrar e use sua senha.";
  if (code === "invalid_credentials" || /invalid login credentials/i.test(message)) return "E-mail ou senha incorretos.";
  if (code === "email_not_confirmed" || /email not confirmed/i.test(message)) return "Este cadastro ainda aguarda confirmação. Use o link recebido no e-mail ou procure o suporte.";
  if (code === "email_address_invalid") return "Confira o endereço de e-mail digitado.";
  if (code === "weak_password") return "A senha não atende aos requisitos de segurança. Use uma senha mais longa, combinando letras, números e símbolos.";
  if (/password should be at least/i.test(message)) return "A senha precisa ter pelo menos 8 caracteres.";
  if (code?.startsWith("over_") || /rate limit|only request this after/i.test(message)) return "Muitas tentativas. Aguarde um pouco e tente novamente.";
  return "Não foi possível concluir agora. Tente novamente ou entre em contato com o suporte.";
}
