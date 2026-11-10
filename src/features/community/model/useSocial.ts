import { useCallback, useSyncExternalStore } from "react";
import { useSession } from "../../../lib/auth-client";
import { useAuth } from "../../../context/AuthContext";
import {
  readSocial,
  socialScope,
  subscribeSocial,
  updateSocial,
  type SocialState,
} from "./social-store";

export function useSocial() {
  const { data: session } = useSession();
  const { user: authUser } = useAuth();
  const user = session?.user || authUser;
  const scope = socialScope(user?.id);
  const state = useSyncExternalStore(subscribeSocial, () => readSocial(scope));
  const update = useCallback(
    (change: (state: SocialState) => void) => updateSocial(scope, change),
    [scope],
  );
  return { state, update, user, scope };
}
