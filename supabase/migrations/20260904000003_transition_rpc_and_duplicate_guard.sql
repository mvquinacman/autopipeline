-- AutoPipeline Migration 003: Atomic Transition RPC & Duplicate Lead Guard
-- Guarantees atomic state transitions (lead + activity + follow-up) and duplicate detection.

--------------------------------------------------------------------------------
-- 1. Helper: Stage Progression Order
--------------------------------------------------------------------------------
create or replace function next_stage(p_stage lead_stage)
returns lead_stage language sql immutable as $$
  select case p_stage
    when 'new' then 'contacted'::lead_stage
    when 'contacted' then 'showroom'::lead_stage
    when 'showroom' then 'test_drive'::lead_stage
    when 'test_drive' then 'application'::lead_stage
    when 'application' then 'approved'::lead_stage
    when 'approved' then 'released'::lead_stage
    when 'released' then 'released'::lead_stage
  end;
$$;

create or replace function prev_stage(p_stage lead_stage)
returns lead_stage language sql immutable as $$
  select case p_stage
    when 'released' then 'approved'::lead_stage
    when 'approved' then 'application'::lead_stage
    when 'application' then 'test_drive'::lead_stage
    when 'test_drive' then 'showroom'::lead_stage
    when 'showroom' then 'contacted'::lead_stage
    when 'contacted' then 'new'::lead_stage
    when 'new' then 'new'::lead_stage
  end;
$$;

create or replace function stage_default_probability(p_stage lead_stage)
returns integer language sql immutable as $$
  select case p_stage
    when 'new' then 10
    when 'contacted' then 25
    when 'showroom' then 40
    when 'test_drive' then 60
    when 'application' then 80
    when 'approved' then 90
    when 'released' then 100
  end;
$$;

--------------------------------------------------------------------------------
-- 2. Duplicate Lead Guard Function
--------------------------------------------------------------------------------
-- Checks for existing active leads with the same normalized phone number in the organization.
create or replace function check_duplicate_lead(
  p_org_id uuid,
  p_phone text,
  p_exclude_lead_id uuid default null
)
returns table (
  lead_id uuid,
  customer_name text,
  agent_name text,
  stage lead_stage,
  created_at timestamptz
) language sql stable security definer set search_path = public as $$
  select 
    l.id as lead_id,
    l.customer_name,
    p.full_name as agent_name,
    l.stage,
    l.created_at
  from public.leads l
  left join public.profiles p on p.id = l.agent_id
  where l.org_id = p_org_id
    and l.status = 'active'
    and l.deleted_at is null
    and (p_exclude_lead_id is null or l.id <> p_exclude_lead_id)
    and regexp_replace(l.customer_phone, '\D', '', 'g') = regexp_replace(p_phone, '\D', '', 'g')
  limit 1;
$$;

--------------------------------------------------------------------------------
-- 3. Atomic Lead Transition RPC (advance, regress, lost)
--------------------------------------------------------------------------------
create or replace function transition_lead(
  p_lead_id uuid,
  p_action text, -- 'advance' | 'regress' | 'lost'
  p_lost_reason lost_reason default null,
  p_note text default null
)
returns public.leads
language plpgsql
security invoker -- Enforces RLS permissions on caller!
set search_path = public
as $$
declare
  l public.leads;
  v_next_stage lead_stage;
  v_prev_stage lead_stage;
  v_target_tz text;
begin
  -- 1. Lock lead row for update to prevent concurrent race conditions
  select * into l from public.leads where id = p_lead_id for update;
  if not found then
    raise exception 'Lead not found or permission denied.';
  end if;

  v_target_tz := app.org_tz(l.org_id);

  -- 2. Process Action
  if p_action = 'advance' then
    v_next_stage := next_stage(l.stage);
    
    update public.leads set
      stage = v_next_stage,
      probability = stage_default_probability(v_next_stage),
      status = case when v_next_stage = 'released' then 'won'::lead_status else status end,
      updated_at = now()
    where id = p_lead_id
    returning * into l;

    -- Schedule next follow-up 2 days later in dealership local timezone (if not won)
    if l.status <> 'won' then
      insert into public.follow_ups (lead_id, org_id, agent_id, due_date, status, note)
      values (
        l.id,
        l.org_id,
        l.agent_id,
        (timezone(v_target_tz, now())::date + interval '2 days')::date,
        'pending',
        'Follow up on ' || l.stage::text || ' stage progression'
      );
    end if;

  elsif p_action = 'regress' then
    v_prev_stage := prev_stage(l.stage);
    
    update public.leads set
      stage = v_prev_stage,
      probability = stage_default_probability(v_prev_stage),
      updated_at = now()
    where id = p_lead_id
    returning * into l;

  elsif p_action = 'lost' then
    if p_lost_reason is null then
      p_lost_reason := 'other'::lost_reason;
    end if;

    update public.leads set
      status = 'lost'::lead_status,
      lost_reason = p_lost_reason,
      updated_at = now()
    where id = p_lead_id
    returning * into l;

    -- Mark any pending follow-ups as missed/cancelled
    update public.follow_ups
    set status = 'missed', updated_at = now()
    where lead_id = p_lead_id and status = 'pending';

  else
    raise exception 'Invalid action: % (must be advance, regress, or lost)', p_action;
  end if;

  -- 3. Append-only activity audit trail (guaranteed atomic log)
  insert into public.activities (lead_id, org_id, actor_id, type, detail)
  values (
    l.id,
    l.org_id,
    auth.uid(),
    'stage_change',
    initcap(p_action) || case when p_note is not null then ': ' || p_note else '' end
  );

  return l;
end;
$$;

-- Dedicated single-tap advance wrapper
create or replace function advance_lead_stage(
  p_lead_id uuid,
  p_note text default null
)
returns public.leads
language sql
security invoker
as $$
  select transition_lead(p_lead_id, 'advance', null, p_note);
$$;

grant execute on function transition_lead to authenticated;
grant execute on function advance_lead_stage to authenticated;
grant execute on function check_duplicate_lead to authenticated;
