import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { formatPeso } from '../../data/seed';
import type { Profile } from '../../types/crm';
import {
  Lock,
  X,
  ShieldCheck,
  User,
  Users,
  CheckCircle,
  AlertCircle,
  KeyRound,
} from 'lucide-react';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HINT_PINS: Record<string, string> = {
  'user-agent-1': '1111',
  'user-agent-2': '2222',
  'user-mgr-1': '3333',
  'user-dp-1': '9999',
};

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  useBodyScrollLock(isOpen);
  const { currentProfile, profiles, switchProfile } = useAuth();
  const [selectedProfileId, setSelectedProfileId] = useState<string>(
    currentProfile?.id || profiles[0]?.id || ''
  );
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const targetProfile = profiles.find((p) => p.id === selectedProfileId) || profiles[0];

  const handleSelectProfile = (p: Profile) => {
    setSelectedProfileId(p.id);
    setPin('');
    setError(null);
  };

  const handleQuickLogin = (p: Profile) => {
    const success = switchProfile(p.id);
    if (success) {
      onClose();
    } else {
      setError('Authentication failed. Please verify credentials.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const success = switchProfile(selectedProfileId, pin);
    if (success) {
      onClose();
    } else {
      setError(`Invalid PIN for ${targetProfile.fullName}. Demo PIN is ${HINT_PINS[targetProfile.id] || '1111'}.`);
    }
  };

  const getRoleIcon = (role: Profile['role']) => {
    switch (role) {
      case 'dealer_principal':
        return <ShieldCheck className="size-4 text-won" />;
      case 'manager':
        return <Users className="size-4 text-due" />;
      default:
        return <User className="size-4 text-cobalt" />;
    }
  };

  const getRoleBadge = (role: Profile['role']) => {
    switch (role) {
      case 'dealer_principal':
        return (
          <span className="text-[10px] font-bold text-won bg-won/10 px-2 py-0.5 rounded-full border border-won/20">
            Dealer Principal (Full Authority)
          </span>
        );
      case 'manager':
        return (
          <span className="text-[10px] font-bold text-due bg-due/10 px-2 py-0.5 rounded-full border border-due/20">
            Sales Manager (Team Alpha)
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-bold text-cobalt bg-cobalt-tint px-2 py-0.5 rounded-full border border-cobalt/20">
            Sales Consultant (Showroom)
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 m-0 z-50 flex items-center justify-center p-3 sm:p-4 pt-[max(1rem,env(safe-area-inset-top,0px))] pb-[max(1rem,env(safe-area-inset-bottom,0px))] bg-ink/50 backdrop-blur-sm animate-fade-in overscroll-none touch-none">
      <div className="bg-card border border-line rounded-card max-w-lg w-full p-4 sm:p-6 shadow-xl space-y-5 max-h-[90dvh] modal-scroll-container touch-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line pb-3">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-full bg-cobalt-tint flex items-center justify-center text-cobalt shrink-0">
              <Lock className="size-4" />
            </div>
            <div>
              <h3 className="font-display text-xl font-bold text-ink">Showroom Terminal Auth</h3>
              <p className="text-xs text-sub">Switch user session &amp; verify dealership hierarchy</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close terminal auth"
            className="size-7 flex items-center justify-center rounded-control hover:bg-wash text-sub hover:text-ink transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Profile Roster Selection */}
        <div className="space-y-2">
          <label className="block text-[11px] font-semibold text-sub uppercase">
            Select Dealership Account
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {profiles.map((p) => {
              const isSelected = p.id === selectedProfileId;
              const isCurrent = p.id === currentProfile?.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelectProfile(p)}
                  className={`p-3 rounded-control border text-left flex items-start justify-between transition-all min-h-[44px] ${
                    isSelected
                      ? 'border-cobalt bg-cobalt-tint/40 shadow-sm'
                      : 'border-line bg-paper hover:bg-wash'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      {getRoleIcon(p.role)}
                      <span className="text-xs font-bold text-ink">{p.fullName}</span>
                    </div>
                    <p className="text-[10.5px] text-sub truncate">{p.email}</p>
                    <p className="text-[10px] text-sub font-semibold">
                      Target: {formatPeso(p.targetValue || 0, true)}
                    </p>
                  </div>
                  {isCurrent && (
                    <span className="text-[9px] font-bold text-cobalt bg-white px-1.5 py-0.5 rounded border border-cobalt/30 shrink-0">
                      Active
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Account Credentials Card */}
        <div className="bg-paper border border-line rounded-control p-3.5 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-ink">{targetProfile.fullName}</p>
              <div className="mt-1">{getRoleBadge(targetProfile.role)}</div>
            </div>
            <span className="text-[11px] text-sub font-mono bg-wash px-2 py-1 rounded border border-line">
              PIN: {HINT_PINS[targetProfile.id] || '1111'}
            </span>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-xs text-overdue bg-overdue/10 border border-overdue/20 rounded-control p-2.5">
              <AlertCircle className="size-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-sub uppercase mb-1">
                Enter Terminal 4-Digit PIN
              </label>
              <div className="relative">
                <KeyRound className="size-4 text-sub absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="password"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder={`e.g. ${HINT_PINS[targetProfile.id] || '1111'}`}
                  className="w-full h-9 pl-9 pr-3 rounded-control border border-line bg-card text-base sm:text-xs text-ink font-mono tracking-widest focus:border-cobalt focus:outline-none"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleQuickLogin(targetProfile)}
                className="px-3 py-1.5 text-xs font-semibold rounded-control bg-wash hover:bg-line text-ink border border-line transition-colors"
              >
                Instant Switch (Demo)
              </button>

              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold rounded-control bg-cobalt hover:bg-cobalt-press text-white shadow-sm transition-colors flex items-center gap-1.5"
              >
                <CheckCircle className="size-3.5" /> Authenticate &amp; Switch
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
