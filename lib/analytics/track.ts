"use client";

import type { FunnelEvent } from "@/lib/analytics/funnel";

const VISITOR_KEY = "nota-alvo-visitor-id";

function visitorId() {
  try {
    let id = localStorage.getItem(VISITOR_KEY);
    if (!id) { id = crypto.randomUUID(); localStorage.setItem(VISITOR_KEY, id); }
    return id;
  } catch { return null; }
}

// Registra uma vez por aba e evento; falhas nunca afetam a experiência do aluno.
export function trackFunnel(event: FunnelEvent) {
  try {
    const seenKey = `nota-alvo-funnel-${event}`;
    if (sessionStorage.getItem(seenKey)) return;
    const id = visitorId();
    if (!id) return;
    sessionStorage.setItem(seenKey, "1");
    void fetch("/api/track", {
      method: "POST", headers: { "Content-Type": "application/json" }, keepalive: true,
      body: JSON.stringify({ visitorId: id, event, path: location.pathname }),
    }).catch(() => undefined);
  } catch { /* Analytics é opcional. */ }
}
