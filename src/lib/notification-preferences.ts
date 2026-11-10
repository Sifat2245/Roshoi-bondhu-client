const KEY = 'heshel:notification-preferences';
export function getNotificationPreferences(): Record<string, boolean> {
  try { return { LIKE: true, COMMENT: true, GROUP_INVITE: true, ...JSON.parse(localStorage.getItem(KEY) || '{}') }; }
  catch { return { LIKE: true, COMMENT: true, GROUP_INVITE: true }; }
}
export function saveNotificationPreferences(preferences: Record<string, boolean>) {
  localStorage.setItem(KEY, JSON.stringify(preferences));
  window.dispatchEvent(new Event('heshel:notification-preferences'));
}
