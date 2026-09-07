import type { Metadata } from "next";
import Link from "next/link";
import { Brand } from "@/components/brand";
import { EnemCheckout } from "@/components/enem-checkout";
import { PublicFooter } from "@/components/public-footer";
import { isEnemExpressAvailable } from "@/lib/billing/enem-express";

export const metadata: Metadata = { title: "Pagamento ENEM Express", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default function EnrollmentPage() {
  return <div className="enem-landing">
    <header className="enem-nav"><Brand /></header>
    <main className="enem-result-main">
      <section className="enem-course-preview">
        <p className="enem-kicker">MATRÍCULA • PAGAMENTO</p>
        <h1>Conclua sua matrícula no ENEM Express</h1>
        <p>Vamos abrir o pagamento seguro no Asaas. Seu acesso será liberado após a confirmação do pagamento.</p>
        <EnemCheckout enabled={process.env.ASAAS_CHECKOUT_ENABLED === "true" && isEnemExpressAvailable()} autoStart />
        <p><Link href="/resultadodoquiz">Voltar ao resultado do quiz</Link></p>
      </section>
    </main>
    <PublicFooter />
  </div>;
}
