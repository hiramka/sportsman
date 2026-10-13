import React, { createContext, useContext, useState, useEffect } from 'react';
import { getApiBaseUrl } from '../config/api';

const AuthContext = createContext(null);

const API_BASE = getApiBaseUrl();

// Standard Role Accounts for Local / Mobile Fallback
const MOCK_ACCOUNTS = [
  {
    id: 'usr-admin-1',
    name: 'Corporate Admin',
    email: 'admin@sportsman.ke',
    phone: '+254 759 238018',
    role: 'admin',
    password: 'admin123'
  },
  {
    id: 'usr-warehouse-2',
    name: 'Main Warehouse Staff',
    email: 'warehouse@sportsman.ke',
    phone: '+254 711 223 344',
    role: 'warehouse_staff',
    password: 'warehouse123'
  },
  {
    id: 'usr-delivery-3',
    name: 'Nairobi Express Courier',
    email: 'delivery@sportsman.ke',
    phone: '+254 722 334 455',
    role: 'delivery_agent',
    password: 'delivery123'
  },
  {
    id: 'usr-cust-4',
    name: 'Sample Customer',
    email: 'customer@sportsman.ke',
    phone: '+254 733 445 566',
    role: 'customer',
    password: 'customer123'
  }
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  const fetchProfile = async () => {
    const token = sessionStorage.getItem('sm_token') || localStorage.getItem('sm_token');

    if (token) {
      try {
        const res = await fetch(`${API_BASE}/auth/me`, {
          headers: { 'Authorization': `Bearer ${token}` },
          credentials: 'include'
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data);
          setIsAuthenticated(true);
          localStorage.setItem('sm_current_user', JSON.stringify(data));
          setAuthLoading(false);
          return;
        } else if (res.status === 401) {
          console.warn('Backend rejected expired/missing token. Resetting credentials.');
          sessionStorage.removeItem('sm_token');
          localStorage.removeItem('sm_token');
          ['admin', 'warehouse_staff', 'delivery_agent', 'customer'].forEach(r => {
            sessionStorage.removeItem(`sm_token_${r}`);
            localStorage.removeItem(`sm_token_${r}`);
          });
          localStorage.removeItem('sm_current_user');
          setUser(null);
          setIsAuthenticated(false);
          setAuthLoading(false);
          return;
        }
      } catch (err) {
        console.warn('Authentication sync with backend failed, checking saved local user session...', err);
      }
    }

    // Check saved local session for offline / mobile app persistence only if token exists
    const savedUser = localStorage.getItem('sm_current_user');
    if (savedUser && token) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
        setIsAuthenticated(true);
      } catch (e) {
        setUser(null);
        setIsAuthenticated(false);
      }
    } else {
      setUser(null);
      setIsAuthenticated(false);
    }
    setAuthLoading(false);
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const parseJsonOrText = async (response) => {
    const text = await response.text();
    if (!text) return null;
    try {
      return JSON.parse(text);
    } catch {
      if (response.status === 404 || text.includes('NOT_FOUND') || text.includes('<!DOCTYPE')) {
        return { message: 'Backend service API is unreachable. Using mobile fallback mode.' };
      }
      return { message: text };
    }
  };

  const login = async (email, password) => {
    const normEmail = email.trim().toLowerCase();

    // 1. Try Backend API login
    let backendResponded = false;
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normEmail, password }),
        credentials: 'include'
      });

      backendResponded = true;

      if (res.ok) {
        const data = await parseJsonOrText(res);
        if (data && data.user) {
          setUser(data.user);
          setIsAuthenticated(true);
          localStorage.setItem('sm_current_user', JSON.stringify(data.user));
          if (data.token) {
            sessionStorage.setItem('sm_token', data.token);
            sessionStorage.setItem(`sm_token_${data.user.role}`, data.token);
            localStorage.setItem('sm_token', data.token);
            localStorage.setItem(`sm_token_${data.user.role}`, data.token);
          }
          return data.user;
        }
      } else {
        const errorData = await parseJsonOrText(res);
        throw new Error(errorData?.message || 'Invalid email or password. Please check your credentials or sign up.');
      }
    } catch (err) {
      // If the backend actively rejected the credentials, DO NOT fallback. Reject immediately!
      if (backendResponded || (err.message && !err.message.includes('Failed to fetch') && !err.message.includes('NetworkError'))) {
        throw err;
      }
      console.warn('Backend login network call unavailable. Checking verified offline credentials...', err);
    }

    // 2. Offline / Mobile App Fallback Authentication (Only for verified registered accounts)
    const matched = MOCK_ACCOUNTS.find(a => a.email.toLowerCase() === normEmail);
    if (matched) {
      if (matched.password === password) {
        const localUser = {
          id: matched.id,
          name: matched.name,
          email: matched.email,
          phone: matched.phone,
          role: matched.role
        };
        setUser(localUser);
        setIsAuthenticated(true);
        localStorage.setItem('sm_current_user', JSON.stringify(localUser));
        return localUser;
      } else {
        throw new Error('Invalid password provided.');
      }
    }

    // Check custom registered users in localStorage (must have signed up previously)
    const savedUsersStr = localStorage.getItem('sm_users');
    if (savedUsersStr) {
      try {
        const localUsers = JSON.parse(savedUsersStr);
        const userMatch = localUsers.find(u => u.email.toLowerCase() === normEmail);
        if (userMatch) {
          if (userMatch.password && userMatch.password !== password) {
            throw new Error('Invalid password provided.');
          }
          const userObj = {
            id: userMatch.id || `usr-${Date.now()}`,
            name: userMatch.name,
            email: userMatch.email,
            phone: userMatch.phone,
            role: userMatch.role || 'customer'
          };
          setUser(userObj);
          setIsAuthenticated(true);
          localStorage.setItem('sm_current_user', JSON.stringify(userObj));
          return userObj;
        }
      } catch (e) {
        if (e.message === 'Invalid password provided.') throw e;
        console.warn('Local user parse error:', e);
      }
    }

    // Unregistered accounts must sign up first
    throw new Error('Account does not exist. Please sign up first before logging in.');
  };

  const signup = async (name, email, phone, password) => {
    try {
      const res = await fetch(`${API_BASE}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, password }),
        credentials: 'include'
      });

      if (res.ok) {
        const data = await parseJsonOrText(res);
        if (data && data.user) {
          setUser(data.user);
          setIsAuthenticated(true);
          localStorage.setItem('sm_current_user', JSON.stringify(data.user));
          if (data.token) {
            sessionStorage.setItem('sm_token', data.token);
            sessionStorage.setItem(`sm_token_${data.user.role}`, data.token);
            localStorage.setItem('sm_token', data.token);
            localStorage.setItem(`sm_token_${data.user.role}`, data.token);
          }
        }
        return data || { message: 'Registration successful.' };
      } else {
        const errorData = await parseJsonOrText(res);
        throw new Error(errorData?.message || 'Registration failed.');
      }
    } catch (err) {
      if (err.message && !err.message.includes('Failed to fetch') && !err.message.includes('NetworkError')) {
        throw err;
      }
      console.warn('Backend signup network error, using local registration fallback:', err);
    }

    // Local mobile registration fallback (Store password for offline login verification)
    const newUser = {
      id: `usr-${Date.now()}`,
      name,
      email: email.trim().toLowerCase(),
      phone,
      password,
      role: 'customer'
    };

    const savedUsersStr = localStorage.getItem('sm_users');
    const localUsers = savedUsersStr ? JSON.parse(savedUsersStr) : [];
    const existing = localUsers.find(u => u.email === newUser.email);
    if (existing) {
      throw new Error('An account with this email already exists. Please log in.');
    }

    localUsers.push(newUser);
    localStorage.setItem('sm_users', JSON.stringify(localUsers));
    setUser(newUser);
    setIsAuthenticated(true);
    localStorage.setItem('sm_current_user', JSON.stringify(newUser));

    return { message: 'Account created successfully! Welcome to Sportsman.ke.', user: newUser };
  };

  const logout = async () => {
    try {
      const token = sessionStorage.getItem('sm_token') || localStorage.getItem('sm_token');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers,
        credentials: 'include'
      });
    } catch (err) {
      console.warn('Signout callback failed:', err);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('sm_current_user');
      sessionStorage.removeItem('sm_token');
      localStorage.removeItem('sm_token');
      ['admin', 'warehouse_staff', 'delivery_agent', 'customer'].forEach(r => {
        sessionStorage.removeItem(`sm_token_${r}`);
        localStorage.removeItem(`sm_token_${r}`);
      });
    }
  };

  const forgotPassword = async (email) => {
    try {
      const res = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
        credentials: 'include'
      });
      const data = await parseJsonOrText(res);
      if (!res.ok) {
        throw new Error(data?.message || 'Failed to request password reset.');
      }
      return data;
    } catch (err) {
      console.warn('Backend forgot-password error:', err);
      throw err;
    }
  };

  const resetPassword = async (token, email, newPassword) => {
    try {
      const res = await fetch(`${API_BASE}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: token.trim(), email: email.trim().toLowerCase(), newPassword }),
        credentials: 'include'
      });
      const data = await parseJsonOrText(res);
      if (!res.ok) {
        throw new Error(data?.message || 'Failed to reset password.');
      }
      return data;
    } catch (err) {
      console.warn('Backend reset-password error:', err);
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, authLoading, login, signup, logout, fetchProfile, forgotPassword, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
