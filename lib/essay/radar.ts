import { z } from "zod";

const sourceSchema = z.object({ title: z.string().min(3).max(250), url: z.string().url().refine(value => value.startsWith("https://")), publishedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) });
export const radarSchema = z.object({
  themes: z.array(z.object({
    title: z.string().min(15).max(250),
    reason: z.string().min(20).max(800),
    historicalConnection: z.string().min(10).max(600),
    axes: z.array(z.string().min(5).max(300)).length(2),
    exercise: z.string().min(10).max(600),
    sources: z.array(sourceSchema).min(1).max(3),
  })).min(1).max(6),
});
export type EssayRadar = z.infer<typeof radarSchema> & { weekStart: string; generatedAt: string };

// Use a single editorial week in UTC, independent of client locale or timezone.
export function radarWeek(now = new Date()) {
  const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  date.setUTCDate(date.getUTCDate() - (date.getUTCDay() + 6) % 7);
  return date.toISOString().slice(0, 10);
}

export function validateRadarSources(input: z.infer<typeof radarSchema>, searchResults: Array<{ url: string; date: string | null }>, now = new Date()) {
  const known = new Map(searchResults.map(source => [source.url, source.date?.slice(0, 10)]));
  const cutoff = now.getTime() - 7 * 86_400_000;
  return { themes: input.themes.filter(theme => theme.sources.every(source => {
    const date = Date.parse(`${source.publishedAt}T23:59:59Z`);
    return known.get(source.url) === source.publishedAt && Number.isFinite(date) && new Date(date).toISOString().slice(0, 10) === source.publishedAt && date >= cutoff && Date.parse(source.publishedAt) <= now.getTime();
  })) };
}
