#!/usr/bin/env node
import { canRepairStatement } from "./lib/enem-promotion.mjs";

const url = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/$/, "");
const serviceKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "";
if (!url || !serviceKey) throw new Error("Configure SUPABASE_URL e a chave server-side do Supabase.");

const baseHeaders = {
  apikey: serviceKey,
  ...(!serviceKey.startsWith("sb_secret_") ? { authorization: `Bearer ${serviceKey}` } : {}),
  "content-type": "application/json",
};

async function rest(path, init = {}) {
  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...init,
    headers: { ...baseHeaders, ...(init.headers || {}) },
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`${response.status} ${path}: ${text.slice(0, 900)}`);
  return text ? JSON.parse(text) : null;
}

async function all(path, pageSize = 1000) {
  const result = [];
  for (let start = 0; ; start += pageSize) {
    const rows = await rest(path, { headers: { Range: `${start}-${start + pageSize - 1}` } });
    result.push(...rows);
    if (rows.length < pageSize) return result;
  }
}

async function upsert(table, rows, conflict, size = 200) {
  for (let start = 0; start < rows.length; start += size) {
    await rest(`${table}?on_conflict=${encodeURIComponent(conflict)}`, {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify(rows.slice(start, start + size)),
    });
    process.stdout.write(`\r${table}: ${Math.min(start + size, rows.length)}/${rows.length}`);
  }
  if (rows.length) process.stdout.write("\n");
}

const ROUTES = [
  ["Linguagens", "LINGUAGENS.INTERPRETACAO", /./],
  ["Matemática", "MAT.PROBLEMAS", /./],
  ["Ciências Humanas", "HUM.GEOGRAFIA", /geograf|territ[oó]ri|urban|clima|relevo|migra|popula[cç][aã]o|cartogr|espa[cç]o/i],
  ["Ciências Humanas", "HUM.FILOSOFIA_SOCIOLOGIA", /filosof|sociolog|[ée]tica|cultura|ideologia|cidadania|sociedade/i],
  ["Ciências Humanas", "HUM.HISTORIA", /./],
  ["Ciências da Natureza", "NAT.FISICA", /velocidade|for[cç]a|energia|movimento|circuito|el[eé]tric|onda|press[aã]o|calor|pot[eê]ncia/i],
  ["Ciências da Natureza", "NAT.QUIMICA", /rea[cç][aã]o|mol[eé]cul|[aá]cido|base|solu[cç][aã]o|concentra[cç][aã]o|elemento|liga[cç][aã]o|qu[ií]mic/i],
  ["Ciências da Natureza", "NAT.BIOLOGIA", /./],
  ["Interdisciplinar", "CONHECIMENTOS_GERAIS.CIDADANIA", /./],
];

function topicCode(item) {
  const text = `${item.statement} ${item.raw_text || ""}`;
  return ROUTES.find(([axis, , pattern]) => axis === item.axis && pattern.test(text))?.[1] ?? "CONHECIMENTOS_GERAIS.CIDADANIA";
}

function axisName(item) {
  return item.axis === "Interdisciplinar" ? "Conhecimentos Gerais" : item.axis;
}

async function main() {
  const [reviewers, axes, topics, existing, items] = await Promise.all([
    rest("profiles?select=id,account_role&account_role=in.(admin,reviewer)&order=created_at.asc&limit=1"),
    rest("question_axes?select=id,name"),
    rest("topics?select=id,stable_code,name"),
    all("questions?select=id,content_hash,provenance,options,correct_option"),
    all("enem_archive_items?select=id,exam_id,exam_year,exam_day,item_number,axis,source_page,extraction_status,statement,options,correct_option,raw_text,content_hash,extraction_confidence,metadata,source_document:enem_archive_documents!source_document_id(file_name,official_page_url,official_download_url)&extraction_status=eq.ready&metadata->>parserVersion=eq.2&correct_option=not.is.null&order=exam_year.desc,item_number.asc"),
  ]);
  const reviewerId = reviewers[0]?.id;
  if (!reviewerId) throw new Error("Nenhum administrador/revisor disponível para responsabilizar a promoção automatizada.");
  const axisByName = new Map(axes.map((axis) => [axis.name, axis.id]));
  const topicByCode = new Map(topics.map((topic) => [topic.stable_code, topic]));
  const questionByHash = new Map(existing.map((question) => [question.content_hash, question.id]));
  const existingByArchive = new Map(existing.map(question => [question.provenance?.archiveItemId || question.id, question]));
  const now = new Date().toISOString();
  const promoted = items.map((item) => {
    const archived = existingByArchive.get(item.id);
    const existingId = archived?.id || questionByHash.get(item.content_hash);
    const questionId = existingId || item.id;
    const topic = topicByCode.get(topicCode(item));
    if (!axisByName.has(axisName(item)) || !topic) throw new Error(`Taxonomia ausente para ${axisName(item)}/${topicCode(item)}`);
    const repairable = canRepairStatement(archived, item);
    return { item, questionId, topic, isNew: !existingId, repairable,
      // Existing evidence refers to the original options. Changed items require
      // editorial review instead of replacing a question students already answered.
      changed: Boolean(archived && archived.content_hash !== item.content_hash) };
  });

  for (const entry of promoted.filter(entry => entry.changed && entry.repairable)) {
    await rest(`questions?id=eq.${entry.questionId}&provenance->>validationMethod=eq.automated_official_extraction`, {
      method: "PATCH", body: JSON.stringify({ statement: entry.item.statement, content_hash: entry.item.content_hash,
        validation_status: "validated", validation_notes: "Texto reprocessado com contexto. Alternativas e índice do gabarito preservados; revisão estrutural v2.", updated_at: now }),
    });
  }
  for (const entry of promoted.filter(entry => entry.changed && !entry.repairable)) {
    await rest(`questions?id=eq.${entry.questionId}&provenance->>validationMethod=eq.automated_official_extraction`, {
      method: "PATCH", body: JSON.stringify({ validation_status: "pending", validation_notes: "Extração atualizada difere da versão publicada. Conferir o item no acervo e preservar a correspondência das alternativas antes de republicar.", updated_at: now }),
    });
  }
  const unchanged = promoted.filter(entry => !entry.changed || entry.repairable);
  await upsert("questions", promoted.filter((entry) => entry.isNew).map(({ item, questionId, topic }) => ({
    id: questionId,
    exam_id: item.exam_id,
    axis_id: axisByName.get(axisName(item)),
    subject: item.axis,
    topic: topic.name,
    statement: item.statement,
    options: item.options,
    correct_option: item.correct_option,
    explanation: `Gabarito oficial: alternativa ${String.fromCharCode(65 + item.correct_option)}. A resolução comentada será enriquecida pela curadoria.`,
    difficulty: "medium",
    source_page: item.source_page,
    content_hash: item.content_hash,
    status: "published",
    source_type: "official_exam",
    validation_status: "validated",
    validation_notes: "Item oficial promovido automaticamente após validação estrutural da extração e associação do gabarito. Classificação temática heurística, sujeita a aperfeiçoamento editorial.",
    reviewed_by: reviewerId,
    reviewed_at: now,
    validated_by: reviewerId,
    validated_at: now,
    ingestion_origin: "file_import",
    provenance: {
      archiveItemId: item.id,
      archive: "ENEM 1998-2025",
      officialQuestion: true,
      validationMethod: "automated_official_extraction",
      extractionConfidence: Number(item.extraction_confidence),
      parserVersion: item.metadata?.parserVersion ?? 1,
      thematicClassification: "heuristic-v1",
    },
  })), "content_hash", 100);

  await upsert("question_options", unchanged.flatMap(({ item, questionId }) => item.options.map((content, optionIndex) => ({
    question_id: questionId,
    option_index: optionIndex,
    label: String.fromCharCode(65 + optionIndex),
    content,
  }))), "question_id,option_index", 300);

  await upsert("question_topics", unchanged.map(({ questionId, topic }) => ({
    question_id: questionId,
    topic_id: topic.id,
    relevance: 1,
    is_primary: true,
    classification_method: "stable_code",
    classified_by: reviewerId,
  })), "question_id,topic_id", 300);

  await upsert("question_sources", unchanged.map(({ item, questionId }) => ({
    question_id: questionId,
    source_type: "official_exam",
    source_name: `INEP — ${item.source_document?.file_name || `ENEM ${item.exam_year}`}`,
    source_url: item.source_document?.official_download_url || item.source_document?.official_page_url || "https://riep.inep.gov.br/",
    authorization_reference: "Caderno e gabarito oficiais registrados no Repositório Institucional do Inep",
    source_page: item.source_page,
    official: true,
    metadata: { archiveItemId: item.id, examYear: item.exam_year, examDay: item.exam_day, itemNumber: item.item_number },
  })), "question_id,source_type,source_name", 200);

  console.log(JSON.stringify({ archiveReady: items.length, newQuestions: promoted.filter((entry) => entry.isNew).length, linkedExisting: promoted.filter((entry) => !entry.isNew).length, repairedStatements: promoted.filter(entry => entry.changed && entry.repairable).length, changedForReview: promoted.filter(entry => entry.changed && !entry.repairable).length }));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
