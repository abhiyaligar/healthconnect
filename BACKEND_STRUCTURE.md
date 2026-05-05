# Backend Architecture & Database Structure (BACKEND_STRUCTURE.md)

---

## 1. Architecture Overview

### System Architecture
- **Pattern**: REST + WebSocket hybrid
- **Type**: Modular Monolith
- **Core Modules**:
  - Appointment Service
  - Queue Engine
  - Conflict Resolver
  - Scheduling Engine
  - Doctor Management
  - Notification System

### Data Flow
```text
Client (React)
   ↓ REST (CRUD)
FastAPI
   ↓
Business Logic Layer
   ↓
PostgreSQL (source of truth)
   ↓
Redis (cache + pub/sub)
   ↓
WebSocket push → Client
```

### Key Architectural Decisions
- **PostgreSQL** = authoritative state
- **Redis** = transient + real-time coordination
- **WebSockets** = live updates
- **Scheduling logic** = backend (not frontend)

---

## 2. Database Schema

### Naming Convention
- `snake_case`
- UUID primary keys
- `timestamps` on all tables

### Core Entities Overview
- `users`
- `doctors`
- `patients`
- `appointments`
- `queue_entries`
- `conflicts`
- `reschedule_logs`
- `doctor_availability`
- `fatigue_logs`
- `system_events`

---

## 3. Tables & Relationships

### Table: `users`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK | User ID |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | Login |
| `password_hash` | TEXT | NOT NULL | Hashed password |
| `role` | ENUM('admin','reception','doctor') | NOT NULL | Role |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Created |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Updated |

### Table: `patients`
| Column | Type | Constraints |
| :--- | :--- | :--- |
| `id` | UUID | PK |
| `name` | VARCHAR(255) | NOT NULL |
| `phone` | VARCHAR(20) | NOT NULL |
| `priority` | ENUM('P1','P2','P3') | NOT NULL |
| `created_at` | TIMESTAMP | DEFAULT NOW() |

### Table: `doctors`
| Column | Type | Constraints |
| :--- | :--- | :--- |
| `id` | UUID | PK |
| `name` | VARCHAR(255) | NOT NULL |
| `specialization` | VARCHAR(255) | NOT NULL |
| `max_daily_capacity` | INT | NOT NULL |
| `fatigue_threshold` | INT | DEFAULT 80 |
| `created_at` | TIMESTAMP | DEFAULT NOW() |

### Table: `doctor_availability`
| Column | Type |
| :--- | :--- |
| `id` | UUID |
| `doctor_id` | UUID (FK) |
| `start_time` | TIMESTAMP |
| `end_time` | TIMESTAMP |

### Table: `appointments`
| Column | Type | Constraints |
| :--- | :--- | :--- |
| `id` | UUID | PK |
| `patient_id` | UUID | FK |
| `doctor_id` | UUID | FK |
| `slot_time` | TIMESTAMP | NOT NULL |
| `status` | ENUM('scheduled','completed','cancelled','rescheduled') | |
| `is_overbooked` | BOOLEAN | DEFAULT FALSE |
| `created_at` | TIMESTAMP | |

### Table: `queue_entries`
| Column | Type | Constraints |
| :--- | :--- | :--- |
| `id` | UUID | PK |
| `appointment_id` | UUID | FK |
| `position` | INT | NOT NULL |
| `priority_score` | FLOAT | NOT NULL |
| `status` | ENUM('waiting','called','done','no_show') | |
| `created_at` | TIMESTAMP | |

### Table: `conflicts`
| Column | Type |
| :--- | :--- |
| `id` | UUID |
| `doctor_id` | UUID |
| `slot_time` | TIMESTAMP |
| `severity` | ENUM('low','medium','high') |
| `status` | ENUM('open','resolved') |
| `created_at` | TIMESTAMP |

### Table: `reschedule_logs`
| Column | Type |
| :--- | :--- |
| `id` | UUID |
| `appointment_id` | UUID |
| `old_time` | TIMESTAMP |
| `new_time` | TIMESTAMP |
| `reason` | TEXT |
| `created_at` | TIMESTAMP |

### Table: `fatigue_logs`
| Column | Type |
| :--- | :--- |
| `id` | UUID |
| `doctor_id` | UUID |
| `fatigue_score` | INT |
| `recorded_at` | TIMESTAMP |

### Table: `system_events`
| Column | Type |
| :--- | :--- |
| `id` | UUID |
| `event_type` | VARCHAR |
| `payload` | JSONB |
| `created_at` | TIMESTAMP |

---

## 4. Scheduling Engine (Core Logic)

### Priority Score Formula
```text
score = (priority_weight)
      + (waiting_time * w1)
      - (reschedule_penalty * w2)
```
**Where:**
- `P1` > `P2` > `P3`
- `waiting_time` increases score
- `rescheduling` reduces score

### Conflict Detection Rules
- Over capacity → **conflict**
- Same doctor overlapping → **conflict**
- Fatigue threshold exceeded → **soft conflict**

### Resolution Strategy
1. Identify affected appointments
2. Rank by lowest `priority_score`
3. Move lowest score first
4. Minimize total reschedules

---

## 5. API Endpoints

### POST `/api/appointments`
**Purpose**: Create appointment
**Request**:
```json
{
  "patient_id": "uuid",
  "doctor_id": "uuid",
  "slot_time": "2026-05-05T10:00:00Z"
}
```

### GET `/api/queue`
**Returns**: ordered queue

### POST `/api/conflicts/resolve`
**Request**:
```json
{
  "conflict_id": "uuid",
  "mode": "auto" | "manual"
}
```

### POST `/api/appointments/reschedule`
*(Reschedule specific appointment)*

---

## 6. WebSocket Events

### Event: `queue_update`
```json
{
  "type": "queue_update",
  "data": [...]
}
```

### Event: `conflict_detected`
```json
{
  "type": "conflict",
  "severity": "high"
}
```

### Event: `fatigue_alert`
```json
{
  "doctor_id": "...",
  "fatigue": 85
}
```

---

## 7. Authentication & Authorization

### JWT Payload
```json
{
  "sub": "user_id",
  "role": "reception"
}
```

### Access Levels
- **Public** → booking
- **Reception** → queue + conflicts
- **Doctor** → schedule
- **Admin** → analytics

---

## 8. Caching Strategy

### Redis Usage
- `queue:{doctor_id}`
- `conflict:{id}`
- `session:{user}`

### TTL
- **Queue**: 30 sec
- **Sessions**: 7 days

---

## 9. Rate Limiting
- **Booking**: 10/min
- **Login**: 5/min
- **API**: 100/min

---

## 10. Migration Strategy
- Alembic migrations only
- No manual DB edits

---

## 11. Backup Strategy
- Daily backup
- 30-day retention

---

## 12. API Versioning
- `/api/v1/`

---

## Critical Evaluation
This backend:
- Supports real-time scheduling
- Encodes conflict resolution logic
- Handles concurrency correctly (with DB + Redis)
- Matches your UI behavior
