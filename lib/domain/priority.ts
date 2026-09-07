/** Shared heuristic, not TRI or an official university weighting. */
export function priorityScore(weight: number, mastery: number, confidence: number, daysSince: number, urgency: number, errorRate = 0) {
  const clamp = (n: number) => Math.max(0, Math.min(1, n));
  return Math.round(clamp(clamp(weight) * .30 + (1 - clamp(mastery)) * .35 + clamp(daysSince / 30) * .10 + clamp(urgency) * .1 + (1 - clamp(confidence)) * .05 + clamp(errorRate) * .10) * 100);
}
