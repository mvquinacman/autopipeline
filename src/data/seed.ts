import {
  Activity,
  FollowUp,
  KpiSummary,
  Lead,
  Profile,
  StageConfig,
} from '../types/crm';

export const STAGES: StageConfig[] = [
  { id: 'new', label: 'New Lead', color: '#8A93A3', order: 1 },
  { id: 'contacted', label: 'Contacted', color: '#2E7BD6', order: 2 },
  { id: 'showroom', label: 'Showroom Visit', color: '#1E4FD6', order: 3 },
  { id: 'test_drive', label: 'Test Drive', color: '#0E7490', order: 4 },
  { id: 'application', label: 'Financing Application', color: '#E8A013', order: 5 },
  { id: 'approved', label: 'Bank Approved', color: '#189A5A', order: 6 },
  { id: 'released', label: 'Unit Released', color: '#0F1826', order: 7 },
];

export const SEED_PROFILES: Profile[] = [
  {
    id: 'user-agent-1',
    fullName: 'Paolo Morales',
    email: 'paolo.morales@toyotabgc.ph',
    role: 'agent',
    orgId: 'org-toyota-bgc',
    teamId: 'team-alpha',
    targetValue: 8_000_000,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'user-agent-2',
    fullName: 'Camille Dizon',
    email: 'camille.dizon@toyotabgc.ph',
    role: 'agent',
    orgId: 'org-toyota-bgc',
    teamId: 'team-alpha',
    targetValue: 7_000_000,
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'user-mgr-1',
    fullName: 'Rafael Alcantara',
    email: 'rafael.alcantara@toyotabgc.ph',
    role: 'manager',
    orgId: 'org-toyota-bgc',
    teamId: 'team-alpha',
    targetValue: 15_000_000,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'user-dp-1',
    fullName: 'Vicente Tan',
    email: 'vicente.tan@toyotabgc.ph',
    role: 'dealer_principal',
    orgId: 'org-toyota-bgc',
    targetValue: 40_000_000,
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
  },
];

export const SEED_LEADS: Lead[] = [
  // 1. Stage: NEW | Urgency: due_today
  {
    id: 'lead-01',
    orgId: 'org-toyota-bgc',
    teamId: 'team-alpha',
    agentId: 'user-agent-1',
    agentName: 'Paolo Morales',
    customerName: 'Maria Santos',
    customerPhone: '+63 917 555 1024',
    customerEmail: 'maria.santos@gmail.com',
    modelInterest: 'Toyota Fortuner 2.8 LTD',
    estValue: 2_630_000,
    probability: 0.1,
    stage: 'new',
    status: 'active',
    notes: 'Inquired via Facebook Messenger ad about White Pearl 4x4 LTD. Inquiring about 20% downpayment promo.',
    followUpDue: '2026-09-04T10:00:00Z',
    urgency: 'due_today',
    tradeInId: 'ti-001',
    netTradeInEquity: 330_000,
    createdAt: '2026-09-03T08:15:00Z',
    updatedAt: '2026-09-03T08:15:00Z',
  },
  // 2. Stage: NEW | Urgency: upcoming
  {
    id: 'lead-02',
    orgId: 'org-toyota-bgc',
    teamId: 'team-alpha',
    agentId: 'user-agent-2',
    agentName: 'Camille Dizon',
    customerName: 'Juan Dela Cruz',
    customerPhone: '+63 918 223 8911',
    customerEmail: 'juan.delacruz@outlook.ph',
    modelInterest: 'Vios 1.5 G',
    estValue: 1_039_000,
    probability: 0.1,
    stage: 'new',
    status: 'active',
    notes: 'First-time car buyer. Looking for lowest monthly amortization under 5-year bank purchase order.',
    followUpDue: '2026-09-05T14:00:00Z',
    urgency: 'upcoming',
    createdAt: '2026-09-03T11:30:00Z',
    updatedAt: '2026-09-03T11:30:00Z',
  },
  // 3. Stage: CONTACTED | Urgency: overdue
  {
    id: 'lead-03',
    orgId: 'org-toyota-bgc',
    teamId: 'team-alpha',
    agentId: 'user-agent-1',
    agentName: 'Paolo Morales',
    customerName: 'Patricia Reyes',
    customerPhone: '+63 920 441 2938',
    customerEmail: 'patricia.reyes@consulting.ph',
    modelInterest: 'Corolla Cross HEV',
    estValue: 1_815_000,
    probability: 0.25,
    stage: 'contacted',
    status: 'active',
    notes: 'Spoke over phone. Needs hybrid fuel efficiency numbers vs gas variant. Promised quotation and loan simulation.',
    followUpDue: '2026-09-02T16:00:00Z',
    urgency: 'overdue',
    createdAt: '2026-08-31T09:00:00Z',
    updatedAt: '2026-09-01T14:20:00Z',
  },
  // 4. Stage: CONTACTED | Urgency: due_today
  {
    id: 'lead-04',
    orgId: 'org-toyota-bgc',
    teamId: 'team-alpha',
    agentId: 'user-agent-2',
    agentName: 'Camille Dizon',
    customerName: 'Roberto Lim',
    customerPhone: '+63 917 882 1190',
    customerEmail: 'rlim@limlogistics.com',
    modelInterest: 'Hilux GR-S',
    estValue: 2_186_000,
    probability: 0.25,
    stage: 'contacted',
    status: 'active',
    notes: 'Managing director of logistics company. Evaluating corporate fleet acquisition of 2 units.',
    followUpDue: '2026-09-04T15:30:00Z',
    urgency: 'due_today',
    createdAt: '2026-08-30T10:00:00Z',
    updatedAt: '2026-09-02T11:00:00Z',
  },
  // 5. Stage: SHOWROOM | Urgency: upcoming
  {
    id: 'lead-05',
    orgId: 'org-toyota-bgc',
    teamId: 'team-alpha',
    agentId: 'user-agent-1',
    agentName: 'Paolo Morales',
    customerName: 'Angela Garcia',
    customerPhone: '+63 908 771 6320',
    customerEmail: 'angela.garcia@medclinic.ph',
    modelInterest: 'RAV4 HEV',
    estValue: 2_621_000,
    probability: 0.45,
    stage: 'showroom',
    status: 'active',
    notes: 'Visited showroom last Saturday. Evaluated cargo space and rear seat recline for family use.',
    followUpDue: '2026-09-06T11:00:00Z',
    urgency: 'upcoming',
    createdAt: '2026-08-28T13:45:00Z',
    updatedAt: '2026-09-02T16:30:00Z',
  },
  // 6. Stage: SHOWROOM | Urgency: overdue
  {
    id: 'lead-06',
    orgId: 'org-toyota-bgc',
    teamId: 'team-alpha',
    agentId: 'user-agent-2',
    agentName: 'Camille Dizon',
    customerName: 'Marco Tan',
    customerPhone: '+63 917 334 7891',
    customerEmail: 'marco.tan@tantech.io',
    modelInterest: 'Land Cruiser Prado',
    estValue: 4_500_000,
    probability: 0.45,
    stage: 'showroom',
    status: 'active',
    notes: 'VIP customer. Inspected Prado 250 series in showroom. Requested appraisal for trade-in of 2021 Fortuner.',
    followUpDue: '2026-09-03T09:30:00Z',
    urgency: 'overdue',
    createdAt: '2026-08-27T15:00:00Z',
    updatedAt: '2026-09-01T10:15:00Z',
  },
  // 7. Stage: TEST_DRIVE | Urgency: due_today
  {
    id: 'lead-07',
    orgId: 'org-toyota-bgc',
    teamId: 'team-alpha',
    agentId: 'user-agent-1',
    agentName: 'Paolo Morales',
    customerName: 'Leah Bautista',
    customerPhone: '+63 922 667 4310',
    customerEmail: 'leah.bautista@bautistalaw.ph',
    modelInterest: 'Corolla Cross HEV',
    estValue: 1_815_000,
    probability: 0.6,
    stage: 'test_drive',
    status: 'active',
    notes: 'Test drive scheduled today 4:00 PM along McKinley and BGC perimeter road. Very interested in TSS 3.0 safety suite.',
    followUpDue: '2026-09-04T16:00:00Z',
    urgency: 'due_today',
    createdAt: '2026-08-25T11:20:00Z',
    updatedAt: '2026-09-03T17:00:00Z',
  },
  // 8. Stage: TEST_DRIVE | Urgency: upcoming
  {
    id: 'lead-08',
    orgId: 'org-toyota-bgc',
    teamId: 'team-alpha',
    agentId: 'user-agent-2',
    agentName: 'Camille Dizon',
    customerName: 'Miguel Aquino',
    customerPhone: '+63 919 123 9845',
    customerEmail: 'miguel.aquino@agri-corp.com',
    modelInterest: 'Hilux GR-S',
    estValue: 2_186_000,
    probability: 0.6,
    stage: 'test_drive',
    status: 'active',
    notes: 'Completed test drive around BGC dealership track. Highly satisfied with monotube shock performance. Ready for financing form.',
    followUpDue: '2026-09-07T13:30:00Z',
    urgency: 'upcoming',
    createdAt: '2026-08-24T14:10:00Z',
    updatedAt: '2026-09-03T18:20:00Z',
  },
  // 9. Stage: APPLICATION | Urgency: overdue
  {
    id: 'lead-09',
    orgId: 'org-toyota-bgc',
    teamId: 'team-alpha',
    agentId: 'user-agent-1',
    agentName: 'Paolo Morales',
    customerName: 'Carmela Fernandez',
    customerPhone: '+63 917 654 3210',
    customerEmail: 'carmela.fernandez@gmail.com',
    modelInterest: 'Toyota Fortuner 2.8 LTD',
    estValue: 2_630_000,
    probability: 0.75,
    stage: 'application',
    status: 'active',
    notes: 'Submitted ITR and 6 months bank statements. Endorsed application to BDO and BPI Family Bank.',
    followUpDue: '2026-09-01T11:00:00Z',
    urgency: 'overdue',
    createdAt: '2026-08-20T08:30:00Z',
    updatedAt: '2026-08-31T16:40:00Z',
  },
  // 10. Stage: APPLICATION | Urgency: due_today
  {
    id: 'lead-10',
    orgId: 'org-toyota-bgc',
    teamId: 'team-alpha',
    agentId: 'user-agent-2',
    agentName: 'Camille Dizon',
    customerName: 'Antonio Mendoza',
    customerPhone: '+63 918 333 7741',
    customerEmail: 'tony.mendoza@mendozabuilders.ph',
    modelInterest: 'Vios 1.5 G',
    estValue: 1_039_000,
    probability: 0.75,
    stage: 'application',
    status: 'active',
    notes: 'Metrobank auto loan application pending co-maker wet signature. Customer arriving at noon to sign.',
    followUpDue: '2026-09-04T11:30:00Z',
    urgency: 'due_today',
    createdAt: '2026-08-22T09:40:00Z',
    updatedAt: '2026-09-03T10:00:00Z',
  },
  // 11. Stage: APPROVED | Urgency: upcoming
  {
    id: 'lead-11',
    orgId: 'org-toyota-bgc',
    teamId: 'team-alpha',
    agentId: 'user-agent-1',
    agentName: 'Paolo Morales',
    customerName: 'Grace Villanueva',
    customerPhone: '+63 920 987 6543',
    customerEmail: 'grace.villanueva@globalpharma.com',
    modelInterest: 'RAV4 HEV',
    estValue: 2_621_000,
    probability: 0.9,
    stage: 'approved',
    status: 'active',
    notes: 'BPI loan approval letter received. VIN and engine number allocated. Processing comprehensive insurance with Toyota Financial.',
    followUpDue: '2026-09-06T15:00:00Z',
    urgency: 'upcoming',
    createdAt: '2026-08-15T10:00:00Z',
    updatedAt: '2026-09-02T15:45:00Z',
  },
  // 12. Stage: APPROVED | Urgency: due_today
  {
    id: 'lead-12',
    orgId: 'org-toyota-bgc',
    teamId: 'team-alpha',
    agentId: 'user-agent-2',
    agentName: 'Camille Dizon',
    customerName: 'Eduardo Cruz',
    customerPhone: '+63 917 444 8822',
    customerEmail: 'eduardo.cruz@cruzshipping.com',
    modelInterest: 'Land Cruiser Prado',
    estValue: 4_500_000,
    probability: 0.9,
    stage: 'approved',
    status: 'active',
    notes: 'RCBC purchase order approved. Downpayment cleared via cashier check. Ready for unit release scheduling.',
    followUpDue: '2026-09-04T17:00:00Z',
    urgency: 'due_today',
    createdAt: '2026-08-10T11:00:00Z',
    updatedAt: '2026-09-03T14:30:00Z',
  },
  // 13. Stage: RELEASED | Status: WON
  {
    id: 'lead-13',
    orgId: 'org-toyota-bgc',
    teamId: 'team-alpha',
    agentId: 'user-agent-1',
    agentName: 'Paolo Morales',
    customerName: 'Christine Soriano',
    customerPhone: '+63 917 111 4455',
    customerEmail: 'christine.soriano@sorianofinance.ph',
    modelInterest: 'Toyota Fortuner 2.8 LTD',
    estValue: 2_630_000,
    probability: 1.0,
    stage: 'released',
    status: 'won',
    notes: 'Unit released today. Free tint, ceramic coating, comprehensive insurance, and genuine matting installed.',
    urgency: 'none',
    createdAt: '2026-08-05T09:00:00Z',
    updatedAt: '2026-09-04T09:00:00Z',
  },
  // 14. Stage: TEST_DRIVE | Status: LOST
  {
    id: 'lead-14',
    orgId: 'org-toyota-bgc',
    teamId: 'team-alpha',
    agentId: 'user-agent-2',
    agentName: 'Camille Dizon',
    customerName: 'Ramon Valenzuela',
    customerPhone: '+63 922 998 1123',
    customerEmail: 'ramon.valenzuela@valenzuela-foods.com',
    modelInterest: 'Hilux GR-S',
    estValue: 2_186_000,
    probability: 0.0,
    stage: 'test_drive',
    status: 'lost',
    lostReason: 'bought_elsewhere',
    notes: 'Client purchased Ford Ranger Raptor due to earlier stock delivery promise. Keeping in touch for future fleet updates.',
    urgency: 'none',
    createdAt: '2026-08-12T13:00:00Z',
    updatedAt: '2026-09-02T10:00:00Z',
  },
];

export const SEED_ACTIVITIES: Activity[] = [
  {
    id: 'act-01',
    leadId: 'lead-13',
    actorId: 'user-agent-1',
    actorName: 'Paolo Morales',
    type: 'stage_change',
    detail: 'Advanced stage to Unit Released (Won). Ceremonial key turnover completed.',
    createdAt: '2026-09-04T09:00:00Z',
  },
  {
    id: 'act-02',
    leadId: 'lead-12',
    actorId: 'user-agent-2',
    actorName: 'Camille Dizon',
    type: 'quote',
    detail: 'Issued final invoice and chattel mortgage documents for Land Cruiser Prado.',
    createdAt: '2026-09-03T14:30:00Z',
  },
  {
    id: 'act-03',
    leadId: 'lead-08',
    actorId: 'user-agent-2',
    actorName: 'Camille Dizon',
    type: 'test_drive',
    detail: 'Conducted 30-minute test drive with customer around Bonifacio Global City route.',
    createdAt: '2026-09-03T16:00:00Z',
  },
  {
    id: 'act-04',
    leadId: 'lead-07',
    actorId: 'user-agent-1',
    actorName: 'Paolo Morales',
    type: 'call',
    detail: 'Confirmed test drive appointment scheduled for today at 4:00 PM.',
    createdAt: '2026-09-03T17:00:00Z',
  },
  {
    id: 'act-05',
    leadId: 'lead-14',
    actorId: 'user-agent-2',
    actorName: 'Camille Dizon',
    type: 'note',
    detail: 'Lead marked Lost: Bought elsewhere (Ford Ranger Raptor). Delivery time constraint.',
    createdAt: '2026-09-02T10:00:00Z',
  },
];

export const SEED_FOLLOW_UPS: FollowUp[] = [
  {
    id: 'fu-01',
    leadId: 'lead-01',
    agentId: 'user-agent-1',
    dueDate: '2026-09-04T10:00:00Z',
    status: 'pending',
    note: 'Send official quotation for Fortuner 2.8 LTD with 20% downpayment computations.',
  },
  {
    id: 'fu-02',
    leadId: 'lead-03',
    agentId: 'user-agent-1',
    dueDate: '2026-09-02T16:00:00Z',
    status: 'missed',
    note: 'Follow up on Corolla Cross HEV loan simulation sent via Viber.',
  },
  {
    id: 'fu-03',
    leadId: 'lead-04',
    agentId: 'user-agent-2',
    dueDate: '2026-09-04T15:30:00Z',
    status: 'pending',
    note: 'Call Mr. Lim regarding company fleet pricing structure for Hilux GR-S.',
  },
  {
    id: 'fu-04',
    leadId: 'lead-06',
    agentId: 'user-agent-2',
    dueDate: '2026-09-03T09:30:00Z',
    status: 'missed',
    note: 'Deliver used car trade-in appraisal certificate for 2021 Fortuner.',
  },
  {
    id: 'fu-05',
    leadId: 'lead-07',
    agentId: 'user-agent-1',
    dueDate: '2026-09-04T16:00:00Z',
    status: 'pending',
    note: 'Welcome Atty. Bautista at showroom reception for Corolla Cross test drive.',
  },
  {
    id: 'fu-06',
    leadId: 'lead-10',
    agentId: 'user-agent-2',
    dueDate: '2026-09-04T11:30:00Z',
    status: 'pending',
    note: 'Collect signed Metrobank auto loan co-maker documentation.',
  },
  {
    id: 'fu-07',
    leadId: 'lead-12',
    agentId: 'user-agent-2',
    dueDate: '2026-09-04T17:00:00Z',
    status: 'pending',
    note: 'Confirm schedule for Prado turnover ceremony and gate pass release.',
  },
];

/**
 * Format monetary amount in Philippine Pesos (PHP)
 *
 * @param amount - Numeric amount in Pesos
 * @param compact - If true, outputs e.g. "₱4.25M" or "₱850K"
 *                  If false, outputs full formatted number e.g. "₱2,630,000"
 */
export function formatPeso(amount: number, compact = false): string {
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';

  if (compact) {
    if (abs >= 1_000_000) {
      const millions = abs / 1_000_000;
      const formatted = Number.isInteger(millions)
        ? millions.toString()
        : millions.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
      return `${sign}₱${formatted}M`;
    }
    if (abs >= 1_000) {
      const thousands = abs / 1_000;
      const formatted = Number.isInteger(thousands)
        ? thousands.toString()
        : thousands.toFixed(1).replace(/0+$/, '').replace(/\.$/, '');
      return `${sign}₱${formatted}K`;
    }
    return `${sign}₱${abs.toLocaleString('en-PH')}`;
  }

  return `${sign}₱${Math.round(abs).toLocaleString('en-PH')}`;
}

/**
 * Calculate KPI summary figures across a set of leads
 *
 * @param leads - Array of leads to aggregate
 * @param monthlyTarget - Monthly dealership sales revenue target (defaults to ₱15,000,000)
 */
export function calculateKpis(
  leads: Lead[],
  monthlyTarget = 15_000_000
): KpiSummary {
  let totalActiveLeads = 0;
  let closedThisMonthValue = 0;
  let closedThisMonthCount = 0;
  let weightedPipelineValue = 0;
  let overdueFollowUpsCount = 0;
  let dueTodayCount = 0;

  for (const lead of leads) {
    if (lead.status === 'won' || lead.stage === 'released') {
      closedThisMonthValue += lead.estValue;
      closedThisMonthCount += 1;
    } else if (lead.status === 'active') {
      totalActiveLeads += 1;
      weightedPipelineValue += lead.estValue * lead.probability;

      if (lead.urgency === 'overdue') {
        overdueFollowUpsCount += 1;
      } else if (lead.urgency === 'due_today') {
        dueTodayCount += 1;
      }
    }
  }

  const achievementPct =
    monthlyTarget > 0 ? Math.round((closedThisMonthValue / monthlyTarget) * 100) : 0;

  return {
    totalActiveLeads,
    closedThisMonthValue,
    closedThisMonthCount,
    monthlyTarget,
    achievementPct,
    weightedPipelineValue: Math.round(weightedPipelineValue),
    overdueFollowUpsCount,
    dueTodayCount,
  };
}
