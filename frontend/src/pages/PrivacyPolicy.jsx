import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Lock, Eye, FileText, Phone, Mail, MapPin } from 'lucide-react';
import SEOHead from '../components/SEOHead';

export default function PrivacyPolicy() {
  return (
    <div className="flex-1 w-full bg-[#080B11] text-slate-100 py-12 px-4 md:px-8">
      <SEOHead
        title="Privacy & Data Protection Policy | Sportsman.ke Kenya"
        description="Sportsman.ke customer privacy and personal data protection policy in strict compliance with the Kenya Data Protection Act 2019."
        canonical="https://sportsman.ke/privacy"
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
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-bold mb-4">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Kenya Data Protection Act 2019 Compliant</span>
          </div>

          <h1 className="text-2xl md:text-4xl font-black text-white uppercase tracking-tight mb-2">
            Privacy &amp; Data Protection Policy
          </h1>
          <p className="text-xs text-slate-500 mb-8">Effective Date: October 2026 • Sportsman.ke Nairobi Hub</p>

          <div className="space-y-8 text-xs md:text-sm text-slate-300 font-light leading-relaxed">
            <section className="space-y-3">
              <h2 className="text-base font-bold text-white uppercase flex items-center gap-2">
                <Lock className="w-4 h-4 text-orange-500" />
                1. Information We Collect
              </h2>
              <p>
                When you browse our storefront, register an account, or complete a checkout order, we collect specific details necessary to execute delivery:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
                <li><strong className="text-slate-200">Customer Identity:</strong> Full Name, Email Address, and Phone Number.</li>
                <li><strong className="text-slate-200">Logistics Data:</strong> Delivery Street Address, Nairobi Sub-County, Building / Floor details.</li>
                <li><strong className="text-slate-200">Payment Reference:</strong> M-Pesa transaction reference code (e.g., QDH87...) provided by Safaricom Daraja STK.</li>
                <li><strong className="text-slate-200">Financial Safety:</strong> We NEVER request or store your secret 4-digit M-Pesa PIN. PIN prompt is processed inside Safaricom's encrypted network dialog.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-bold text-white uppercase flex items-center gap-2">
                <FileText className="w-4 h-4 text-orange-500" />
                2. Purpose of Processing
              </h2>
              <p>
                Your data is strictly utilized for commercial purchase fulfillment:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
                <li>Generating certified tax receipts, order waybills, and delivery manifests.</li>
                <li>Transmitting automated dispatch SMS notifications and tracking coordinates.</li>
                <li>Facilitating size exchanges or customer support inquiries.</li>
                <li>Preventing fraudulent orders and duplicate charge attempts.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-bold text-white uppercase flex items-center gap-2">
                <Eye className="w-4 h-4 text-orange-500" />
                3. Third-Party Sharing &amp; Non-Disclosure
              </h2>
              <p>
                Sportsman.ke does NOT sell, rent, or lease customer registries to advertising brokers. Data is shared solely with vetted operational partners:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
                <li><strong className="text-slate-200">Safaricom PLC:</strong> For automated M-Pesa B2C/C2B transaction reconciliation.</li>
                <li><strong className="text-slate-200">Delivery Couriers:</strong> Customer phone number and destination address for door-to-door handover.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-bold text-white uppercase flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-orange-500" />
                4. Your Statutory Rights
              </h2>
              <p>
                Under Section 26 of the Kenya Data Protection Act 2019, you retain the right to be informed, right of access, right to rectification, and right to complete deletion (right to be forgotten) of your data archives.
              </p>
            </section>

            <section className="p-4 bg-slate-950/60 border border-slate-850 rounded-2xl space-y-2 text-xs">
              <h3 className="font-bold text-white uppercase">Data Controller Contact</h3>
              <div className="flex flex-col sm:flex-row gap-3 text-slate-400">
                <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-orange-500" /> Kimathi Street, CBD, Nairobi</span>
                <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-orange-500" /> +254 759 238 018</span>
                <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-orange-500" /> legal@sportsman.ke</span>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
