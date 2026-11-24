# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Surma** is a tournament control application for assassination games (_salamurhapeli_) organized by Helsingin yliopiston salamurhapelaajat ry (a Finnish student association). The app manages:
- Player registration for tournaments
- Passwordless email authentication
- Tournament administration and player assignments
- Team games with ring-based hunting assignments
- Player status tracking (ALIVE, DEAD, DETECTIVE, EXTRA)
- Umpire management and player oversight
- Internationalization (Finnish & English)

Deployed at: https://surma.salamurhaajat.net

## Tech Stack

- **Frontend**: Next.js 15 + React 19 + TypeScript
- **Backend**: Next.js API routes
- **Database**: PostgreSQL with Prisma ORM
- **UI Framework**: Material-UI (MUI)
- **Authentication**: NextAuth.js v4 with passwordless email provider
- **Email**: AWS SES v2
- **Image Storage**: Cloudinary
- **Internationalization**: next-i18next (Finnish & English)
- **Testing**: Playwright
- **Form Handling**: Formik + Yup validation
- **CSS**: Emotion (emotion/react, emotion/styled) with CSS modules

## Development Commands

```bash
# Install dependencies
npm i

# Development server (runs on http://localhost:3000)
npm run dev

# Build for production
npm build

# Start production server
npm start

# Linting
npm run lint

# Run all tests
npm test

# Run specific test file
npx playwright test tests/filename.spec.ts

# Database setup
npx prisma db push              # Sync schema with database
npx prisma migrate dev          # Create and apply migration
npx prisma db seed              # Seed database with test data
npx prisma studio              # Open Prisma Studio UI

# Create admin user
npm run create-admin
```

## Environment Setup

Create a `.env` file in the root with:
- `POSTGRES_URL` – PostgreSQL connection string
- `NEXTAUTH_URL` – Application URL (e.g., http://localhost:3000 for dev)
- `NEXTAUTH_SECRET` – Random string for NextAuth session encryption
- `EMAIL_SERVER_HOST`, `EMAIL_SERVER_PORT`, `EMAIL_SERVER_USER`, `EMAIL_SERVER_PASSWORD` – Email configuration
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` – AWS SES credentials
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` – Cloudinary cloud name

## Architecture

### Authentication Flow
1. User enters email on landing page (`/pages/index.tsx`)
2. NextAuth sends magic link via email (configured in `/pages/api/auth/[...nextauth].ts`)
3. User clicks link → session created via Prisma adapter
4. Redirected to user page `/personal` with user data from session
5. SSL redirect middleware ensures HTTPS in production

### Database Schema
Core entities:
- **User**: Base user account (email-based)
- **Player**: In-tournament player with assignment data, calendar, and state
- **Tournament**: Event with start/end times and registration windows
- **Team**: Group of players (team game mode)
- **Assignment**: Hunter → Target relationship (ring-based)
- **AssignmentRing**: Container for assignments (allows multiple "rings" per tournament)
- **Umpire**: Tournament moderator with responsibility tracking

Key relationships:
- User → Player (one-to-one per tournament)
- Tournament contains Players, Teams, Umpires, Assignments
- Player states: ACTIVE (hunter + target), DEAD (out), DETECTIVE (special hunter), EXTRA

### Page Structure
```
pages/
├── index.tsx              # Landing page with tournament list & login
├── personal.tsx           # User profile (requires auth)
├── privacy.tsx            # Privacy policy (internationalized)
├── admin/                 # Admin routes (umpire functions)
│   └── create-tournament.tsx
├── tournaments/[tournamentId]/
│   ├── registration.tsx   # Player registration form
│   ├── umpire-page.tsx    # Admin dashboard
│   ├── users/[id].tsx     # Player detail page (calendar, info)
│   └── targets/[id].tsx   # Target information page
└── api/                   # API routes for CRUD operations
```

### Component Organization
```
components/
├── Common/                # Reusable UI (DateTimePicker, Markdown)
├── LandingPage/          # Tournament table, info accordion
├── Registration/         # User & team registration forms
├── PlayerPage/           # Desktop/mobile views, Calendar component
├── Admin/                # Admin tables (players, teams)
├── UmpirePage/           # Settings component
├── NavigationBar.tsx     # App header with locale switcher
├── Footer.tsx            # Footer (internationalized)
└── UserProvider.tsx      # User context provider
```

### API Routes (`/pages/api`)
- `/auth/[...nextauth].ts` – NextAuth configuration
- `/tournament/*` – Tournament CRUD (create, rings, assignments)
- `/player/*` – Player operations (create, state updates)
- `/team/*` – Team CRUD (create, team rings)
- `/user/create.ts` – User registration
- `/sign-cloudinary-params.ts` – Cloudinary upload signing

## Key Concepts

### Player State Machine
- **ACTIVE**: Normal player (can hunt and be hunted)
- **DEAD**: Eliminated from game (no longer hunted)
- **DETECTIVE**: Special investigator role with modified hunting rules
- **EXTRA**: Additional state for special cases

### Rings
Groups of assignments that can be triggered together. Allows umpires to release assignments in phases or manage separate competitive groups within a tournament.

### Calendar
Stored as JSON in `Player.calendar` field. Recent commits show ongoing improvements to the calendar component and persistence using localStorage.

## Recent Development Focus

- **Internationalization**: Strings being localized across Footer, Landing page, Registration, and Player pages (Finnish/English)
- **Calendar Component**: Recent refactoring of calendar data format and layout improvements; accordion states now saved to localStorage
- **Team Games**: Updates to team game components and assignment logic
- **Admin Features**: New admin user and tournament creation forms

## Important Notes

- **TypeScript**: Configured with `strict: false` for flexibility during refactoring
- **Locales**: Stored in `/public/locales` with next-i18next config at root
- **Prisma Adapter**: Uses `@next-auth/prisma-adapter` for session persistence
- **Form Validation**: Formik handles form state; Yup for schema validation
- **Player Colors**: Pre-defined palette in `lib/constants.ts` for player visualization
- **Feature Flags**: `lib/constants.ts` contains feature flags (e.g., `SHOW_TEAM_NAME`)
- **Tests**: Playwright test config at root; run with `npm test`

## Related Files by Purpose

| Purpose | Location |
|---------|----------|
| Database models | `prisma/schema.prisma` |
| Constants & enums | `lib/constants.ts` |
| Prisma client | `lib/prisma.ts` |
| Email sending | `lib/ses_mailer.ts` |
| Custom hooks | `lib/hooks.ts` |
| Component utilities | `components/utils.ts` |
| NextAuth config | `pages/api/auth/[...nextauth].ts` |
| Type definitions | `types/*.ts` |
| i18n config | `next-i18next.config.js` |
| Global styles | `styles/globals.css` |
