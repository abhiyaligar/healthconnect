# Technology Stack Documentation

## 1. Stack Overview

**Last Updated**: 2026-05-05
**Architecture**: Modular Monolith with Serverless Realtime (Supabase)

---

## 2. Frontend Stack

### Core Framework
- **Framework**: React
- **Version**: 18.2.0
- **Documentation**: https://react.dev
- **License**: MIT
- **Reason**: Component-based architecture, Real-time UI handling, Strong ecosystem

### Build Tool
- **Tool**: Vite
- **Version**: 5.1.0
- **Reason**: Fast dev server, Lightweight vs CRA

### Language
- **Language**: TypeScript
- **Version**: 5.3.3
- **Reason**: Type safety for complex state (queue, scheduling), Prevents runtime bugs

### Styling
- **Framework**: Tailwind CSS
- **Version**: 3.4.1
- **Reason**: Matches UI design, Rapid iteration, Utility-first consistency

### State Management
- **Library**: Zustand
- **Version**: 4.5.2
- **Reason**: Minimal boilerplate, Good for real-time UI state
- **Alternatives Rejected**: Redux (overhead), Context API (performance limits)

### Data Fetching / Server State
- **Library**: @tanstack/react-query
- **Version**: 5.17.19
- **Reason**: Cache + sync API data, Handles stale data

### WebSocket Client
- **Library**: native WebSocket API
- **Reason**: Lightweight, No abstraction needed

### Form Handling
- **Library**: React Hook Form
- **Version**: 7.49.3
- **Validation**: Zod 3.22.4

### HTTP Client
- **Library**: Axios
- **Version**: 1.6.5

### UI Utilities
- **Icons**: lucide-react 0.312.0

---

## 3. Backend Stack

### Runtime
- **Platform**: Python
- **Version**: 3.11.8
- **Reason**: Async support, FastAPI compatibility

### Framework
- **Framework**: FastAPI
- **Language**: Python 3.11+
- **ORM**: SQLAlchemy 2.0 (Sync/Async capable)
- **Database**: PostgreSQL (Supabase)
- **Real-time Engine**: Supabase Realtime (Replaces custom WebSockets/Redis for high-speed queue updates)
- **File Storage**: Supabase Storage (Buckets for prescriptions/profiles)

---

## 7. Environment Variables

```bash
# Database
DATABASE_URL=postgresql+asyncpg://...

# Redis
REDIS_URL=redis://localhost:6379

# Auth
JWT_SECRET=super_secret_key
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15

# App
ENV=development
API_BASE_URL=http://localhost:8000
```

---

## 8. Scripts

### Frontend
```json
{
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "lint": "eslint .",
  "format": "prettier --write ."
}
```

### Backend
```bash
uvicorn app.main:app --reload
alembic upgrade head
```

---

## 9. Dependencies Lock

### Frontend
```json
{
  "react": "18.2.0",
  "react-dom": "18.2.0",
  "typescript": "5.3.3",
  "vite": "5.1.0",
  "tailwindcss": "3.4.1",
  "zustand": "4.5.2",
  "@tanstack/react-query": "5.17.19",
  "react-hook-form": "7.49.3",
  "zod": "3.22.4",
  "axios": "1.6.5",
  "lucide-react": "0.312.0"
}
```

### Backend
```json
{
  "fastapi": "0.110.0",
  "uvicorn": "0.27.1",
  "sqlalchemy": "2.0.25",
  "alembic": "1.13.1",
  "redis": "5.0.1",
  "python-jose": "3.3.0",
  "passlib": "1.7.4",
  "asyncpg": "0.29.0"
}
```

---

## 10. Security Considerations

### Authentication
- JWT (short-lived tokens)
- HTTP-only cookies (recommended in prod)

### Passwords
- bcrypt hashing (12 rounds)

### Rate Limiting
- Redis-based

---

## 11. Version Upgrade Policy

### Major Updates
- Quarterly review
- Test in staging

### Minor Updates
- Monthly

### Breaking Changes
- Must be documented before update

---

## Critical Notes
This stack is:
- Fully aligned with your system complexity
- Real-time capable
- Scalable beyond MVP
- Avoids unnecessary complexity (no microservices yet)
