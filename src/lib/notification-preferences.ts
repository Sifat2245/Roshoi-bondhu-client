const KEY = "heshel:notification-preferences";

export interface NotificationPreferences {
  LIKE: boolean;
  COMMENT: boolean;
  MENTION: boolean;
  FRIEND_REQUEST: boolean;
  GROUP_INVITE: boolean;
  SOUND: boolean;
  [key: string]: boolean;
}

const DEFAULT_PREFS: NotificationPreferences = {
  LIKE: true,
  COMMENT: true,
  MENTION: true,
  FRIEND_REQUEST: true,
  GROUP_INVITE: true,
  SOUND: true,
};

export function getNotificationPreferences(): NotificationPreferences {
  try {
    return {
      ...DEFAULT_PREFS,
      ...JSON.parse(localStorage.getItem(KEY) || "{}"),
    };
  } catch {
    return { ...DEFAULT_PREFS };
  }
}

export function saveNotificationPreferences(
  preferences: Record<string, boolean>,
) {
  localStorage.setItem(KEY, JSON.stringify(preferences));
  window.dispatchEvent(new Event("heshel:notification-preferences"));
}

export function isNotificationTypeEnabled(
  type: string,
  preferences = getNotificationPreferences(),
): boolean {
  switch (type) {
    case "POST_LIKE":
    case "COMMENT_LIKE":
    case "LIKE":
      return preferences.LIKE !== false;
    case "POST_COMMENT":
    case "COMMENT_REPLY":
    case "COMMENT":
      return preferences.COMMENT !== false;
    case "MENTION":
      return preferences.MENTION !== false;
    case "FRIEND_REQUEST":
    case "FRIEND_ACCEPT":
    case "FOLLOW":
      return preferences.FRIEND_REQUEST !== false;
    case "GROUP_INVITE":
    case "GROUP_JOIN_REQUEST":
    case "GROUP_JOIN_APPROVED":
      return preferences.GROUP_INVITE !== false;
    default:
      return preferences[type] !== false;
  }
}
