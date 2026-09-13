// Preserve the meaning of recorded answers when repairing a published statement.
export function canRepairStatement(existing, item) {
  const normalized = options => JSON.stringify((options || []).map(option => option.replace(/\s+/g, " ").trim()));
  return Boolean(existing && existing.provenance?.validationMethod === "automated_official_extraction"
    && Number(item.metadata?.parserVersion) >= 2 && item.extraction_status === "ready"
    && existing.correct_option === item.correct_option
    && normalized(existing.options) === normalized(item.options));
}
