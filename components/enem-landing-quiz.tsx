"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { landingQuestions, parseQuizAttempt, QUIZ_STORAGE_KEY, QUIZ_VERSION } from "@/lib/enem/landing-quiz";

export function EnemLandingQuiz() {
  const router = useRouter();
  const [answers, setAnswers] = useState<(number | null)[]>(() => landingQuestions.map(() => null));
  const [index, setIndex] = useState(0);
  const [started, setStarted] = useState(false);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const title = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try {
        const saved = parseQuizAttempt(JSON.parse(sessionStorage.getItem(QUIZ_STORAGE_KEY) ?? "null"));
        if (saved) {
          setAnswers(saved.answers);
          const next = saved.answers.findIndex(answer => answer === null);
          setIndex(next === -1 ? 0 : next);
        }
      } catch { /* Uma tentativa inválida não impede um novo quiz. */ }
      setReady(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);
  useEffect(() => { if (started) title.current?.focus(); }, [index, started]);

  function select(answer: number) {
    const next = answers.map((value, i) => i === index ? answer : value);
    setAnswers(next);
    try {
      sessionStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify({ version: QUIZ_VERSION, answers: next }));
      setStorageError(false);
    } catch { setStorageError(true); }
  }
  const question = landingQuestions[index];
  const answered = answers.filter(answer => answer !== null).length;
  function advance() {
    if (answers[index] === null) return;
    if (index < landingQuestions.length - 1) { setIndex(index + 1); return; }
    const missing = answers.findIndex(answer => answer === null);
    if (missing !== -1) { setIndex(missing); return; }
    try {
      sessionStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify({ version: QUIZ_VERSION, answers }));
      router.push("/resultadodoquiz");
    } catch { setStorageError(true); }
  }

  return <section className="enem-quiz" id="quiz" aria-label="Quiz diagnóstico ENEM">
    {!started ? <div className="enem-quiz-intro">
      <span className="enem-kicker">SEU PONTO DE PARTIDA</span>
      <h2>O que você já sabe?<br />Vamos descobrir.</h2>
      <p>Responda 12 questões de Linguagens, Matemática, Humanas e Natureza. Escolha uma alternativa por questão, sem consultar o gabarito.</p>
      <ul><li>Sem cadastro para responder</li><li>Você pode voltar e revisar suas escolhas</li><li>Questões autorais, com cinco alternativas</li></ul>
      <p className="enem-quiz-disclosure">Ao concluir, informe seu nome e e-mail para ver gratuitamente seus acertos, erros e assuntos para revisar. Telefone opcional. Depois, você poderá conhecer o ENEM Express, sem obrigação de compra.</p>
      <button type="button" className="enem-button" disabled={!ready} onClick={() => setStarted(true)}>{!ready ? "Preparando quiz…" : answered > 0 ? "Retomar meu quiz →" : "Começar meu quiz →"}</button>
      {answered > 0 && <p className="enem-small">{answered} de 12 respostas salvas nesta aba.</p>}
    </div> : <div>
      <div className="enem-quiz-top"><span>{question.area}</span><span>Questão {index + 1} de {landingQuestions.length}</span></div>
      <progress value={answered} max={landingQuestions.length} aria-label={`${answered} de ${landingQuestions.length} questões respondidas`} />
      <h2 ref={title} tabIndex={-1} className="enem-question-title">{question.text}</h2>
      <fieldset className="enem-options"><legend className="enem-sr-only">Selecione uma alternativa</legend>{question.options.map((option, i) => <label className={`enem-option ${answers[index] === i ? "is-selected" : ""}`} key={option}>
        <input type="radio" name={question.id} value={i} checked={answers[index] === i} onChange={() => select(i)} />
        <span className="enem-option-letter" aria-hidden="true">{String.fromCharCode(65 + i)}</span><span>{option}</span>
      </label>)}</fieldset>
      {storageError && <p role="alert" className="enem-storage-error">Não foi possível salvar suas respostas. Permita o armazenamento neste navegador e selecione sua resposta novamente para continuar até o diagnóstico.</p>}
      <div className="enem-quiz-actions"><button type="button" className="enem-button-secondary" disabled={index === 0} onClick={() => setIndex(index - 1)}>Voltar</button><button type="button" className="enem-button" disabled={answers[index] === null} onClick={advance}>{index === landingQuestions.length - 1 ? "Concluir e continuar →" : "Próxima →"}</button></div>
      <p className="enem-small">O quiz é uma sondagem inicial. Não calcula nota TRI nem avalia sua redação.</p>
    </div>}
  </section>;
}
