"use client";

import { useEffect, useState } from "react";
import { ESSAY_CHAPTERS, MIND_MAP, PRACTICE_THEMES, STUDY_SOURCE } from "@/lib/essay/study-content";
import { REPERTOIRE } from "@/lib/essay/references";
import { HISTORICAL_THEMES } from "@/lib/essay/themes";
import type { EssayRadar } from "@/lib/essay/radar";

const normalize = (text: string) => text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export function EssayMindMap() {
  return <section className="essay-mindmap" aria-label="Mapa mental: inclusão digital de idosos"><h3>Mapa aplicado: inclusão digital de idosos</h3><p>Leia da tese aos argumentos e confira se as ações respondem às causas.</p><div>{MIND_MAP.map(item => <article key={item.branch}><h4>{item.branch}</h4><ul>{item.nodes.map(node => <li key={node}>{node}</li>)}</ul></article>)}</div></section>;
}

export function EssayChapters() {
  return <section className="essay-section"><header><div><p className="eyebrow">CURSO DE REDAÇÃO</p><h2>Estude um capítulo. Aplique no seu texto.</h2></div><a href={STUDY_SOURCE} target="_blank" rel="noreferrer">Cartilha do Inep ↗</a></header><p>Conteúdo autoral de estudo. Os exemplos acompanham o tema de inclusão digital para mostrar como um texto se constrói.</p><div className="essay-chapters">{ESSAY_CHAPTERS.map((chapter, index) => <details key={chapter.title} open={index === 0 ? true : undefined}><summary><span>{String(index + 1).padStart(2, "0")}</span><div><h3>{chapter.title}</h3><p>{chapter.summary}</p></div></summary><div className="essay-chapter-body"><p>{chapter.lesson}</p><blockquote><b>Exemplo comentado</b><p>{chapter.example}</p></blockquote>{index === 2 && <EssayMindMap />}<div className="practice-callout"><b>Coloque em prática</b><p>{chapter.exercise}</p></div><p><strong>Antes de avançar:</strong> {chapter.check}</p></div></details>)}</div></section>;
}

export function EssayReferences() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todas");
  const items = REPERTOIRE.filter(item => (category === "Todas" || item.category === category) && normalize(Object.values(item).join(" ")).includes(normalize(query)));
  return <section className="essay-section"><header><div><p className="eyebrow">BIBLIOTECA DE REPERTÓRIOS</p><h2>Da referência ao argumento</h2></div><p>{REPERTOIRE.length} referências para explorar</p></header><p>As frases abaixo são sínteses e paráfrases didáticas, não citações literais. Identifique autor e obra ao usá-las; reserve as aspas para palavras conferidas na fonte. Os exemplos de aplicação são propostas de análise.</p><div className="essay-filters"><label>Buscar autor, obra ou tema<input value={query} onChange={event => setQuery(event.target.value)} placeholder="Ex.: educação, cinema, Freire" /></label><label>Área<select aria-label="Área" value={category} onChange={event => setCategory(event.target.value)}>{["Todas", ...new Set(REPERTOIRE.map(item => item.category))].map(item => <option key={item}>{item}</option>)}</select></label></div><p role="status">{items.length} referências encontradas</p><div className="reference-grid">{items.map(item => <article key={`${item.author}-${item.work}`}><small>{item.category} · {item.tags}</small><h3>{item.author}</h3><strong>{item.work}</strong><p>{item.idea}</p><p><b>Como aplicar:</b> {item.application}</p><a href={item.url} target="_blank" rel="noreferrer">Consultar obra ou acervo ↗</a></article>)}</div>{items.length === 0 && <p>Tente outro autor ou escolha todas as áreas.</p>}</section>;
}

export function EssayThemes({ onTrain }: { onTrain: (theme: string) => void }) {
  const [query, setQuery] = useState("");
  const [edition, setEdition] = useState("Todas");
  const items = HISTORICAL_THEMES.filter(item => (edition === "Todas" || item.edition === edition) && normalize(`${item.year} ${item.title}`).includes(normalize(query)));
  return <section className="essay-section"><header><div><p className="eyebrow">ACERVO DE TEMAS</p><h2>Aprenda com as propostas anteriores</h2></div><p>{HISTORICAL_THEMES.length} propostas · 1998–2025</p></header><p>Inclui todas as edições regulares de 1998 a 2025 e propostas de aplicações especiais identificadas no catálogo. Consulte a fonte para ler os textos motivadores e as instruções originais.</p><div className="essay-filters"><label>Buscar ano ou assunto<input value={query} onChange={event => setQuery(event.target.value)} placeholder="Ex.: 2025, cultura, trabalho" /></label><label>Aplicação<select aria-label="Aplicação" value={edition} onChange={event => setEdition(event.target.value)}>{["Todas", ...new Set(HISTORICAL_THEMES.map(item => item.edition))].map(item => <option key={item}>{item}</option>)}</select></label></div><p role="status">{items.length} propostas encontradas</p><div className="essay-theme-list">{items.map(item => <article key={`${item.year}-${item.edition}`}><small>{item.year} · {item.edition}</small><h3>{item.title}</h3>{item.note && <p>{item.note}</p>}<div><button type="button" className="secondary-button" onClick={() => onTrain(item.title)}>Treinar este tema →</button><a href={item.url} target="_blank" rel="noreferrer">Consultar fonte ↗</a></div></article>)}</div>{!items.length && <p>Nenhum tema corresponde aos filtros.</p>}</section>;
}

export function EssayRadarPanel({ onTrain }: { onTrain: (theme: string) => void }) {
  const [radar, setRadar] = useState<EssayRadar | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/redacoes/radar", { signal: controller.signal }).then(async response => {
      const payload = await response.json();
      if (controller.signal.aborted) return;
      if (response.ok) setRadar(payload.data);
      else setMessage(payload.error || "Radar indisponível no momento.");
    }).catch(() => { if (!controller.signal.aborted) setMessage("Não foi possível consultar a edição semanal."); });
    return () => controller.abort();
  }, []);
  async function research() {
    setLoading(true); setMessage("");
    try {
      const response = await fetch("/api/redacoes/radar", { method: "POST", signal: AbortSignal.timeout(60_000) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Pesquisa indisponível.");
      if (payload.pending) setMessage("A edição está sendo preparada ou aguarda uma nova tentativa. Consulte novamente em alguns minutos.");
      else setRadar(payload.data);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Não foi possível pesquisar agora."); }
    finally { setLoading(false); }
  }
  return <section className="essay-section"><header><div><p className="eyebrow">RADAR IA DE REDAÇÃO</p><h2>Atualidades para transformar em treino</h2></div><button type="button" className="primary-button" onClick={() => void research()} disabled={loading}>{loading ? "Pesquisando fontes…" : "Consultar radar da semana"}</button></header><p>A IA relaciona publicações recentes ao histórico do Enem e propõe hipóteses para estudo. A ordem indica relevância pedagógica, não a chance de um tema cair na prova. Nova edição semanal, compartilhada entre os alunos.</p>{message && <p role="status">{message}</p>}{loading && <p role="status">A pesquisa pode levar até um minuto. Os temas de treino abaixo continuam disponíveis.</p>}{radar && <><p>Semana de {radar.weekStart.split("-").reverse().join("/")} · Pesquisa em {new Date(radar.generatedAt).toLocaleDateString("pt-BR", { timeZone: "UTC" })}</p><div className="essay-theme-list">{radar.themes.map((item, index) => <article key={item.title}><small>Sugestão {index + 1} · hipótese de treino</small><h3>{item.title}</h3><p>{item.reason}</p><p><b>Relação com o histórico:</b> {item.historicalConnection}</p><ul>{item.axes.map(axis => <li key={axis}>{axis}</li>)}</ul><p><b>Exercício:</b> {item.exercise}</p><ul>{item.sources.map(source => <li key={source.url}><a href={source.url} target="_blank" rel="noreferrer">{source.title}</a> · {source.publishedAt}</li>)}</ul><button type="button" className="secondary-button" onClick={() => onTrain(item.title)}>Treinar este tema →</button></article>)}</div></>}<h3>Banco de hipóteses para treino</h3><p>Seleção editorial fixa para ampliar seu repertório de temas. Não representa uma pesquisa de notícias da semana.</p><div className="essay-theme-list">{PRACTICE_THEMES.map(item => <article key={item.title}><small>{item.axis} · tema autoral</small><h3>{item.title}</h3><p>{item.reason}</p><button type="button" className="secondary-button" onClick={() => onTrain(item.title)}>Treinar este tema →</button></article>)}</div></section>;
}
