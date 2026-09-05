import type { Metadata } from "next";
import Link from "next/link";
import { Brand } from "@/components/brand";
import { EnemQuizResult } from "@/components/enem-quiz-result";
import { EnemCheckout } from "@/components/enem-checkout";
import { ENEM_EXPRESS, isEnemExpressAvailable } from "@/lib/billing/enem-express";

export const metadata: Metadata = { title: "Seu diagnóstico ENEM", robots: { index: false, follow: false } };

export default function EnemResultPage() {
  return <div className="enem-landing"><header className="enem-nav"><Brand /><Link className="enem-login" href="https://app.notaalvo.com.br/entrar">Já sou aluno →</Link></header><main className="enem-result-main"><EnemQuizResult /><section className="enem-course-preview"><span className="enem-kicker">NOTA ALVO • ENEM EXPRESS</span><h2>Acelere sua preparação até o ENEM com inteligência artificial.</h2><p>{ENEM_EXPRESS.description}</p><ul><li>Mentor de IA para tirar dúvidas e orientar a revisão.</li><li>Análise de redação com feedback para melhorar sua escrita.</li><li>Preparação personalizada para direcionar seus próximos estudos.</li></ul><p>Acesso liberado após a confirmação do pagamento, até {ENEM_EXPRESS.accessEndLabel}.</p><p className="enem-small">Inclui todas as funcionalidades de IA da plataforma, com os limites técnicos de uso de cada ferramenta.</p><EnemCheckout enabled={process.env.ASAAS_CHECKOUT_ENABLED === "true" && isEnemExpressAvailable()} /></section><Link className="enem-back-link" href="/#quiz">← Voltar ao quiz</Link></main></div>;
}
