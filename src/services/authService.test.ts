import { describe, it, expect } from 'vitest';
import { authService } from './authService';
import { SEED_PROFILES } from '../data/seed';

describe('authService - Dealership RBAC & Access Control', () => {
  const agent = SEED_PROFILES.find((p) => p.role === 'agent')!;
  const manager = SEED_PROFILES.find((p) => p.role === 'manager')!;
  const principal = SEED_PROFILES.find((p) => p.role === 'dealer_principal')!;

  it('correctly evaluates permissions across the dealership hierarchy', () => {
    // Agent permissions
    expect(authService.hasPermission('agent', 'lead:view')).toBe(true);
    expect(authService.hasPermission('agent', 'lead:advance')).toBe(true);
    expect(authService.hasPermission('agent', 'trade_in:appraise')).toBe(true);
    expect(authService.hasPermission('agent', 'lead:reassign')).toBe(false);
    expect(authService.hasPermission('agent', 'lead:export')).toBe(false);
    expect(authService.hasPermission('agent', 'quota:manage')).toBe(false);

    // Manager permissions
    expect(authService.hasPermission('manager', 'lead:view')).toBe(true);
    expect(authService.hasPermission('manager', 'lead:reassign')).toBe(true);
    expect(authService.hasPermission('manager', 'lead:export')).toBe(true);
    expect(authService.hasPermission('manager', 'analytics:team')).toBe(true);
    expect(authService.hasPermission('manager', 'quota:manage')).toBe(false);

    // Dealer Principal permissions
    expect(authService.hasPermission('dealer_principal', 'lead:reassign')).toBe(true);
    expect(authService.hasPermission('dealer_principal', 'lead:export')).toBe(true);
    expect(authService.hasPermission('dealer_principal', 'analytics:dealership')).toBe(true);
    expect(authService.hasPermission('dealer_principal', 'quota:manage')).toBe(true);
  });

  it('correctly compares role hierarchy ranks', () => {
    expect(authService.isAtLeastRole('agent', 'agent')).toBe(true);
    expect(authService.isAtLeastRole('agent', 'manager')).toBe(false);
    expect(authService.isAtLeastRole('manager', 'agent')).toBe(true);
    expect(authService.isAtLeastRole('manager', 'manager')).toBe(true);
    expect(authService.isAtLeastRole('manager', 'dealer_principal')).toBe(false);
    expect(authService.isAtLeastRole('dealer_principal', 'agent')).toBe(true);
    expect(authService.isAtLeastRole('dealer_principal', 'manager')).toBe(true);
    expect(authService.isAtLeastRole('dealer_principal', 'dealer_principal')).toBe(true);
  });

  it('verifies PIN credentials for showroom terminals', () => {
    expect(authService.verifyCredentials(agent.id, '1111')).not.toBeNull();
    expect(authService.verifyCredentials(agent.id, '9999')).toBeNull(); // wrong PIN
    expect(authService.verifyCredentials(principal.id, '9999')).not.toBeNull();
  });

  it('evaluates lead ownership scoping rules', () => {
    const mockLead = {
      id: 'lead-test',
      orgId: 'org-toyota-bgc',
      teamId: 'team-alpha',
      agentId: agent.id,
      agentName: agent.fullName,
      customerName: 'Juan Dela Cruz',
      customerPhone: '+63 917 111 2222',
      modelInterest: 'Toyota Vios',
      estValue: 1000000,
      probability: 0.2,
      stage: 'contacted' as const,
      status: 'active' as const,
      urgency: 'none' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Lead belongs to Paolo (agent)
    expect(authService.canAccessLead(agent, mockLead)).toBe(true);

    // Another agent cannot access Paolo's lead
    const otherAgent = SEED_PROFILES.find((p) => p.role === 'agent' && p.id !== agent.id)!;
    expect(authService.canAccessLead(otherAgent, mockLead)).toBe(false);

    // Manager in team-alpha can access
    expect(authService.canAccessLead(manager, mockLead)).toBe(true);

    // Dealer principal can always access
    expect(authService.canAccessLead(principal, mockLead)).toBe(true);
  });
});
