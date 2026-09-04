import React from 'react';
import { Profile } from '../types/crm';
import { formatPeso } from '../data/seed';
import { ShieldCheck, User, Users } from 'lucide-react';

interface RoleSwitcherProps {
  currentProfile: Profile;
  profiles: Profile[];
  onSelectProfile: (profile: Profile) => void;
}

export const RoleSwitcher: React.FC<RoleSwitcherProps> = ({
  currentProfile,
  profiles,
  onSelectProfile,
}) => {
  const getRoleIcon = (role: Profile['role']) => {
    switch (role) {
      case 'dealer_principal':
        return <ShieldCheck className="size-3.5 text-won" />;
      case 'manager':
        return <Users className="size-3.5 text-due" />;
      default:
        return <User className="size-3.5 text-cobalt" />;
    }
  };

  const getRoleLabel = (role: Profile['role']) => {
    switch (role) {
      case 'dealer_principal':
        return 'Dealer Principal';
      case 'manager':
        return 'Sales Manager';
      default:
        return 'Sales Agent';
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center bg-card border border-line rounded-control p-1 shadow-sm">
        {profiles.map((p) => {
          const isActive = p.id === currentProfile.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onSelectProfile(p)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-control text-xs font-medium transition-all ${
                isActive
                  ? 'bg-wash text-ink font-semibold shadow-sm border border-line'
                  : 'text-sub hover:text-ink hover:bg-paper'
              }`}
              title={`${p.fullName} - Target: ${formatPeso(p.targetValue || 0, true)}`}
            >
              {getRoleIcon(p.role)}
              <span className="hidden sm:inline">{p.fullName}</span>
              <span className="text-[10px] text-sub uppercase font-bold tracking-wider sm:hidden">
                {p.role === 'dealer_principal' ? 'Owner' : p.role}
              </span>
            </button>
          );
        })}
      </div>
      <div className="hidden lg:flex items-center text-xs text-sub px-2 border-l border-line">
        <span className="font-semibold text-ink mr-1">Scope:</span>
        {getRoleLabel(currentProfile.role)}
      </div>
    </div>
  );
};
