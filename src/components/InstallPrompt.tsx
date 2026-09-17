'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from '@/lib/i18n'
import { X, Download, Share, PlusSquare, Info, MoreHorizontal } from 'lucide-react'

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
  const [showIOSGuide, setShowIOSGuide] = useState(false)

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
    const dismissed = localStorage.getItem('installPromptDismissed_v4') === 'true'

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
    localStorage.setItem('installPromptDismissed_v4', 'true')
  }

  if (!showPrompt) return null;

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-40 p-4 pb-6 bg-white border-t shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] flex items-center justify-between gap-4 animate-in slide-in-from-bottom-full duration-300">
        <div className="flex-1">
          {isIOS ? (
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium text-gray-800">
                아이폰(Safari) 앱 설치 안내
              </p>
              <p className="text-xs text-gray-500">
                자세한 방법을 확인해보세요!
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-700 font-medium">
              {t('common.installPrompt.androidMessage')}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {isIOS ? (
            <button
              onClick={() => setShowIOSGuide(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-blue-500 rounded-full hover:bg-blue-600 transition-colors"
            >
              <Info className="w-4 h-4" />
              안내 보기
            </button>
          ) : (
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

      {/* iOS 가이드 모달 */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-900">아이폰 앱 설치 가이드</h3>
                <button onClick={() => setShowIOSGuide(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="p-3 bg-yellow-50 text-yellow-800 rounded-lg text-sm border border-yellow-200">
                  <p className="font-bold mb-1">⚠️ 주의사항</p>
                  <p>카카오톡, 네이버 앱 등에서는 추가할 수 없습니다. 우측 하단의 [⠇] 버튼을 눌러 반드시 <strong>'Safari로 열기'</strong>를 먼저 선택해주세요!</p>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 font-bold">1</div>
                  <div>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      화면 하단의 <MoreHorizontal className="w-4 h-4 inline-block text-gray-600" /> <strong>점 3개</strong> 버튼을 누른 뒤, <Share className="w-4 h-4 inline-block text-blue-500 mx-0.5" /> <strong>공유</strong> 버튼을 눌러주세요.
                    </p>
                    <div className="mt-2 flex items-center justify-center gap-4 py-2 bg-gray-50 rounded-lg">
                      <div className="flex flex-col items-center gap-1">
                        <MoreHorizontal className="w-5 h-5 text-gray-600" />
                        <span className="text-[10px] text-gray-500">메뉴</span>
                      </div>
                      <span className="text-gray-300">➜</span>
                      <div className="flex flex-col items-center gap-1">
                        <Share className="w-5 h-5 text-blue-500" />
                        <span className="text-[10px] text-gray-500">공유</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 font-bold">2</div>
                  <div>
                    <p className="text-sm text-gray-700">공유 메뉴를 위로 조금 올려서 <strong>'홈 화면에 추가'</strong>를 눌러주세요.</p>
                    <div className="mt-2 flex items-center justify-center gap-2 py-2 bg-gray-50 rounded-lg">
                      <PlusSquare className="w-5 h-5 text-gray-700" />
                      <span className="text-sm font-medium text-gray-800">홈 화면에 추가</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 font-bold">3</div>
                  <div>
                    <p className="text-sm text-gray-700">우측 상단의 <strong>'추가'</strong> 버튼을 누르면 바탕화면에 앱 아이콘이 생깁니다!</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 border-t">
              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-3 text-sm font-semibold text-white bg-gray-900 rounded-xl hover:bg-gray-800 transition-colors"
              >
                확인했습니다
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
