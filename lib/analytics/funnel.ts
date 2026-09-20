export const FUNNEL_EVENTS = ["quiz_view", "quiz_started", "quiz_completed", "result_view", "checkout_click", "enrollment_view"] as const;
export type FunnelEvent = typeof FUNNEL_EVENTS[number];
