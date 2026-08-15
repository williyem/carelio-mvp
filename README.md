# Carelio (Frontend)

**Carelio** is a multi-role telehealth MVP for remote clinical care: doctors/admins, health assistants, and patients collaborate on invites, appointments, LiveKit video consultations, vitals capture, device guides, and AI-assisted clinical summaries.

|                  |                                            |
| ---------------- | ------------------------------------------ |
| **Live app**     | https://carelio.vercel.app/                |
| **API**          | https://carelio-server-gsh5.onrender.com   |
| **Backend repo** | https://github.com/williyem/carelio-server |
| **This repo**    | https://github.com/williyem/carelio-mvp    |

> CSCD602 Advanced Software Engineering — Henneh Kusi William (22427958). Development assisted with [Cursor](https://cursor.com).

## Roles

| Role                 | What they do                                                                                                          |
| -------------------- | --------------------------------------------------------------------------------------------------------------------- |
| **Admin / Doctor**   | Manage patients & team, schedule appointments, run live consults, configure device guides, view AI clinical summaries |
| **Health Assistant** | Support assigned patients, capture vitals, follow device guides during visits                                         |
| **Patient**          | Accept invites, view appointments, join video consults, review health records                                         |

## Demo accounts

| Role             | Identifier             | Password       |
| ---------------- | ---------------------- | -------------- |
| Admin (doctor)   | `admin@carelio.app`    | `Password123!` |
| Doctor           | `dr.smith@carelio.app` | `Password123!` |
| Health Assistant | `ha.jones@carelio.app` | `Password123!` |
| Patient          | `PAT-1001`             | `Password123!` |

No 2FA is required for these demo accounts. The Render free tier may cold-start (wait 30–60s on first API call).

## Stack

- **Next.js** (App Router) + TypeScript + React
- **Tailwind CSS** + shadcn/ui
- **TanStack Query** for server state
- **BFF** routes under `src/app/api/*` (proxy to Express API; cookies / auth)
- **LiveKit** for video consultations
- Deployed on **Vercel**

## Local setup

```bash
npm install
# create .env.local (see Environment below)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment

Create `.env.local` in the project root:

```bash
API_BASE_URL=http://localhost:4000
USE_DUMMY_DATA=false
```

| Variable         | Purpose                                                             |
| ---------------- | ------------------------------------------------------------------- |
| `API_BASE_URL`   | Backend base URL (local: `http://localhost:4000`, prod: Render URL) |
| `USE_DUMMY_DATA` | Set `false` to call the real API                                    |

Ensure the [carelio-server](https://github.com/williyem/carelio-server) backend is running (or pointed at production) with MongoDB and optional LiveKit / Resend / OpenRouter keys.

## Project layout (high level)

```
src/
  app/                 # App Router pages + BFF API routes
    (auth)/            # Login, password reset, 2FA flows
    dashboard/         # Doctor / admin
    health-assistant/  # HA workspace
    patient/           # Patient portal
    live-consultation/ # Video room
    api/               # Next.js BFF → Express
  components/          # UI + domain components
  integration/         # API client config & endpoints
  stores/              # Client state where used
```

## Scripts

```bash
npm run dev          # development server
npm run build        # production build
npm run lint         # ESLint
npm run format       # Prettier
npm test             # Vitest
```

## Related docs

Exam submission artefacts (SRS, testing report, user manual, etc.) live in the course submission folder, not this repository root.

## Licence / academic use

Submitted for CSCD602. Demo credentials are for examiner access only — rotate after the exam if the deployment remains public.
