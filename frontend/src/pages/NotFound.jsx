import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Home, PackageCheck, MessageCircle, AlertTriangle } from 'lucide-react';
import SEOHead from '../components/SEOHead';

export default function NotFound() {
  return (
    <div className="flex-1 min-h-[75vh] flex flex-col items-center justify-center p-6 text-center bg-[#080B11] text-slate-100">
      <SEOHead
        title="404 - Page Not Found | Sportsman.ke"
        description="The sports gear or page you requested could not be found. Return to Sportsman.ke storefront to browse authentic footballs, jerseys, and athletic equipment."
        canonical="https://sportsman.ke/404"
      />

      <div className="max-w-md w-full bg-[#0D1321] border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden animate-fade-in">
        {/* Glow backdrop */}
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-red-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <span className="text-xs font-black uppercase tracking-widest text-orange-500 bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20 mb-3 inline-block">
          Error 404 • Page Out of Bounds
        </span>

        <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight mb-3">
          Offside! Page Not Found
        </h1>

        <p className="text-xs md:text-sm text-slate-400 font-light mb-8 leading-relaxed">
          The page or product link you clicked has been moved, substituted, or blown off the pitch. Let's get you back in play.
        </p>

        <div className="flex flex-col gap-3">
          <Link
            to="/"
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-3 px-5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg shadow-orange-500/20 transition-all hover:scale-[1.02] active:scale-95"
          >
            <Home className="w-4 h-4" />
            <span>Return to Storefront</span>
          </Link>

          <Link
            to="/tracker"
            className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white py-3 px-5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all"
          >
            <PackageCheck className="w-4 h-4 text-cyan-400" />
            <span>Track Existing Order</span>
          </Link>

          <a
            href="https://wa.me/254759238018?text=Hello%20Sportsman.ke%2C%20I%20need%20assistance%20finding%20a%20product"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 py-3 px-5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all"
          >
            <MessageCircle className="w-4 h-4" />
            <span>WhatsApp Support</span>
          </a>
        </div>
      </div>
    </div>
  );
}
