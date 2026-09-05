import type { Metadata } from "next";
import Link from "next/link";
import { Brand } from "@/components/brand";
import { EnemLandingQuiz } from "@/components/enem-landing-quiz";

export const metadata: Metadata = {
  title: "Quiz ENEM — descubra o que revisar",
  description: "Teste seus conhecimentos em 12 questões autorais das quatro áreas do ENEM e identifique assuntos para revisar na reta final.",
  alternates: { canonical: "https://www.notaalvo.com.br" },
};

export default function LandingPage() {
  return <div className="enem-landing">
    <header className="enem-nav"><Brand /><nav aria-label="Navegação pública"><a href="#como-funciona">Como funciona</a><a href="#quiz">Fazer o quiz</a></nav><Link className="enem-login" href="https://app.notaalvo.com.br/entrar">Já sou aluno →</Link></header>
    <main>
      <section className="enem-hero">
        <div className="enem-hero-copy"><span className="enem-kicker">NOTA ALVO • RETA FINAL DO ENEM</span><h1>Seu próximo acerto começa com o que você <em>precisa revisar.</em></h1><p>Você está estudando o que mais precisa? Teste seus conhecimentos e encontre um ponto de partida para organizar a revisão até o ENEM.</p><a className="enem-button" href="#quiz">Testar meus conhecimentos →</a><div className="enem-hero-facts"><span><b>12</b> questões autorais</span><span><b>4</b> áreas do conhecimento</span><span><b>Seu ritmo</b> sem cronômetro</span></div></div>
        <EnemLandingQuiz />
      </section>
      <section className="enem-section" id="como-funciona"><span className="enem-kicker">DO PRIMEIRO TESTE À PRÓXIMA REVISÃO</span><h2>Uma direção mais clara para o seu estudo.</h2><div className="enem-feature-grid"><article><span>01</span><h3>Teste seus conhecimentos</h3><p>Responda questões de interpretação, resolução de problemas e conceitos das quatro áreas.</p></article><article><span>02</span><h3>Encontre pontos de atenção</h3><p>As respostas mostram quais assuntos desta amostra merecem uma nova revisão.</p></article><article><span>03</span><h3>Conheça o próximo passo</h3><p>Ao concluir, você vai para a página de diagnóstico e apresentação do curso para a reta final.</p></article></div></section>
      <section className="enem-final-stretch"><div><span className="enem-kicker">RETA FINAL COM FOCO</span><h2>Faça cada sessão de estudo ter um objetivo.</h2><p>Uma questão errada pode revelar uma dúvida de conteúdo, de interpretação ou de cálculo. Identificar essa diferença ajuda a escolher o que praticar em seguida.</p></div><ul><li><b>Revisar o que ficou para trás.</b><span>Retome os conceitos por trás das alternativas que confundiram você.</span></li><li><b>Praticar e conferir.</b><span>Resolva novas questões do mesmo assunto e acompanhe seus acertos.</span></li><li><b>Incluir a redação no plano.</b><span>Este quiz não avalia produção textual. Reserve também tempo para escrever e revisar.</span></li></ul></section>
      <section className="enem-bottom-cta"><h2>Comece pelo seu ponto de partida.</h2><p>Doze questões para olhar com mais atenção para sua preparação.</p><a className="enem-button" href="#quiz">Começar o quiz ENEM →</a><small>Diagnóstico limitado aos assuntos testados. Sem estimativa de nota ou promessa de aprovação.</small></section>
    </main><footer className="enem-footer"><Brand /><span>Preparação para o ENEM, um acerto de cada vez.</span><Link href="https://app.notaalvo.com.br/entrar">Acesso do aluno</Link></footer>
  </div>;
}
