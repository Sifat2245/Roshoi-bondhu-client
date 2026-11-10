export type PostAudience = "PUBLIC" | "FRIENDS" | "ONLY_ME";
export type PinContext =
  | { type: "profile" }
  | { type: "group"; groupId: string };
export type PostPins = Record<
  string,
  { profile?: boolean; groups?: Record<string, boolean> }
>;
export type Viewer = { id?: string; friendIds: string[] };

export const audienceLabels: Record<PostAudience, string> = {
  PUBLIC: "Public",
  FRIENDS: "Friends",
  ONLY_ME: "Only me",
};
export function postAudience(post: any): PostAudience {
  // Unknown visibility must never silently become public.
  if (post.audience == null) return "PUBLIC";
  return ["PUBLIC", "FRIENDS", "ONLY_ME"].includes(post.audience)
    ? post.audience
    : "ONLY_ME";
}
export function canViewPost(post: any, viewer: Viewer): boolean {
  if (post.authorId === viewer.id && viewer.id) return true;
  const audience = postAudience(post);
  return (
    audience === "PUBLIC" ||
    (audience === "FRIENDS" &&
      Boolean(viewer.id) &&
      viewer.friendIds.includes(post.authorId))
  );
}
export function postForViewer(post: any, viewer: Viewer): any | null {
  if (!canViewPost(post, viewer)) return null;
  const visited = new Set<string>([post.id]);
  let original = post.originalPost;
  while (original) {
    if (visited.has(original.id) || !canViewPost(original, viewer)) {
      return { ...post, originalPost: null, originalPostId: null };
    }
    visited.add(original.id);
    original = original.originalPost;
  }
  return post;
}
export function canSharePost(post: any): boolean {
  if (
    !post ||
    postAudience(post) !== "PUBLIC" ||
    post.group?.privacy === "PRIVATE"
  )
    return false;
  const visited = new Set<string>();
  let current = post;
  while (current?.postType === "REPOST") {
    if (visited.has(current.id) || !current.originalPost) return false;
    visited.add(current.id);
    current = current.originalPost;
    if (
      postAudience(current) !== "PUBLIC" ||
      current.group?.privacy === "PRIVATE"
    )
      return false;
  }
  return true;
}
export function pinnedIn(
  post: any,
  pins: PostPins,
  context?: PinContext,
): boolean {
  if (!context) return false;
  const saved = pins[post.id];
  if (context.type === "profile")
    return (
      saved?.profile ??
      Boolean(post.profilePinned ?? (!post.groupId && post.isPinned))
    );
  return (
    saved?.groups?.[context.groupId] ??
    Boolean(
      post.groupId === context.groupId && (post.groupPinned ?? post.isPinned),
    )
  );
}
export function compareRecent(a: any, b: any): number {
  const time = (post: any) =>
    Number.isFinite(Date.parse(post.createdAt))
      ? Date.parse(post.createdAt)
      : 0;
  return time(b) - time(a) || String(b.id).localeCompare(String(a.id));
}
export function uniqueRecent(posts: any[]): any[] {
  return [...new Map(posts.map((post) => [post.id, post])).values()].sort(
    compareRecent,
  );
}
export function matchesPost(post: any, params: any): boolean {
  const text = [
    post.title,
    post.caption,
    post.poll?.question,
    post.author?.name,
    post.cuisine,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  const time = post.preparationTime ?? post.cookingTime;
  return (
    (!params.authorId || post.authorId === params.authorId) &&
    (!params.groupId || post.groupId === params.groupId) &&
    (!params.type ||
      post.postType === params.type ||
      (params.type === "CASUAL" && post.postType === "POLL")) &&
    (!params.cuisine ||
      post.cuisine?.toLowerCase() === params.cuisine.toLowerCase()) &&
    (!params.maxTime || (time > 0 && time <= Number(params.maxTime))) &&
    (!params.tag ||
      [...(post.tags || []), ...(post.categories || [])].includes(
        params.tag,
      )) &&
    (!params.search || text.includes(params.search.toLowerCase()))
  );
}

// The existing backend supports page/limit. Keep unread items from both sources
// between requests so older device posts cannot jump above newer server posts.
export type FeedCursor = {
  page: number;
  remote: any[];
  local: any[];
  seen: string[];
  hasRemote: boolean;
};
export type RemotePage = { data: any[]; hasMore: boolean };
export async function readFeedPage(
  load: (page: number, limit: number) => Promise<RemotePage>,
  local: any[],
  limit = 12,
  previous?: FeedCursor,
): Promise<{ posts: any[]; cursor: FeedCursor | null }> {
  const cursor: FeedCursor = previous
    ? structuredClone(previous)
    : {
        page: 1,
        remote: [],
        local: uniqueRecent(local),
        seen: [],
        hasRemote: true,
      };
  const seen = new Set(cursor.seen);
  const posts: any[] = [];
  let requests = 0;
  while (posts.length < limit) {
    if (!cursor.remote.length && cursor.hasRemote) {
      // Bound sparse filter requests. A continuation can scan the next batch.
      if (requests++ >= 5) break;
      const batch = await load(cursor.page++, limit);
      cursor.remote = uniqueRecent(batch.data).filter(
        (post) => !seen.has(post.id),
      );
      cursor.hasRemote = batch.hasMore;
      if (!cursor.remote.length && cursor.hasRemote) continue;
    }
    const remote = cursor.remote[0];
    const device = cursor.local[0];
    if (!remote && !device) break;
    const next =
      !remote || (device && compareRecent(device, remote) < 0)
        ? cursor.local.shift()
        : cursor.remote.shift();
    if (!seen.has(next.id)) {
      posts.push(next);
      seen.add(next.id);
    }
  }
  cursor.seen = [...seen];
  return {
    posts,
    cursor:
      cursor.hasRemote || cursor.remote.length || cursor.local.length
        ? cursor
        : null,
  };
}
