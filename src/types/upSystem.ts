export type AgentFloorStatus =
  | 'up_next'
  | 'ready'
  | 'with_client'
  | 'on_test_drive'
  | 'off_floor';

export interface FloorQueueEntry {
  id: string;
  agentId: string;
  agentName: string;
  position: number;
  status: AgentFloorStatus;
  currentLeadId?: string;
  currentCustomerName?: string;
  currentModelInterest?: string;
  startedAt?: string;
  updatedAt: string;
}

export type WalkInSource = 'walk_in' | 'phone_in' | 'service_drive';

export interface WalkInLog {
  id: string;
  customerName: string;
  customerPhone: string;
  modelInterest: string;
  assignedAgentId: string;
  assignedAgentName: string;
  source: WalkInSource;
  timestamp: string;
  status: 'active' | 'converted' | 'completed';
  notes?: string;
}

export interface CreateWalkInInput {
  customerName: string;
  customerPhone: string;
  modelInterest: string;
  source?: WalkInSource;
  notes?: string;
}
