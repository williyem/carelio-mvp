# Dummy Data

JSON fixtures for local development and exam demos. When `USE_DUMMY_DATA=true` (default), all API routes serve data from these files instead of the remote backend.

## Switching to the real backend

1. Set `USE_DUMMY_DATA=false` in `.env`
2. Set `API_BASE_URL` to your backend URL
3. No frontend code changes required — the same API routes proxy to the backend

## Demo credentials

| Field    | Value                  |
| -------- | ---------------------- |
| Email    | `dr.smith@carelio.app` |
| Password | `Password123!`         |

## File structure

| File                      | Description                                           |
| ------------------------- | ----------------------------------------------------- |
| `auth.json`               | Login credentials and token placeholders              |
| `doctor.json`             | Logged-in doctor profile                              |
| `patients.json`           | Patient records                                       |
| `appointments.json`       | Appointments with embedded patient/telehealth data    |
| `consultation-notes.json` | SOAP notes / health records                           |
| `vitals.json`             | Vitals readings per appointment                       |
| `stats.json`              | Dashboard statistics                                  |
| `health-assistants.json`  | Health assistant staff                                |
| `devices.json`            | Medical device list (no React icons — mapped in code) |

## Data relationships

```
doctor (doc-001)
  └── patients (pat-001 … pat-005)
        └── appointments (apt-001 … apt-008)
              ├── consultation-notes
              ├── vitals
              └── telehealth tokens
```

Loaded by `src/lib/dummy-data/loader.ts`.
