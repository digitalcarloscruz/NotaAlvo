import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = { title: "Empresa e contato" };

export default function Page() {
  return <LegalPage title="Empresa e contato"><h2>Quem opera a Nota Alvo</h2><p>A Nota Alvo oferece ferramentas de estudo e preparação para o ENEM. A empresa responsável é INFORMATUS TECNOLOGIA E PROCESSOS, CNPJ 32.453.696/0001-06.</p><h2>Fale conosco</h2><p>Para dúvidas sobre a plataforma, acesso, pagamentos, cancelamentos ou seus dados pessoais, escreva para <a href="mailto:contato@notafacil.com.br">contato@notafacil.com.br</a>. Informe o e-mail da sua conta e, quando houver, o identificador do pedido. Não envie senha, número completo do cartão ou código de segurança.</p><p>O endereço de atendimento utiliza o domínio notafacil.com.br. O site institucional informado pela empresa é <a href="https://www.3cinova.com.br" rel="noopener noreferrer" target="_blank">www.3cinova.com.br</a>. A plataforma educacional está disponível em www.notaalvo.com.br.</p></LegalPage>;
}
