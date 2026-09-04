import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import type { Role, Profile, Lead } from '../types/crm';
import { DealershipPermission, UserSession } from '../types/auth';
import { authService } from '../services/authService';

interface AuthContextValue {
  currentProfile: Profile;
  session: UserSession;
  profiles: Profile[];
  switchProfile: (profileOrId: Profile | string, pin?: string) => boolean;
  login: (profileId: string, pin?: string) => boolean;
  logout: () => void;
  hasPermission: (permission: DealershipPermission) => boolean;
  isAtLeastRole: (minRole: Role) => boolean;
  canAccessLead: (lead: Lead) => boolean;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const profiles = useMemo(() => authService.getProfiles(), []);

  // Initialize session from storage or default to first agent (Paolo Morales)
  const [session, setSession] = useState<UserSession>(() => {
    const saved = authService.loadSession();
    if (saved && saved.user) {
      return saved;
    }
    const defaultProfile = profiles[0];
    const initialSession = authService.createSession(defaultProfile);
    authService.saveSession(initialSession);
    return initialSession;
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const currentProfile = session.user;

  const switchProfile = useCallback(
    (profileOrId: Profile | string, pin?: string): boolean => {
      const targetId = typeof profileOrId === 'string' ? profileOrId : profileOrId.id;
      const verified = authService.verifyCredentials(targetId, pin);
      if (!verified) return false;

      const newSession = authService.createSession(verified);
      setSession(newSession);
      authService.saveSession(newSession);
      return true;
    },
    []
  );

  const login = useCallback(
    (profileId: string, pin?: string): boolean => {
      return switchProfile(profileId, pin);
    },
    [switchProfile]
  );

  const logout = useCallback(() => {
    // Reset to base agent
    const defaultProfile = profiles[0];
    const initialSession = authService.createSession(defaultProfile);
    setSession(initialSession);
    authService.saveSession(initialSession);
  }, [profiles]);

  const hasPermission = useCallback(
    (permission: DealershipPermission): boolean => {
      return authService.hasPermission(currentProfile.role, permission);
    },
    [currentProfile.role]
  );

  const isAtLeastRole = useCallback(
    (minRole: Role): boolean => {
      return authService.isAtLeastRole(currentProfile.role, minRole);
    },
    [currentProfile.role]
  );

  const canAccessLead = useCallback(
    (lead: Lead): boolean => {
      return authService.canAccessLead(currentProfile, lead);
    },
    [currentProfile]
  );

  const openAuthModal = useCallback(() => setIsAuthModalOpen(true), []);
  const closeAuthModal = useCallback(() => setIsAuthModalOpen(false), []);

  const value: AuthContextValue = {
    currentProfile,
    session,
    profiles,
    switchProfile,
    login,
    logout,
    hasPermission,
    isAtLeastRole,
    canAccessLead,
    isAuthModalOpen,
    openAuthModal,
    closeAuthModal,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
