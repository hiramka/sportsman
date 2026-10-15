import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, RefreshCw, Truck, ShieldAlert, Award } from 'lucide-react';
import SEOHead from '../components/SEOHead';

export default function TermsConditions() {
  return (
    <div className="flex-1 w-full bg-[#080B11] text-slate-100 py-12 px-4 md:px-8">
      <SEOHead
        title="Terms and Conditions of Sale | Sportsman.ke Nairobi"
        description="Official terms of purchase, Nairobi express shipping rules, size exchange guarantees, and M-Pesa order policies for Sportsman.ke."
        canonical="https://sportsman.ke/terms"
      />

      <div className="max-w-4xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-orange-500 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Storefront</span>
        </Link>

        <div className="bg-[#0D1321] border border-slate-800 rounded-3xl p-6 md:p-10 shadow-2xl relative">
          <div className="inline-flex items-center gap-2 bg-orange-500/10 text-orange-400 border border-orange-500/20 px-3 py-1 rounded-full text-xs font-bold mb-4">
            <Award className="w-3.5 h-3.5" />
            <span>Official Retail &amp; Logistics Terms</span>
          </div>

          <h1 className="text-2xl md:text-4xl font-black text-white uppercase tracking-tight mb-2">
            Terms &amp; Conditions of Service
          </h1>
          <p className="text-xs text-slate-500 mb-8">Last Updated: October 2026 • Registered in Nairobi, Kenya</p>

          <div className="space-y-8 text-xs md:text-sm text-slate-300 font-light leading-relaxed">
            <section className="space-y-3">
              <h2 className="text-base font-bold text-white uppercase flex items-center gap-2">
                <Truck className="w-4 h-4 text-orange-500" />
                1. Nairobi Same-Day Delivery
              </h2>
              <p>
                Orders confirmed before 4:00 PM are dispatched for same-day delivery via our express courier network across Nairobi County (Westlands, Kilimani, Lang’ata, Kasarani, Embakasi, CBD, and environs). Orders received past 4:00 PM are scheduled for early morning transit.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-bold text-white uppercase flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-orange-500" />
                2. Free Size Exchange Guarantee
              </h2>
              <p>
                We understand proper fit is paramount for athletic cleats, team jerseys, and basketball boots. We offer a <strong>48-hour complimentary size exchange policy</strong> provided items are in unused condition with tags and packaging intact. Size exchange requests can be initiated directly on the tracking portal.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-bold text-white uppercase flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-orange-500" />
                3. Authenticity &amp; Product Condition
              </h2>
              <p>
                All merchandise sold through Sportsman.ke is 100% genuine and inspected at our central warehouse prior to packaging. We stock official FIFA match footballs, ITTF table tennis rubber racket gear, and NBA specification basketball equipment.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-bold text-white uppercase flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-orange-500" />
                4. Pricing &amp; Payment Settlement
              </h2>
              <p>
                Prices are listed in Kenya Shillings (KES) inclusive of applicable local VAT. Payments are settled via Safaricom M-Pesa Buy Goods / Till, direct WhatsApp concierge, or certified cash on store pickup.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
