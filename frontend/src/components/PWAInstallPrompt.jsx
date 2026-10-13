import React, { useState, useEffect } from 'react';
import { Download, Share, PlusSquare, X, Smartphone, Sparkles, Check } from 'lucide-react';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if app is already running in standalone PWA mode
    const inStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true ||
      document.referrer.includes('android-app://');

    setIsStandalone(inStandalone);
    if (inStandalone) return;

    // Detect iOS devices (iPhone, iPad, iPod)
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isAppleDevice = /iphone|ipad|ipod/.test(userAgent) && !window.MSStream;
    setIsIOS(isAppleDevice);

    // Check if user dismissed the prompt recently (cooldown: 2 days)
    const lastDismissed = localStorage.getItem('sm_pwa_dismissed');
    const now = Date.now();
    const cooldownMs = 2 * 24 * 60 * 60 * 1000;
    const isDismissedRecently = lastDismissed && now - parseInt(lastDismissed, 10) < cooldownMs;

    // 1. Android / Chromium: capture native beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!isDismissedRecently) {
        setShowBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 2. iOS Safari: beforeinstallprompt never fires on iOS, so show gentle prompt after short delay
    let iosTimer = null;
    if (isAppleDevice && !isDismissedRecently) {
      iosTimer = setTimeout(() => {
        setShowBanner(true);
      }, 2000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      if (iosTimer) clearTimeout(iosTimer);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      // iOS doesn't support programmatic install; open step-by-step guidance modal
      setShowIOSModal(true);
      return;
    }

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    } else {
      // Fallback for browsers that support manual installation
      setShowIOSModal(true);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('sm_pwa_dismissed', Date.now().toString());
  };

  if (isStandalone || (!showBanner && !showIOSModal)) {
    return null;
  }

  return (
    <>
      {/* Lightweight Fixed Install Banner */}
      {showBanner && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 animate-slide-up">
          <div className="bg-[#0D1321]/95 backdrop-blur-xl border border-orange-500/40 rounded-2xl p-4 shadow-2xl shadow-orange-500/10 flex items-center justify-between gap-3 text-left">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center shrink-0 p-1.5 shadow-inner">
                <img
                  src="/logo.jpg"
                  alt="Sportsman.ke"
                  className="w-full h-full object-contain rounded-lg"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/logo.png';
                  }}
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-orange-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-orange-400" />
                    Web App
                  </span>
                  <span className="text-[10px] text-slate-500">•</span>
                  <span className="text-[10px] text-slate-400 font-bold">100% Free</span>
                </div>
                <h4 className="text-xs font-black text-white leading-snug line-clamp-2">
                  Install Sportsman.ke to your Home Screen for faster shopping
                </h4>
                <p className="text-[10px] text-slate-400 truncate mt-0.5">
                  Instant M-Pesa checkout &amp; fast offline access
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={handleInstallClick}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-black text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-md shadow-orange-500/20 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Install</span>
              </button>

              <button
                onClick={handleDismiss}
                aria-label="Dismiss install banner"
                className="p-1.5 text-slate-500 hover:text-slate-300 hover:bg-slate-800/60 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* iOS & Mobile Add-to-Home-Screen Step-by-Step Interactive Guide */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in text-left">
          <div className="w-full max-w-sm sm:max-w-md bg-[#0D1321] border border-orange-500/30 rounded-3xl p-6 shadow-2xl relative">
            <button
              onClick={() => setShowIOSModal(false)}
              className="absolute top-4 right-4 bg-slate-900 border border-slate-800 p-2 rounded-full text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/30 p-1 flex items-center justify-center shrink-0">
                <img
                  src="/logo.jpg"
                  alt="Sportsman.ke Logo"
                  className="w-full h-full object-contain rounded-xl"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/logo.png';
                  }}
                />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-orange-400 block">
                  iOS Home Screen App
                </span>
                <h3 className="text-base font-black text-white">
                  Install Sportsman.ke on iPhone &amp; iPad
                </h3>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-5">
              Apple Safari lets you install Sportsman.ke directly onto your phone without using the App Store. Follow these 3 easy steps:
            </p>

            {/* Steps Container */}
            <div className="space-y-3.5 mb-6">
              {/* Step 1 */}
              <div className="flex items-start gap-3 bg-slate-950/60 border border-slate-800/80 p-3 rounded-2xl">
                <div className="w-7 h-7 rounded-xl bg-orange-500/20 text-orange-400 font-black text-xs flex items-center justify-center shrink-0">
                  1
                </div>
                <div className="flex-1 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-white mb-0.5">
                    <span>Tap the Safari Share button</span>
                    <Share className="w-3.5 h-3.5 text-blue-400 inline shrink-0" />
                  </div>
                  <span className="text-slate-400 text-[11px] block">
                    Located in Safari's bottom toolbar (or top right on iPad).
                  </span>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-3 bg-slate-950/60 border border-slate-800/80 p-3 rounded-2xl">
                <div className="w-7 h-7 rounded-xl bg-orange-500/20 text-orange-400 font-black text-xs flex items-center justify-center shrink-0">
                  2
                </div>
                <div className="flex-1 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-white mb-0.5">
                    <span>Select "Add to Home Screen"</span>
                    <PlusSquare className="w-3.5 h-3.5 text-orange-400 inline shrink-0" />
                  </div>
                  <span className="text-slate-400 text-[11px] block">
                    Scroll down through the share actions sheet and tap the plus icon.
                  </span>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-3 bg-slate-950/60 border border-slate-800/80 p-3 rounded-2xl">
                <div className="w-7 h-7 rounded-xl bg-orange-500/20 text-orange-400 font-black text-xs flex items-center justify-center shrink-0">
                  3
                </div>
                <div className="flex-1 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-white mb-0.5">
                    <span>Tap "Add" in the top right</span>
                    <Check className="w-3.5 h-3.5 text-emerald-400 inline shrink-0" />
                  </div>
                  <span className="text-slate-400 text-[11px] block">
                    Confirm the app name. The Sportsman icon will now sit on your home screen!
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/80">
              <button
                onClick={() => {
                  setShowIOSModal(false);
                  setShowBanner(false);
                  localStorage.setItem('sm_pwa_dismissed', Date.now().toString());
                }}
                className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-black text-xs rounded-xl transition-all cursor-pointer shadow-lg shadow-orange-500/20 text-center"
              >
                Got It! I'll Add to Home Screen
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
