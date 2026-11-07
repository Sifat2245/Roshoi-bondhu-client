export type UserRole = 'USER' | 'MODERATOR' | 'ADMIN';

export type UserStatus = 'ACTIVE' | 'BLOCKED';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

export type ThemeMode = 'light' | 'dark';

export type LanguageCode = 'en' | 'bn';

