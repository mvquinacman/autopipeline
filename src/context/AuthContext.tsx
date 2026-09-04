import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import type { Role, Profile, Lead } from '../types/crm';
import { DealershipPermission, UserSession } from '../types/auth';
import { authService } from '../services/authService';

interface AuthContextValue {
  currentProfile: Profile | null;
  session: UserSession | null;
  profiles: Profile[];
  switchProfile: (profileOrId: Profile | string, pin?: string) => boolean;
  login: (profileIdOrEmail: string, pin?: string) => boolean;
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

  // Initialize session from storage (or null if not logged in)
  const [session, setSession] = useState<UserSession | null>(() => {
    return authService.loadSession();
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const currentProfile = session?.user || null;

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
    (profileIdOrEmail: string, pin?: string): boolean => {
      return switchProfile(profileIdOrEmail, pin);
    },
    [switchProfile]
  );

  const logout = useCallback(() => {
    authService.clearSession();
    setSession(null);
  }, []);

  const hasPermission = useCallback(
    (permission: DealershipPermission): boolean => {
      if (!currentProfile) return false;
      return authService.hasPermission(currentProfile.role, permission);
    },
    [currentProfile]
  );

  const isAtLeastRole = useCallback(
    (minRole: Role): boolean => {
      if (!currentProfile) return false;
      return authService.isAtLeastRole(currentProfile.role, minRole);
    },
    [currentProfile]
  );

  const canAccessLead = useCallback(
    (lead: Lead): boolean => {
      if (!currentProfile) return false;
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
