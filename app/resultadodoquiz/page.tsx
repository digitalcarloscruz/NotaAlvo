import type { Metadata } from "next";
import Link from "next/link";
import { PublicFooter } from "@/components/public-footer";
import { Brand } from "@/components/brand";
import { EnemQuizResult } from "@/components/enem-quiz-result";
import { EnemCheckout } from "@/components/enem-checkout";
import { ENEM_EXPRESS, isEnemExpressAvailable } from "@/lib/billing/enem-express";

export const metadata: Metadata = { title: "Seu diagnóstico ENEM", robots: { index: false, follow: false } };

export default function EnemResultPage() {
  return <div className="enem-landing">
    <header className="enem-nav"><Brand /><Link className="enem-login" href="/entrar">Já sou aluno →</Link></header>
    <main className="enem-result-main">
      <EnemQuizResult>
        <section className="enem-course-preview" id="matricula">
          <span className="enem-kicker">NOTA ALVO • ENEM EXPRESS</span>
          <h2>Você está na reta final. Faça seu próximo estudo contar.</h2>
          <p>É normal sentir que há assuntos demais para revisar. Você não precisa tentar estudar tudo de uma vez: precisa de um próximo passo claro.</p>
          <p>A Nota Alvo usa inteligência artificial e seu histórico de respostas para ajudar a identificar dificuldades e orientar sua preparação. Transforme suas dúvidas em prática, revisão e uma rotina que cabe na sua semana.</p>
          <h3>O que você terá acesso</h3>
          <ul><li><strong>Mentor com inteligência artificial:</strong> tire dúvidas e receba orientações para continuar estudando.</li><li><strong>Plano de estudos adaptativo:</strong> organize a semana conforme sua disponibilidade e evolução.</li><li><strong>Questões e simulados rápidos:</strong> pratique com os conteúdos disponíveis e confira seu desempenho.</li><li><strong>Caderno de erros e revisões:</strong> retome os pontos que ainda precisam de atenção.</li><li><strong>Análise de redação com IA:</strong> receba feedback para orientar a melhoria do seu texto.</li><li><strong>Painel de desempenho:</strong> acompanhe respostas, progresso e prioridades de estudo.</li><li><strong>Metas e desafios de estudo:</strong> use os recursos de gamificação para manter a constância.</li></ul>
          <p><strong>Prepare sua reta final por apenas R$ 97,00. Um único pagamento, sem mensalidade.</strong></p>
          <p>Acesso após a confirmação do pagamento, até {ENEM_EXPRESS.accessEndLabel}. Uma oportunidade para chegar à prova com uma preparação mais organizada.</p>
          <p className="enem-small">Inclui 30 solicitações diárias ao mentor e 5 uploads mensais de editais. As respostas da IA devem ser conferidas. Não há garantia de nota ou aprovação.</p>
          <EnemCheckout enabled={process.env.ASAAS_CHECKOUT_ENABLED === "true" && isEnemExpressAvailable()} />
        </section>
      </EnemQuizResult>
      <Link className="enem-back-link" href="/quiz">← Voltar ao quiz</Link>
    </main>
    <PublicFooter />
  </div>;
}
