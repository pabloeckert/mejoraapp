# MejoraApp — Project Context & Instructions

MejoraApp is a Progressive Web App (PWA) for a business community, built with a modern React stack and Supabase backend.

## 🚀 Project Overview

- **Purpose:** A strategic hub for business leaders in Argentina, featuring diagnostic tools, anonymous networking, AI-driven mentorship, and curated content.
- **Tech Stack:**
  - **Frontend:** React 18, TypeScript 5.8, Vite 5, Tailwind CSS 3.4.
  - **UI Library:** shadcn/ui + Radix UI.
  - **State Management:** React Query (Server State), React Context (Global UI State).
  - **Backend (BaaS):** Supabase (PostgreSQL, Auth, Realtime, Edge Functions).
  - **Monitoring:** Sentry (Errors), PostHog (Analytics).
  - **Testing:** Vitest (Unit), Playwright (E2E).

## 🏗️ Architecture & Flow

The project follows a layered architecture to ensure separation of concerns:

1.  **UI Layer (`src/components/`):** React components using shadcn/ui. Components should be presentational and delegate logic to hooks.
2.  **Hooks Layer (`src/hooks/`):** Custom hooks that manage state and logic. Most use React Query to interact with services.
3.  **Services Layer (`src/services/`):** Abstraction layer for Supabase calls. Prevents direct DB access from components/hooks.
4.  **Integration Layer (`src/integrations/`):** Configured Supabase client and auto-generated types.

**Data Flow:** `UI Component` → `Hook` → `Service` → `Supabase Client` → `Supabase DB`.

## 🛠️ Development Commands

- `npm run dev`: Start the development server (default port 8080).
- `npm run build`: Create a production build in the `dist/` directory.
- `npm run lint`: Run ESLint to check for code quality issues.
- `npx tsc --noEmit`: Run TypeScript compiler for type checking.
- `npm run test`: Execute unit tests using Vitest.
- `npm run test:e2e`: Execute end-to-end tests using Playwright.
- `npm run test:coverage`: Generate a test coverage report.

## 📏 Design & Coding Conventions

### File Naming
- **Components:** `PascalCase.tsx` (e.g., `src/components/muro/PostCard.tsx`).
- **Hooks:** `useCamelCase.ts` (e.g., `src/hooks/useProfile.ts`).
- **Services:** `camelCase.service.ts` (e.g., `src/services/wall.service.ts`).
- **Utilities/Lib:** `camelCase.ts` (e.g., `src/lib/validation.ts`).

### Best Practices
- **Types:** Strictly avoid `any`. Use auto-generated Supabase types or define explicit interfaces.
- **Validation:** Use **Zod** schemas in `src/lib/validation.ts` for all form and API data validation.
- **Services:** Never call `supabase` directly from components. Always use or create a service function.
- **Styling:** Use Tailwind CSS utility classes. Reference design tokens in `index.css` (HSL variables).
- **Error Handling:** Use the provided `RouteErrorBoundary` for per-route isolation.
- **Performance:** Prefer `lazy()` loading for routes and heavy components. Use `useDebounce` for search/input actions.

## 🔐 Security & Safety
- **Auth:** Uses Supabase Auth with PKCE flow.
- **Headers:** Security headers (CSP, HSTS, etc.) are configured in `vercel.json`.
- **Validation:** Zod schemas are used at boundaries.
- **Rate Limiting:** Client-side rate limiting is implemented in `src/lib/rateLimit.ts`.

## 📱 PWA & Offline Support
- **Service Worker:** Located at `public/sw.js`. It handles caching strategies (Cache-first for hashed assets, Network-first for navigation).
- **Manifest:** Configured in `public/manifest.json`.

## 🧪 Testing Strategy
- **Unit Tests:** Located in `src/test/`. Use Vitest and React Testing Library.
- **E2E Tests:** Located in `e2e/`. Use Playwright. Tests should pass on both Desktop and Mobile (Pixel 5) emulators.
- **Lighthouse:** Automated accessibility and performance checks are enforced via `.lighthouserc.json`.
