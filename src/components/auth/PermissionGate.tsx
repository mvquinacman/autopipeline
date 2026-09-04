import React from 'react';
import type { Role, Lead } from '../../types/crm';
import type { DealershipPermission } from '../../types/auth';
import { useAuth } from '../../context/AuthContext';

export interface PermissionGateProps {
  permission?: DealershipPermission;
  minRole?: Role;
  lead?: Lead;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export const PermissionGate: React.FC<PermissionGateProps> = ({
  permission,
  minRole,
  lead,
  fallback = null,
  children,
}) => {
  const { hasPermission, isAtLeastRole, canAccessLead } = useAuth();

  if (permission && !hasPermission(permission)) {
    return <>{fallback}</>;
  }

  if (minRole && !isAtLeastRole(minRole)) {
    return <>{fallback}</>;
  }

  if (lead && !canAccessLead(lead)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
