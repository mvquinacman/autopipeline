import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import type { Profile } from '../../types/crm';
import {
  Lock,
  KeyRound,
  Mail,
  AlertCircle,
  ArrowRight,
  Car,
  Users,
  Boxes,
  Calculator,
} from 'lucide-react';

interface LandingPageProps {
  onLoginSuccess?: (profile: Profile) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLoginSuccess }) => {
  const { profiles, login } = useAuth();
  const [authMode, setAuthMode] = useState<'pin' | 'corporate'>('pin');
  const [selectedProfileId, setSelectedProfileId] = useState<string>(profiles[0]?.id || 'user-agent-1');
  const [pin, setPin] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const selectedProfile = profiles.find((p) => p.id === selectedProfileId);

  const handlePinSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!pin || pin.length < 4) {
      setError('Please enter a valid 4-digit showroom PIN.');
      return;
    }

    const success = login(selectedProfileId, pin);
    if (success) {
      setError(null);
      if (selectedProfile && onLoginSuccess) onLoginSuccess(selectedProfile);
    } else {
      setError('Invalid PIN code. Please verify or use demo PIN.');
    }
  };

  const handleCorporateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your dealership corporate email.');
      return;
    }
    if (!password.trim()) {
      setError('Please enter your account password.');
      return;
    }

    const matched = profiles.find((p) => p.email.toLowerCase() === email.trim().toLowerCase());
    if (!matched) {
      setError('No dealership account associated with this email.');
      return;
    }

    const success = login(matched.id, password.trim());
    if (success) {
      setError(null);
      if (onLoginSuccess) onLoginSuccess(matched);
    } else {
      setError('Authentication failed. Incorrect password.');
    }
  };

  const handleKeypadPress = (val: string) => {
    if (pin.length < 4) {
      setPin((prev) => prev + val);
      setError(null);
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setError(null);
  };

  const handleClear = () => {
    setPin('');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col justify-between font-sans selection:bg-cobalt selection:text-white">
      {/* Top Bar Header with iOS Status Bar / Notch Safe Area */}
      <header className="border-b border-line bg-card/95 backdrop-blur-sm sticky top-0 z-30 px-4 sm:px-8 pt-[max(0.875rem,env(safe-area-inset-top,0px))] pb-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="size-9 sm:size-10 rounded-control bg-cobalt text-white flex items-center justify-center font-display font-bold text-lg sm:text-xl tracking-wider shadow-sm shrink-0">
            AP
          </div>
          <div>
            <h1 className="font-display text-lg sm:text-xl font-bold tracking-tight text-ink flex items-center gap-1.5 sm:gap-2">
              AutoPipeline
              <span className="hidden sm:inline text-[11px] font-mono uppercase bg-wash text-sub px-2 py-0.5 rounded border border-line">
                v2.5 OS
              </span>
            </h1>
            <p className="text-[11px] sm:text-xs text-sub font-medium truncate max-w-[200px] sm:max-w-none">Metro Manila Motors — BGC Showroom</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="inline-flex items-center gap-1.5 text-[10.5px] sm:text-[11px] font-semibold text-won bg-won/10 px-2 sm:px-2.5 py-1 rounded-full border border-won/20">
            <span className="size-2 rounded-full bg-won animate-pulse shrink-0" />
            <span className="hidden sm:inline">BGC Sales Cloud Online</span>
            <span className="sm:hidden">Online</span>
          </span>
        </div>
      </header>

      {/* Main Landing / Auth Hero Container */}
      <main className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-12 flex-1 flex flex-col justify-center pb-[max(2rem,env(safe-area-inset-bottom,0px))]">
        <div className="text-center space-y-2.5 sm:space-y-3 mb-6 sm:mb-8">
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-cobalt bg-cobalt-tint px-2.5 sm:px-3 py-1 rounded-full inline-block">
            Showroom Floor Operations Terminal
          </span>
          <h2 className="font-display text-2xl sm:text-5xl font-bold tracking-tight text-ink leading-tight">
            Automotive Dealership Sales Operating System
          </h2>
          <p className="text-xs sm:text-sm text-sub max-w-xl mx-auto">
            Authorized access only for Sales Consultants, General Sales Managers, and Dealer
            Principals.
          </p>
        </div>

        {/* Authentication Card */}
        <div className="max-w-lg mx-auto w-full bg-card border border-line rounded-card shadow-xl p-4 sm:p-7 space-y-4 sm:space-y-5">
          {/* Tab Switcher */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-wash border border-line rounded-control">
            <button
              type="button"
              onClick={() => {
                setAuthMode('pin');
                setError(null);
              }}
              className={`py-2 px-1.5 sm:px-2.5 text-[11px] sm:text-xs font-bold rounded-control transition-all flex items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap ${
                authMode === 'pin'
                  ? 'bg-card text-cobalt shadow-sm border border-line'
                  : 'text-sub hover:text-ink'
              }`}
            >
              <KeyRound className="size-3.5 shrink-0" />
              <span>Showroom PIN Terminal</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('corporate');
                setError(null);
              }}
              className={`py-2 px-1.5 sm:px-2.5 text-[11px] sm:text-xs font-bold rounded-control transition-all flex items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap ${
                authMode === 'corporate'
                  ? 'bg-card text-cobalt shadow-sm border border-line'
                  : 'text-sub hover:text-ink'
              }`}
            >
              <Mail className="size-3.5 shrink-0" />
              <span>Corporate Login</span>
            </button>
          </div>

          {error && (
            <div className="p-3 bg-overdue/10 border border-overdue/20 rounded-control flex items-center gap-2 text-xs text-overdue">
              <AlertCircle className="size-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Mode 1: Showroom Floor PIN Terminal */}
          {authMode === 'pin' && (
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-sub uppercase mb-2">
                  Select Your Consultant Profile
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {profiles.map((p) => {
                    const isSelected = p.id === selectedProfileId;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setSelectedProfileId(p.id);
                          setPin('');
                          setError(null);
                        }}
                        className={`p-2 sm:p-2.5 rounded-control border text-left transition-all min-h-[46px] ${
                          isSelected
                            ? 'border-cobalt bg-cobalt-tint/30 ring-1 ring-cobalt'
                            : 'border-line bg-paper hover:bg-wash'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <img
                            src={p.avatarUrl}
                            alt={p.fullName}
                            className="w-8 h-8 rounded-full object-cover border border-line shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-[11.5px] sm:text-xs font-bold text-ink truncate">{p.fullName}</p>
                            <span className="text-[9.5px] sm:text-[10px] text-sub uppercase font-semibold block truncate">
                              {p.role.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* PIN Display & Keypad */}
              <div className="bg-paper p-4 rounded-control border border-line text-center space-y-3">
                <span className="text-[10px] font-bold uppercase text-sub tracking-wider block">
                  Enter 4-Digit Floor PIN for {selectedProfile?.fullName}
                </span>

                {/* PIN Dots Display */}
                <div className="flex items-center justify-center gap-3">
                  {[0, 1, 2, 3].map((idx) => (
                    <div
                      key={idx}
                      className={`size-3.5 rounded-full border transition-all ${
                        pin.length > idx
                          ? 'bg-cobalt border-cobalt scale-110'
                          : 'bg-card border-line'
                      }`}
                    />
                  ))}
                </div>

                {/* Keypad Grid */}
                <div className="grid grid-cols-3 gap-1.5 max-w-[240px] mx-auto pt-1">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => handleKeypadPress(num)}
                      className="h-10 rounded-control bg-card border border-line text-sm font-bold text-ink hover:bg-wash hover:border-cobalt/40 active:scale-95 transition-all"
                    >
                      {num}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={handleClear}
                    className="h-10 rounded-control bg-card border border-line text-[11px] font-bold text-sub hover:bg-wash active:scale-95 transition-all"
                  >
                    Clear
                  </button>
                  <button
                    type="button"
                    onClick={() => handleKeypadPress('0')}
                    className="h-10 rounded-control bg-card border border-line text-sm font-bold text-ink hover:bg-wash hover:border-cobalt/40 active:scale-95 transition-all"
                  >
                    0
                  </button>
                  <button
                    type="button"
                    onClick={handleBackspace}
                    className="h-10 rounded-control bg-card border border-line text-[11px] font-bold text-sub hover:bg-wash active:scale-95 transition-all"
                  >
                    Del
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handlePinSubmit()}
                className="w-full py-2.5 rounded-control bg-cobalt hover:bg-cobalt-press text-white text-xs font-bold shadow-sm transition-colors flex items-center justify-center gap-2 min-h-[42px]"
              >
                <Lock className="size-4" /> Unlock Dealership Terminal
              </button>
            </div>
          )}

          {/* Mode 2: Corporate Email/Password Login */}
          {authMode === 'corporate' && (
            <form onSubmit={handleCorporateSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-sub uppercase mb-1">
                  Dealership Email Address
                </label>
                <div className="relative">
                  <Mail className="size-4 text-sub absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="email"
                    required
                    placeholder="paolo.morales@toyotabgc.ph"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-10 pl-9 pr-3 rounded-control border border-line bg-paper text-xs text-ink focus:border-cobalt focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-sub uppercase mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="size-4 text-sub absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-10 pl-9 pr-3 rounded-control border border-line bg-paper text-xs text-ink focus:border-cobalt focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-control bg-cobalt hover:bg-cobalt-press text-white text-xs font-bold shadow-sm transition-colors flex items-center justify-center gap-2 min-h-[42px]"
              >
                <ArrowRight className="size-4" /> Sign In to Terminal
              </button>
            </form>
          )}

        </div>

        {/* Feature Spec-Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto w-full mt-10">
          <div className="bg-card border border-line rounded-control p-3 flex items-start gap-2.5">
            <Calculator className="size-4 text-cobalt shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-ink">F&amp;I Loan Desk</h4>
              <p className="text-[10.5px] text-sub">Bank loan simulation &amp; trade-in equity</p>
            </div>
          </div>
          <div className="bg-card border border-line rounded-control p-3 flex items-start gap-2.5">
            <Users className="size-4 text-cobalt shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-ink">Showroom Up-System</h4>
              <p className="text-[10.5px] text-sub">Walk-in queue &amp; consultant rotation</p>
            </div>
          </div>
          <div className="bg-card border border-line rounded-control p-3 flex items-start gap-2.5">
            <Boxes className="size-4 text-cobalt shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-ink">VIN Stock Matrix</h4>
              <p className="text-[10.5px] text-sub">Physical allocations &amp; 48-hr holds</p>
            </div>
          </div>
          <div className="bg-card border border-line rounded-control p-3 flex items-start gap-2.5">
            <Car className="size-4 text-cobalt shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-ink">Pipeline Kanban</h4>
              <p className="text-[10.5px] text-sub">7-stage sales standup huddle board</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-line bg-card py-4 px-4 sm:px-8 text-center text-xs text-sub">
        <p>© 2026 Metro Manila Motors Inc. • BGC Showroom Operations Platform • Protected by Dealership RBAC</p>
      </footer>
    </div>
  );
};
