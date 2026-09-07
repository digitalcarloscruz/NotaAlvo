-- Only advance a due review after a correct, persisted answer in the current cycle.
create or replace function public.advance_review_item(p_user_id uuid, p_review_id uuid)
returns table(id uuid, status text, interval_step smallint, due_at timestamptz)
language plpgsql security definer set search_path = public as $$
declare v_item public.review_queue%rowtype; v_days integer[] := array[1,7,15,30]; v_correct boolean;
begin
  select * into v_item from public.review_queue r where r.id=p_review_id and r.user_id=p_user_id for update;
  if not found then raise exception 'review_not_available'; end if;
  if v_item.status <> 'scheduled' or v_item.due_at > now() then
    -- An identical retry must not advance another interval.
    id := v_item.id; status := v_item.status; interval_step := v_item.interval_step; due_at := v_item.due_at;
    return next; return;
  end if;
  select a.is_correct into v_correct from public.user_answers a
    where a.user_id=p_user_id and a.question_id=v_item.question_id
      and a.answered_at >= v_item.due_at
      and a.answered_at > coalesce(v_item.last_reviewed_at, '-infinity'::timestamptz)
    order by a.answered_at desc limit 1;
  if v_correct is distinct from true then raise exception 'review_answer_required'; end if;
  update public.review_queue r set
    status=case when v_item.interval_step >= 4 then 'completed' else 'scheduled' end,
    interval_step=least(v_item.interval_step+1,4),
    due_at=case when v_item.interval_step >= 4 then r.due_at else now()+make_interval(days=>v_days[v_item.interval_step+1]) end,
    last_reviewed_at=now(), updated_at=now()
    where r.id=p_review_id
    returning r.id,r.status,r.interval_step,r.due_at into id,status,interval_step,due_at;
  return next;
end $$;
revoke all on function public.advance_review_item(uuid,uuid) from public, anon, authenticated;
grant execute on function public.advance_review_item(uuid,uuid) to service_role;
