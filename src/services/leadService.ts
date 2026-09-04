import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { SEED_LEADS, SEED_ACTIVITIES, SEED_PROFILES, SEED_FOLLOW_UPS, STAGES } from '../data/seed';
import { Lead, Stage, Activity, Profile, FollowUp, FollowUpWithLead } from '../types/crm';
import {
  CreateLeadInput,
  CreateLeadSchema,
  TransitionLeadInput,
  TransitionLeadSchema,
  normalizePhone,
} from '../lib/validations/lead';

// In-memory stores for mock fallback
let inMemoryLeads: Lead[] = [...SEED_LEADS];
let inMemoryActivities: Activity[] = [...SEED_ACTIVITIES];
let inMemoryFollowUps: FollowUp[] = [...SEED_FOLLOW_UPS];

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  existingLead?: {
    id: string;
    customerName: string;
    agentName: string;
    stage: Stage;
  };
}

export const leadService = {
  /**
   * Fetches all active leads
   */
  async getLeads(): Promise<Lead[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to fetch leads from Supabase:', error);
        throw error;
      }
      return data as Lead[];
    }

    return [...inMemoryLeads];
  },

  /**
   * Scopes leads to the authenticated user's role (Simulating RLS)
   */
  filterLeadsForRole(leads: Lead[], profile: Profile): Lead[] {
    if (profile.role === 'agent') {
      return leads.filter((l) => l.agentId === profile.id);
    }
    if (profile.role === 'manager') {
      return leads.filter((l) => !l.teamId || l.teamId === profile.teamId);
    }
    // dealer_principal sees all
    return leads;
  },

  /**
   * Returns list of dealership profiles (Agent, Manager, Dealer Principal)
   */
  getProfiles(): Profile[] {
    return SEED_PROFILES;
  },

  /**
   * Check for duplicate phone number in organization
   */
  async checkDuplicate(
    phone: string,
    excludeLeadId?: string
  ): Promise<DuplicateCheckResult> {
    const cleanPhone = normalizePhone(phone);
    if (!cleanPhone || cleanPhone.length < 7) {
      return { isDuplicate: false };
    }

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.rpc('check_duplicate_lead', {
        p_phone: cleanPhone,
        p_exclude_lead_id: excludeLeadId || null,
      });

      if (error) {
        console.error('Failed to check duplicate lead:', error);
        throw error;
      }

      if (data && data.length > 0) {
        return {
          isDuplicate: true,
          existingLead: {
            id: data[0].lead_id,
            customerName: data[0].customer_name,
            agentName: data[0].agent_name,
            stage: data[0].stage,
          },
        };
      }
      return { isDuplicate: false };
    }

    // In-memory fallback
    const match = inMemoryLeads.find(
      (l) =>
        l.status === 'active' &&
        l.id !== excludeLeadId &&
        normalizePhone(l.customerPhone) === cleanPhone
    );

    if (match) {
      return {
        isDuplicate: true,
        existingLead: {
          id: match.id,
          customerName: match.customerName,
          agentName: match.agentName,
          stage: match.stage,
        },
      };
    }

    return { isDuplicate: false };
  },

  /**
   * Fetches activity history for a specific lead
   */
  async getActivities(leadId: string): Promise<Activity[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to fetch activities:', error);
        throw error;
      }
      return data as Activity[];
    }

    return inMemoryActivities
      .filter((a) => a.leadId === leadId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  /**
   * Adds an audit activity row
   */
  async addActivity(
    leadId: string,
    actorId: string,
    actorName: string,
    type: Activity['type'],
    detail: string
  ): Promise<Activity> {
    const newActivity: Activity = {
      id: crypto.randomUUID(),
      leadId,
      actorId,
      actorName,
      type,
      detail,
      createdAt: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('activities')
        .insert({
          id: newActivity.id,
          org_id: '11111111-1111-1111-1111-111111111111',
          lead_id: leadId,
          actor_id: actorId,
          type,
          detail,
          created_at: newActivity.createdAt,
        })
        .select()
        .single();

      if (error) {
        console.error('Failed to insert activity:', error);
        throw error;
      }
      return data as Activity;
    }

    inMemoryActivities = [newActivity, ...inMemoryActivities];
    return newActivity;
  },

  /**
   * Transitions a lead atomically (advance, regress, lost)
   */
  async transitionLead(
    input: TransitionLeadInput,
    actorId = 'user-agent-1',
    actorName = 'Paolo Morales'
  ): Promise<Lead> {
    const validated = TransitionLeadSchema.parse(input);

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.rpc('transition_lead', {
        p_lead_id: validated.leadId,
        p_action: validated.action,
        p_lost_reason: validated.lostReason || null,
        p_note: validated.note || null,
      });

      if (error) {
        console.error('Supabase RPC transition_lead failed:', error);
        throw error;
      }
      return data as Lead;
    }

    // In-memory atomic transition fallback
    const leadIndex = inMemoryLeads.findIndex((l) => l.id === validated.leadId);
    if (leadIndex === -1) {
      throw new Error(`Lead ${validated.leadId} not found`);
    }

    const currentLead = inMemoryLeads[leadIndex];
    const stageOrder: Stage[] = STAGES.map((s) => s.id);
    const currentIndex = stageOrder.indexOf(currentLead.stage);

    let updatedLead: Lead = { ...currentLead };
    let actionDetail = `${validated.action.toUpperCase()}`;

    if (validated.action === 'advance') {
      const nextIndex = Math.min(stageOrder.length - 1, currentIndex + 1);
      const nextStage = stageOrder[nextIndex];
      const isWon = nextStage === 'released';
      actionDetail = `Advanced stage to ${nextStage.replace('_', ' ')}`;

      updatedLead = {
        ...currentLead,
        stage: nextStage,
        status: isWon ? 'won' : currentLead.status,
        probability: Math.min(100, currentLead.probability + 15),
        updatedAt: new Date().toISOString(),
      };
    } else if (validated.action === 'regress') {
      const prevIndex = Math.max(0, currentIndex - 1);
      const prevStage = stageOrder[prevIndex];
      actionDetail = `Regressed stage back to ${prevStage.replace('_', ' ')}`;

      updatedLead = {
        ...currentLead,
        stage: prevStage,
        probability: Math.max(5, currentLead.probability - 15),
        updatedAt: new Date().toISOString(),
      };
    } else if (validated.action === 'lost') {
      actionDetail = `Marked as lost: ${validated.lostReason || 'other'}`;
      updatedLead = {
        ...currentLead,
        status: 'lost',
        lostReason: validated.lostReason || 'other',
        updatedAt: new Date().toISOString(),
      };
    }

    if (validated.note) {
      actionDetail += ` - ${validated.note}`;
    }

    inMemoryLeads[leadIndex] = updatedLead;

    // Automatically append to activity log
    await this.addActivity(
      currentLead.id,
      actorId,
      actorName,
      'stage_change',
      actionDetail
    );

    return updatedLead;
  },

  /**
   * One-tap stage advancement helper
   */
  async advanceStage(leadId: string, note?: string, actorId?: string, actorName?: string): Promise<Lead> {
    return this.transitionLead(
      {
        leadId,
        action: 'advance',
        note,
      },
      actorId,
      actorName
    );
  },

  /**
   * Reassign a lead to another agent (Manager/Owner capability)
   */
  async reassignLead(
    leadId: string,
    newAgentId: string,
    newAgentName: string,
    actorId: string,
    actorName: string
  ): Promise<Lead> {
    const leadIndex = inMemoryLeads.findIndex((l) => l.id === leadId);
    if (leadIndex === -1) {
      throw new Error(`Lead ${leadId} not found`);
    }

    const currentLead = inMemoryLeads[leadIndex];
    const prevAgentName = currentLead.agentName;

    const updated: Lead = {
      ...currentLead,
      agentId: newAgentId,
      agentName: newAgentName,
      updatedAt: new Date().toISOString(),
    };

    inMemoryLeads[leadIndex] = updated;

    await this.addActivity(
      leadId,
      actorId,
      actorName,
      'note',
      `Reassigned lead from ${prevAgentName} to ${newAgentName}`
    );

    return updated;
  },

  /**
   * Links a trade-in appraisal to a lead and records net trade-in equity
   */
  async updateLeadTradeIn(
    leadId: string,
    tradeInId: string,
    netTradeInEquity: number
  ): Promise<Lead> {
    const leadIndex = inMemoryLeads.findIndex((l) => l.id === leadId);
    if (leadIndex === -1) {
      throw new Error(`Lead ${leadId} not found`);
    }

    const currentLead = inMemoryLeads[leadIndex];
    const updated: Lead = {
      ...currentLead,
      tradeInId,
      netTradeInEquity,
      updatedAt: new Date().toISOString(),
    };

    inMemoryLeads[leadIndex] = updated;
    return updated;
  },

  /**
   * Creates a new lead with validation and activity logging
   */
  async createLead(
    input: CreateLeadInput,
    agentId: string,
    agentName: string
  ): Promise<Lead> {
    const validated = CreateLeadSchema.parse(input);

    const newLead: Lead = {
      id: crypto.randomUUID(),
      orgId: '11111111-1111-1111-1111-111111111111',
      agentId,
      agentName,
      customerName: validated.customerName,
      customerPhone: validated.customerPhone,
      customerEmail: validated.customerEmail || undefined,
      modelInterest: validated.modelInterest,
      source: validated.source,
      stage: 'new',
      status: 'active',
      estValue: validated.estValue,
      probability: 10,
      notes: validated.notes,
      urgency: 'none',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('leads')
        .insert(newLead)
        .select()
        .single();

      if (error) {
        console.error('Failed to create lead in Supabase:', error);
        throw error;
      }
      return data as Lead;
    }

    inMemoryLeads = [newLead, ...inMemoryLeads];

    await this.addActivity(
      newLead.id,
      agentId,
      agentName,
      'note',
      `Lead created via ${newLead.source} for ${newLead.modelInterest}`
    );

    return newLead;
  },

  /**
   * Fetches all follow-ups
   */
  async getFollowUps(): Promise<FollowUp[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('follow_ups')
        .select('*')
        .order('due_date', { ascending: true });

      if (error) {
        console.error('Failed to fetch follow-ups:', error);
        throw error;
      }
      return data as FollowUp[];
    }
    return [...inMemoryFollowUps];
  },

  /**
   * Fetches enriched follow-ups joined with lead info and escalation status
   */
  async getEnrichedFollowUps(roleProfile?: Profile): Promise<FollowUpWithLead[]> {
    const rawFollowUps = await this.getFollowUps();
    const leads = await this.getLeads();
    const leadMap = new Map<string, Lead>(leads.map((l) => [l.id, l]));

    const now = new Date('2026-09-04T12:00:00Z').getTime(); // Dealership clock reference

    const enriched: FollowUpWithLead[] = rawFollowUps.map((fu) => {
      const lead = leadMap.get(fu.leadId);
      const dueTime = new Date(fu.dueDate).getTime();
      const isPast24h = dueTime < now - 24 * 3600 * 1000;
      const isEscalated = fu.status === 'missed' || (fu.status === 'pending' && isPast24h);

      return {
        ...fu,
        customerName: lead ? lead.customerName : 'Unknown Customer',
        customerPhone: lead ? lead.customerPhone : '',
        modelInterest: lead ? lead.modelInterest : 'Inquiry',
        leadStage: lead ? lead.stage : 'new',
        agentName: lead ? lead.agentName : 'Unassigned',
        isEscalated,
      };
    });

    if (!roleProfile) return enriched;

    if (roleProfile.role === 'agent') {
      return enriched.filter((fu) => fu.agentId === roleProfile.id);
    }
    if (roleProfile.role === 'manager') {
      return enriched.filter((fu) => {
        const lead = leadMap.get(fu.leadId);
        return lead && (!lead.teamId || lead.teamId === roleProfile.teamId);
      });
    }

    return enriched;
  },

  /**
   * Completes a follow-up and appends activity audit log
   */
  async completeFollowUp(
    followUpId: string,
    actorId: string,
    actorName: string,
    note?: string
  ): Promise<FollowUp> {
    const index = inMemoryFollowUps.findIndex((f) => f.id === followUpId);
    if (index === -1) {
      throw new Error(`Follow-up ${followUpId} not found`);
    }

    const current = inMemoryFollowUps[index];
    const updated: FollowUp = {
      ...current,
      status: 'done',
    };
    inMemoryFollowUps[index] = updated;

    await this.addActivity(
      current.leadId,
      actorId,
      actorName,
      'call',
      `Completed follow-up: ${note || current.note}`
    );

    // Update lead urgency to none if no other pending followups
    const leadIndex = inMemoryLeads.findIndex((l) => l.id === current.leadId);
    if (leadIndex !== -1) {
      inMemoryLeads[leadIndex] = {
        ...inMemoryLeads[leadIndex],
        urgency: 'none',
        updatedAt: new Date().toISOString(),
      };
    }

    return updated;
  },

  /**
   * Reschedules a follow-up to a new date and appends activity
   */
  async rescheduleFollowUp(
    followUpId: string,
    newDueDate: string,
    actorId: string,
    actorName: string,
    reason?: string
  ): Promise<FollowUp> {
    const index = inMemoryFollowUps.findIndex((f) => f.id === followUpId);
    if (index === -1) {
      throw new Error(`Follow-up ${followUpId} not found`);
    }

    const current = inMemoryFollowUps[index];
    const updated: FollowUp = {
      ...current,
      dueDate: newDueDate,
      status: 'pending',
    };
    inMemoryFollowUps[index] = updated;

    await this.addActivity(
      current.leadId,
      actorId,
      actorName,
      'note',
      `Rescheduled follow-up to ${new Date(newDueDate).toLocaleDateString()}${reason ? ` (${reason})` : ''}`
    );

    // Update lead follow-up date and urgency
    const leadIndex = inMemoryLeads.findIndex((l) => l.id === current.leadId);
    if (leadIndex !== -1) {
      inMemoryLeads[leadIndex] = {
        ...inMemoryLeads[leadIndex],
        followUpDue: newDueDate,
        urgency: 'upcoming',
        updatedAt: new Date().toISOString(),
      };
    }

    return updated;
  },

  /**
   * Creates a new follow-up for a lead
   */
  async createFollowUp(
    leadId: string,
    dueDate: string,
    note: string,
    agentId: string,
    actorName: string
  ): Promise<FollowUp> {
    const newFollowUp: FollowUp = {
      id: crypto.randomUUID(),
      leadId,
      agentId,
      dueDate,
      status: 'pending',
      note,
    };

    inMemoryFollowUps = [newFollowUp, ...inMemoryFollowUps];

    await this.addActivity(
      leadId,
      agentId,
      actorName,
      'note',
      `Scheduled follow-up for ${new Date(dueDate).toLocaleDateString()}: ${note}`
    );

    const leadIndex = inMemoryLeads.findIndex((l) => l.id === leadId);
    if (leadIndex !== -1) {
      inMemoryLeads[leadIndex] = {
        ...inMemoryLeads[leadIndex],
        followUpDue: dueDate,
        urgency: 'upcoming',
        updatedAt: new Date().toISOString(),
      };
    }

    return newFollowUp;
  },

  /**
   * Resets in-memory mock store (for testing)
   */
  resetMockStore(): void {
    inMemoryLeads = [...SEED_LEADS];
    inMemoryActivities = [...SEED_ACTIVITIES];
    inMemoryFollowUps = [...SEED_FOLLOW_UPS];
  },
};
