/**
 * API & Deployment Configuration
 * Centralized API base URL resolver for Vercel, Supabase, and local environments.
 */
export const API_BASE = import.meta.env.VITE_API_URL || '/api';
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const buildApiUrl = (endpoint) => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE}${cleanEndpoint}`;
};
