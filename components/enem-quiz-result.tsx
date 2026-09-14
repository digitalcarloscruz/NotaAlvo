"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { getQuizQuestions, evaluateQuiz, parseQuizAttempt, QUIZ_STORAGE_KEY, type QuizAttempt } from "@/lib/enem/landing-quiz";
import { QUIZ_CONTACT_KEY, quizContactSchema } from "@/lib/enem/quiz-contact";

import { quizMessage } from "@/lib/enem/quiz-message";

type Result = NonNullable<ReturnType<typeof evaluateQuiz>>;
export function EnemQuizResult({ children }: { children: ReactNode }) {
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [ready, setReady] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try {
        const saved = parseQuizAttempt(JSON.parse(sessionStorage.getItem(QUIZ_STORAGE_KEY) ?? "null"));
        if (saved && evaluateQuiz(saved.answers, saved.version)) {
          setAttempt(saved);
          const previous = JSON.parse(sessionStorage.getItem(QUIZ_CONTACT_KEY) ?? "null");
          const contact = quizContactSchema.safeParse(previous?.contact);
          if (contact.success) {
            setName(contact.data.name); setEmail(contact.data.email); setPhone(contact.data.phone);
            if (previous.attempt === JSON.stringify(saved)) setResult(evaluateQuiz(saved.answers, saved.version));
          }
        }
      } catch { /* Invalid or blocked storage does not fabricate a result. */ }
      setReady(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);
  useEffect(() => { if (result) heading.current?.focus(); }, [result]);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const contact = quizContactSchema.safeParse({ name, email, phone });
    if (!contact.success) { setMessage(contact.error.issues[0].message); return; }
    setBusy(true); setMessage("");
    try {
      const response = await fetch("/api/quiz/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contact: contact.data, attempt, website: new FormData(event.currentTarget).get("website") }) });
      const data = await response.json();
      if (!response.ok) { setMessage(data.error ?? "Não foi possível continuar. Tente novamente."); return; }
      try { sessionStorage.setItem(QUIZ_CONTACT_KEY, JSON.stringify({ contact: contact.data, attempt: JSON.stringify(attempt) })); } catch { /* Still reveal the saved result if local storage is full. */ }
      setName(contact.data.name);
      setResult(data.result);
    } catch { setMessage("Não foi possível conectar. Confira sua conexão e tente novamente."); }
    finally { setBusy(false); }
  }
  if (!ready) return <section className="enem-result-card" aria-live="polite"><p>Preparando seu resultado…</p></section>;
  if (!attempt) return <section className="enem-result-card"><h1>Seu diagnóstico começa no quiz.</h1><p>Conclua as 12 questões nesta mesma aba para ver suas respostas.</p><Link className="enem-button" href="/quiz">Ir para o quiz →</Link></section>;
  if (!result) return <section className="enem-result-card quiz-contact-card"><span className="enem-kicker">12 QUESTÕES CONCLUÍDAS</span><h1>Seu resultado está pronto.</h1><p>Informe seu nome e e-mail para ver seus acertos, erros, assuntos para revisar e até duas resoluções comentadas. É gratuito e não exige cartão.</p>
    <form className="auth-form" onSubmit={submit}>
      <label>Seu nome<input autoComplete="name" value={name} onChange={e => setName(e.target.value)} required minLength={2} maxLength={120} /></label>
      <label>E-mail<input type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} required maxLength={254} /></label>
      <label>Telefone <span className="enem-small">(opcional)</span><input type="tel" autoComplete="tel" value={phone} onChange={e => setPhone(e.target.value)} maxLength={24} /></label>
      <div hidden aria-hidden="true"><label>Site<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
      <p className="enem-small">Vamos registrar seus dados e as respostas para identificar seu diagnóstico e facilitar o atendimento. Isso não cria uma conta nem autoriza mensagens promocionais. <Link href="/privacidade">Veja a Política de Privacidade.</Link></p>
      {message && <p role="alert">{message}</p>}
      <button className="enem-button" disabled={busy}>{busy ? "Salvando…" : "Ver meus acertos e o que revisar →"}</button>
    </form></section>;
  const copy = quizMessage(result.correct);
  const questions = getQuizQuestions(attempt.version);
  const mistakes = questions.map((question, index) => ({ question, index })).filter(({ question, index }) => attempt.answers[index] !== question.answer);
  const remaining = Math.max(0, mistakes.length - 2);
  const priorities = result.areas.filter(area => area.correct < area.total).sort((a, b) => a.correct - b.correct);
  return <><section className="enem-result-card"><span className="enem-kicker">SUA RETA FINAL COMEÇA AGORA</span><h1 ref={heading} tabIndex={-1}>{name.split(" ")[0]}, {copy.title.charAt(0).toLowerCase() + copy.title.slice(1)}</h1><p>{copy.description}</p><p>{copy.next}</p></section><section className="enem-result-card" id="meu-resultado"><span className="enem-kicker">SEU RESULTADO GRATUITO</span><h2>Confira seus acertos e pontos de atenção.</h2>
    <div className="quiz-score"><div><strong>{result.correct}</strong><span>acertos</span></div><div><strong>{result.total - result.correct}</strong><span>erros</span></div><div><strong>{result.total}</strong><span>questões</span></div></div>
    <p>{priorities.length ? "Cada erro mostra uma oportunidade de revisar com mais foco. Comece pelos assuntos abaixo." : "Você acertou todas as questões! Amplie o treino com outros assuntos e situações de prova."}</p>
    <div className="quiz-area-results">{result.areas.map(area => <article key={area.area}><h2>{area.area}</h2><p><strong>{area.correct} de {area.total} acertos</strong></p><p>{area.reviewTopics.length ? `Revisar: ${area.reviewTopics.join(", ")}.` : "Todos os assuntos desta amostra respondidos corretamente."}</p></article>)}</div>
    <div className="quiz-error-details"><h2>{priorities.length ? "Entenda suas respostas" : "Próximos passos"}</h2>{!priorities.length && <p>Experimente outras habilidades, pratique com tempo marcado e avalie sua redação. Acertar esta amostra não dispensa a revisão nem demonstra domínio de toda a prova.</p>}{mistakes.slice(0, 2).map(({ question, index }) => <article className="quiz-answer-preview" key={question.id}><h3>Questão {index + 1} • Revisar {question.topic}</h3><p style={{ whiteSpace: "pre-line" }}>{question.text}</p><p>Sua resposta: {question.options[attempt.answers[index]!]}</p><p><strong>Resposta correta: {String.fromCharCode(65 + question.answer)} — {question.options[question.answer]}</strong></p><p>{question.explanation}</p>{question.source && <p className="enem-small">ENEM {question.source.year} • {question.source.application} • {question.source.booklet} • questão {question.source.number}. Resolução comentada da Nota Alvo.</p>}</article>)}{remaining > 0 && <div className="quiz-review-enrollment"><p><strong>{remaining === 1 ? "Há mais uma questão para revisar." : `Há mais ${remaining} questões para revisar.`}</strong></p><p>Faça sua matrícula para continuar a revisão na plataforma, com seu caderno de erros e um plano de estudos orientado pelas suas respostas.</p><Link className="enem-button" href="/matricula">Fazer matrícula →</Link></div>}</div><p className="enem-small">{attempt.version === 1 ? "Sondagem de 12 questões autorais." : "Desafio de 12 questões oficiais, com seleção e dificuldade editoriais. Uma amostra exigente, não uma avaliação de todo o ENEM."} Não calcula TRI nem prevê nota ou aprovação.</p></section>{children}</>;
}
