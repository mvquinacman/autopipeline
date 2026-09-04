import { describe, it, expect, beforeEach } from 'vitest';
import { deliveryService } from './deliveryService';

describe('deliveryService - Delivery Bay & Vehicle Turnover Desk', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('retrieves delivery appointments across Bays 1 to 3', () => {
    const appts = deliveryService.getAppointments();
    expect(appts.length).toBe(3);

    const bay1 = appts.find((a) => a.bayNumber === 1);
    expect(bay1).toBeDefined();
    expect(bay1?.customerName).toBe('Maria Santos');
    expect(bay1?.status).toBe('pdi_ready');
    expect(bay1?.pdiChecklist.length).toBe(10);
  });

  it('updates PDI checklist item status and recomputes inspection readiness', () => {
    // In Bay 2, change item pdi-8 from pending to passed
    const appt = deliveryService.getAppointmentById('del-002');
    expect(appt).toBeDefined();

    const updated = deliveryService.updatePdiItem('del-002', 'pdi-8', 'passed', 'Ronaldo Cruz');
    const item = updated.pdiChecklist.find((i) => i.id === 'pdi-8');
    expect(item?.status).toBe('passed');
    expect(item?.inspectedBy).toBe('Ronaldo Cruz');
  });

  it('toggles handover kit verification check', () => {
    const appt = deliveryService.getAppointmentById('del-002');
    const initialVerified = appt?.handoverKit[0].verified;

    const updated = deliveryService.toggleHandoverKitItem('del-002', 'kit-1');
    expect(updated.handoverKit[0].verified).toBe(!initialVerified);
  });

  it('generates security gate pass, marks appointment released, and records CSI feedback', async () => {
    const result = await deliveryService.generateGatePass('del-001', 'Officer Santos', 'user-1', 'Paolo Morales');

    expect(result.gatePass).toBeDefined();
    expect(result.gatePass.passNumber).toContain('GP-2026-0904');
    expect(result.appointment.status).toBe('released');

    // Record CSI survey feedback
    const withCsi = deliveryService.recordCsiFeedback('del-001', 5, 'Exceptional vehicle delivery experience!');
    expect(withCsi.csiRating).toBe(5);
    expect(withCsi.csiFeedback).toContain('Exceptional');
  });

  it('computes delivery KPI metrics correctly', () => {
    const kpis = deliveryService.getKpis();
    expect(kpis.scheduledTodayCount).toBeGreaterThanOrEqual(2);
    expect(kpis.pdiCompletedCount).toBeGreaterThanOrEqual(1);
    expect(kpis.averageCsiScore).toBeGreaterThanOrEqual(4.0);
  });
});
