import Link from "next/link";
import type { ReactNode } from "react";
import { Brand } from "@/components/brand";
import { PublicFooter } from "@/components/public-footer";

export function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  return <div className="enem-landing"><header className="enem-nav"><Brand /><Link href="/">Voltar ao quiz</Link></header><main className="legal-content"><h1>{title}</h1><p className="legal-date">Atualizado em 7 de setembro de 2026</p>{children}</main><PublicFooter /></div>;
}
