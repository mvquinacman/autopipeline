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

    const matched = profiles.find((p) => p.email.toLowerCase() === email.trim().toLowerCase());
    if (!matched) {
      setError('No dealership account associated with this email.');
      return;
    }

    const success = login(matched.id);
    if (success) {
      setError(null);
      if (onLoginSuccess) onLoginSuccess(matched);
    } else {
      setError('Authentication failed. Check your credentials.');
    }
  };

  const handleQuickDemoLogin = (profileId: string) => {
    const matched = profiles.find((p) => p.id === profileId);
    if (!matched) return;
    login(matched.id);
    if (onLoginSuccess) onLoginSuccess(matched);
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
      {/* Top Bar Header */}
      <header className="border-b border-line bg-card/80 backdrop-blur-sm sticky top-0 z-30 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-control bg-cobalt text-white flex items-center justify-center font-display font-bold text-xl tracking-wider shadow-sm">
            AP
          </div>
          <div>
            <h1 className="font-display text-xl font-bold tracking-tight text-ink flex items-center gap-2">
              AutoPipeline
              <span className="hidden sm:inline text-[11px] font-mono uppercase bg-wash text-sub px-2 py-0.5 rounded border border-line">
                v2.5 OS
              </span>
            </h1>
            <p className="text-xs text-sub font-medium">Metro Manila Motors — BGC Showroom</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-won bg-won/10 px-2.5 py-1 rounded-full border border-won/20">
            <span className="size-2 rounded-full bg-won animate-pulse" />
            <span className="hidden sm:inline">BGC Sales Cloud Online</span>
            <span className="sm:hidden">Online</span>
          </span>
        </div>
      </header>

      {/* Main Landing / Auth Hero Container */}
      <main className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12 flex-1 flex flex-col justify-center">
        <div className="text-center space-y-3 mb-8">
          <span className="text-[11px] font-bold uppercase tracking-wider text-cobalt bg-cobalt-tint px-3 py-1 rounded-full inline-block">
            Showroom Floor Operations Terminal
          </span>
          <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-ink">
            Automotive Dealership Sales Operating System
          </h2>
          <p className="text-xs sm:text-sm text-sub max-w-xl mx-auto">
            Authorized access only for Sales Consultants, General Sales Managers, and Dealer
            Principals.
          </p>
        </div>

        {/* Authentication Card */}
        <div className="max-w-lg mx-auto w-full bg-card border border-line rounded-card shadow-xl p-5 sm:p-7 space-y-5">
          {/* Tab Switcher */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-wash border border-line rounded-control">
            <button
              type="button"
              onClick={() => {
                setAuthMode('pin');
                setError(null);
              }}
              className={`py-2 text-xs font-bold rounded-control transition-all flex items-center justify-center gap-1.5 ${
                authMode === 'pin'
                  ? 'bg-card text-cobalt shadow-sm border border-line'
                  : 'text-sub hover:text-ink'
              }`}
            >
              <KeyRound className="size-3.5" /> Showroom PIN Terminal
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('corporate');
                setError(null);
              }}
              className={`py-2 text-xs font-bold rounded-control transition-all flex items-center justify-center gap-1.5 ${
                authMode === 'corporate'
                  ? 'bg-card text-cobalt shadow-sm border border-line'
                  : 'text-sub hover:text-ink'
              }`}
            >
              <Mail className="size-3.5" /> Corporate Login
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
                        className={`p-2.5 rounded-control border text-left transition-all ${
                          isSelected
                            ? 'border-cobalt bg-cobalt-tint/30 ring-1 ring-cobalt'
                            : 'border-line bg-paper hover:bg-wash'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <img
                            src={p.avatarUrl}
                            alt={p.fullName}
                            className="size-7 rounded-full object-cover border border-line shrink-0"
                          />
                          <div className="truncate">
                            <p className="text-xs font-bold text-ink truncate">{p.fullName}</p>
                            <span className="text-[10px] text-sub uppercase font-semibold block">
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

          {/* Quick Demo Access Strip */}
          <div className="pt-3 border-t border-line space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-sub block text-center">
              Quick Demonstration Bypass (One-Click)
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('user-agent-1')}
                className="p-1.5 bg-paper hover:bg-wash text-ink rounded-control border border-line text-[11px] font-semibold text-center transition-colors truncate"
              >
                Paolo (Agent)
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('user-mgr-1')}
                className="p-1.5 bg-paper hover:bg-wash text-ink rounded-control border border-line text-[11px] font-semibold text-center transition-colors truncate"
              >
                Rafael (Manager)
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('user-dp-1')}
                className="p-1.5 bg-paper hover:bg-wash text-ink rounded-control border border-line text-[11px] font-semibold text-center transition-colors truncate"
              >
                Vicente (Principal)
              </button>
            </div>
            <p className="text-[10px] text-sub text-center">
              Demo PIN codes: Paolo <code>1111</code> • Camille <code>2222</code> • Rafael <code>3333</code> • Vicente <code>9999</code>
            </p>
          </div>
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
