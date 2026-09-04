import { describe, it, expect, beforeEach } from 'vitest';
import { serviceDriveService } from './serviceDriveService';
import { tradeInService } from './tradeInService';

describe('serviceDriveService - Workshop Buyback & Equity Prospecting', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('retrieves active service bay appointments and buyback opportunities', () => {
    const appts = serviceDriveService.getAppointments();
    expect(appts.length).toBeGreaterThanOrEqual(6);

    const bay1 = appts.find((a) => a.bayNumber === 1);
    expect(bay1).toBeDefined();
    expect(bay1?.customerName).toBe('Danilo Ramos');
    expect(bay1?.netEquity).toBe(480000); // ₱1.32M - ₱840k
    expect(bay1?.opportunityType).toBe('high_positive_equity');
  });

  it('updates pitch status and notes for an appointment', () => {
    const appt = serviceDriveService.getAppointmentById('srv-001');
    expect(appt).toBeDefined();

    const updated = serviceDriveService.updatePitchStatus('srv-001', 'pitch_presented', 'Customer expressed keen interest in GR-S');
    expect(updated.pitchStatus).toBe('pitch_presented');
    expect(updated.pitchNotes).toContain('GR-S');
  });

  it('converts a service drive appointment into a pipeline lead with linked trade-in appraisal', async () => {
    const result = await serviceDriveService.convertServiceToLead({
      appointmentId: 'srv-001',
      assignedAgentId: 'user-agent-1',
      assignedAgentName: 'Paolo Morales',
      initialNote: 'Spoke at customer lounge. Wants quotation today.',
    });

    expect(result.lead.id).toBeDefined();
    expect(result.lead.customerName).toBe('Danilo Ramos');
    expect(result.lead.modelInterest).toBe('Toyota Hilux GR-S 4x4');
    expect(result.lead.stage).toBe('contacted');
    expect(result.appointment.pitchStatus).toBe('converted_to_lead');
    expect(result.appointment.convertedLeadId).toBe(result.lead.id);

    // Verify trade-in appraisal was automatically registered
    const appraisal = tradeInService.getAppraisalByLead(result.lead.id);
    expect(appraisal).toBeDefined();
    expect(appraisal?.model).toBe('Hilux Conquest 4x4');
    expect(appraisal?.netTradeInEquity).toBe(480000);
  });

  it('calculates service drive KPIs correctly', () => {
    const kpis = serviceDriveService.getKpis();
    expect(kpis.activeVehiclesInService).toBeGreaterThanOrEqual(6);
    expect(kpis.highEquityProspectsCount).toBeGreaterThan(0);
    expect(kpis.totalPotentialTradeInValue).toBeGreaterThan(0);
  });
});
