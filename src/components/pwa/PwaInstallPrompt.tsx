import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const PwaInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if running in standalone mode
    const checkStandalone = 
      (typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(display-mode: standalone)')?.matches) ||
      (typeof navigator !== 'undefined' && 'standalone' in navigator && (navigator as unknown as { standalone: boolean }).standalone === true);
    setIsStandalone(Boolean(checkStandalone));

    // Check if previously dismissed in this session
    const dismissed = sessionStorage.getItem('pwa_prompt_dismissed') === 'true';
    setIsDismissed(dismissed);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem('pwa_prompt_dismissed', 'true');
  };

  // Do not render if standalone or dismissed or already installed
  if (isStandalone || isDismissed || isInstalled || !deferredPrompt) {
    return null;
  }

  return (
    <div 
      role="region"
      aria-label="Install Application Banner"
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:w-96 z-50 bg-card border border-line rounded-card p-3 shadow-lg flex items-center justify-between gap-3 animate-fade-in"
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="size-9 rounded-control bg-cobalt-tint text-cobalt flex items-center justify-center shrink-0">
          <Smartphone className="size-5" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold text-ink leading-snug truncate">
            Install AutoPipeline
          </p>
          <p className="text-[11px] text-sub leading-tight truncate">
            Install as standalone app on your device
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          onClick={handleInstallClick}
          aria-label="Install AutoPipeline App"
          className="px-2.5 py-1.5 bg-cobalt hover:bg-cobalt-press text-white text-xs font-bold rounded-control transition-colors flex items-center gap-1.5 shadow-xs"
        >
          <Download className="size-3.5" />
          <span>Install</span>
        </button>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss install prompt"
          className="size-7 rounded-control flex items-center justify-center text-sub hover:text-ink hover:bg-wash transition-colors"
        >
          <X className="size-3.5" />
        </button>
      </div>
    </div>
  );
};
