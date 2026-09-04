-- AutoPipeline Migration 002: RLS Helper Functions, Policies, and Security Triggers
-- Enforces multi-tenant isolation, role-based scoping ladders, and privilege escalation guards.

create schema if not exists app;

-- Helper 1: Current User Role
create or replace function app.current_role() returns user_role
language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid();
$$;

-- Helper 2: Current User Org
create or replace function app.current_org() returns uuid
language sql stable security definer set search_path = public as $$
  select org_id from public.profiles where id = auth.uid();
$$;

-- Helper 3: Current User Team
create or replace function app.current_team() returns uuid
language sql stable security definer set search_path = public as $$
  select team_id from public.profiles where id = auth.uid();
$$;

-- Helper 4: Org Timezone (defaults to Asia/Manila)
create or replace function app.org_tz(p_org_id uuid) returns text
language sql stable security definer set search_path = public as $$
  select coalesce((select timezone from public.orgs where id = p_org_id), 'Asia/Manila');
$$;

grant usage on schema app to authenticated, anon;
grant execute on all functions in schema app to authenticated;

--------------------------------------------------------------------------------
-- Enable RLS on all tables
--------------------------------------------------------------------------------
alter table public.orgs enable row level security;
alter table public.teams enable row level security;
alter table public.profiles enable row level security;
alter table public.leads enable row level security;
alter table public.activities enable row level security;
alter table public.follow_ups enable row level security;

--------------------------------------------------------------------------------
-- 1. Orgs Policies
--------------------------------------------------------------------------------
create policy orgs_select on public.orgs for select to authenticated
using (id = app.current_org());

create policy orgs_update on public.orgs for update to authenticated
using (id = app.current_org() and app.current_role() in ('owner', 'admin'))
with check (id = app.current_org());

--------------------------------------------------------------------------------
-- 2. Teams Policies
--------------------------------------------------------------------------------
create policy teams_select on public.teams for select to authenticated
using (org_id = app.current_org());

create policy teams_manage on public.teams for all to authenticated
using (org_id = app.current_org() and app.current_role() in ('owner', 'admin', 'manager'))
with check (org_id = app.current_org());

--------------------------------------------------------------------------------
-- 3. Profiles Policies & Privilege Escalation Protection
--------------------------------------------------------------------------------
-- Users can see all profiles in their own organization (for team counts and leaderboard)
create policy profiles_select on public.profiles for select to authenticated
using (org_id = app.current_org());

-- Users can update their own personal info (name, avatar), but NOT their role, org, or team
create policy profiles_self_update on public.profiles for update to authenticated
using (id = auth.uid())
with check (id = auth.uid());

-- Trigger: Prevent unauthorized self-escalation of roles or org reassignment
create or replace function app.protect_profile_columns()
returns trigger language plpgsql as $$
begin
  if new.role is distinct from old.role
     or new.org_id is distinct from old.org_id
     or new.team_id is distinct from old.team_id then
    if app.current_role() not in ('owner', 'admin') then
      raise exception 'Security Error: You are not authorized to modify your role, organization, or team.';
    end if;
  end if;
  return new;
end;
$$;

create trigger trg_protect_profile_columns
before update on public.profiles
for each row execute function app.protect_profile_columns();

--------------------------------------------------------------------------------
-- 4. Leads Policies: The Scoping Ladder
--------------------------------------------------------------------------------
-- Read: Own leads for agents; team leads for managers; all org leads for owners/admins
create policy leads_select on public.leads for select to authenticated
using (
  org_id = app.current_org()
  and deleted_at is null
  and (
    app.current_role() in ('owner', 'admin')
    or (app.current_role() = 'manager' and team_id = app.current_team())
    or agent_id = auth.uid()
  )
);

-- Insert: Agents insert for themselves; Managers/Owners can assign
create policy leads_insert on public.leads for insert to authenticated
with check (
  org_id = app.current_org()
  and (
    (agent_id = auth.uid() and (team_id = app.current_team() or team_id is null))
    or app.current_role() in ('manager', 'owner', 'admin')
  )
);

-- Update: Agents update own; Managers update team; Owners update all
create policy leads_update on public.leads for update to authenticated
using (
  org_id = app.current_org()
  and (
    agent_id = auth.uid()
    or (app.current_role() = 'manager' and team_id = app.current_team())
    or app.current_role() in ('owner', 'admin')
  )
)
with check (org_id = app.current_org());

-- Soft Delete Security: Only Managers and Owners can soft-delete leads
create or replace function app.enforce_soft_delete_permission()
returns trigger language plpgsql as $$
begin
  if new.deleted_at is not null and old.deleted_at is null then
    if app.current_role() not in ('manager', 'owner', 'admin') then
      raise exception 'Security Error: Only team managers and dealership owners may delete leads.';
    end if;
  end if;
  return new;
end;
$$;

create trigger trg_enforce_soft_delete
before update on public.leads
for each row execute function app.enforce_soft_delete_permission();

--------------------------------------------------------------------------------
-- 5. Activities Policies (Append-Only Audit Log)
--------------------------------------------------------------------------------
-- Visible only if user has access to the corresponding lead
create policy activities_select on public.activities for select to authenticated
using (
  org_id = app.current_org()
  and exists (
    select 1 from public.leads l
    where l.id = activities.lead_id
  )
);

create policy activities_insert on public.activities for insert to authenticated
with check (
  org_id = app.current_org()
  and actor_id = auth.uid()
);

-- Note: No UPDATE or DELETE policies on activities! This guarantees an immutable audit trail.

--------------------------------------------------------------------------------
-- 6. Follow-ups Policies
--------------------------------------------------------------------------------
create policy follow_ups_select on public.follow_ups for select to authenticated
using (
  org_id = app.current_org()
  and (
    agent_id = auth.uid()
    or app.current_role() in ('manager', 'owner', 'admin')
  )
);

create policy follow_ups_manage on public.follow_ups for all to authenticated
using (
  org_id = app.current_org()
  and (
    agent_id = auth.uid()
    or app.current_role() in ('manager', 'owner', 'admin')
  )
)
with check (org_id = app.current_org());
