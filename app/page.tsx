import type { Metadata } from "next";
import Link from "next/link";
import { Brand } from "@/components/brand";
import { PublicFooter } from "@/components/public-footer";
import { ENEM_EXPRESS } from "@/lib/billing/enem-express";

export const metadata: Metadata = {
  title: "Nota Alvo — direção para sua reta final do ENEM",
  description: "Organize sua reta final do ENEM com plano de estudos, questões, revisão de erros, redação e apoio de inteligência artificial.",
  alternates: { canonical: "https://www.notaalvo.com.br" },
};

const resources = [
  ["Plano adaptativo", "Transforme sua disponibilidade e seu desempenho em uma semana de estudos com prioridades mais claras."],
  ["Questões e simulados", "Pratique com questões do acervo, acompanhe seus acertos e descubra assuntos que pedem mais atenção."],
  ["Caderno de erros", "Reúna o que você errou e volte a esses pontos para que a revisão não dependa apenas da memória."],
  ["Mentor com IA", "Peça explicações e orientações durante o estudo, inclusive a partir do contexto de uma questão."],
  ["Laboratório de redação", "Revise estrutura, repertório e as cinco competências com feedback pedagógico para evoluir o texto."],
  ["Painel de desempenho", "Visualize sua prática, seu progresso e suas prioridades em um só lugar."],
] as const;

export default function HomePage() {
  return <div className="enem-landing home-landing">
    <header className="enem-nav home-nav"><Brand /><nav aria-label="Navegação principal"><a href="#como-funciona">Como funciona</a><a href="#recursos">Recursos</a><a href="#enem-express">ENEM Express</a></nav><div className="home-nav-actions"><Link className="enem-login" href="/entrar">Já sou aluno</Link><Link className="enem-button home-nav-cta" href="/quiz">Fazer quiz grátis</Link></div></header>
    <main>
      <section className="home-hero">
        <div className="home-hero-copy"><span className="enem-kicker">NOTA ALVO • RETA FINAL DO ENEM</span><h1>Menos dúvida sobre o que estudar. <em>Mais direção para revisar.</em></h1><p className="home-lead">O Nota Alvo reúne plano de estudos, questões, revisão de erros, redação e inteligência artificial para ajudar você a escolher o próximo passo — mesmo quando o tempo é curto.</p><div className="home-hero-actions"><Link className="enem-button" href="/quiz">Descobrir o que revisar →</Link><a className="enem-button-secondary" href="#como-funciona">Entender como funciona</a></div><p className="home-trust-line">Quiz gratuito com 12 questões oficiais • Sem estimativa de nota • Resultado inicial ao concluir</p></div>
        <aside className="home-direction-card" aria-label="Exemplo da jornada de revisão"><span className="home-card-label">SUA REVISÃO, COM UM PRÓXIMO PASSO</span><div className="home-card-step"><span>01</span><div><b>Pratique</b><p>Responda questões e registre seu desempenho.</p></div></div><div className="home-card-line" aria-hidden="true" /><div className="home-card-step"><span>02</span><div><b>Entenda</b><p>Identifique erros e assuntos que merecem atenção.</p></div></div><div className="home-card-line" aria-hidden="true" /><div className="home-card-step is-highlighted"><span>03</span><div><b>Organize</b><p>Transforme os sinais da prática em uma pauta de revisão.</p></div></div></aside>
      </section>
      <section className="home-problem" aria-labelledby="home-problem-title"><div><span className="enem-kicker">NÃO É SÓ ESTUDAR MAIS</span><h2 id="home-problem-title">É saber onde colocar sua atenção agora.</h2></div><div><p>Na reta final, tentar revisar tudo pode deixar a sensação de que nada avança. O Nota Alvo ajuda a transformar respostas, erros e tempo disponível em decisões de estudo mais claras.</p><p>Assim, cada sessão pode começar com uma intenção: praticar um assunto, retomar uma dificuldade ou avançar na redação.</p></div></section>
      <section className="home-method" id="como-funciona"><div className="home-section-heading"><span className="enem-kicker">COMO FUNCIONA</span><h2>Da dúvida à próxima ação de estudo.</h2><p>Você pratica, reconhece o que merece atenção e organiza a continuidade sem precisar montar tudo do zero.</p></div><div className="home-method-grid"><article><span>1</span><h3>Comece por uma amostra</h3><p>Faça o quiz gratuito e veja como você se sai em 12 questões das quatro áreas do ENEM.</p></article><article><span>2</span><h3>Encontre pontos de atenção</h3><p>Use seus acertos e erros como sinais para escolher assuntos que podem entrar na próxima revisão.</p></article><article><span>3</span><h3>Construa uma rotina possível</h3><p>Distribua prática, revisão e redação de acordo com o tempo que você realmente tem.</p></article><article><span>4</span><h3>Acompanhe e ajuste</h3><p>Consulte seu histórico, retome erros e use o apoio da IA quando precisar destravar uma dúvida.</p></article></div></section>
      <section className="home-resources" id="recursos"><div className="home-section-heading"><span className="enem-kicker">TUDO CONECTADO</span><h2>Recursos para praticar, revisar e continuar.</h2><p>Em vez de ferramentas soltas, uma jornada de estudo que registra o que você faz e ajuda a indicar o que vem depois.</p></div><div className="home-resource-grid">{resources.map(([title, description], index) => <article key={title}><span className="home-resource-number">0{index + 1}</span><h3>{title}</h3><p>{description}</p></article>)}</div></section>
      <section className="home-story"><div><span className="enem-kicker">COMO O NOTA ALVO APOIA O ALUNO</span><h2>O erro deixa de ser só um resultado e vira matéria-prima para a revisão.</h2></div><div className="home-story-flow"><p><b>Você responde.</b><br />A plataforma registra sua prática e organiza o histórico.</p><p><b>Você identifica.</b><br />Os resultados ajudam a revelar dificuldades naquela amostra.</p><p><b>Você retoma.</b><br />O caderno de erros, o plano e o Mentor apoiam a continuidade.</p></div><p className="home-story-note">O Nota Alvo oferece apoio à preparação. Seus indicadores são internos e não equivalem à nota oficial do ENEM.</p></section>
      <section className="home-offer" id="enem-express"><div className="home-offer-copy"><span className="enem-kicker">ENEM EXPRESS 2026</span><h2>Sua reta final em um só lugar.</h2><p>Tenha acesso aos recursos do Nota Alvo para organizar o estudo até a prova, com uma conta individual e seu histórico sincronizado.</p><ul><li>Plano de estudos e prioridades</li><li>Questões, simulados e caderno de erros</li><li>Mentor com IA e laboratório de redação</li><li>Painel, metas e acompanhamento da rotina</li></ul></div><div className="home-price-card"><span>Acesso até {ENEM_EXPRESS.accessEndLabel}</span><p className="home-price"><small>R$</small> 97<small>,00</small></p><p>Pagamento único<br />sem mensalidade ou renovação automática</p><Link className="enem-button" href="/quiz">Começar pelo quiz gratuito →</Link><Link className="home-login-link" href="/entrar">Já tenho uma conta</Link></div></section>
      <section className="home-final-cta"><span className="enem-kicker">SEU PONTO DE PARTIDA</span><h2>Descubra o que merece sua atenção.</h2><p>Responda ao quiz gratuito e transforme o resultado em um primeiro passo para organizar a revisão.</p><Link className="enem-button" href="/quiz">Fazer o quiz ENEM →</Link><small>12 questões oficiais. O resultado considera apenas os assuntos testados e não calcula TRI.</small></section>
    </main><PublicFooter />
  </div>;
}
