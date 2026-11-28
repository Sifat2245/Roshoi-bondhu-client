# Heshel (হেঁশেল) — Culinary Social Network Frontend

**Heshel** is a full-featured culinary social platform built with **React 19, TypeScript, Vite, Tailwind CSS v4, Apollo GraphQL, TanStack Query, Better Auth, and Socket.IO**. Users can share recipes, create polls, join cooking groups, connect with friends, manage their personal kitchen, and receive real-time notifications.

- **Frontend URL:** https://heshel-server-fg2v.vercel.app/
- **Backend API URL:** https://heshel-server.vercel.app/

---

## ✨ Features

- **Authentication & Account Security (Better Auth)**
  - Email/password sign-up & login with 6-digit email OTP verification
  - Two-factor authentication (TOTP & email OTP), WebAuthn Passkeys, and active session management
  - Password reset, account deactivation, and deletion workflows
- **Social Feed, Recipes & Polls**
  - Create casual posts, structured recipes (ingredients, instructions, prep time, servings, cuisine, tags), shared reposts, and community polls
  - Audience controls (`PUBLIC`, `FRIENDS`, `ONLY_ME`), trash/restore/permanent delete, hide/report posts, and toggle comments
  - Nested comments & replies, reaction likes, and `@mention` user autocomplete with profile links
- **Cooking Groups & Moderation**
  - Public & private groups with visible or invite-only (`HIDDEN`) discoverability
  - Configurable joining policies: **Direct join** vs. **Admin approval**
  - Direct user invitations, shareable tokenized invite links (`/group/:slug?invite=...` with copy/regenerate/revoke), group invitation banners, and admin moderation queues
  - Dedicated desktop/mobile **Manage** console (Overview, Member Requests & Sent Invitations, Pending Posts, Group Rules, Community Roles, Group Settings, Ownership Transfer & Lifecycle)
- **Friends, Discovery & Search**
  - Send, accept, decline, and cancel friend requests; friend suggestions and block management
  - Profile hover cards on desktop and full profile customization
  - Global search with live suggestions (`users`, `groups`, `posts`) and recent search persistence
- **Real-Time Notifications & Chat Infrastructure**
  - Live Socket.IO client & context (`notification:new`, presence, room subscriptions)
  - Facebook-style bottom-left notification popup cards with inline Accept/Decline actions, Web Audio chime sound, and per-type mute/preference toggles
  - Messenger page and floating chat dock UI
- **Personal Kitchen Tools**
  - Saved **Cookbooks**, **Pantry**, **Meal Planner**, and **Recipe Drafts**
- **UX & Accessibility**
  - Light & dark mode, responsive mobile/desktop navigation, skeleton loading states, and SWR query caching

---

## 🛠️ Tech Stack

| Category | Packages / Tools |
|---|---|
| **Core** | `react` (`19.x`), `react-dom`, `typescript`, `vite` (`6.x`), `react-router` (`7.x`) |
| **Styling & UI** | `tailwindcss` (`4.x`), `daisyui` (`5.x`), `lucide-react`, `react-icons`, `framer-motion`, `lottie-react`, `swiper` |
| **Data & State** | `@apollo/client` + `graphql`, `@tanstack/react-query`, `zustand`, `react-hook-form`, `zod` |
| **Auth & Realtime** | `better-auth`, `@better-auth/passkey`, `socket.io-client` |

---

## 📁 Project Structure

```text
src/
├── app/            # App entry, providers (Apollo, Query, Auth, Toast, Socket, Notifications), router
├── assets/         # Brand logos, icons, and fallback images
├── components/     # Reusable UI primitives, route guards, skeletons, modals
├── context/        # React contexts (Auth, Theme, Language, Toast, Socket, Notification, ChatDock, Upload)
├── features/       # Domain modules:
│   ├── auth/
│   ├── community/
│   ├── friends/
│   ├── groups/
│   ├── kitchen/
│   ├── messenger/
│   ├── notifications/
│   ├── posts/
│   ├── profile/
│   ├── reports/
│   ├── search/
│   └── settings/
├── lib/            # API client, Better Auth client, Apollo links/queries/mutations, Socket client, preferences & sound
├── pages/          # Route pages (feed, friends, group, kitchen, messages, notifications, profile, search, settings)
├── stores/         # Zustand stores
├── types/          # Shared TypeScript definitions
├── widgets/        # Header navbar & sidebars
└── main.tsx        # Application bootstrap
```

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env` for local development:

```bash
cp .env.example .env
```

| Variable | Description | Local Dev Default | Vercel Production (`.env.production`) |
|---|---|---|---|
| `VITE_API_URL` | Backend REST, Auth & GraphQL base URL | `http://localhost:5000` | `https://heshel-server.vercel.app` |
| `VITE_SOCKET_URL` | Socket.IO server origin | `http://localhost:5000` | `https://heshel-server.vercel.app` |
| `VITE_SOCKET_PATH` | Socket.IO mount path | `/socket.io` | `/socket.io` |
| `VITE_SOCKET_ENABLED` | Enable live Socket.IO connections | `"true"` | `"false"` *(serverless)* / `"true"` *(persistent host)* |

> **Note:** Real-time WebSockets require a persistent Node server (Railway, Render, Fly.io, VPS). When pairing with a Vercel serverless backend, `.env.production` sets `VITE_SOCKET_ENABLED="false"` so the browser does not fail repeated WebSocket handshakes.

---

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start development server (http://localhost:5173)
npm run dev

# Run ESLint
npm run lint

# Type-check & build for production
npx tsc --noEmit
npm run build

# Preview production bundle
npm run preview
```

---

## ▲ Vercel Deployment (GitHub)

1. Connect this repository in Vercel (**Framework Preset:** `Vite`, **Build Command:** `npm run build`, **Output Directory:** `dist`).
2. [vercel.json](./vercel.json) configures SPA fallback rewrites (`/(.*) -> /index.html`) so direct visits and page refreshes on routes like `/group/:slug?invite=...` and `/notifications` resolve cleanly.
3. Production defaults are provided in [.env.production](./.env.production) and can also be overridden in **Vercel Project Settings → Environment Variables**.
