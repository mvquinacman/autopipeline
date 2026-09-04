import { describe, it, expect, beforeEach } from 'vitest';
import { upSystemService } from './upSystemService';

describe('upSystemService - Showroom Floor Board & Up-System', () => {
  beforeEach(() => {
    upSystemService.resetMockStore();
  });

  it('initializes queue with Paolo Morales Up Next and Camille Dizon Ready', () => {
    const queue = upSystemService.getQueue();
    expect(queue.length).toBe(2);

    const upNext = upSystemService.getNextUpAgent();
    expect(upNext?.agentName).toBe('Paolo Morales');
    expect(upNext?.status).toBe('up_next');
  });

  it('assigns walk-in to Up Next consultant and rotates the queue', () => {
    const { walkIn, assignedAgent } = upSystemService.assignWalkIn({
      customerName: 'Eduardo Ramos',
      customerPhone: '+63 917 555 9876',
      modelInterest: 'Toyota Land Cruiser Prado',
      source: 'walk_in',
    });

    expect(walkIn.customerName).toBe('Eduardo Ramos');
    expect(walkIn.assignedAgentName).toBe('Paolo Morales');
    expect(assignedAgent.status).toBe('with_client');
    expect(assignedAgent.currentCustomerName).toBe('Eduardo Ramos');

    // Camille Dizon should now be promoted to Up Next
    const newUpNext = upSystemService.getNextUpAgent();
    expect(newUpNext?.agentName).toBe('Camille Dizon');
    expect(newUpNext?.status).toBe('up_next');
  });

  it('completes client meeting and returns consultant to end of rotation queue', () => {
    // 1. Assign walk-in to Paolo
    upSystemService.assignWalkIn({
      customerName: 'Leah Bautista',
      customerPhone: '+63 918 333 4444',
      modelInterest: 'Toyota Hilux GR-S',
    });

    // 2. Complete meeting
    upSystemService.completeMeeting('user-agent-1', 'Client booked a test drive for tomorrow.');

    const queue = upSystemService.getQueue();
    const paolo = queue.find((e) => e.agentId === 'user-agent-1')!;

    // Paolo should now be ready and behind Camille
    expect(paolo.status).toBe('ready');
    expect(paolo.currentCustomerName).toBeUndefined();

    // Camille should be up next at position 1
    const camille = queue.find((e) => e.agentId === 'user-agent-2')!;
    expect(camille.status).toBe('up_next');
    expect(camille.position).toBe(1);
    expect(paolo.position).toBe(2);
  });
});
