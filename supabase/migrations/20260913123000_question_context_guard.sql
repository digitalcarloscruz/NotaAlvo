-- Quarantine only automatically published archive items with identifiable loss of
-- context or broken character encoding. Preserve all answers and review history.
update public.questions
set validation_status = 'pending',
    validation_notes = concat_ws(E'\n', validation_notes,
      'Revisão de integridade necessária: possível texto de apoio ausente ou caracteres corrompidos. Conferir caderno original antes de republicar.'),
    updated_at = now()
where validation_status = 'validated'
  and provenance->>'validationMethod' = 'automated_official_extraction'
  and (
    (length(statement) < 400 and statement ~* '(texto|textos|trecho|passagem|informações)[[:space:]]+(anterior|anteriores|acima|a seguir)|(segundo|conforme|considerando)[[:space:]]+(o[[:space:]]+)?(mesmo[[:space:]]+)?texto|(nesse|neste)[[:space:]]+texto')
    or position(chr(3) in statement) > 0
    or position('�' in statement) > 0
  );

-- Re-importing an incomplete archive item must also withdraw its automatically
-- promoted counterpart. It must not erase attempts or change answer indices.
create or replace function public.quarantine_incomplete_archive_question()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.extraction_status <> 'ready' then
    update public.questions
    set validation_status = 'pending',
        validation_notes = 'Acervo reprocessado: item incompleto ou com conteúdo visual. Conferir a fonte antes de republicar.',
        updated_at = now()
    where provenance->>'archiveItemId' = new.id::text
      and provenance->>'validationMethod' = 'automated_official_extraction'
      and validation_status = 'validated';
  end if;
  return new;
end $$;
revoke all on function public.quarantine_incomplete_archive_question() from public, anon, authenticated;
create trigger quarantine_incomplete_archive_question
  after update of extraction_status, statement, options on public.enem_archive_items
  for each row execute function public.quarantine_incomplete_archive_question();
