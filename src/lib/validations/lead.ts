import { z } from 'zod';

export const StageEnum = z.enum([
  'new',
  'attempting_contact',
  'contacted',
  'interested',
  'quotation_sent',
  'application',
  'processing',
  'released',
  'showroom',
  'test_drive',
  'approved',
]);

export const LeadStatusEnum = z.enum(['active', 'won', 'lost', 'nurture']);

export const LostReasonEnum = z.enum([
  'bought_elsewhere',
  'unresponsive',
  'financing_declined',
  'budget',
  'other',
]);

export const CreateLeadSchema = z.object({
  customerName: z.string().min(2, 'Customer name must be at least 2 characters'),
  customerPhone: z
    .string()
    .min(7, 'Phone number is too short')
    .regex(/^[\d\s\-+()]+$/, 'Invalid phone number format'),
  customerEmail: z.string().email('Invalid email address').optional().or(z.literal('')),
  modelInterest: z.string().min(2, 'Vehicle model is required'),
  estValue: z.number().positive('Estimated deal value must be greater than zero'),
  source: z.string().default('walk_in'),
  notes: z.string().optional(),
  nextAction: z.string().optional(),
  nextFollowUpDate: z.string().optional(),
  agentId: z.string().optional(),
});

export const TransitionLeadSchema = z.object({
  leadId: z.string().min(1, 'Lead ID is required'),
  action: z.enum(['advance', 'regress', 'lost', 'nurture']),
  lostReason: LostReasonEnum.optional(),
  note: z.string().optional(),
});

export type CreateLeadInput = z.infer<typeof CreateLeadSchema>;
export type TransitionLeadInput = z.infer<typeof TransitionLeadSchema>;

/**
 * Normalizes phone numbers by stripping all non-digit characters
 * e.g. "+63 (917) 123-4567" -> "639171234567"
 */
export function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '');
}
