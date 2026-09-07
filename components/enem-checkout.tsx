"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { QUIZ_STORAGE_KEY } from "@/lib/enem/landing-quiz";

export function EnemCheckout({ enabled }: { enabled: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    let count = 0;
    const check = async () => {
      try {
        const response = await fetch("/api/billing/status", { cache: "no-store", signal: controller.signal });
        if (response.ok) setPaymentStatus((await response.json()).status);
      } catch { /* A failed check never confirms payment. */ }
    };
    void check();
    const interval = setInterval(() => { if (++count < 20) void check(); else clearInterval(interval); }, 5000);
    return () => { controller.abort(); clearInterval(interval); };
  }, []);
  async function checkout() {
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/billing/checkout", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: sessionStorage.getItem(QUIZ_STORAGE_KEY) ?? "null",
      });
      if (response.status === 401) {
        router.push("/entrar?mode=signup&next=%2Fresultadodoquiz%23matricula");
        return;
      }
      const data = await response.json();
      if (!response.ok) { setMessage(data.error ?? "Não foi possível abrir o pagamento."); return; }
      window.location.assign(data.url);
    } catch { setMessage("Não foi possível abrir o pagamento. Tente novamente em instantes."); }
    finally { setBusy(false); }
  }
  if (paymentStatus === "paid") return <div><p role="status">Pagamento confirmado! Seu ENEM Express está liberado.</p><a className="enem-button" href="/entrar">Acessar meu ENEM Express →</a></div>;
  if (paymentStatus === "revoked") return <p role="status">O acesso deste pedido foi suspenso por estorno ou contestação. Entre em contato com o suporte.</p>;
  return <div>{paymentStatus === "pending" && <p role="status">Aguardando a confirmação do pagamento. Se você já pagou, aguarde a atualização.</p>}<p><strong>R$ 97,00</strong> • pagamento único</p><p className="enem-small">Pagamento pelo Asaas. Sem assinatura recorrente. Crie sua conta ou entre antes de pagar para vincular o acesso ao seu e-mail.</p><button className="enem-button" disabled={!enabled || busy} onClick={checkout}>{busy ? "Abrindo pagamento…" : enabled ? "Continuar para matrícula →" : "Matrículas em breve"}</button>{message && <p role="alert">{message}</p>}</div>;
}
