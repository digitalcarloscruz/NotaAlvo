"use client";

import { useCallback, useEffect, useState } from "react";

type Funnel = {
  days: number;
  steps: { quizViews: number; quizStarted: number; quizCompleted: number; contacts: number; resultViews: number; checkoutClicks: number; signups: number; checkoutsCreated: number; paid: number };
  revenueCents: number;
  averageCorrect: number | null;
  distribution: number[];
  bands: Array<{ label: string; leads: number; checkouts: number; paid: number }>;
  areas: Array<{ area: string; rate: number }>;
  leads: Array<{ name: string; email: string; phone: string | null; createdAt: string; correct: number | null; total: number; areas: Array<{ area: string; correct: number; total: number }>; stage: "lead" | "checkout" | "paid" }>;
};

const periods = [[1, "24 horas"], [7, "7 dias"], [30, "30 dias"], [90, "90 dias"]] as const;
const percent = (part: number, total: number) => total ? `${Math.round(part / total * 1000) / 10}%` : "—";

export function FunnelDashboard() {
  const [days, setDays] = useState(7);
  const [data, setData] = useState<Funnel | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const load = useCallback(async (period: number) => {
    setLoading(true);
    const response = await fetch(`/api/admin/funnel?days=${period}`, { cache: "no-store" });
    const payload = await response.json().catch(() => ({}));
    if (response.ok) { setData(payload); setMessage(""); } else { setData(null); setMessage(payload.error ?? "Painel indisponível."); }
    setLoading(false);
  }, []);
  useEffect(() => { queueMicrotask(() => { void load(days); }); }, [days, load]);
  if (loading && !data) return <div className="surface empty-state">Consolidando o funil…</div>;
  if (!data) return <div className="surface empty-state"><b>Acesso não liberado</b><p>{message}</p></div>;
  const s = data.steps;
  const stages: Array<[string, number, string]> = [
    ["Abriram o quiz", s.quizViews, "Visitantes únicos em /quiz"],
    ["Iniciaram o quiz", s.quizStarted, "Responderam a 1ª questão"],
    ["Concluíram o quiz", s.quizCompleted, "Responderam as 12 questões"],
    ["Deixaram nome e e-mail", s.contacts, "Contatos salvos para ver o resultado"],
    ["Clicaram para comprar", s.checkoutClicks, "Botão do ENEM Express no resultado"],
    ["Cadastros na plataforma", s.signups, "Contas criadas no período (qualquer origem)"],
    ["Checkouts gerados", s.checkoutsCreated, "Pedidos criados no Asaas"],
    ["Pagamentos realizados", s.paid, "Pedidos pagos"],
  ];
  return <div className="operations">
    <div className="button-row">{periods.map(([value, label]) => <button key={value} type="button" className={value === days ? "primary-button" : "secondary-button"} onClick={() => setDays(value)}>{label}</button>)}</div>
    <section className="surface"><div className="panel-head"><div><h3>Funil por etapa</h3><p>Últimos {data.days === 1 ? "24 horas" : `${data.days} dias`}. Visitantes são contados por navegador; cadastros e pagamentos, por conta.</p></div></div>
      <div className="funnel-list">{stages.map(([label, value, hint], index) => {
        const top = stages[0][1] || value || 1;
        return <div className="funnel-row" key={label}>
          <div className="funnel-label"><b>{label}</b><small>{hint}</small></div>
          <div className="funnel-bar"><i style={{ width: `${Math.max(2, Math.min(100, value / top * 100))}%` }} /></div>
          <strong>{value}</strong>
          <small>{index === 0 ? "" : `${percent(value, stages[index - 1][1])} da etapa anterior`}</small>
        </div>;
      })}</div>
    </section>
    <section className="operations-metrics funnel-metrics">
      <article className="surface"><span>Quiz iniciado → concluído</span><strong>{percent(s.quizCompleted, s.quizStarted)}</strong></article>
      <article className="surface"><span>Quiz concluído → contato</span><strong>{percent(s.contacts, s.quizCompleted)}</strong></article>
      <article className="surface"><span>Abriu quiz → pagou</span><strong>{percent(s.paid, s.quizViews)}</strong></article>
      <article className="surface"><span>Receita confirmada</span><strong>{(data.revenueCents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</strong></article>
    </section>
    <section className="surface"><div className="panel-head"><div><h3>Dificuldade do quiz</h3><p>Média de {data.averageCorrect ?? "—"} acertos em 12 questões. Se a maioria acerta pouco, o quiz pode estar desanimando; se acerta muito, a pessoa pode não sentir necessidade de comprar.</p></div></div>
      <div className="funnel-dist">{data.distribution.map((value, correct) => <div key={correct}><span style={{ height: `${Math.max(3, value / Math.max(1, ...data.distribution) * 100)}%` }} title={`${value} leads`} /><b>{value}</b><small>{correct}</small></div>)}</div>
      <p className="enem-small">Leads por número de acertos.</p>
      <div className="operations-facts">{data.areas.map((area) => <span key={area.area}><small>Taxa de acerto — {area.area}</small><b>{area.rate}%</b></span>)}</div>
    </section>
    <section className="surface"><div className="panel-head"><div><h3>Conversão por desempenho</h3><p>Quem acerta mais ou menos compra mais?</p></div></div>
      <div className="operations-plans">{data.bands.map((band) => <span key={band.label}><b>{band.label}</b><strong>{band.leads} leads · {band.checkouts} checkouts · {band.paid} pagos ({percent(band.paid, band.leads)})</strong></span>)}</div>
    </section>
    <section className="surface operations-log"><div className="panel-head"><div><h3>Leads do quiz</h3><p>Nome, contato, acertos e situação da compra ({data.leads.length} mais recentes)</p></div></div>
      {data.leads.length === 0 ? <div className="empty-state">Nenhum lead no período.</div> : <div className="funnel-table"><table><thead><tr><th>Nome</th><th>E-mail</th><th>Telefone</th><th>Acertos</th><th>Por área</th><th>Situação</th><th>Data</th></tr></thead><tbody>{data.leads.map((lead) => <tr key={`${lead.email}-${lead.createdAt}`}><td>{lead.name}</td><td>{lead.email}</td><td>{lead.phone ?? "—"}</td><td><b>{lead.correct === null ? "—" : `${lead.correct}/${lead.total}`}</b></td><td>{lead.areas.map((area) => `${area.area.slice(0, 3)} ${area.correct}/${area.total}`).join(" · ")}</td><td>{lead.stage === "paid" ? "Pagou" : lead.stage === "checkout" ? "Abriu checkout" : "Só o quiz"}</td><td>{new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }).format(new Date(lead.createdAt))}</td></tr>)}</tbody></table></div>}
    </section>
    <p className="enem-small">Eventos de navegação (abriu, iniciou, concluiu, clicou) passam a ser contados a partir da publicação desta versão. Contatos, cadastros e pagamentos usam o histórico existente.</p>
  </div>;
}
