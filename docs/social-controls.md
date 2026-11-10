# Social post and group controls

This follow-up keeps the existing visual style and adds the interaction details behind it. Server files and existing live API paths are unchanged.

## Navigation and presentation

- Kitchen tabs have been removed. Kitchen pages use a viewport-aligned left sidebar, with a compact icon rail on phones and the full sidebar on desktop.
- Decorative sparkle symbols have been removed throughout the client. Functional navigation, cooking, voting, and rating icons remain.
- Group posts show the group name first, with the author, date, and privacy on the second line. The group image carries a smaller author avatar.
- Embedded shared posts link to the original post route. Original recipe instructions, tools, polls, and conversations open from there. Nested reposts resolve to their original source.

## Polls in ordinary posts

Choose **Poll** in the regular feed/profile/group composer. Polls have a question, 2–6 distinct answers, optional multiple answers, and an optional closing time. Incomplete polls save as drafts and restore their answers, destination group, and settings.

People can vote, change or remove a vote, and inspect who voted for each answer. Multiple-choice percentages use distinct voters as the denominator. Authors can close and reopen voting. Closed/expired polls reject further votes. Poll posts also support normal reactions, comments, sharing, caption editing, pinning, and deletion.

Poll posts are explicitly device previews while their backend is pending. They are merged into the feed, profile, group feed, and permalink views by the client adapter. Existing recipe and casual post requests continue using the original backend helpers.

## Challenge management

Group → **Community** → **Create challenge** opens the title, description, guidelines, and closing-time form. Authorized creators can edit, close, reopen, or delete a challenge. Closing preserves existing entries and stops new participation. Reopening preserves entries and clears an expired closing time.

Admins and moderators can create/manage challenges by default. Admins can use **Challenge permissions** to allow all members to create their own challenges. Members can manage their own challenges; staff can manage every challenge. Existing challenge participants, entries, and community polls are migrated from the previous kitchen data.

## Member menus

Group → **Members** has an options button on each row. Everyone can open a profile. Management actions depend on the viewer’s group role:

| Viewer | Available management actions |
| --- | --- |
| Creator/admin | Promote/demote eligible members, remove, ban, and remove bans. Only the creator manages another admin’s role. |
| Moderator | Remove/ban ordinary members; cannot assign staff roles or manage other staff. |
| Ordinary member | Profile navigation; no moderation actions. |

The creator is protected, self-management is prevented, and the last admin cannot be demoted through a member action. Role changes/removal/bans require confirmation. Staff can inspect the banned-members list. Removing a ban permits a future rejoin; it does not silently restore membership. Existing posts remain when a member is removed. Header and group-list member counts reflect exclusions once, even when a person is both removed and banned.

## Storage and backend handoff

New social state lives at `heshel:social:v1:<demo|user>:<accountId>` in this browser. `src/features/community/model/community-domain.ts` holds validation and permission rules. `social-store.ts` stores local posts, poll votes, challenge collections, creation policies, member-role overrides, removals, and bans. Account-specific storage is separate from the existing kitchen store.

The demo adds two normal-stream poll posts alongside its existing 20 recipe/story posts. The new controls write to local prototype data, not server endpoints. To connect the backend, add canonical poll/options/votes and closing state, challenge CRUD/policies/entries, group membership roles/removal/bans, and group-post author/group presentation data. Enforce membership and management permissions server-side; local prototype controls are not server authorization.

Verification covers nine domain tests plus the existing six recipe tests, 25 main interaction scenarios, 84 responsive/role/draft checks at 1440, 1024, 768, 390, and 320 pixels, and 19 existing social regression scenarios. Local poll adapter editing/reactions/comments/sharing/deletion and dark-mode contrast were also checked. TypeScript, ESLint (no errors), production build, and whitespace checks pass; existing Fast Refresh warnings and the shared-bundle size advisory remain. No backend writes occurred in the demo checks.

## Feed, pin scope, and post audiences

The home feed now uses the existing `GET /api/post?page=…&limit=12` pagination contract. It shows posts in descending creation time with a stable ID tie-breaker, merges device posts into that order, removes duplicate IDs, and retains unread items between pages. **Load more posts**, refresh, retry, and the caught-up state are available. Changing a filter resets pagination; aborted or superseded requests cannot replace the current results. Sparse local-only filters scan at most five server pages per action. Adding a comment updates the visible count without discarding loaded pages or resetting the reader’s place. Pins and reaction counts never influence home-feed ordering. Pinned posts remain ordinary eligible feed items.

Pin metadata is separate for profile and group destinations in `social.pins[postId]`. A profile owner can use **Pin to profile** on their profile. Group admins/moderators can use **Pin in group** on group posts; these appear under **Featured**. Group discussion, home-feed, and permalink cards have no pin badges. Unpinning one destination leaves the other unchanged. Legacy `isPinned` values are interpreted as group pins for group posts and profile pins for personal posts; explicit destination overrides take precedence. Pins persist on this device/account and require live endpoints for shared, multi-device state.

Personal composers on profiles and the feed offer **Public**, **Friends**, and **Only me** for stories, recipes, and polls. Drafts retain the choice. Post headers show the correct audience. Group composers show the group's privacy instead of a personal-audience selector. Friends visibility checks actual friendships, separately from following. Owners can see their own restricted posts. Feed, profile, and permalink adapters apply audience rules; shared snapshots redact inaccessible originals. Public resharing is disabled for restricted audiences and private groups, with an API-adapter guard as well as the disabled control.

The existing server schema has no post-audience field. **Friends and Only me are explicitly labelled device previews**, stored in the account's local social workspace; they are never sent to the existing public create endpoint. Photos selected for these previews also stay local. If a local photo draft is changed to Public or a group destination, its photo uploads before publishing. Public casual/recipe posts retain the existing server payload. Polls remain device previews. These presentation rules are not server access control: backend integration must add canonical audience storage, friendship-based authorization on every read/mutation, original-post visibility on shares, and profile/group pin permissions. The server's existing offset pagination can shift when posts are created/deleted between requests; the client deduplicates overlaps, and refresh starts a fresh list. Stable server cursor pagination is a later backend improvement.

Additional verification covers 13 post-policy tests (visibility, restricted sharing/snapshots, independent pins, deterministic order, pagination merging, overlapping pages, sparse filters, and retry without cursor mutation) and 24 browser scenarios, including profile/group pin persistence, audience drafts, public-create payload compatibility, restricted permalinks/shares, friendship changes, and composer layouts at 1024/768/390/320px. Eleven additional browser checks cover filter resets, following versus friendships, sparse/empty results, request cancellation, failed pagination/refresh retries, and preserving loaded pages after commenting. Five photo/audience checks cover local image storage, publishing after an audience change, and rejecting inaccessible local reactions/comments. The existing social interaction regression suite was also rerun. No backend writes occurred in these browser checks.
