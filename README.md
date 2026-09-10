# Mini FIRMA - Project Handoff Guide

Ye README Mini FIRMA project ka complete handoff document hai. Iska purpose kisi bhi developer ya AI tool, including Gemini, ko existing project structure, routes, UI system, data flow, aur current implementation samajhne me help karna hai.

## 1. Project Overview

Mini FIRMA ek construction/business management dashboard application hai. Project me company management, subscription, team/admin management, customers, enquiries, quotations, projects, jobs, reports, settings, authentication, aur onboarding flows ke routes available hain.

### Main technology stack

- Next.js `16.3.4` with App Router
- React `19.2.8`
- TypeScript
- Tailwind CSS `4.3.3`
- shadcn-style UI primitives
- Zustand for client auth state
- Dexie/IndexedDB for local browser database
- React Hook Form + Zod for form handling and validation
- Lucide React and Tabler Icons for icons
- GraphQL/Apollo dependencies are installed, but current visible flows primarily use Dexie/local data

## 2. Folder Count and File Count

- Project folders: approximately **50** source/project folders, `.git` ko exclude karke.
- Visible project files: approximately **57** files in the current workspace snapshot.
- Kuch folders abhi empty scaffold folders hain: `constants`, `hooks`, `services`, `types`, `utils`, `features/auth`, `features/customers`, `features/finance`, `features/jobs`, `features/quotations`, `graphql/generated`, `graphql/mutations`, `graphql/queries`, `components/forms`, `components/modals`, and `components/tables`.

## 3. Complete Folder Structure

```text
mini-firma/
|-- .gitignore
|-- components.json
|-- next-env.d.ts
|-- next.config.ts
|-- package.json
|-- package-lock.json
|-- postcss.config.mjs
|-- tsconfig.json
|
|-- app/
|   |-- globals.css
|   |-- layout.tsx
|   |-- page.tsx
|   |-- company/page.tsx
|   |-- customers/page.tsx
|   |-- dashboard/page.tsx
|   |-- finance/page.tsx
|   |-- help/page.tsx
|   |-- jobs/page.tsx
|   |-- login/page.tsx
|   |-- projects/page.tsx
|   |-- quotations/page.tsx
|   |-- reports/page.tsx
|   |-- setting/page.tsx
|   |-- signup/page.tsx
|   |-- subscription/page.tsx
|   |-- team/page.tsx
|   |-- users/page.tsx
|   |-- onboarding/
|       |-- welcome/page.tsx
|       |-- company/page.tsx
|       |-- plan/page.tsx
|       |-- billing/page.tsx
|       |-- complete/page.tsx
|
|-- components/
|   |-- forms/                 # Empty scaffold for reusable forms
|   |-- layout/
|   |   |-- FirmaLayout.tsx    # Main authenticated dashboard shell
|   |   |-- Sidebar.tsx        # Alternate role menu; currently basic/incomplete
|   |-- modals/                # Empty scaffold for modal components
|   |-- onboarding/
|   |   |-- OnboardingHeader.tsx
|   |   |-- OnboardingStepper.tsx
|   |-- tables/                # Empty scaffold for reusable tables
|   |-- ui/
|       |-- button.tsx
|       |-- card.tsx
|       |-- dialog.tsx
|       |-- input.tsx
|       |-- label.tsx
|
|-- constants/                 # Empty scaffold for constants
|-- features/
|   |-- auth/                  # Empty scaffold
|   |-- customers/             # Empty scaffold
|   |-- finance/               # Empty scaffold
|   |-- jobs/                  # Empty scaffold
|   |-- quotations/            # Empty scaffold
|   |-- users/
|       |-- AccountAdminDashboard.tsx
|       |-- FieldWorkerDashboard.tsx
|       |-- FinanceManagerDashboard.tsx
|       |-- OwnerDashboard.tsx
|       |-- ProjectManagerDashboard.tsx
|       |-- SalesManagerDashboard.tsx
|       |-- TeamAndAdmin.tsx
|       |-- UserAndRoles.tsx
|
|-- graphql/
|   |-- generated/             # Empty scaffold for generated GraphQL types
|   |-- mutations/             # Empty scaffold
|   |-- queries/               # Empty scaffold
|
|-- hooks/                     # Empty scaffold for custom React hooks
|-- lib/
|   |-- db.ts                  # Dexie database and shared domain types
|   |-- utils.ts               # Shared utility helpers, including cn
|-- mock/
|   |-- users.json             # Present but currently empty
|-- public/
|   |-- images/
|       |-- architecture_hero.jpg
|       |-- landing_hero.jpg
|       |-- sidebar_leaves.jpg
|       |-- subscription_branch.jpg
|       |-- tropical_leaf.jpg
|-- services/                  # Empty scaffold for API/service layer
|-- store/
|   |-- authStore.ts           # Persisted Zustand auth store
|-- types/                     # Empty scaffold for shared TypeScript types
|-- utils/                     # Empty scaffold for utility modules
```

## 4. Routes and Pages

Next.js App Router me `app/**/page.tsx` files routes define karti hain.

| Route | File | Purpose |
|---|---|---|
| `/` | `app/page.tsx` | Root/landing entry page |
| `/login` | `app/login/page.tsx` | Login flow |
| `/signup` | `app/signup/page.tsx` | Signup flow |
| `/dashboard` | `app/dashboard/page.tsx` | Main authenticated dashboard |
| `/company` | `app/company/page.tsx` | Company details/management |
| `/subscription` | `app/subscription/page.tsx` | Subscription and plan area |
| `/team` | `app/team/page.tsx` | Team and account admin area |
| `/users` | `app/users/page.tsx` | Account Admin users and roles area |
| `/customers` | `app/customers/page.tsx` | Customer management |
| `/quotations` | `app/quotations/page.tsx` | Enquiries/quotations area |
| `/projects` | `app/projects/page.tsx` | Project management |
| `/jobs` | `app/jobs/page.tsx` | Jobs/work management |
| `/finance` | `app/finance/page.tsx` | Finance area |
| `/reports` | `app/reports/page.tsx` | Reports |
| `/setting` | `app/setting/page.tsx` | Settings |
| `/help` | `app/help/page.tsx` | Help and support |
| `/onboarding/welcome` | `app/onboarding/welcome/page.tsx` | Onboarding welcome step |
| `/onboarding/company` | `app/onboarding/company/page.tsx` | Company information step |
| `/onboarding/plan` | `app/onboarding/plan/page.tsx` | Plan selection step |
| `/onboarding/billing` | `app/onboarding/billing/page.tsx` | Billing step |
| `/onboarding/complete` | `app/onboarding/complete/page.tsx` | Onboarding completion |

## 5. Layout and UI Architecture

### `app/layout.tsx`

- Global CSS import karta hai.
- Next font `Geist` load karta hai.
- Global metadata set karta hai: `Mini FIRMA`.
- Root HTML language `en` hai.

### `components/layout/FirmaLayout.tsx`

Ye current application ka primary dashboard shell hai.

- Desktop left sidebar
- FIRMA branding
- Main navigation
- Sticky top header
- Search input
- Notifications/profile area
- User dropdown and logout behavior
- Account Admin create modal/form
- Current pathname ke basis par active navigation
- Dashboard pages ke liye common background, spacing, typography, and layout

Is component ko change karte waqt authenticated pages ke overall UI par impact consider karna zaroori hai.

### `components/layout/Sidebar.tsx`

Ye role-based menu ka alternate basic component hai. Isme `menuByRole` mapping hai, lekin component abhi minimal hai aur `FirmaLayout` ka replacement nahi hai. Existing UI banate waqt primary shell ke liye `FirmaLayout` ko follow karein.

### `components/ui/`

- `button.tsx`: Base UI button, variants, sizes, focus states, and icon sizing.
- `card.tsx`: Card, header, title, description, content, action, and footer primitives.
- `dialog.tsx`: Dialog primitive.
- `input.tsx`: Input primitive.
- `label.tsx`: Form label primitive.

New UI components banate waqt in primitives aur existing Tailwind conventions ko reuse karein.

## 6. Authentication and Data Model

### `store/authStore.ts`

Zustand store `mini-firma-auth` key ke through persisted hai.

- `currentUser`: current logged-in user without password
- `setUser(user)`: login ke baad user set karta hai
- `logout()`: current user clear karta hai

### `lib/db.ts`

Dexie database ka naam `MiniFIRMA` hai. Current tables:

- `users`: users, email, password, role, size
- `onboarding`: user plan and completion flags
- `company`: company information linked by `userId`

Available roles:

- `OWNER`
- `ACCOUNT_ADMIN`
- `SALES_MANAGER`
- `PROJECT_MANAGER`
- `FIELD_WORKER`
- `FINANCE_MANAGER`

Important: Ye current implementation local browser IndexedDB use karti hai. Backend API/auth abhi connected nahi dikh raha. Production UI/API banate waqt passwords ko client-side plain text me store na karein.

## 7. User and Role Features

`features/users/` me role-based dashboard components available hain:

- `OwnerDashboard.tsx`
- `AccountAdminDashboard.tsx`
- `SalesManagerDashboard.tsx`
- `ProjectManagerDashboard.tsx`
- `FieldWorkerDashboard.tsx`
- `FinanceManagerDashboard.tsx`
- `TeamAndAdmin.tsx`
- `UserAndRoles.tsx`

`app/users/page.tsx` current user ko check karta hai:

- Login nahi hai to `/login` par redirect.
- User `ACCOUNT_ADMIN` nahi hai to `/dashboard` par redirect.
- Valid Account Admin ke liye `UsersAndRoles` render hota hai.

`AccountAdminDashboard.tsx` me React Hook Form + Zod validation se user create hota hai. Supported creation roles:

- Sales Manager
- Project Manager
- Field Worker
- Finance Manager

New user Dexie ke `users` table me save hota hai aur existing users list me show hota hai.

## 8. Existing Visual Direction

Current UI ko preserve karne ke liye ye design language follow karein:

- Light neutral background, especially `#F5F6F5` family
- Dark green brand color, especially `#182E25`
- Off-white/beige content surfaces
- Rounded cards and compact dashboard spacing
- Geist font through Next font
- Lucide icons
- Architecture and botanical imagery from `public/images`
- Desktop sidebar + sticky top header dashboard pattern
- Responsive grids using Tailwind breakpoints
- Small, dense dashboard typography instead of oversized marketing sections

Existing dashboard UI in `app/dashboard/page.tsx` me welcome banner, KPI cards, quick actions, task list, and image-based brand presentation ka pattern use hota hai.

## 9. Images and Assets

`public/images/` me current assets:

- `architecture_hero.jpg`: dashboard architecture visual
- `landing_hero.jpg`: landing page visual
- `sidebar_leaves.jpg`: sidebar promotional visual
- `subscription_branch.jpg`: subscription visual
- `tropical_leaf.jpg`: supporting botanical visual

Next/Image use karte waqt paths `/images/<filename>` format me use karein.

## 10. Configuration Files

- `package.json`: scripts and dependencies.
- `package-lock.json`: exact npm dependency lockfile.
- `tsconfig.json`: TypeScript configuration and path aliases.
- `next.config.ts`: Next.js configuration.
- `postcss.config.mjs`: Tailwind/PostCSS setup.
- `components.json`: shadcn component configuration.
- `next-env.d.ts`: Next.js generated TypeScript declarations.
- `.gitignore`: ignored files/folders.

Run commands:

```bash
npm install
npm run dev
npm run build
npm start
```

Default development URL usually `http://localhost:3000` hota hai.

## 11. Important Existing Notes for UI Work

1. Existing pages ko replace karne se pehle unka current route aur data behavior preserve karein.
2. Authenticated dashboard pages ke liye `FirmaLayout` use karein.
3. `Sidebar.tsx` ka role menu useful reference hai, lekin uski current markup basic hai.
4. `/quotations` current navigation me Enquiries ke liye bhi use ho raha hai. Enquiries aur Quotations ko separate karna ho to pehle route decision clearly define karein.
5. Account Admin ke create-admin flow me `FirmaLayout` ke andar direct Dexie write hoti hai.
6. `/users` route Account Admin-only hai; role guard ko remove ya weaken na karein bina product requirement ke.
7. Empty folders future API, GraphQL, hooks, shared types, services, and reusable UI ke liye scaffold hain.
8. New UI existing colors, spacing, rounded corners, responsive behavior, and image assets ke saath consistent honi chahiye.
9. Dummy/static numbers ko real data se replace karte waqt loading, empty, and error states add karein.
10. Client-side database ko real production authentication ya secure password storage ka replacement na samjhein.

## 12. Gemini Handoff Prompt

Is project par UI change karte waqt Gemini ko ye context dena useful rahega:

> This is a Next.js App Router project named Mini FIRMA. Use the existing `FirmaLayout` as the main authenticated dashboard shell. Preserve the current light neutral and dark-green visual language, Geist typography, Tailwind CSS v4, Lucide icons, responsive sidebar/header layout, and image assets in `public/images`. Reuse components from `components/ui` where possible. The app currently uses Zustand for persisted auth state and Dexie IndexedDB for local users, company, and onboarding data. Check the relevant route in `app/` and existing feature component in `features/` before changing UI. Do not replace working route guards or local data behavior without an explicit requirement. Add responsive loading, empty, and error states for new data-driven screens.
