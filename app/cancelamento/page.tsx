import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = { title: "Cancelamento e reembolso" };

export default function Page() {
  return <LegalPage title="Cancelamento e reembolso"><h2>Direito de arrependimento</h2><p>Nas contratações pela internet, respeitamos o direito de arrependimento previsto no artigo 49 do Código de Defesa do Consumidor: você pode desistir no prazo de 7 dias contado da assinatura ou do recebimento do produto ou serviço, conforme aplicável, com devolução dos valores pagos.</p><h2>Como solicitar</h2><p>Envie sua solicitação para <a href="mailto:contato@notafacil.com.br">contato@notafacil.com.br</a>, informando o e-mail da conta e a identificação do pedido. Não envie senha ou dados completos do cartão. Solicite pelo mesmo canal ajuda para identificar uma compra.</p><h2>Processamento</h2><p>Após a conferência da solicitação, o reembolso será encaminhado pelo meio de pagamento aplicável. A disponibilização do valor depende do processamento pelo Asaas e pela instituição financeira. A confirmação e o acompanhamento serão feitos pelo atendimento. O acesso associado à compra será encerrado quando o reembolso for confirmado.</p><h2>Outras situações</h2><p>Depois do prazo de arrependimento, dúvidas sobre falhas do serviço, cobrança indevida ou outras hipóteses de reembolso serão analisadas conforme os direitos legais aplicáveis. O ENEM Express é uma compra única, sem cobrança recorrente a cancelar.</p></LegalPage>;
}
