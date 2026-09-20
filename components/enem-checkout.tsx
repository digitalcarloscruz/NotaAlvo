"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { trackFunnel } from "@/lib/analytics/track";
import { QUIZ_STORAGE_KEY } from "@/lib/enem/landing-quiz";

export function EnemCheckout({ enabled, autoStart = false, ctaLabel = "Continuar para matrícula →", showPrice = true }: { enabled: boolean; autoStart?: boolean; ctaLabel?: string; showPrice?: boolean }) {
  const router = useRouter();
  const { status: authStatus, user, signOut } = useAuth();
  const started = useRef(false);
  useEffect(() => {
    if (!autoStart || !enabled || authStatus === "loading" || authStatus === "unavailable" || started.current) return;
    started.current = true;
    void checkout();
    // Open once on arrival; retries remain an explicit action.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart, enabled, authStatus]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  useEffect(() => {
    if (authStatus !== "authenticated") return;
    const controller = new AbortController();
    let count = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const check = async () => {
      try {
        const response = await fetch("/api/billing/status", { cache: "no-store", signal: controller.signal });
        // A missing server session will not be fixed by polling repeatedly.
        if (response.status === 401) return;
        if (response.ok) {
          const data = await response.json();
          if (controller.signal.aborted) return;
          setPaymentStatus(data.status);
          if (["paid", "revoked", "expired", "none", "checkout_unavailable"].includes(data.status)) return;
        }
      } catch { /* A failed check never confirms payment. */ }
      if (!controller.signal.aborted && ++count < 20) timer = setTimeout(check, 5000);
    };
    void check();
    return () => { controller.abort(); clearTimeout(timer); };
  }, [authStatus, user?.id]);
  async function checkout() {
    trackFunnel(autoStart ? "enrollment_view" : "checkout_click");
    if (authStatus === "loading" || authStatus === "unavailable") return;
    if (authStatus !== "authenticated") {
      router.push("/entrar?mode=signup&next=%2Fmatricula");
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/billing/checkout", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: sessionStorage.getItem(QUIZ_STORAGE_KEY) ?? "null",
      });
      if (response.status === 401) {
        await signOut();
        router.push("/entrar?mode=signup&next=%2Fmatricula");
        return;
      }
      const data = await response.json();
      if (!response.ok) { setMessage(data.error ?? "Não foi possível abrir o pagamento."); return; }
      window.location.assign(data.url);
    } catch { setMessage("Não foi possível abrir o pagamento. Tente novamente em instantes."); }
    finally { setBusy(false); }
  }
  if (paymentStatus === "paid") return <div><p role="status">Pagamento confirmado! Seu ENEM Express está liberado.</p><a className="enem-button" href="/app">Acessar meu ENEM Express →</a></div>;
  if (paymentStatus === "revoked") return <p role="status">O acesso deste pedido foi suspenso por estorno ou contestação. Entre em contato com o suporte.</p>;
  return <div>{paymentStatus === "checkout_unavailable" && <p role="status">O link de pagamento ainda não está disponível. Seu pedido foi registrado; entre em contato com o suporte para continuar.</p>}{paymentStatus === "pending" && <p role="status">Aguardando a confirmação do pagamento. Se você já pagou, aguarde a atualização.</p>}{showPrice && <p><strong>R$ 97,00</strong> • pagamento único</p>}<p className="enem-small">Pagamento pelo Asaas. Sem assinatura recorrente. {autoStart ? "O pagamento ficará vinculado à sua conta." : "Crie sua conta ou entre antes de pagar para vincular o acesso à sua conta."}</p><button className="enem-button" disabled={!enabled || busy || authStatus === "loading" || authStatus === "unavailable"} onClick={checkout}>{busy ? "Abrindo pagamento…" : enabled ? ctaLabel : "Matrículas em breve"}</button>{message && <p role="alert">{message}</p>}</div>;
}
