import assert from "node:assert/strict";
import { test } from "node:test";
import {
  canViewPost,
  canSharePost,
  matchesPost,
  pinnedIn,
  postAudience,
  postForViewer,
  readFeedPage,
  uniqueRecent,
} from "../src/features/posts/model/post-policy.ts";

const post = (id, hour, extra = {}) => ({
  id,
  authorId: "cook",
  createdAt: `2026-11-01T${String(hour).padStart(2, "0")}:00:00Z`,
  ...extra,
});
const owner = { id: "cook", friendIds: [] };
const friend = { id: "friend", friendIds: ["cook"] };
const stranger = { id: "stranger", friendIds: [] };

test("legacy posts default to Public; unknown audiences fail closed", () => {
  assert.equal(postAudience({}), "PUBLIC");
  assert.equal(postAudience({ audience: "invalid" }), "ONLY_ME");
  assert.equal(
    canViewPost({ authorId: "cook", audience: "invalid" }, stranger),
    false,
  );
});
test("Public, Friends and Only me distinguish owners, friends and strangers", () => {
  for (const audience of ["PUBLIC", "FRIENDS", "ONLY_ME"]) {
    const p = post("p", 1, { audience });
    assert.equal(canViewPost(p, owner), true);
    assert.equal(canViewPost(p, friend), audience !== "ONLY_ME");
    assert.equal(canViewPost(p, stranger), audience === "PUBLIC");
    assert.equal(
      canViewPost(p, { friendIds: ["cook"] }),
      audience === "PUBLIC",
    );
  }
});
test("non-public posts and private group posts cannot be reposted publicly", () => {
  assert.equal(canSharePost(post("p", 1)), true);
  for (const audience of ["FRIENDS", "ONLY_ME"])
    assert.equal(canSharePost(post("p", 1, { audience })), false);
  assert.equal(
    canSharePost(post("p", 1, { group: { privacy: "PRIVATE" } })),
    false,
  );
  const restricted = post("r", 1, { audience: "FRIENDS" });
  assert.equal(
    canSharePost(
      post("s", 2, { postType: "REPOST", originalPost: restricted }),
    ),
    false,
  );
});
test("sharing rejects missing originals and circular reposts", () => {
  assert.equal(canSharePost(post("s", 1, { postType: "REPOST" })), false);
  const p = post("s", 1, { postType: "REPOST" });
  p.originalPost = p;
  assert.equal(canSharePost(p), false);
});
test("shared snapshots cannot reveal a restricted original through nested reposts", () => {
  const privatePost = post("private", 1, { audience: "ONLY_ME" });
  const inner = post("inner", 2, {
    postType: "REPOST",
    originalPost: privatePost,
  });
  const outer = post("outer", 3, {
    postType: "REPOST",
    originalPost: inner,
    originalPostId: inner.id,
  });
  assert.equal(postForViewer(privatePost, stranger), null);
  assert.equal(postForViewer(outer, stranger).originalPost, null);
  assert.equal(postForViewer(outer, stranger).originalPostId, null);
  assert.equal(postForViewer(outer, owner).originalPost, inner);
  assert.equal(outer.originalPost.originalPost, privatePost);
});
test("feed and permalink have no pin context, even with legacy pin metadata", () => {
  const p = post("p", 1, { isPinned: true });
  assert.equal(pinnedIn(p, {}), false);
  assert.equal(
    pinnedIn(p, { p: { profile: true, groups: { g: true } } }),
    false,
  );
});
test("profile pins and group pins are independent, including explicit unpin overrides", () => {
  const p = post("p", 1, { groupId: "g", isPinned: true });
  const profile = { type: "profile" },
    group = { type: "group", groupId: "g" };
  assert.equal(pinnedIn(p, {}, profile), false);
  assert.equal(pinnedIn(p, {}, group), true);
  const pins = { p: { profile: true, groups: { g: false } } };
  assert.equal(pinnedIn(p, pins, profile), true);
  assert.equal(pinnedIn(p, pins, group), false);
  assert.equal(pinnedIn(p, pins, { type: "group", groupId: "another" }), false);
});
test("feed ordering uses time and stable ID ties, ignoring pins and reaction counts", () => {
  const posts = uniqueRecent([
    post("old", 1, { isPinned: true, likeCount: 10000 }),
    post("a", 5),
    post("b", 5),
    post("new", 8),
    post("a", 5, { caption: "latest copy" }),
  ]);
  assert.deepEqual(
    posts.map((p) => p.id),
    ["new", "b", "a", "old"],
  );
  assert.equal(posts[2].caption, "latest copy");
});
test("local polls and recipes use consistent text, cuisine, category and time filters", () => {
  const poll = post("p", 1, {
    postType: "POLL",
    poll: { question: "Rice or pasta?" },
    author: { name: "Maya" },
  });
  assert.equal(matchesPost(poll, { type: "CASUAL", search: "pasta" }), true);
  assert.equal(matchesPost(poll, { type: "RECIPE" }), false);
  const recipe = post("r", 1, {
    postType: "RECIPE",
    cuisine: "Bangladeshi",
    preparationTime: 25,
    categories: ["Dinner"],
  });
  assert.equal(
    matchesPost(recipe, { cuisine: "bangladeshi", maxTime: 30, tag: "Dinner" }),
    true,
  );
  assert.equal(matchesPost(recipe, { maxTime: 15 }), false);
});
test("pagination merges both sources chronologically and drains all unread posts exactly once", async () => {
  const remote = [
    post("r9", 9),
    post("r7", 7),
    post("r5", 5),
    post("r3", 3),
    post("r1", 1),
  ];
  const local = [post("l8", 8), post("l4", 4), post("l2", 2)];
  const requests = [];
  const load = async (page, limit) => {
    requests.push(page);
    return {
      data: remote.slice((page - 1) * limit, page * limit),
      hasMore: page * limit < remote.length,
    };
  };
  let cursor,
    all = [];
  do {
    const result = await readFeedPage(load, local, 3, cursor);
    all.push(...result.posts);
    cursor = result.cursor;
  } while (cursor);
  assert.deepEqual(
    all.map((p) => p.id),
    ["r9", "l8", "r7", "r5", "l4", "r3", "l2", "r1"],
  );
  assert.deepEqual(requests, [1, 2]);
});
test("pagination skips overlapping backend pages and does not mutate the previous cursor", async () => {
  const load = async (page) => ({
    data:
      page === 1 ? [post("a", 9), post("b", 8)] : [post("b", 8), post("c", 7)],
    hasMore: page === 1,
  });
  const first = await readFeedPage(load, [], 2);
  const before = globalThis.structuredClone(first.cursor);
  const second = await readFeedPage(load, [], 2, first.cursor);
  assert.deepEqual(
    second.posts.map((p) => p.id),
    ["c"],
  );
  assert.deepEqual(first.cursor, before);
  assert.equal(second.cursor, null);
});
test("a failed load can be retried from the same unread cursor", async () => {
  const first = await readFeedPage(
    async () => ({ data: [post("a", 9)], hasMore: true }),
    [],
    1,
  );
  const before = globalThis.structuredClone(first.cursor);
  await assert.rejects(
    readFeedPage(
      async () => {
        throw new Error("offline");
      },
      [],
      1,
      first.cursor,
    ),
    /offline/,
  );
  assert.deepEqual(first.cursor, before);
  const retry = await readFeedPage(
    async () => ({ data: [post("b", 8)], hasMore: false }),
    [],
    1,
    first.cursor,
  );
  assert.deepEqual(
    retry.posts.map((p) => p.id),
    ["b"],
  );
});
test("sparse filters bound each request batch and retain a continuation", async () => {
  let count = 0;
  const result = await readFeedPage(
    async () => {
      count++;
      return { data: [], hasMore: true };
    },
    [],
    12,
  );
  assert.equal(count, 5);
  assert.equal(result.cursor.page, 6);
});
