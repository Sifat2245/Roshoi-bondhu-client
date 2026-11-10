export type Person = {
  id: string;
  name: string;
  image?: string;
  username?: string;
};
export type MemberRole = "ADMIN" | "MODERATOR" | "MEMBER";
export type Poll = {
  id: string;
  question: string;
  options: { id: string; text: string; voterIds: string[] }[];
  multiple: boolean;
  authorId: string;
  closed: boolean;
  expiresAt?: string;
};
export type PollDraft = {
  question: string;
  options: string[];
  multiple: boolean;
  expiresAt?: string;
};
export const emptyPoll = (): PollDraft => ({
  question: "",
  options: ["", ""],
  multiple: false,
});
export type Challenge = {
  id: string;
  title: string;
  description: string;
  rules: string;
  authorId: string;
  createdAt: string;
  endsAt?: string;
  closed: boolean;
  participants: string[];
  entries: { userId: string; recipeId: string }[];
};
export type MemberChanges = {
  roles: Record<string, MemberRole>;
  removed: string[];
  banned: string[];
};
export type MemberAction =
  | "ADMIN"
  | "MODERATOR"
  | "MEMBER"
  | "REMOVE"
  | "BAN"
  | "UNBAN";

export function validatePoll(question: string, options: string[]) {
  const clean = options.map((text) => text.trim());
  if (question.trim().length < 8 || question.trim().length > 200)
    return "Write a question between 8 and 200 characters.";
  if (
    clean.length < 2 ||
    clean.length > 6 ||
    clean.some((text) => !text || text.length > 100)
  )
    return "Add between two and six answers, up to 100 characters each.";
  if (new Set(clean.map((text) => text.toLowerCase())).size !== clean.length)
    return "Each answer needs to be different.";
  return "";
}
export const pollEnded = (poll: Poll, now = Date.now()) =>
  poll.closed ||
  (!!poll.expiresAt && new Date(poll.expiresAt).getTime() <= now);
export const pollVoters = (poll: Poll) => [
  ...new Set(poll.options.flatMap((option) => option.voterIds)),
];
export function castVote(
  poll: Poll,
  optionId: string,
  actorId: string,
  now = Date.now(),
): Poll {
  if (!actorId || pollEnded(poll, now))
    throw new Error("Voting has ended for this poll.");
  const target = poll.options.find((option) => option.id === optionId);
  if (!target) throw new Error("This answer is no longer available.");
  const selected = target.voterIds.includes(actorId);
  return {
    ...poll,
    options: poll.options.map((option) => ({
      ...option,
      voterIds: selected
        ? option.id === optionId
          ? option.voterIds.filter((id) => id !== actorId)
          : option.voterIds
        : option.id === optionId
          ? [...option.voterIds.filter((id) => id !== actorId), actorId]
          : poll.multiple
            ? option.voterIds
            : option.voterIds.filter((id) => id !== actorId),
    })),
  };
}
export function resolveGroup(
  group: any,
  changes: MemberChanges | undefined,
  actorId?: string,
) {
  if (!changes) return group;
  const excluded = new Set([...changes.removed, ...changes.banned]);
  const all = (group.members || []).map((member) => ({
    ...member,
    role:
      member.userId === group.creatorId
        ? "ADMIN"
        : changes.roles[member.userId] || member.role,
  }));
  const members = all.filter((member) => !excluded.has(member.userId));
  const me = members.find((member) => member.userId === actorId);
  return {
    ...group,
    members,
    bannedMembers: all.filter((member) =>
      changes.banned.includes(member.userId),
    ),
    membersCount: Math.max(
      0,
      (group.membersCount ?? all.length) -
        all.filter((member) => excluded.has(member.userId)).length,
    ),
    isMember: excluded.has(actorId) ? false : group.isMember,
    membershipRole: me?.role || group.membershipRole,
  };
}
export function memberActions(
  group: any,
  actorId: string,
  targetId: string,
  banned = false,
): MemberAction[] {
  if (
    !actorId ||
    group.isMember === false ||
    actorId === targetId ||
    targetId === group.creatorId
  )
    return [];
  const actor = group.members?.find((member) => member.userId === actorId);
  const target = [
    ...(group.members || []),
    ...(group.bannedMembers || []),
  ].find((member) => member.userId === targetId);
  const role = actorId === group.creatorId ? "ADMIN" : actor?.role || "MEMBER";
  if (!target || !["ADMIN", "MODERATOR"].includes(role)) return [];
  if (banned)
    return role === "ADMIN" || target.role === "MEMBER" ? ["UNBAN"] : [];
  if (role === "MODERATOR")
    return target.role === "MEMBER" ? ["REMOVE", "BAN"] : [];
  if (target.role === "ADMIN" && actorId !== group.creatorId) return [];
  const actions: MemberAction[] = (
    ["ADMIN", "MODERATOR", "MEMBER"] as MemberRole[]
  ).filter((next) => next !== target.role);
  if (
    target.role === "ADMIN" &&
    group.members.filter((m) => m.role === "ADMIN").length < 2
  )
    return [];
  return [...actions, "REMOVE", "BAN"];
}
export function applyMemberAction(
  group: any,
  actorId: string,
  targetId: string,
  action: MemberAction,
  previous?: MemberChanges,
): MemberChanges {
  const current = previous || { roles: {}, removed: [], banned: [] };
  if (
    !memberActions(
      group,
      actorId,
      targetId,
      current.banned.includes(targetId),
    ).includes(action)
  )
    throw new Error("Your group role does not allow this action.");
  const result = structuredClone(current);
  if (["ADMIN", "MODERATOR", "MEMBER"].includes(action))
    result.roles[targetId] = action as MemberRole;
  else if (action === "REMOVE")
    result.removed = [...new Set([...result.removed, targetId])];
  else if (action === "BAN") {
    result.banned = [...new Set([...result.banned, targetId])];
    result.removed = [...new Set([...result.removed, targetId])];
  } else result.banned = result.banned.filter((id) => id !== targetId);
  return result;
}
export function canCreateChallenge(
  group: any,
  actorId: string,
  policy = "STAFF",
) {
  const member = group.members?.find((m) => m.userId === actorId);
  return (
    !!actorId &&
    group.isMember !== false &&
    (group.creatorId === actorId ||
      (!!member &&
        (["ADMIN", "MODERATOR"].includes(member.role) || policy === "MEMBERS")))
  );
}
export function validateChallenge(
  title: string,
  description: string,
  endsAt?: string,
  now = Date.now(),
) {
  if (title.trim().length < 5 || title.trim().length > 100)
    return "Give the challenge a title between 5 and 100 characters.";
  if (description.trim().length < 20 || description.trim().length > 1500)
    return "Describe the challenge in 20–1500 characters.";
  if (
    endsAt &&
    (!Number.isFinite(new Date(endsAt).getTime()) ||
      new Date(endsAt).getTime() <= now)
  )
    return "Choose a closing date in the future.";
  return "";
}
export const challengeEnded = (challenge: Challenge) =>
  challenge.closed ||
  (!!challenge.endsAt && new Date(challenge.endsAt).getTime() <= Date.now());
export function originalPost(post: any) {
  let current = post;
  const visited = new Set<string>();
  while (
    current?.postType === "REPOST" &&
    current.originalPost &&
    !visited.has(current.id)
  ) {
    visited.add(current.id);
    current = current.originalPost;
  }
  return current;
}
