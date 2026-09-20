import type { Metadata } from "next";
import { Brand } from "@/components/brand";
import { EnemLandingQuiz } from "@/components/enem-landing-quiz";
import { daysUntilEnem } from "@/lib/enem/countdown";

export const metadata: Metadata = {
  title: "Quiz ENEM — descubra o que revisar",
  description: "Responda a 12 questões oficiais das quatro áreas do ENEM e descubra, de graça, o que revisar antes da prova.",
  alternates: { canonical: "https://www.notaalvo.com.br/quiz" },
};

// Recalcula a contagem regressiva a cada hora sem tornar a página dinâmica.
export const revalidate = 3600;

export default function QuizPage() {
  const daysLeft = daysUntilEnem();
  return <div className="enem-landing quiz-page">
    <header className="enem-nav quiz-nav"><Brand /></header>
    <main className="quiz-page-main">
      <header className="quiz-page-heading">
        {daysLeft > 0 && <span className="quiz-countdown"><b>{daysLeft}</b> {daysLeft === 1 ? "dia" : "dias"} para o ENEM</span>}
        <h1>Você sabe o que ainda <em>está tirando pontos da sua nota?</em></h1>
        <p>Na reta final, revisar tudo é impossível. Responda 12 questões oficiais do ENEM e descubra em quais áreas você mais precisa focar.</p>
        <ul className="quiz-benefits" aria-label="Como funciona">
          <li>12 questões oficiais do Inep</li>
          <li>Leva poucos minutos</li>
          <li>100% gratuito</li>
          <li>Resultado por área</li>
        </ul>
      </header>
      <EnemLandingQuiz />
    </main>
  </div>;
}
