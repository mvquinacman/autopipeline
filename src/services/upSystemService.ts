import type {
  FloorQueueEntry,
  WalkInLog,
  CreateWalkInInput,
  AgentFloorStatus,
} from '../types/upSystem';

const initialQueue: FloorQueueEntry[] = [
  {
    id: 'fq-1',
    agentId: 'user-agent-1',
    agentName: 'Paolo Morales',
    position: 1,
    status: 'up_next',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'fq-2',
    agentId: 'user-agent-2',
    agentName: 'Camille Dizon',
    position: 2,
    status: 'ready',
    updatedAt: new Date().toISOString(),
  },
];

const initialWalkIns: WalkInLog[] = [
  {
    id: 'wi-1',
    customerName: 'Antonio Luna',
    customerPhone: '+63 917 888 4321',
    modelInterest: 'Toyota RAV4 HEV',
    assignedAgentId: 'user-agent-1',
    assignedAgentName: 'Paolo Morales',
    source: 'walk_in',
    timestamp: '2026-09-04T09:15:00Z',
    status: 'completed',
    notes: 'Inquired about hybrid battery warranty. Scheduled showroom follow-up.',
  },
];

let queueStore: FloorQueueEntry[] = JSON.parse(JSON.stringify(initialQueue));
let walkInsStore: WalkInLog[] = JSON.parse(JSON.stringify(initialWalkIns));

function reorderQueue(queue: FloorQueueEntry[]): FloorQueueEntry[] {
  // Sort: active queue members by position
  const activeQueue = queue.filter(
    (e) => e.status === 'up_next' || e.status === 'ready'
  );
  const busyOrOff = queue.filter(
    (e) => e.status !== 'up_next' && e.status !== 'ready'
  );

  activeQueue.sort((a, b) => a.position - b.position);

  // If no one is 'up_next', make first ready agent 'up_next'
  const hasUpNext = activeQueue.some((e) => e.status === 'up_next');
  if (!hasUpNext && activeQueue.length > 0) {
    activeQueue[0].status = 'up_next';
  }

  // Re-index positions
  activeQueue.forEach((e, idx) => {
    e.position = idx + 1;
  });

  return [...activeQueue, ...busyOrOff];
}

export const upSystemService = {
  getQueue(): FloorQueueEntry[] {
    return [...queueStore];
  },

  getWalkIns(): WalkInLog[] {
    return [...walkInsStore];
  },

  getNextUpAgent(): FloorQueueEntry | undefined {
    return (
      queueStore.find((e) => e.status === 'up_next') ||
      queueStore
        .filter((e) => e.status === 'ready')
        .sort((a, b) => a.position - b.position)[0]
    );
  },

  assignWalkIn(input: CreateWalkInInput): {
    walkIn: WalkInLog;
    assignedAgent: FloorQueueEntry;
  } {
    const nextAgent = this.getNextUpAgent();
    if (!nextAgent) {
      throw new Error('No sales consultants are currently available on the showroom floor.');
    }

    const walkIn: WalkInLog = {
      id: `wi-${Date.now()}`,
      customerName: input.customerName.trim(),
      customerPhone: input.customerPhone.trim(),
      modelInterest: input.modelInterest.trim(),
      assignedAgentId: nextAgent.agentId,
      assignedAgentName: nextAgent.agentName,
      source: input.source || 'walk_in',
      timestamp: new Date().toISOString(),
      status: 'active',
      notes: input.notes?.trim() || undefined,
    };

    walkInsStore = [walkIn, ...walkInsStore];

    // Update agent to with_client
    nextAgent.status = 'with_client';
    nextAgent.currentCustomerName = walkIn.customerName;
    nextAgent.currentModelInterest = walkIn.modelInterest;
    nextAgent.startedAt = walkIn.timestamp;
    nextAgent.updatedAt = new Date().toISOString();

    // Reorder remaining queue
    queueStore = reorderQueue(queueStore);

    return { walkIn, assignedAgent: nextAgent };
  },

  completeMeeting(agentId: string, outcomeNote?: string): void {
    const entry = queueStore.find((e) => e.agentId === agentId);
    if (!entry) return;

    // Mark active walk-in as completed
    const activeWalkIn = walkInsStore.find(
      (w) => w.assignedAgentId === agentId && w.status === 'active'
    );
    if (activeWalkIn) {
      activeWalkIn.status = 'completed';
      if (outcomeNote) {
        activeWalkIn.notes = outcomeNote;
      }
    }

    // Reset agent to end of queue
    const highestPos = queueStore.reduce(
      (max, e) => Math.max(max, e.position || 0),
      0
    );
    entry.status = 'ready';
    entry.position = highestPos + 1;
    entry.currentCustomerName = undefined;
    entry.currentModelInterest = undefined;
    entry.startedAt = undefined;
    entry.updatedAt = new Date().toISOString();

    queueStore = reorderQueue(queueStore);
  },

  setAgentStatus(agentId: string, newStatus: AgentFloorStatus): FloorQueueEntry {
    const entry = queueStore.find((e) => e.agentId === agentId);
    if (!entry) {
      throw new Error(`Agent ${agentId} not found in floor queue`);
    }

    entry.status = newStatus;
    entry.updatedAt = new Date().toISOString();

    queueStore = reorderQueue(queueStore);
    return entry;
  },

  resetMockStore(): void {
    queueStore = JSON.parse(JSON.stringify(initialQueue));
    walkInsStore = JSON.parse(JSON.stringify(initialWalkIns));
  },
};
