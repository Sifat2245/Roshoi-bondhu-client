import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
});

export const signIn = authClient.signIn;
export const signUp = authClient.signUp;
export const signOut = (options?: any) => (authClient.signOut as any)(options);
export const useSession = authClient.useSession as () => {
  data: any;
  isPending: boolean;
  error: any;
  refetch: () => void;
};
