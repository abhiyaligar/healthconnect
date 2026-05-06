# Technology Stack

**Project**: HealthConnect  
**Architecture**: Modular Monolith with Serverless Auth & Storage  
**Last Updated**: 2026-05-06

---

## Frontend

| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 18.2.0 | Component-based UI framework |
| TypeScript | 5.3.3 | Type safety for complex state (queue, scheduling) |
| Vite | 5.1.0 | Fast dev server and build tool |
| Tailwind CSS | 3.4.1 | Utility-first styling |
| React Router | 6.x | Client-side routing with role-based protection |
| Axios | 1.6.5 | HTTP client for API calls |
| lucide-react | 0.312.0 | Icon library |
| clsx + tailwind-merge | — | Dynamic class composition |

### State Management
- **Auth state**: Custom `AuthContext` (`useAuth` hook) — stores token, role, user profile
- **Server data**: Direct `api.get()` calls inside component `useEffect` hooks — no React Query in current implementation

### Frontend Scripts
```bash
npm run dev      # Start dev server → http://localhost:5173
npm run build    # Production bundle
npm run preview  # Preview production build locally
```

---

## Backend

| Technology | Version | Purpose |
|-----------|---------|---------|
| Python | 3.11+ | Runtime |
| FastAPI | 0.110.0 | REST API framework |
| Uvicorn | 0.27.1 | ASGI server |
| SQLAlchemy | 2.0 | ORM (synchronous session) |
| Alembic | 1.13.1 | Database migrations |
| Pydantic | v2 | Request/response validation and serialization |
| supabase-py | — | Supabase Auth and Storage client |

### Backend Scripts
```bash
uvicorn main:app --reload     # Start dev server → http://localhost:8000
alembic upgrade head          # Apply latest migrations
alembic revision --autogenerate -m "description"  # Generate migration
pytest                        # Run test suite
```

---

## Infrastructure

| Service | Purpose |
|---------|---------|
| Supabase (PostgreSQL) | Primary relational database |
| Supabase Auth | JWT-based identity and role management |
| Supabase Storage | S3-compatible file storage for medical records |
| SMTP (Gmail / Custom) | Transactional email — OTP & notifications |

---

## Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# Supabase
SUPABASE_URL=https://<project-id>.supabase.co
SUPABASE_KEY=<anon-public-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-secret-key>

# SMTP (Email)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@email.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@healthconnect.com
```

> ⚠️ `SUPABASE_SERVICE_ROLE_KEY` must **never** be exposed to the frontend or committed to version control. It is used exclusively by the backend for admin-level user creation and password resets.

---

## Security Decisions

| Area | Approach |
|------|----------|
| Auth | Supabase JWT — short-lived tokens, validated per request |
| Password Reset | 6-digit OTP via SMTP, 10-min expiry, single-use (`is_used` flag) |
| Role Enforcement | Role stored in Supabase `user_metadata`, checked server-side per route |
| Admin Actions | Require `SUPABASE_SERVICE_ROLE_KEY` — not the anon key |
| CORS | `allow_origins=["*"]` in development — **must restrict in production** |
| Medical Data | Access-controlled: only the patient or their assigned doctor can view records |

---

## Version Upgrade Policy

- **Major updates**: Quarterly review; test in staging environment first
- **Minor updates**: Monthly, no breaking changes expected
- **Breaking changes**: Must be documented in CHANGELOG before applying

---

## Notes

- The project does **not** currently use Redis or WebSockets. Supabase Realtime is available but queue polling (`setInterval(fetchData, 10000)`) is used in `QueuePanel.tsx` for simplicity.
- The frontend does **not** currently use React Query or Zustand — state is managed via React `useState` / `useContext`.
- `react-hook-form` and `zod` are listed as dependencies but not yet broadly used; form handling is currently done with controlled inputs.
