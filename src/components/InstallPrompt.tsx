'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from '@/lib/i18n'
import { X, Download, Share } from 'lucide-react'

// Define the type for the BeforeInstallPromptEvent
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function InstallPrompt() {
  const { t } = useTranslation()
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    // 1. Register Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => console.log('SW registered!', reg))
        .catch((err) => console.log('SW registration failed!', err));
    }

    // 2. Check if already installed
    const isPwa = window.matchMedia('(display-mode: standalone)').matches || 
                  (window.navigator as any).standalone === true;
    setIsStandalone(isPwa)

    // Check if dismissed previously
    const dismissed = localStorage.getItem('installPromptDismissed_v2') === 'true'

    if (isPwa || dismissed) {
      return; // Do not show if already installed or dismissed
    }

    // 3. Detect iOS
    const ua = window.navigator.userAgent;
    const isIOSDevice = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
    setIsIOS(isIOSDevice)
    
    if (isIOSDevice) {
      setShowPrompt(true)
    }

    // 4. Handle Android / Chrome prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [])

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem('installPromptDismissed_v2', 'true')
  }

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 pb-6 bg-white border-t shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] flex items-center justify-between gap-4 animate-in slide-in-from-bottom-full duration-300">
      <div className="flex-1">
        {isIOS ? (
          <p className="text-sm text-gray-700 flex items-start gap-2">
            <Share className="w-5 h-5 mt-0.5 text-blue-500 shrink-0" />
            {t('common.installPrompt.iosMessage')}
          </p>
        ) : (
          <p className="text-sm text-gray-700 font-medium">
            {t('common.installPrompt.androidMessage')}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {!isIOS && (
          <button
            onClick={handleInstallClick}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-moss rounded-full hover:bg-forest transition-colors"
          >
            <Download className="w-4 h-4" />
            {t('common.installPrompt.installButton')}
          </button>
        )}
        <button
          onClick={handleDismiss}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label={t('common.installPrompt.closeButton')}
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
