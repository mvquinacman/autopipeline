-- AutoPipeline Migration 001: Core Enums, Tables, and Indexes
-- Enforces multi-tenant architecture with org_id on all tables and strict soft-delete discipline.

-- Extensions
create extension if not exists "uuid-ossp";

-- Enums
create type user_role as enum ('agent', 'manager', 'owner', 'admin');
create type lead_stage as enum ('new', 'contacted', 'showroom', 'test_drive', 'application', 'approved', 'released');
create type lead_status as enum ('active', 'won', 'lost');
create type lost_reason as enum ('bought_elsewhere', 'unresponsive', 'financing_declined', 'budget', 'other');
create type follow_up_status as enum ('pending', 'done', 'missed');
create type activity_type as enum ('stage_change', 'call', 'note', 'test_drive', 'quote');

-- 1. Orgs (Tenant Root)
create table public.orgs (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  timezone text not null default 'Asia/Manila',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Teams
create table public.teams (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references public.orgs(id) on delete cascade,
  name text not null,
  target_monthly numeric(15, 2) not null default 15000000.00,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. Profiles (Users linked to auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  org_id uuid not null references public.orgs(id) on delete cascade,
  team_id uuid references public.teams(id) on delete set null,
  role user_role not null default 'agent',
  full_name text not null,
  email text not null,
  target_monthly numeric(15, 2) not null default 5000000.00,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 4. Leads
create table public.leads (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references public.orgs(id) on delete cascade,
  team_id uuid references public.teams(id) on delete set null,
  agent_id uuid not null references public.profiles(id) on delete restrict,
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  model_interest text not null,
  source text not null default 'walk_in',
  stage lead_stage not null default 'new',
  status lead_status not null default 'active',
  lost_reason lost_reason,
  est_value numeric(15, 2) not null default 0.00,
  probability integer not null default 10 check (probability between 0 and 100),
  notes text,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 5. Activities (Append-only audit trail)
create table public.activities (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references public.orgs(id) on delete cascade,
  lead_id uuid not null references public.leads(id) on delete cascade,
  actor_id uuid not null references public.profiles(id) on delete restrict,
  type activity_type not null,
  detail text not null,
  created_at timestamptz not null default now()
);

-- 6. Follow-ups
create table public.follow_ups (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references public.orgs(id) on delete cascade,
  lead_id uuid not null references public.leads(id) on delete cascade,
  agent_id uuid not null references public.profiles(id) on delete cascade,
  due_date date not null,
  status follow_up_status not null default 'pending',
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes for performance & relational integrity
create index idx_teams_org_id on public.teams(org_id);
create index idx_profiles_org_id on public.profiles(org_id);
create index idx_profiles_team_id on public.profiles(team_id);
create index idx_leads_org_id on public.leads(org_id);
create index idx_leads_team_id on public.leads(team_id);
create index idx_leads_agent_id on public.leads(agent_id);
create index idx_leads_stage on public.leads(org_id, stage) where deleted_at is null;
create index idx_leads_status on public.leads(org_id, status) where deleted_at is null;
create index idx_activities_lead_id on public.activities(lead_id);
create index idx_follow_ups_due on public.follow_ups(org_id, agent_id, due_date, status);

-- Duplicate Phone Number Guard Index (Normalized digits)
create index idx_leads_phone_normalized on public.leads (
  org_id,
  regexp_replace(customer_phone, '\D', '', 'g')
) where status = 'active' and deleted_at is null;
