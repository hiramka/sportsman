import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Cookie, X, Check, Shield } from 'lucide-react';

export default function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('sm_cookie_consent');
    if (!consent) {
      // Small delay for smooth entry after initial render
      const timer = setTimeout(() => setIsVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('sm_cookie_consent', JSON.stringify({ analytics: true, essential: true, date: new Date().toISOString() }));
    setIsVisible(false);
  };

  const handleEssentialOnly = () => {
    localStorage.setItem('sm_cookie_consent', JSON.stringify({ analytics: false, essential: true, date: new Date().toISOString() }));
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div
      role="region"
      aria-label="Cookie and Privacy Consent"
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 bg-[#0D1321]/95 backdrop-blur-md border border-slate-800 rounded-2xl p-5 shadow-2xl shadow-black/80 animate-fade-in text-slate-200"
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 shrink-0">
          <Cookie className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h4 className="text-xs font-black uppercase text-white tracking-wider flex items-center gap-1.5">
            Cookie &amp; Privacy Choices
          </h4>
          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed font-light">
            We use essential cookies to maintain your shopping cart, login sessions, and optimize fast order dispatch in Nairobi. We respect your privacy under the Kenya Data Protection Act.
          </p>
        </div>
        <button
          onClick={handleEssentialOnly}
          className="text-slate-500 hover:text-slate-300 p-1 cursor-pointer"
          aria-label="Dismiss cookie banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-slate-850 gap-2">
        <Link
          to="/privacy"
          className="text-[10px] text-slate-400 hover:text-orange-400 underline font-medium"
        >
          Privacy Policy
        </Link>

        <div className="flex gap-2">
          <button
            onClick={handleEssentialOnly}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] font-bold text-slate-300 transition-colors cursor-pointer"
          >
            Essential Only
          </button>
          <button
            onClick={handleAcceptAll}
            className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-[11px] font-bold text-white shadow-md shadow-orange-500/20 transition-all cursor-pointer"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
}
