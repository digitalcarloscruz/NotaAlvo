"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { QUIZ_STORAGE_KEY } from "@/lib/enem/landing-quiz";

export function EnemCheckout({ enabled }: { enabled: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  async function checkout() {
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/billing/checkout", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: sessionStorage.getItem(QUIZ_STORAGE_KEY) ?? "null",
      });
      if (response.status === 401) {
        router.push("/entrar?next=%2Fresultadodoquiz");
        return;
      }
      const data = await response.json();
      if (!response.ok) { setMessage(data.error ?? "Não foi possível abrir o pagamento."); return; }
      window.location.assign(data.url);
    } catch { setMessage("Não foi possível abrir o pagamento. Tente novamente em instantes."); }
    finally { setBusy(false); }
  }
  return <div><p><strong>R$ 97,00</strong> • pagamento único</p><p className="enem-small">Pagamento pelo Asaas. Sem assinatura recorrente.</p><button className="enem-button" disabled={!enabled || busy} onClick={checkout}>{busy ? "Abrindo pagamento…" : enabled ? "Continuar para matrícula →" : "Matrículas em breve"}</button>{message && <p role="alert">{message}</p>}</div>;
}
