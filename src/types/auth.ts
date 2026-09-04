import type { Role, Profile } from './crm';

export type DealershipPermission =
  | 'lead:view'
  | 'lead:advance'
  | 'lead:reassign'
  | 'lead:mark_lost'
  | 'lead:export'
  | 'trade_in:appraise'
  | 'analytics:team'
  | 'analytics:dealership'
  | 'quota:manage'
  | 'commission:view_team'
  | 'commission:approve'
  | 'social:manage';

export const ROLE_HIERARCHY_RANK: Record<Role, number> = {
  agent: 1,
  manager: 2,
  dealer_principal: 3,
};

export const ROLE_PERMISSIONS: Record<Role, DealershipPermission[]> = {
  agent: [
    'lead:view',
    'lead:advance',
    'lead:mark_lost',
    'trade_in:appraise',
    'social:manage',
  ],
  manager: [
    'lead:view',
    'lead:advance',
    'lead:mark_lost',
    'trade_in:appraise',
    'lead:reassign',
    'lead:export',
    'analytics:team',
    'commission:view_team',
    'commission:approve',
    'social:manage',
  ],
  dealer_principal: [
    'lead:view',
    'lead:advance',
    'lead:mark_lost',
    'trade_in:appraise',
    'lead:reassign',
    'lead:export',
    'analytics:team',
    'analytics:dealership',
    'quota:manage',
    'commission:view_team',
    'commission:approve',
    'social:manage',
  ],
};

export interface UserSession {
  user: Profile;
  token: string;
  loggedInAt: string;
}
