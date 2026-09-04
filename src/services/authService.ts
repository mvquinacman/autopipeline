import { SEED_PROFILES } from '../data/seed';
import type { Role, Profile, Lead } from '../types/crm';
import {
  DealershipPermission,
  ROLE_PERMISSIONS,
  ROLE_HIERARCHY_RANK,
  UserSession,
} from '../types/auth';

const DEMO_PINS: Record<string, string> = {
  'user-agent-1': '1111',
  'user-agent-2': '2222',
  'user-mgr-1': '3333',
  'user-dp-1': '9999',
};

const STORAGE_KEY = 'autopipeline_auth_session';

export const authService = {
  getProfiles(): Profile[] {
    return SEED_PROFILES;
  },

  getProfileById(id: string): Profile | undefined {
    return SEED_PROFILES.find((p) => p.id === id);
  },

  hasPermission(role: Role, permission: DealershipPermission): boolean {
    const permissions = ROLE_PERMISSIONS[role] || [];
    return permissions.includes(permission);
  },

  isAtLeastRole(userRole: Role, minRole: Role): boolean {
    return ROLE_HIERARCHY_RANK[userRole] >= ROLE_HIERARCHY_RANK[minRole];
  },

  canAccessLead(profile: Profile, lead: Lead): boolean {
    if (profile.role === 'dealer_principal') return true;
    if (profile.role === 'manager') {
      return !lead.teamId || lead.teamId === profile.teamId;
    }
    return lead.agentId === profile.id;
  },

  verifyCredentials(profileIdOrEmail: string, pin?: string): Profile | null {
    const profile = SEED_PROFILES.find(
      (p) => p.id === profileIdOrEmail || p.email.toLowerCase() === profileIdOrEmail.toLowerCase()
    );
    if (!profile) return null;

    if (pin && pin.trim().length > 0) {
      const expectedPin = DEMO_PINS[profile.id] ?? '0000';
      if (pin !== expectedPin) {
        return null;
      }
    }

    return profile;
  },

  createSession(profile: Profile): UserSession {
    return {
      user: profile,
      token: `session-jwt-${profile.id}-${Date.now()}`,
      loggedInAt: new Date().toISOString(),
    };
  },

  saveSession(session: UserSession): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      }
    } catch {
      // Storage unavailable or disabled
    }
  },

  loadSession(): UserSession | null {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) {
          return JSON.parse(raw) as UserSession;
        }
      }
    } catch {
      // Storage parsing failed
    }
    return null;
  },

  clearSession(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // Storage error
    }
  },
};
