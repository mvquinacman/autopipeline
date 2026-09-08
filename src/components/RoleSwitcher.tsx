import React from 'react';
import { Profile } from '../types/crm';
import { ShieldCheck, User, Users } from 'lucide-react';

interface RoleSwitcherProps {
  currentProfile: Profile;
  profiles?: Profile[];
  onSelectProfile?: (profile: Profile) => void;
  onOpenAuthModal?: () => void;
}

export const RoleSwitcher: React.FC<RoleSwitcherProps> = ({
  currentProfile,
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

  const getRoleBadge = (role: Profile['role']) => {
    switch (role) {
      case 'dealer_principal':
        return (
          <span className="text-[10px] font-bold text-won bg-won/10 px-2 py-0.5 rounded-full border border-won/20">
            Dealer Principal
          </span>
        );
      case 'manager':
        return (
          <span className="text-[10px] font-bold text-due bg-due/10 px-2 py-0.5 rounded-full border border-due/20">
            Sales Manager
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-bold text-cobalt bg-cobalt-tint px-2 py-0.5 rounded-full border border-cobalt/20">
            Sales Agent
          </span>
        );
    }
  };

  return (
    <div
      aria-label={`Active user: ${currentProfile.fullName}`}
      className="flex items-center gap-2 px-3 py-1.5 rounded-control bg-card border border-line text-ink shadow-xs min-h-[36px]"
    >
      <div className="size-6 rounded-full bg-wash flex items-center justify-center shrink-0 border border-line">
        {getRoleIcon(currentProfile.role)}
      </div>
      <div className="flex items-center gap-1.5 text-left">
        <span className="text-xs font-bold text-ink">{currentProfile.fullName}</span>
        {getRoleBadge(currentProfile.role)}
      </div>
    </div>
  );
};

