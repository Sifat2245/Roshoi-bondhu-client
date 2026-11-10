import { isDemoMode, readDemo } from "../../../lib/demo/demo-store";
import {
  type Challenge,
  type MemberChanges,
  type Person,
  type Poll,
  originalPost,
} from "./community-domain";

import type { PostPins } from "../../posts/model/post-policy";

export type SocialState = {
  pins: PostPins;
  posts: any[];
  polls: Record<string, Poll>;
  groupPolls: Record<string, string[]>;
  challengeCreators: Record<string, "STAFF" | "MEMBERS">;
  challenges: Record<string, Challenge[]>;
  members: Record<string, MemberChanges>;
  people: Record<string, Person>;
};
export const SOCIAL_EVENT = "heshel:social-change";
const cache = new Map<string, { raw: string | null; value: SocialState }>();
export const socialScope = (actorId?: string) =>
  `${isDemoMode() ? "demo" : "user"}:${actorId || (isDemoMode() ? readDemo().users[0].id : "guest")}`;
export const socialId = () => crypto.randomUUID();
const key = (scope: string) => `heshel:social:v1:${scope}`;

function initial(scope: string): SocialState {
  const state: SocialState = {
    pins: {},
    posts: [],
    polls: {},
    groupPolls: {},
    challengeCreators: {},
    challenges: {},
    members: {},
    people: {},
  };
  try {
    const old = JSON.parse(
      localStorage.getItem(`heshel:kitchen:v1:${scope}`) || "null",
    );
    for (const [groupId, value] of Object.entries(old?.communities || {}) as [
      string,
      any,
    ][]) {
      state.challenges[groupId] = [
        {
          id: `legacy-${groupId}`,
          title: "One ingredient. A table full of ideas.",
          description:
            "Choose a seasonal vegetable and give it your own family twist. Share your recipe and cook along with the community.",
          rules:
            "Use a seasonal vegetable, credit your inspiration, and share a recipe in this group.",
          authorId: "",
          createdAt: new Date().toISOString(),
          closed: false,
          participants: value.participants || [],
          entries: value.entries || [],
        },
      ];
      const actorId = scope.slice(scope.indexOf(":") + 1);
      const people = isDemoMode()
        ? readDemo().users.filter((user) => user.id !== actorId)
        : [];
      state.groupPolls[groupId] = (value.polls || []).map((old) => {
        const id = `group-${groupId}-${old.id}`;
        let cursor = 0;
        state.polls[id] = {
          id,
          question: old.question,
          multiple: false,
          authorId: actorId,
          closed: false,
          options: old.options.map((option, index) => {
            const voterIds = people
              .slice(cursor, cursor + option.count)
              .map((p) => p.id);
            cursor += option.count;
            if (old.vote === index) voterIds.push(actorId);
            return { id: `${id}-${index}`, text: option.label, voterIds };
          }),
        };
        return id;
      });
    }
  } catch {
    /* A new social workspace can start without older kitchen data. */
  }
  if (isDemoMode()) {
    const demo = readDemo();
    demo.users.forEach((user) => {
      state.people[user.id] = {
        id: user.id,
        name: user.name,
        image: user.image,
        username: user.username,
      };
    });
    [
      {
        id: "local-post-demo-poll-1",
        question: "What is your favourite comfort meal on a rainy day?",
        answers: [
          "Khichuri and a little pickle",
          "A warm bowl of noodles",
          "Crispy potatoes and tea",
        ],
        author: demo.users[1],
        group: null,
      },
      {
        id: "local-post-demo-poll-2",
        question: "Which quick dinner should we cook together next?",
        answers: [
          "One-pot chickpea curry",
          "Garlic vegetable pasta",
          "A crunchy seasonal salad",
        ],
        author: demo.users[2],
        group: demo.groups.find((group) => group.id === "g-quick"),
      },
    ].forEach((sample, index) => {
      const poll: Poll = {
        id: sample.id,
        question: sample.question,
        authorId: sample.author.id,
        multiple: false,
        closed: false,
        options: sample.answers.map((text, i) => ({
          id: `${sample.id}-${i}`,
          text,
          voterIds: demo.users
            .slice(3 + i * 2, 5 + i * 2)
            .map((user) => user.id),
        })),
      };
      state.polls[poll.id] = poll;
      state.posts.push({
        id: sample.id,
        postType: "POLL",
        caption: index
          ? "Help us choose the next recipe for our kitchen table."
          : "Food memories are the best memories. Tell us your go-to!",
        poll,
        authorId: sample.author.id,
        author: sample.author,
        groupId: sample.group?.id || null,
        group: sample.group,
        createdAt: new Date(Date.now() - (index + 2) * 3600000).toISOString(),
        comments: [],
        commentCount: 0,
        likeCount: 8 + index * 4,
        hasLiked: false,
      });
    });
  }
  return state;
}
export function readSocial(scope: string): SocialState {
  const raw = localStorage.getItem(key(scope));
  const previous = cache.get(scope);
  if (previous?.raw === raw) return previous.value;
  let value: SocialState;
  try {
    const saved = JSON.parse(raw || "null");
    value =
      saved?.posts && saved?.polls
        ? { ...initial(scope), ...saved }
        : initial(scope);
  } catch {
    value = initial(scope);
  }
  cache.set(scope, { raw, value });
  return value;
}
export function updateSocial(
  scope: string,
  change: (state: SocialState) => void,
) {
  const next = structuredClone(readSocial(scope));
  change(next);
  localStorage.setItem(key(scope), JSON.stringify(next));
  window.dispatchEvent(new CustomEvent(SOCIAL_EVENT, { detail: { scope } }));
}
export function subscribeSocial(listener: () => void) {
  window.addEventListener(SOCIAL_EVENT, listener);
  window.addEventListener("storage", listener);
  return () => {
    window.removeEventListener(SOCIAL_EVENT, listener);
    window.removeEventListener("storage", listener);
  };
}
export function localPost(postId: string, actorId?: string) {
  const state = readSocial(socialScope(actorId));
  const post = state.posts.find((item) => item.id === postId);
  if (!post) return null;
  const group = isDemoMode()
    ? readDemo().groups.find((item) => item.id === post.groupId) || post.group
    : post.group;
  return {
    ...post,
    group,
    poll: state.polls[postId] || post.poll,
    commentCount: post.comments?.length || 0,
  };
}
export function publishLocalPost(payload: any, actor: Person, group?: any) {
  if (!actor?.id) throw new Error("Sign in to create a post.");
  const id = `local-post-${socialId()}`;
  const poll: Poll | undefined =
    payload.postType === "POLL"
      ? {
          ...payload.poll,
          id,
          authorId: actor.id,
          closed: false,
          options: payload.poll.options.map((text: string) => ({
            id: socialId(),
            text: text.trim(),
            voterIds: [],
          })),
        }
      : undefined;
  const post = {
    ...payload,
    id,
    authorId: actor.id,
    author: actor,
    group,
    poll,
    likeCount: 0,
    hasLiked: false,
    comments: [],
    commentCount: 0,
    createdAt: new Date().toISOString(),
  };
  updateSocial(socialScope(actor.id), (state) => {
    state.people[actor.id] = actor;
    if (poll) state.polls[id] = poll;
    state.posts.unshift(post);
  });
  return { success: true, data: post };
}
export function shareLocalPost(post: any, actor: Person, caption: string) {
  if (!actor?.id) throw new Error("Sign in to share a post.");
  const original = originalPost(post);
  const result = {
    id: `local-post-${socialId()}`,
    postType: "REPOST",
    caption,
    authorId: actor.id,
    author: actor,
    originalPost: original,
    originalPostId: original.id,
    createdAt: new Date().toISOString(),
    comments: [],
    likeCount: 0,
    hasLiked: false,
  };
  updateSocial(socialScope(actor.id), (state) => {
    state.posts.unshift(result);
    state.people[actor.id] = actor;
  });
  return { success: true, data: result };
}
