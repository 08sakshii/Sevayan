# Seva – Project Structure & Complete Workflow

This document describes the folder structure, what each part does, and how the app works end-to-end.

---

## 1. Folder structure (high level)

```
Kimi_Agent_Seva/
├── SUPABASE_SETUP.md            # How to set up Supabase and .env
├── PROJECT_STRUCTURE_AND_WORKFLOW.md   # This file
├── app/                         # Frontend app (Vite + React)
│   ├── package.json             # App deps: React, Supabase, Radix UI, etc.
│   ├── vite.config.ts           # Vite config, @ alias → src
│   ├── .env / .env.example      # VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
│   └── src/
│       ├── main.tsx              # Entry: Supabase check → App or SetupRequired
│       ├── App.tsx               # Router + AuthProvider + Header/Footer + Routes
│       ├── App.css / index.css   # Global styles
│       ├── types/index.ts        # TypeScript types & MAHARASHTRA_CITIES
│       ├── constants/index.ts   # CATEGORIES (with icon, color), cities, routes, etc.
│       ├── lib/                  # Supabase client & utils
│       ├── hooks/                # useAuth, useEvents, use-mobile
│       ├── components/          # Layout + shared UI + EventCard, FilterBar
│       ├── pages/               # Route-level pages
│       └── sections/            # Home page sections (Hero, Categories, etc.)
└── supabase/
    ├── config.toml              # Supabase CLI config
    └── migrations/
        └── 20260201142301_initial_schema.sql   # Tables + RLS + seed categories
```

---

## 2. What each file contains

### 2.1 Entry & app shell

| File | Purpose |
|------|--------|
| **app/src/main.tsx** | Renders root. If Supabase is configured → `<App />`, else → `<SetupRequired />`. |
| **app/src/App.tsx** | Wraps app in `AuthProvider`, `Router`, then `Header` + main content + `Footer`. Defines all routes (see Routes table below). |
| **app/src/components/SetupRequired.tsx** | Shown when `VITE_SUPABASE_*` are missing. Tells user to create `.env` and run schema. |

### 2.2 Configuration & shared code

| File | Purpose |
|------|--------|
| **app/src/lib/supabase.ts** | Creates Supabase client from env; exports `supabase` and `isSupabaseConfigured()`. |
| **app/src/lib/utils.ts** | General helpers (e.g. `cn` for classnames). |
| **app/src/types/index.ts** | `User`, `Event`, `Category`, `Registration`, `EventFilters`, `EventFormData`, `LoginCredentials`, `RegisterData`, `OrganizerStats`, `MAHARASHTRA_CITIES`. |
| **app/src/constants/index.ts** | `CATEGORIES` (id, name, type, description, **icon**, **color**), `MAHARASHTRA_CITIES`, `CATEGORY_SUBTYPES`, `PLATFORM_STATS`, `STORAGE_KEYS`, `ROUTES`. **Note:** `icon` and `color` are frontend-only (not in DB). |

### 2.3 Auth & data hooks

| File | Purpose |
|------|--------|
| **app/src/hooks/useAuth.tsx** | Context provider. Fetches profile from `users` by session; exposes `user`, `login`, `register`, `logout`, `isAuthenticated`, `isOrganizer`. Maps DB `created_at` → `createdAt`. |
| **app/src/hooks/useEvents.tsx** | All event/registration API: `getUpcomingEvents`, `getEventById`, `getOrganizerEvents`, `registerForEvent`, `getUserRegistrations`, `getEventParticipants`, `createEvent`, `updateEvent`, `deleteEvent`. Maps DB snake_case (e.g. `category_id`, `map_link`) to camelCase in types. |
| **app/src/hooks/use-mobile.ts** | Detects mobile viewport (for UI behavior). |

### 2.4 Layout components

| File | Purpose |
|------|--------|
| **app/src/components/Header.tsx** | Fixed top nav: logo, Home/Events, auth dropdown (Dashboard or My Profile, Logout) or Login/Register. Uses `useAuth`. |
| **app/src/components/Footer.tsx** | Site footer: about, quick links, category links, contact. Uses `CATEGORIES` and `Link`. |

### 2.5 Shared UI components

| File | Purpose |
|------|--------|
| **app/src/components/EventCard.tsx** | Card for one event: image, category badge (from `CATEGORIES` by `event.categoryId`), date, duration, city, org, “View Details” → `/events/:id`. |
| **app/src/components/FilterBar.tsx** | Category, city, date filters + optional search field. Syncs with URL via parent. Uses `CATEGORIES`, `MAHARASHTRA_CITIES`, `EventFilters`. |
| **app/src/components/ui/** | Radix-based primitives: button, card, input, select, dialog, tabs, etc. Used across pages. |

### 2.6 Pages (route-level)

| Route | File | Purpose |
|-------|------|--------|
| `/` | **Home.tsx** | Composes Hero, Categories, FeaturedEvents, HowItWorks. |
| `/events` | **Events.tsx** | Upcoming events list; reads URL params for filters; uses FilterBar + EventCard grid; data from `getUpcomingEvents(filters)`. |
| `/events/:id` | **EventDetail.tsx** | Single event: image, description, details, map link, “Register” (calls `registerForEvent`). |
| `/login` | **Login.tsx** | Email/password form; calls `login()`; redirects to `from` or `/`. |
| `/register` | **Register.tsx** | Name, email, password, role (USER/ORGANIZER); calls `register()`; inserts into `auth.users` + `public.users`. |
| `/profile` | **Profile.tsx** | Logged-in user: sidebar (name, email, role, stats), “My Events” tabs (upcoming/past) from `getUserRegistrations`. |
| `/organizer` | **OrganizerDashboard.tsx** | Organizer only: stats (total/upcoming/past events, participants), tabs of upcoming/past events; View/Edit/Delete; Create Event button. |
| `/organizer/events/create` | **CreateEvent.tsx** | Form: name, category, description, date, duration, city, location, map link, org name, image URL. Calls `createEvent()`. |
| `/organizer/events/:id/edit` | **EditEvent.tsx** | Same fields as create; loads event by id, checks ownership and not past; calls `updateEvent()`. |

### 2.7 Home page sections

| File | Purpose |
|------|--------|
| **sections/Hero.tsx** | Hero with CTA “Explore Events” and “Register as Organizer”. |
| **sections/Categories.tsx** | Grid of category cards from `CATEGORIES` (uses **icon** and **color**); click → `/events?category=<id>`. |
| **sections/FeaturedEvents.tsx** | First 6 upcoming events via `getUpcomingEvents()`; uses `EventCard`; “View All” → `/events`. |
| **sections/HowItWorks.tsx** | Static 3 steps: Discover, Register, Participate. |

### 2.8 Database (Supabase)

| Item | Purpose |
|------|--------|
| **supabase/migrations/20260201142301_initial_schema.sql** | Creates `users`, `categories`, `events`, `registrations`; RLS policies; seed data for categories. |
| **DB tables** | `users` (id, name, email, role, created_at), `categories` (id, name, type, description), `events` (id, name, description, date, duration, city, location, map_link, image, organization_name, created_by, category_id, created_at), `registrations` (id, user_id, event_id, registration_date). |

---

## 3. Complete workflow

### 3.1 App startup

1. **main.tsx**  
   - Imports `isSupabaseConfigured()` from `lib/supabase`.  
   - If not configured → render **SetupRequired**.  
   - If configured → render **App** inside `StrictMode`.

2. **App.tsx**  
   - **AuthProvider** wraps the app (subscribes to Supabase auth, loads `users` profile).  
   - **Router** wraps **Header** + main content + **Footer**.  
   - **Routes** define which page component renders for each path.

3. **Header**  
   - Reads `user`, `isAuthenticated`, `isOrganizer` from **useAuth** and shows nav + auth buttons or dropdown.

### 3.2 Anonymous user

- **Home:** Hero, Categories (link to filtered events), Featured Events (from Supabase), How it works.  
- **Events:** FilterBar (category, city, date) + grid of EventCards from `getUpcomingEvents(filters)`.  
- **Event detail:** View event; “Register” sends to Login (with return path).  
- **Login / Register:** Standard forms; after success, redirect and Header shows user menu.

### 3.3 Volunteer (role USER)

- Same as anonymous, plus:  
  - **Profile:** “My Events” from `getUserRegistrations(user.id)` (upcoming/past).  
  - **Event detail:** “Register” calls `registerForEvent(user.id, eventId)` (insert into `registrations`).  
- Header: My Profile, Logout.

### 3.4 Organizer (role ORGANIZER)

- **Organizer dashboard:**  
  - Stats from `getOrganizerEvents(user.id)` and `getEventParticipants` per event.  
  - Tabs: upcoming / past events; View, Edit, Delete.  
- **Create event:** Form → `createEvent(...)` (insert into `events` with `created_by = user.id`).  
- **Edit event:** Load by id, check owner and not past → `updateEvent(id, ...)`.  
- **Delete:** `deleteEvent(id)`.  
- Header: Dashboard, Logout.

### 3.5 Data flow (summary)

- **Auth:** Supabase Auth (sign up / sign in) + `public.users` row. **useAuth** keeps session and profile in context.  
- **Events:** All reads/writes go through **useEvents** (Supabase `events` table). Filters (category, city, date) applied in `getUpcomingEvents`.  
- **Registrations:** **useEvents** `registerForEvent`, `getUserRegistrations`, `getEventParticipants` use `registrations` table.  
- **Categories:** Seed data in DB; UI uses **constants/CATEGORIES** (with extra `icon` and `color` for badges/icons).  

---

## 4. Routing summary

| Path | Component | Auth |
|------|-----------|------|
| `/` | Home | Public |
| `/events` | Events | Public |
| `/events/:id` | EventDetail | Public (Register needs login) |
| `/login` | Login | Public |
| `/register` | Register | Public |
| `/profile` | Profile | User (redirect if not logged in) |
| `/organizer` | OrganizerDashboard | Organizer only |
| `/organizer/events/create` | CreateEvent | Organizer only |
| `/organizer/events/:id/edit` | EditEvent | Organizer only (own event) |

---

## 5. Icons and badges (where they come from)

- **Categories (cards, badges):**  
  - **constants/index.ts** – each category has `icon` (e.g. `'Sparkles'`, `'TreePine'`, `'Heart'`) and `color` (hex).  
  - **sections/Categories.tsx** – maps `icon` to Lucide component (`iconMap`), uses `color` for background and icon.  
  - **EventCard.tsx** – category badge uses `CATEGORIES.find(c => c.id === event.categoryId)` and `category?.color`, `category?.name`.  
  - **Profile / OrganizerDashboard** – same: badge uses `category?.color` and `category?.name`.  
- **Database:** `categories` table has only `id`, `name`, `type`, `description`. No `icon` or `color` in DB; those are frontend-only in constants.

---

## 6. Scripts

- **Root:** `npm run dev` → `cd app && npm run dev` (Vite dev server).  
- **Root:** `npm run build` → build app.  
- **Root:** `supabase:start | stop | status` → local Supabase.  
- **App:** `npm run dev` (Vite), `npm run build` (tsc + vite build), `npm run preview` (preview build).

---

## 7. Summary

- **Frontend:** React + Vite + TypeScript; `@/` → `app/src/`.  
- **Backend:** Supabase (Auth + Postgres).  
- **State:** Auth and session in **useAuth**; events/registrations in **useEvents** (no global store).  
- **UI:** Radix components in `components/ui`; layout in Header/Footer; pages in `pages/`; home sections in `sections/`.  
- **Icons/badges:** Category icons and colors come from **constants** (`CATEGORIES`), not from the database.

This is the complete folder structure, what each file contains, and how the app and workflows work.
