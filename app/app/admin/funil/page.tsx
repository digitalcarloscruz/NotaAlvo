import type { Metadata } from "next";
import Link from "next/link";
import { FunnelDashboard } from "@/components/funnel-dashboard";

export const metadata: Metadata = { title: "Funil de vendas" };

export default function FunnelPage() {
  return <div className="next-content"><header className="page-header"><div><p className="eyebrow">CONVERSÃO</p><h1>Onde estamos perdendo alunos.</h1><p>Do primeiro acesso ao quiz até o pagamento, etapa por etapa.</p></div><div className="button-row"><Link className="secondary-button link-button" href="/app/admin">Administração</Link><Link className="secondary-button link-button" href="/app/admin/operacoes">Operação</Link></div></header><FunnelDashboard /></div>;
}
