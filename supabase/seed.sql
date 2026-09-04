-- AutoPipeline Realistic Seed Data: Metro Manila Motors (BGC Showroom)
-- All monetary values in Philippine Peso (PHP)

-- 1. Create Organization
insert into public.orgs (id, name, timezone)
values ('11111111-1111-1111-1111-111111111111', 'Metro Manila Motors (BGC Showroom)', 'Asia/Manila')
on conflict (id) do nothing;

-- 2. Create Teams
insert into public.teams (id, org_id, name, target_monthly) values
  ('22222222-2222-2222-2222-222222222221', '11111111-1111-1111-1111-111111111111', 'Showroom Sales Team', 15000000.00),
  ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Fleet & Corporate Sales', 25000000.00)
on conflict (id) do nothing;

-- 3. Create Profiles (Corresponding to auth.users in production)
insert into public.profiles (id, org_id, team_id, role, full_name, email, target_monthly) values
  ('33333333-3333-3333-3333-333333333331', '11111111-1111-1111-1111-111111111111', null, 'owner', 'Roberto Lim', 'roberto.lim@metromanilamotors.ph', 40000000.00),
  ('33333333-3333-3333-3333-333333333332', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222221', 'manager', 'Patricia Reyes', 'patricia.reyes@metromanilamotors.ph', 15000000.00),
  ('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222221', 'agent', 'Maria Santos', 'maria.santos@metromanilamotors.ph', 5000000.00)
on conflict (id) do nothing;

-- 4. Create Leads
insert into public.leads (
  id, org_id, team_id, agent_id, customer_name, customer_phone, customer_email,
  model_interest, source, stage, status, lost_reason, est_value, probability, notes
) values
  ('44444444-4444-4444-4444-444444444401', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222221', '33333333-3333-3333-3333-333333333333',
   'Juan Dela Cruz', '+63 917 123 4567', 'juan.delacruz@gmail.com', 'Toyota Fortuner 2.8 LTD', 'walk_in', 'new', 'active', null, 2630000.00, 10, 'Walked in inquiring on two-tone Platinum White.'),
  
  ('44444444-4444-4444-4444-444444444402', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222221', '33333333-3333-3333-3333-333333333333',
   'Angela Garcia', '+63 918 234 5678', 'angela.garcia@outlook.com', 'Hilux GR-S 4x4', 'facebook', 'contacted', 'active', null, 2186000.00, 25, 'Messaged regarding trade-in appraisal on 2019 Ranger.'),

  ('44444444-4444-4444-4444-444444444403', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222221', '33333333-3333-3333-3333-333333333333',
   'Marco Tan', '+63 920 345 6789', 'marco.tan@tanholdings.ph', 'Land Cruiser Prado 2.4 Turbo', 'referral', 'showroom', 'active', null, 4500000.00, 40, 'Visited showroom with spouse; interested in Altitude trim.'),

  ('44444444-4444-4444-4444-444444444404', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222221', '33333333-3333-3333-3333-333333333333',
   'Leah Bautista', '+63 922 456 7890', 'leah.b@bautistalaw.com', 'RAV4 HEV LTD', 'website', 'test_drive', 'active', null, 2621000.00, 60, 'Completed BGC loop test drive; impressed with hybrid fuel economy.'),

  ('44444444-4444-4444-4444-444444444405', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222221', '33333333-3333-3333-3333-333333333333',
   'Miguel Aquino', '+63 917 567 8901', 'm.aquino@manilasteel.com', 'Vios 1.5 G CVT', 'walk_in', 'application', 'active', null, 1039000.00, 80, 'BDO Auto Loan application submitted.'),

  ('44444444-4444-4444-4444-444444444406', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222221', '33333333-3333-3333-3333-333333333333',
   'Carmela Fernandez', '+63 919 678 9012', 'carmela.f@fernandezdental.com', 'Corolla Cross HEV GR-S', 'referral', 'approved', 'active', null, 1815000.00, 90, 'Bank approval released via BPI. Awaiting unit allocation.'),

  ('44444444-4444-4444-4444-444444444407', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222221', '33333333-3333-3333-3333-333333333333',
   'Antonio Mendoza', '+63 917 789 0123', 'antonio.m@mendozacorp.ph', 'Toyota Fortuner 2.8 Q', 'repeat_buyer', 'released', 'won', null, 2450000.00, 100, 'Unit released March 2. Comprehensive insurance and chattel paid.')
on conflict (id) do nothing;

-- 5. Create Initial Audit Activities
insert into public.activities (lead_id, org_id, actor_id, type, detail) values
  ('44444444-4444-4444-4444-444444444401', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'note', 'Walk-in client entertained at showroom lobby.'),
  ('44444444-4444-4444-4444-444444444404', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'test_drive', '30-minute test drive on C5 road completed successfully.'),
  ('44444444-4444-4444-4444-444444444407', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'stage_change', 'Released: Ceremonial key handover completed');

-- 6. Create Initial Follow-ups
insert into public.follow_ups (lead_id, org_id, agent_id, due_date, status, note) values
  ('44444444-4444-4444-4444-444444444401', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', current_date, 'pending', 'Send Fortuner brochure and bank financing computation sheet.'),
  ('44444444-4444-4444-4444-444444444403', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', current_date - 1, 'missed', 'Confirm weekend test drive schedule for Land Cruiser Prado.');
