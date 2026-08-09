# CloudCast — Weather Dashboard

**URL**: [https://cloudcast.lovable.app/](https://cloudcast.lovable.app/)

CloudCast is a modern, feature-rich weather dashboard built with React, TypeScript, and Supabase. It provides real-time weather data, forecasts, and a personalized user experience.

---

## Features

- **Real-time Weather** — Search any city or use geolocation for current conditions
- **5-Day Forecast** — Hourly and daily forecast charts powered by Recharts
- **User Authentication** — Email/password and Google OAuth via Supabase Auth
- **Password Strength Meter** — Real-time feedback on signup password security
- **User Dashboard** — Favorite cities, search history, and preference management
- **Temperature Toggle** — Switch between Celsius and Fahrenheit
- **Dark/Light Theme** — Persistent theme preference
- **Voice Search** — Search for cities using voice input
- **Offline Support** — Cached weather data available offline
- **Responsive Design** — Works on desktop, tablet, and mobile

## Recent Changes

### Auth Page Readability Fix
- Added a semi-transparent overlay (`bg-background/60`) with `backdrop-blur-sm` behind the auth forms to prevent text from blending into the gradient background.
- Auth card uses glassmorphism styling (`backdrop-blur-md bg-card/80 border-white/20`) for improved contrast and readability.

### Input Focus Bug Fix
- Moved the `PasswordInput` component definition **outside** of the `Auth` component to prevent React from re-mounting the input on every keystroke, which was causing the text box to lose focus after typing a single character.

### Signup Database Error Fix
- Updated the `handle_new_user` Supabase trigger function to use `SECURITY DEFINER`, allowing it to bypass Row-Level Security (RLS) when creating initial `user_preferences` records during signup.

---

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui
- **Backend**: Supabase (Auth, Database, Edge Functions)
- **Charts**: Recharts
- **Routing**: React Router v6
- **State**: TanStack React Query

## Getting Started

```sh
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to the project directory
cd <YOUR_PROJECT_NAME>

# Install dependencies
npm install

# Start the development server
npm run dev
```

## Environment Variables

The app requires the following environment variables (see `.env`):

| Variable | Description |
|---|---|
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/public key |
| `VITE_SUPABASE_PROJECT_ID` | Supabase project ID |

## Project Structure

```
src/
├── components/       # Reusable UI components
├── hooks/            # Custom React hooks
├── integrations/     # Supabase client & types
├── pages/            # Route pages (Index, Auth, Dashboard, etc.)
├── services/         # API services (weatherApi)
├── types/            # TypeScript type definitions
└── utils/            # Utility functions
supabase/
├── functions/        # Edge Functions (weather-proxy)
└── migrations/       # Database migrations
```
