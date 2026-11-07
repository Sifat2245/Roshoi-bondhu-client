export type SettingsTabId = 'HOME' | 'PERSONAL' | 'SECURITY';

export interface ActiveSession {
  id: string;
  device: string;
  type: 'DESKTOP' | 'MOBILE';
  location: string;
  activeNow: boolean;
  lastActive: string;
}

