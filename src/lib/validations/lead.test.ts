import { describe, it, expect } from 'vitest';
import {
  CreateLeadSchema,
  TransitionLeadSchema,
  normalizePhone,
} from './lead';

describe('Lead Validations & Zod Schemas', () => {
  it('validates a correct lead creation payload', () => {
    const validData = {
      customerName: 'Maria Santos',
      customerPhone: '+63 917 123 4567',
      customerEmail: 'maria.santos@gmail.com',
      modelInterest: 'Toyota Fortuner 2.8 LTD',
      estValue: 2630000,
      source: 'walk_in',
      notes: 'Interested in Platinum White Pearl',
    };

    const result = CreateLeadSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('rejects lead creation with negative or zero estimated value', () => {
    const invalidData = {
      customerName: 'Juan Dela Cruz',
      customerPhone: '09171234567',
      modelInterest: 'Vios 1.5 G',
      estValue: -1000,
    };

    const result = CreateLeadSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('rejects short customer names', () => {
    const invalidData = {
      customerName: 'J',
      customerPhone: '09171234567',
      modelInterest: 'Vios 1.5 G',
      estValue: 1039000,
    };

    const result = CreateLeadSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('validates a stage transition payload', () => {
    const validTransition = {
      leadId: '11111111-1111-1111-1111-111111111111',
      action: 'advance' as const,
      note: 'Client agreed to proceed to test drive',
    };

    const result = TransitionLeadSchema.safeParse(validTransition);
    expect(result.success).toBe(true);
  });

  it('validates a mark-lost transition with lostReason', () => {
    const lostTransition = {
      leadId: '11111111-1111-1111-1111-111111111111',
      action: 'lost' as const,
      lostReason: 'bought_elsewhere' as const,
      note: 'Bought from competitor dealership',
    };

    const result = TransitionLeadSchema.safeParse(lostTransition);
    expect(result.success).toBe(true);
  });

  it('normalizes phone numbers to digits only', () => {
    expect(normalizePhone('+63 917 123 4567')).toBe('639171234567');
    expect(normalizePhone('(02) 8123-4567')).toBe('0281234567');
    expect(normalizePhone('+63-917-555-0199')).toBe('639175550199');
  });
});
