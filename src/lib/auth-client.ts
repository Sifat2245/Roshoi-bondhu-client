import { createAuthClient } from 'better-auth/react';
import { emailOTPClient } from 'better-auth/client/plugins';
import { useSyncExternalStore } from 'react';
import { exitDemo, getDemoSession, getDemoSnapshot, isDemoMode, subscribeDemo } from './demo/demo-store';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const authClient = createAuthClient({
  baseURL: API_BASE_URL,
  plugins: [
    emailOTPClient(),
  ],
});

export const signIn = authClient.signIn;
export const signUp = authClient.signUp;
export const signOut = async (options?: any) => {
  if (isDemoMode()) { exitDemo(); return { data: null }; }
  await authApi.logout();
  return (authClient.signOut as any)(options);
};
export const getSession = () => isDemoMode() ? Promise.resolve({ data: getDemoSession() }) : (authClient as any).getSession();
export const useSession = () => {
  const liveSession = authClient.useSession();
  const demo = useSyncExternalStore(subscribeDemo, getDemoSnapshot, () => null);
  return demo ? { data: getDemoSession(), isPending: false, error: null, refetch: () => {} } : liveSession;
};

// Custom API Auth Helpers
export const authApi = {
  signup: async (payload: { name: string; email: string; password: string }) => {
    const res = await fetch(`${API_BASE_URL}/api/v1/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to create account.');
    return json;
  },

  verifyOTP: async (payload: { email: string; otp: string }) => {
    const res = await fetch(`${API_BASE_URL}/api/v1/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to verify code.');
    const user = json.data?.user || json.user;
    return {
      ...json,
      user,
      data: json.data || json,
    };
  },

  resendOTP: async (email: string) => {
    const res = await fetch(`${API_BASE_URL}/api/v1/auth/resend-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to resend code.');
    return json;
  },

  login: async (payload: { email: string; password: string }) => {
    const res = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (res.status === 403 && (json.data?.requiresVerification || json.requiresVerification)) {
      return {
        ...json,
        requiresVerification: true,
      };
    }
    if (!res.ok) throw new Error(json.message || 'Invalid email or password.');
    const user = json.data?.user || json.user;
    const token = json.data?.token || json.token;
    return {
      ...json,
      user,
      token,
      data: json.data || json,
    };
  },

  logout: async () => {
    const res = await fetch(`${API_BASE_URL}/api/v1/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    return res.json();
  },

  getMe: async () => {
    if (isDemoMode()) return getDemoSession().user;
    const res = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to load user details.');
    return json.data;
  },
};
