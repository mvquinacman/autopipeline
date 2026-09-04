import { describe, it, expect, beforeEach } from 'vitest';
import { commissionService, getBaseUnitCommission } from './commissionService';
import type { Lead } from '../types/crm';

describe('commissionService', () => {
  beforeEach(() => {
    commissionService.resetStore();
  });

  it('calculates tier-appropriate base unit commissions', () => {
    expect(getBaseUnitCommission('Toyota Vios 1.5 G').baseUnit).toBe(5_000);
    expect(getBaseUnitCommission('Toyota Corolla Cross HEV').baseUnit).toBe(8_000);
    expect(getBaseUnitCommission('Toyota Fortuner LTD').baseUnit).toBe(12_000);
    expect(getBaseUnitCommission('Toyota Hilux GR-S').baseUnit).toBe(12_000);
    expect(getBaseUnitCommission('Land Cruiser Prado 2.4 Turbo').baseUnit).toBe(20_000);
  });

  it('creates and calculates commission breakdown with 20/30/50 reserve split', () => {
    const mockLead: Lead = {
      id: 'lead-test-comm',
      orgId: 'org-toyota-bgc',
      agentId: 'user-agent-1',
      agentName: 'Paolo Morales',
      customerName: 'Test Customer',
      customerPhone: '+63 917 111 2222',
      customerEmail: 'test@example.com',
      modelInterest: 'Toyota Fortuner LTD',
      estValue: 2_630_000,
      probability: 0.9,
      stage: 'approved',
      status: 'active',
      urgency: 'upcoming',
      notes: 'Financing approved with BDO',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const comm = commissionService.createCommissionForLead(mockLead, {
      bankReserveTotal: 50_000,
      accessoriesValue: 40_000,
      isServiceDrive: true,
    });

    expect(comm.baseUnitCommission).toBe(12_000);
    expect(comm.bankReserveSplit.agentShare).toBe(10_000); // 20%
    expect(comm.bankReserveSplit.fiShare).toBe(15_000);    // 30%
    expect(comm.bankReserveSplit.dealershipShare).toBe(25_000); // 50%
    expect(comm.accessoriesCommission).toBe(2_000); // 5% of 40k
    expect(comm.serviceDriveSpotterBounty).toBe(5_000);
    expect(comm.totalAgentPayout).toBe(12_000 + 10_000 + 2_000 + 5_000); // 29,000
    expect(comm.status).toBe('pending_release');
  });

  it('approves a commission and records GSM audit information', async () => {
    const approved = await commissionService.approveCommission('comm-2026-001', 'Rafael Alcantara');
    expect(approved.status).toBe('gsm_approved');
    expect(approved.approvedBy).toBe('Rafael Alcantara');
    expect(approved.approvedAt).toBeDefined();
  });

  it('filters commissions for agent role', async () => {
    const agentRecords = await commissionService.getCommissions('agent', 'user-agent-2');
    expect(agentRecords.every((r) => r.salesConsultantId === 'user-agent-2')).toBe(true);

    const allRecords = await commissionService.getCommissions('manager', 'user-mgr-1');
    expect(allRecords.length).toBeGreaterThan(agentRecords.length);
  });
});
