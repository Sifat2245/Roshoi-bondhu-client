import { useQuery, useQueryClient } from '@tanstack/react-query';
import { profileApi } from '../api/profile.api';
import { authApi } from '../../../lib/auth-client';

export const PROFILE_QUERY_KEY = 'userProfile';
export const TWO_FACTOR_QUERY_KEY = 'twoFactorStatus';
export const PASSKEYS_QUERY_KEY = 'userPasskeys';

export function useUserProfileQuery(userId: string = 'me', token?: string | null) {
  return useQuery({
    queryKey: [PROFILE_QUERY_KEY, userId],
    queryFn: () => profileApi.getUserProfile(userId, token),
    staleTime: 10 * 60 * 1000, // 10 minutes fresh
    gcTime: 15 * 60 * 1000,    // 15 minutes in memory
  });
}

export function useTwoFactorStatusQuery(token?: string | null) {
  return useQuery({
    queryKey: [TWO_FACTOR_QUERY_KEY],
    queryFn: () => authApi.getTwoFactorStatus(token),
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });
}

export function usePasskeysQuery(token?: string | null) {
  return useQuery({
    queryKey: [PASSKEYS_QUERY_KEY],
    queryFn: () => authApi.listPasskeys(token),
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });
}

export function useInvalidateProfileQueries() {
  const queryClient = useQueryClient();
  return {
    invalidateProfile: (userId?: string) => {
      if (userId) {
        queryClient.invalidateQueries({ queryKey: [PROFILE_QUERY_KEY, userId] });
      } else {
        queryClient.invalidateQueries({ queryKey: [PROFILE_QUERY_KEY] });
      }
    },
    invalidateTwoFactor: () => {
      queryClient.invalidateQueries({ queryKey: [TWO_FACTOR_QUERY_KEY] });
    },
    invalidatePasskeys: () => {
      queryClient.invalidateQueries({ queryKey: [PASSKEYS_QUERY_KEY] });
    },
  };
}
