-- AutoPipeline Security Verification Test Suite: 5 RLS Assertions
-- Execute this script in local Supabase or staging to verify security invariants.

do $$
declare
  v_agent_id uuid := '33333333-3333-3333-3333-333333333333';
  v_manager_id uuid := '33333333-3333-3333-3333-333333333332';
  v_owner_id uuid := '33333333-3333-3333-3333-333333333331';
  v_agent_lead_count int;
  v_manager_lead_count int;
  v_owner_lead_count int;
  v_error_caught boolean := false;
begin
  raise notice '=======================================================';
  raise notice 'Starting AutoPipeline RLS & Security Verification Suite';
  raise notice '=======================================================';

  -- -----------------------------------------------------------------
  -- Assertion 1: Scoping Ladder (Agent <= Manager <= Owner)
  -- -----------------------------------------------------------------
  -- Simulate Agent
  set local role authenticated;
  set local "request.jwt.claims" = '{"sub": "33333333-3333-3333-3333-333333333333"}';
  select count(*) into v_agent_lead_count from public.leads;

  -- Simulate Manager
  set local "request.jwt.claims" = '{"sub": "33333333-3333-3333-3333-333333333332"}';
  select count(*) into v_manager_lead_count from public.leads;

  -- Simulate Owner
  set local "request.jwt.claims" = '{"sub": "33333333-3333-3333-3333-333333333331"}';
  select count(*) into v_owner_lead_count from public.leads;

  if v_agent_lead_count <= v_manager_lead_count and v_manager_lead_count <= v_owner_lead_count then
    raise notice '[PASS] Assertion 1: Scoping Ladder Verified (Agent: %, Manager: %, Owner: %)',
      v_agent_lead_count, v_manager_lead_count, v_owner_lead_count;
  else
    raise exception '[FAIL] Assertion 1 Failed: Scope counts out of order!';
  end if;

  -- -----------------------------------------------------------------
  -- Assertion 2: Privilege Escalation Blocked
  -- -----------------------------------------------------------------
  set local "request.jwt.claims" = '{"sub": "33333333-3333-3333-3333-333333333333"}';
  v_error_caught := false;
  begin
    update public.profiles set role = 'owner' where id = v_agent_id;
  exception when others then
    v_error_caught := true;
  end;

  if v_error_caught then
    raise notice '[PASS] Assertion 2: Privilege Escalation successfully blocked by trigger';
  else
    raise exception '[FAIL] Assertion 2 Failed: Agent was able to escalate role to owner!';
  end if;

  -- -----------------------------------------------------------------
  -- Assertion 3: Cross-Tenant Lead Injection Blocked
  -- -----------------------------------------------------------------
  v_error_caught := false;
  begin
    insert into public.leads (
      org_id, agent_id, customer_name, customer_phone, model_interest
    ) values (
      '99999999-9999-9999-9999-999999999999', -- Foreign Org
      v_agent_id,
      'Hacker Customer',
      '+63 900 000 0000',
      'Test Car'
    );
  exception when others then
    v_error_caught := true;
  end;

  if v_error_caught then
    raise notice '[PASS] Assertion 3: Cross-Tenant Insert blocked by RLS WITH CHECK';
  else
    raise exception '[FAIL] Assertion 3 Failed: Cross-tenant insert succeeded!';
  end if;

  -- -----------------------------------------------------------------
  -- Assertion 4: Unauthenticated Access Denied
  -- -----------------------------------------------------------------
  set local role anon;
  set local "request.jwt.claims" = '{}';
  select count(*) into v_agent_lead_count from public.leads;

  if v_agent_lead_count = 0 then
    raise notice '[PASS] Assertion 4: Anon user sees 0 leads (Default Deny)';
  else
    raise exception '[FAIL] Assertion 4 Failed: Anon user can see leads!';
  end if;

  -- -----------------------------------------------------------------
  -- Assertion 5: Duplicate Phone Detection
  -- -----------------------------------------------------------------
  set local role authenticated;
  set local "request.jwt.claims" = '{"sub": "33333333-3333-3333-3333-333333333333"}';
  if exists (
    select 1 from check_duplicate_lead(
      '11111111-1111-1111-1111-111111111111',
      '(0917) 123-4567' -- Formatted version of Juan Dela Cruz (+63 917 123 4567)
    )
  ) then
    raise notice '[PASS] Assertion 5: Duplicate phone guard correctly identifies existing lead';
  else
    raise exception '[FAIL] Assertion 5 Failed: Duplicate phone was not detected!';
  end if;

  raise notice '=======================================================';
  raise notice 'All 5 Security Assertions Passed Successfully!';
  raise notice '=======================================================';
end $$;
