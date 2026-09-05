"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { evaluateQuiz, parseQuizAttempt, QUIZ_STORAGE_KEY } from "@/lib/enem/landing-quiz";

type Result = NonNullable<ReturnType<typeof evaluateQuiz>>;
export function EnemQuizResult() {
  const [result, setResult] = useState<Result | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try {
        const attempt = parseQuizAttempt(JSON.parse(sessionStorage.getItem(QUIZ_STORAGE_KEY) ?? "null"));
        if (attempt) setResult(evaluateQuiz(attempt.answers));
      } catch { /* Sem tentativa válida, oferecemos voltar ao quiz. */ }
      setReady(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);
  if (!ready) return <section className="enem-result-card" aria-live="polite"><p>Preparando sua prévia…</p></section>;
  if (!result) return <section className="enem-result-card"><h1>Seu diagnóstico começa no quiz.</h1><p>Conclua as 12 questões nesta mesma aba para ver a prévia das suas respostas.</p><Link className="enem-button" href="/#quiz">Ir para o quiz →</Link></section>;
  const priorities = result.areas.filter(area => area.correct < area.total).sort((a, b) => a.correct - b.correct);
  return <>
    <section className="enem-result-card"><span className="enem-kicker">QUIZ CONCLUÍDO • SUA PRÉVIA</span><h1>{priorities.length ? "Você já tem um ponto de partida para revisar." : "Você acertou toda esta amostra. Continue ampliando o treino."}</h1><p>Seu quiz passou pelas quatro áreas do ENEM. {priorities.length ? "As respostas indicam assuntos que vale retomar antes de avançar." : "Esse resultado é um bom sinal nos assuntos testados, mas não mede todo o conteúdo da prova."}</p><div className="enem-result-priorities"><h2>{priorities.length ? "Áreas para olhar com mais atenção" : "Seu próximo desafio"}</h2>{priorities.length ? <ul>{priorities.map(area => <li key={area.area}>{area.area}</li>)}</ul> : <p>Pratique com textos mais longos, novos conteúdos e situações de prova.</p>}</div><p className="enem-small">Esta é uma prévia baseada em 12 questões autorais. Não é nota TRI, avaliação de redação ou previsão de aprovação.</p></section>
    <section className="enem-result-next"><span className="enem-kicker">O QUE FAZER COM ESSA INFORMAÇÃO</span><h2>Transforme a dúvida em uma próxima ação.</h2><div className="enem-feature-grid"><article><span>01</span><h3>Retome o conceito</h3><p>Antes de repetir exercícios, procure entender o raciocínio que ficou faltando.</p></article><article><span>02</span><h3>Resolva outra questão</h3><p>Verifique se consegue aplicar o mesmo conteúdo em um contexto diferente.</p></article><article><span>03</span><h3>Volte ao assunto</h3><p>Distribua a revisão na sua rotina e acompanhe a evolução ao longo dos dias.</p></article></div></section>
  </>;
}
