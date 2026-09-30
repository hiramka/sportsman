/**
 * API & Deployment Configuration
 * Centralized API base URL resolver for Vercel, Supabase, Capacitor Mobile, and local environments.
 */
export const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // If running inside Capacitor mobile app or native webview where relative '/api' fails:
  if (
    typeof window !== 'undefined' &&
    (window.Capacitor?.isNativePlatform() ||
      window.location.protocol === 'file:' ||
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1')
  ) {
    return 'https://sportsman.onrender.com/api';
  }
  return '/api';
};

export const API_BASE = getApiBaseUrl();
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const buildApiUrl = (endpoint) => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE}${cleanEndpoint}`;
};
