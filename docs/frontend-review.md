# Frontend review and backend handoff

The existing Facebook-inspired layout, red brand accent, dark theme, and login split are preserved. This work is confined to the client. Server files, database schema, and server dependencies were not edited.

## Try the interactive prototype

Open `/login` and choose **Explore interactive demo**. This creates a local demo session as Rahima Sultana. The existing email/password form continues to use the real authentication flow.

Demo data includes 12 cooks, six groups with member/admin/moderator roles, 20 recipe and casual posts, varied comments, likes, invitations, and friend requests. Demo mutations go through `src/lib/demo/demo-store.ts` instead of the server. They persist under `heshel:demo:v1` in this browser. Existing authentication discovery may still make read requests.

See [Kitchen features and frontend handoff](kitchen-features.md) for the eight new features, routes, local persistence, and suggested backend models.

Use **Exit demo** from the account menu to leave the preview. Signed-in users can choose **Try interactive demo** without signing out of their real account. The fixture factory and `resetDemo()` are exported from the demo store for development. Chat previews, custom friend lists, and notification preferences have separate namespaced browser storage keys.

## Changes by page

| Area | Improvements |
| --- | --- |
| Shared navigation | Mobile navigation on all social pages, responsive search/header controls, popovers contained within the phone viewport, outside-click/Escape dismissal, unread chat count from shared state. |
| Feed | Animated heart and particle burst, optimistic like/unlike with rollback, reaction state shared with the comments dialog, clearer loading/error/retry behaviour, stale-request protection. |
| Posts and comments | Usable post permalinks, recipe ingredients and instructions in the detail dialog, working comment/share controls, validation and reset for the composer, image size/type validation, author-only editing/deletion, confirmation before deletion. |
| Profile | Compact expandable mobile introduction, working photo collections and image viewer, connection search, profile editing with keyboard-friendly dialogs. |
| Settings | URL-backed sections, reachable personal details form, light/dark preference, notification preferences, truthful security/account previews instead of claiming server changes. |
| Groups | Discover category/search filtering, loading/empty states, group search and sorting, featured posts filtering, member search and admin filtering, working sharing and media viewing, leave confirmation, description field and mobile-friendly creation flow. |
| Friends | Demo requests distinct from existing friends, persistent acceptance/dismissal and outgoing requests, editable custom lists with membership selection, profile previews with working tabs, conversation started with the selected person. |
| Messages | Shared state between popup and full Messenger page, persistent local messages, emoji picker, photo attachments, real unread counts, functional mute/read controls. Calls are explicitly unavailable in this prototype. |
| Notifications | Persistent read/dismissal state, preferences applied to the feed, working post links and demo group invitations. |
| Accessibility | Focus outlines, dialog focus containment/restoration, Escape dismissal, named controls, readable fallbacks for missing avatars, reduced-motion support, visible scroll affordances, dynamic viewport heights. |

## Existing client API contracts

Demo responses follow the existing `{ success, data }` envelope. The live request helpers retain their request paths.

| Domain | Client requests |
| --- | --- |
| Posts | `GET/POST /api/post`, `GET/PUT/DELETE /api/post/:id`, `POST /api/post/:id/like`, `/comment`, `/share` |
| Profiles | `GET /api/user/:id`, `PATCH /api/user/profile`, `/api/user/bio`, `POST /api/user/:id/follow` |
| Groups | `GET/POST /api/group`, `GET /api/group/:slug`, `POST /api/group/:slug/join`, `/leave`, `PATCH /api/group/:slug/settings` |
| Friends | `GET /api/user/friends/all`, `/suggestions`; the existing live request action currently uses the follow helper. |
| Notifications | `GET /api/user/notifications`; read preferences and dismissal currently persist on this device. |
| Images | `POST /api/upload/image` with multipart field `image` |

Post cards currently consume `caption`, `postType`, `author`, `group`, `image`, `title`, `cuisine`, `preparationTime`, `servings`, `ingredients`, `instructions`, `hasLiked`, `likeCount`, `commentCount`, and `createdAt`. Comments use `author`, `content`, and `createdAt`. Group views use `slug`, `isMember`, `membershipRole`, `membersCount`, and `members[].user`/`role`.

## Features that still require backend implementation

- Password changes, two-factor enrollment, session revocation, account deletion/deactivation, and device/passkey linking remain clearly labelled previews. No real security change is claimed or performed.
- Messenger delivery, media storage, typing/presence, calls, and message synchronization are local prototypes.
- Friend request acceptance/deletion, custom lists, pin persistence, notification read preferences, and invitation responses need dedicated live endpoints before multi-device behaviour is available.
- Enforce authorization and group privacy on the server when implementing these contracts. Client-side visibility is a presentation rule, not an access-control boundary.
- The demo is an explicit frontend preview. It is not a real authenticated server session and cannot grant server permissions.

## Verification

- TypeScript compilation, full client ESLint, production build, and Git whitespace checks pass. ESLint retains four existing React Fast Refresh warnings in the context modules; Vite retains its bundle-size advisory.
- Browser route audit: 19 routes/sections at 1440, 1024, 768, 390, and 320 pixels (95 checks), with no runtime exceptions or recorded layout overflow.
- Workflow checks: 19 end-to-end scenarios covering likes, comment synchronization, sharing, post creation/editing/deletion, recipe composition, photo collections, personal details, preferences, groups, friend requests/lists, messaging, notifications, and mobile overlays. No backend writes occurred in the demo workflows.
- Six further scenario groups cover profile editing, all friend-profile tabs, group search/options/media, mobile drawer dismissal, dark mode, demo logout, and authentication page rendering.
- Calls and security/account mutations remain preview features as described above. Live backend integration was not verified or changed.
