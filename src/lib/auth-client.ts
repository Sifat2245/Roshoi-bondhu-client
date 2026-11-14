import { createAuthClient } from 'better-auth/react';
import { emailOTPClient, twoFactorClient } from 'better-auth/client/plugins';
import { passkeyClient } from '@better-auth/passkey/client';
import { useSyncExternalStore } from 'react';
import { exitDemo, getDemoSession, getDemoSnapshot, isDemoMode, subscribeDemo } from './demo/demo-store';

import { apolloClient } from './graphql/client';
import { ME_QUERY } from './graphql/queries';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const authClient = createAuthClient({
  baseURL: API_BASE_URL,
  plugins: [
    emailOTPClient(),
    twoFactorClient({
      onTwoFactorRedirect() {
        window.location.href = '/two-factor';
      },
    }),
    passkeyClient(),
  ],
});

export const signIn = authClient.signIn;
export const signUp = authClient.signUp;
export const twoFactor = authClient.twoFactor;
export const passkey = authClient.passkey;
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

  forgotPassword: async (email: string) => {
    const res = await fetch(`${API_BASE_URL}/api/v1/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to request password reset code.');
    return json;
  },

  resetPassword: async (payload: { email: string; otp: string; password: string }) => {
    const res = await fetch(`${API_BASE_URL}/api/v1/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to reset password.');
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
    if (json.data?.twoFactorRedirect || json.twoFactorRedirect) {
      return {
        ...json,
        twoFactorRedirect: true,
        twoFactorMethods: json.data?.twoFactorMethods || json.twoFactorMethods || ['otp'],
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
    try {
      const { data } = await apolloClient.query({
        query: ME_QUERY,
        fetchPolicy: 'network-only',
      });
      return data?.me || null;
    } catch {
      return null;
    }
  },

  changePassword: async (payload: { currentPassword: string; newPassword: string }, token?: string | null) => {
    const res = await fetch(`${API_BASE_URL}/api/v1/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to change password.');
    return json;
  },

  getTwoFactorStatus: async (token?: string | null) => {
    const res = await fetch(`${API_BASE_URL}/api/v1/auth/two-factor/status`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      credentials: 'include',
    });
    const json = await res.json();
    return json.data || { twoFactorEnabled: false, emailOtpEnabled: false, totpEnabled: false };
  },

  enableEmailOtp: async (password: string, token?: string | null) => {
    const res = await fetch(`${API_BASE_URL}/api/v1/auth/two-factor/enable-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      credentials: 'include',
      body: JSON.stringify({ password }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to enable Email OTP.');
    return json.data || json;
  },

  disableEmailOtp: async (password: string, token?: string | null) => {
    const res = await fetch(`${API_BASE_URL}/api/v1/auth/two-factor/disable-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      credentials: 'include',
      body: JSON.stringify({ password }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to disable Email OTP.');
    return json.data || json;
  },

  disableTotp: async (password: string, token?: string | null) => {
    const res = await fetch(`${API_BASE_URL}/api/v1/auth/two-factor/disable-totp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      credentials: 'include',
      body: JSON.stringify({ password }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to remove Authenticator App.');
    return json.data || json;
  },

  confirmTotp: async (token?: string | null) => {
    const res = await fetch(`${API_BASE_URL}/api/v1/auth/two-factor/confirm-totp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      credentials: 'include',
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to confirm authenticator setup.');
    return json.data || json;
  },

  disableAllTwoFactor: async (password: string, token?: string | null) => {
    const res = await fetch(`${API_BASE_URL}/api/v1/auth/two-factor/disable-all`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      credentials: 'include',
      body: JSON.stringify({ password }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to turn off two-factor authentication.');
    return json.data || json;
  },

  listPasskeys: async (token?: string | null) => {
    const res = await fetch(`${API_BASE_URL}/api/auth/passkey/list-user-passkeys`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      credentials: 'include',
    });
    if (!res.ok) return [];
    const json = await res.json();
    return Array.isArray(json) ? json : json?.data || [];
  },

  deletePasskey: async (id: string, token?: string | null) => {
    const res = await fetch(`${API_BASE_URL}/api/auth/passkey/delete-passkey`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      credentials: 'include',
      body: JSON.stringify({ id }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to remove passkey.');
    return json;
  },

  getSessions: async (token?: string | null) => {
    const res = await fetch(`${API_BASE_URL}/api/v1/auth/sessions`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      credentials: 'include',
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to load active sessions.');
    return json.data || [];
  },

  revokeOtherSessions: async (token?: string | null) => {
    const res = await fetch(`${API_BASE_URL}/api/v1/auth/sessions/revoke-others`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      credentials: 'include',
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to revoke other sessions.');
    return json;
  },

  revokeSession: async (sessionId: string, token?: string | null) => {
    const res = await fetch(`${API_BASE_URL}/api/v1/auth/sessions/${sessionId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      credentials: 'include',
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to revoke session.');
    return json.data || json;
  },

  deactivateAccount: async (payload: { password: string; durationDays?: number | null }, token?: string | null) => {
    const res = await fetch(`${API_BASE_URL}/api/v1/auth/deactivate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to deactivate account.');
    return json;
  },

  deleteAccount: async (payload: { password: string }, token?: string | null) => {
    const res = await fetch(`${API_BASE_URL}/api/v1/auth/delete-account`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to delete account.');
    return json;
  },
};
