import type { Metadata } from "next";
import Link from "next/link";
import { Brand } from "@/components/brand";
import { EnemLandingQuiz } from "@/components/enem-landing-quiz";

export const metadata: Metadata = {
  title: "Quiz ENEM — descubra o que revisar",
  description: "Responda a 12 questões oficiais das quatro áreas do ENEM e encontre um ponto de partida para sua revisão.",
  alternates: { canonical: "https://www.notaalvo.com.br/quiz" },
};

export default function QuizPage() {
  return <div className="enem-landing quiz-page"><header className="enem-nav quiz-nav"><Brand /><Link className="enem-login" href="/entrar">Já sou aluno →</Link></header><main className="quiz-page-main"><header className="quiz-page-heading"><span className="enem-kicker">NOTA ALVO • RETA FINAL DO ENEM</span><h1>Seu próximo acerto começa com o que você <em>precisa revisar.</em></h1><p>Você está estudando o que mais precisa? Teste seus conhecimentos e encontre um ponto de partida para organizar a revisão até o ENEM.</p></header><EnemLandingQuiz /></main></div>;
}
