import { describe, it, expect } from 'vitest';
import { tradeInService, getCodingDay, calculateNetEquity } from './tradeInService';

describe('tradeInService - Used Car Appraisal Desk', () => {
  it('correctly maps plate ending digits to Metro Manila LTO coding days', () => {
    expect(getCodingDay('1')).toBe('Monday');
    expect(getCodingDay('ABC-1232')).toBe('Monday');
    expect(getCodingDay('3')).toBe('Tuesday');
    expect(getCodingDay('NBD-4564')).toBe('Tuesday');
    expect(getCodingDay('5')).toBe('Wednesday');
    expect(getCodingDay('6')).toBe('Wednesday');
    expect(getCodingDay('7')).toBe('Thursday');
    expect(getCodingDay('8')).toBe('Thursday');
    expect(getCodingDay('9')).toBe('Friday');
    expect(getCodingDay('0')).toBe('Friday');
    expect(getCodingDay('invalid')).toBe('N/A');
  });

  it('calculates net trade-in equity accurately', () => {
    expect(calculateNetEquity(500_000, 150_000)).toBe(350_000);
    expect(calculateNetEquity(600_000, 0)).toBe(600_000);
    // Underwater trade-in should floor to 0 equity
    expect(calculateNetEquity(300_000, 350_000)).toBe(0);
  });

  it('saves and retrieves an appraisal for a lead', () => {
    const appraisal = tradeInService.saveAppraisal({
      leadId: 'test-lead-999',
      make: 'Honda',
      model: 'City 1.5 RS',
      year: 2022,
      mileageKm: 28000,
      plateEnding: '7',
      transmission: 'automatic',
      condition: 'excellent',
      appraisedValue: 720000,
      existingLoanBalance: 200000,
      notes: 'Fresh unit, first owner',
      appraiserName: 'Used Car Valuation Desk',
    });

    expect(appraisal.codingDay).toBe('Thursday');
    expect(appraisal.netTradeInEquity).toBe(520000);

    const retrieved = tradeInService.getAppraisalByLead('test-lead-999');
    expect(retrieved).toBeDefined();
    expect(retrieved?.model).toBe('City 1.5 RS');
    expect(retrieved?.netTradeInEquity).toBe(520000);
  });

  it('formats a detailed timeline audit note', () => {
    const appraisal = tradeInService.saveAppraisal({
      leadId: 'test-lead-888',
      make: 'Mitsubishi',
      model: 'Montero Sport GLS',
      year: 2019,
      mileageKm: 65000,
      plateEnding: '2',
      transmission: 'automatic',
      condition: 'good',
      appraisedValue: 950000,
      existingLoanBalance: 0,
      appraiserName: 'Valuation Specialist',
    });

    const note = tradeInService.formatTimelineNote(appraisal);
    expect(note).toContain('Trade-In Appraised: 2019 Mitsubishi Montero Sport GLS');
    expect(note).toContain('Coding: Monday');
    expect(note).toContain('Fully Paid');
    expect(note).toContain('Net Equity Credit: ₱950K');
  });
});
