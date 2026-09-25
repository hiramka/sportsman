import React, { useState } from 'react';
import { Mail, Send, X, CheckCircle2, AlertCircle, Sparkles, MessageSquare, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ContactModal({ isOpen, onClose }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    subject: 'General Inquiry',
    message: '',
    botcheck: ''
  });

  const [status, setStatus] = useState({
    submitting: false,
    success: false,
    error: null
  });

  if (!isOpen) return null;

  const accessKey = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY || 'YOUR_WEB3FORMS_ACCESS_KEY';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const API_BASE = import.meta.env.VITE_API_URL || '/api';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.botcheck) {
      // Honeypot triggered
      return;
    }

    setStatus({ submitting: true, success: false, error: null });

    try {
      // 1. Save message to Supabase database via NestJS API
      let dbSuccess = false;
      try {
        const dbRes = await fetch(`${API_BASE}/contact`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            subject: formData.subject,
            message: formData.message,
          }),
        });
        if (dbRes.ok) dbSuccess = true;
      } catch (dbErr) {
        console.warn('Backend DB storage error:', dbErr);
      }

      // 2. Send email notification via Web3Forms API
      let web3Success = false;
      let web3Message = '';
      try {
        const response = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
          },
          body: JSON.stringify({
            access_key: accessKey,
            name: formData.name,
            email: formData.email,
            subject: `[Sportsman.ke] ${formData.subject}`,
            message: formData.message,
            from_name: 'Sportsman.ke Portal Contact'
          })
        });
        const result = await response.json();
        if (result.success) web3Success = true;
        else web3Message = result.message;
      } catch (web3Err) {
        console.warn('Web3Forms email delivery error:', web3Err);
      }

      if (dbSuccess || web3Success) {
        setStatus({ submitting: false, success: true, error: null });
        setFormData({
          name: user?.name || '',
          email: user?.email || '',
          subject: 'General Inquiry',
          message: '',
          botcheck: ''
        });
      } else {
        throw new Error(web3Message || 'Failed to send message via Web3Forms or save to database.');
      }
    } catch (err) {
      console.error('Submission Error:', err);
      setStatus({
        submitting: false,
        success: false,
        error: err.message || 'Could not send contact request.'
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#0D1321] border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6 overflow-hidden">
        {/* Glow backdrop effect */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-orange-500 to-red-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white uppercase tracking-tight m-0">Contact Support</h2>
            <p className="text-[11px] text-slate-400 m-0">Powered by Web3Forms Direct Mail API</p>
          </div>
        </div>

        {accessKey === 'YOUR_WEB3FORMS_ACCESS_KEY' && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-2 text-amber-400 text-xs font-semibold">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span>Notice: Set <code className="font-mono text-[10px] bg-amber-950/50 px-1 py-0.5 rounded">VITE_WEB3FORMS_ACCESS_KEY</code> in <code className="font-mono text-[10px] bg-amber-950/50 px-1 py-0.5 rounded">frontend/.env</code> with your key from web3forms.com to deliver emails directly to your inbox.</span>
            </div>
          </div>
        )}

        {status.success ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-lg font-bold text-white">Message Delivered!</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Thank you for reaching out to Sportsman.ke! Our team has received your message via Web3Forms and will get back to you shortly.
            </p>
            <button
              onClick={() => {
                setStatus({ submitting: false, success: false, error: null });
                onClose();
              }}
              className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              Close Window
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            {/* Honeypot anti-spam field */}
            <input
              type="checkbox"
              name="botcheck"
              className="hidden"
              style={{ display: 'none' }}
              value={formData.botcheck}
              onChange={handleChange}
            />

            {/* Name */}
            <div>
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">
                Your Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. John Kamau"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-slate-600 transition-all"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">
                Your Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="e.g. john@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-slate-600 transition-all"
                />
              </div>
            </div>

            {/* Subject */}
            <div>
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">
                Subject
              </label>
              <select
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-800 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-xl px-3 py-2.5 text-xs text-white transition-all cursor-pointer"
              >
                <option value="General Inquiry">General Inquiry</option>
                <option value="Order Tracking & Support">Order Tracking & Support</option>
                <option value="Bulk/Corporate Order Request">Bulk / Corporate Order Request</option>
                <option value="Payment & M-Pesa Inquiry">Payment & M-Pesa Inquiry</option>
                <option value="Partnership & Sponsorship">Partnership & Sponsorship</option>
              </select>
            </div>

            {/* Message */}
            <div>
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">
                Message
              </label>
              <div className="relative">
                <MessageSquare className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <textarea
                  name="message"
                  required
                  rows={4}
                  placeholder="Write your inquiry or question here..."
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-slate-600 transition-all resize-none"
                />
              </div>
            </div>

            {status.error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-400 text-xs font-bold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{status.error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={status.submitting}
              className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status.submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Sending via Web3Forms...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send Message</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
