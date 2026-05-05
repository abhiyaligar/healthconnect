# Implementation Plan & Build Sequence (IMPLEMENTATION_PLAN.md)

---

## Overview

**Project**: MediSync — Appointment Overbooking Stabilizer
**Approach**: Iterative, backend-first with real-time integration
**Strategy**:
- Build core data model → then logic → then real-time → then UI
- Validate each layer before moving forward

---

## Phase 1: Project Setup & Foundation

### Step 1.1: Initialize Repositories
- **Goal**: Clean project structure
- **Tasks**:
  ```bash
  # frontend
  npm create vite@5.1.0 frontend
  # backend
  mkdir backend && cd backend
  python -m venv venv
  ```
- **Success Criteria**:
  - Frontend + backend folders created
  - Git initialized

### Step 1.2: Backend Setup (FastAPI Core)
- **Tasks**:
  - Install dependencies:
    ```bash
    pip install fastapi==0.110.0 uvicorn==0.27.1 sqlalchemy==2.0.25 asyncpg==0.29.0 alembic==1.13.1 redis==5.0.1 python-jose passlib
    ```
  - Create structure:
    ```text
    app/
     ├── main.py
     ├── core/
     ├── models/
     ├── schemas/
     ├── services/
     ├── api/
    ```
- **Success Criteria**:
  - Server runs at `/docs`
  - Health endpoint works

### Step 1.3: Database Setup
- **Tasks**:
  - Setup PostgreSQL
  - Configure SQLAlchemy
  - Initialize Alembic
- **Success Criteria**:
  - DB connected
  - Migration runs successfully

---

## Phase 2: Core Data Layer

### Step 2.1: Implement Database Models
- **Tables to implement first**:
  - `users`
  - `patients`
  - `doctors`
  - `appointments`
- **Then**:
  - `queue_entries`
  - `conflicts`
  - `reschedule_logs`
  - `fatigue_logs`
- **Success Criteria**:
  - All tables created via migration
  - Relationships verified

### Step 2.2: Seed Data
- **Tasks**:
  - Create dummy doctors
  - Create test patients
- **Success Criteria**:
  - System usable without UI

---

## Phase 3: Core Business Logic

### Step 3.1: Appointment Service
- **Tasks**:
  - Create appointment endpoint
  - Handle overbooking flag
- **Success Criteria**:
  - Appointment creation works
  - Overbooked slots allowed

### Step 3.2: Queue Engine
- **Tasks**:
  - Insert into queue
  - Maintain ordering
  - Compute `priority_score`
- **Success Criteria**:
  - Queue returns ordered list

### Step 3.3: Conflict Detection
- **Tasks**:
  - Detect Overcapacity
  - Detect Double booking
- **Success Criteria**:
  - Conflicts stored in DB

### Step 3.4: Conflict Resolver
- **Tasks**:
  - Implement Ranking logic
  - Implement Rescheduling logic
- **Success Criteria**:
  - Conflict resolves correctly

### Step 3.5: Scheduling Engine
- **Tasks**:
  - Implement priority formula
  - Integrate fatigue
- **Success Criteria**:
  - Correct patient ordering

---

## Phase 4: Real-Time System

### Step 4.1: WebSocket Setup
- **Tasks**:
  - Add WebSocket route
  - Broadcast events
- **Success Criteria**:
  - Client receives updates

### Step 4.2: Redis Integration
- **Tasks**:
  - Cache queue
  - Pub/Sub for events
- **Success Criteria**:
  - Real-time updates stable

---

## Phase 5: Frontend Core

### Step 5.1: Setup UI Framework
- **Tasks**:
  - Install Tailwind
  - Setup routing

### Step 5.2: Patient Booking UI
- **Tasks**:
  - Specialty → Doctor → Slot flow
- **Success Criteria**:
  - Booking works end-to-end

### Step 5.3: Reception Dashboard
- **Tasks**:
  - Queue panel
  - Conflict panel
  - Actions
- **Success Criteria**:
  - Real-time queue visible

### Step 5.4: Doctor Panel
- **Tasks**:
  - Schedule
  - Fatigue indicator

---

## Phase 6: Integration

### Step 6.1: Connect Frontend ↔ Backend
- **Tasks**:
  - API integration
  - WebSocket integration

### Step 6.2: Real-Time Testing
- **Scenarios**:
  - Multiple bookings
  - Conflict trigger
  - Reschedule

---

## Phase 7: Edge Cases & Stability

### Step 7.1: Concurrency Handling
- **Tasks**:
  - DB transactions
  - Prevent double booking

### Step 7.2: Cancellation Storm Simulation
- **Tasks**:
  - Simulate burst cancellations

### Step 7.3: Error Handling
- **Tasks**:
  - API errors
  - UI fallback states

---

## Phase 8: Optimization

### Step 8.1: Performance
- Optimize queries
- Add indexes

### Step 8.2: UI Optimization
- Virtualize queue
- Reduce re-renders

---

## Phase 9: Finalization

### Step 9.1: Testing
- Unit tests (core logic)
- Integration tests

### Step 9.2: Deployment
- Backend → Railway/Render
- Frontend → Vercel

### Step 9.3: Demo Preparation
- **Prepare**:
  - Overbooking scenario
  - Conflict resolution demo
  - Real-time queue

---

## Build Order Summary (Critical)

1. Backend setup
2. Database models
3. Appointment logic
4. Queue engine
5. Conflict system
6. WebSocket
7. Frontend UI
8. Integration
9. Optimization

---

## Critical Warnings

- **Do NOT build UI first** → will break architecture
- **Do NOT skip queue engine** → core system depends on it
- **Do NOT implement ML** → use heuristics for MVP
- **Do NOT skip transactions** → concurrency bugs guaranteed

---

## Final State After Completion

You will have:
- Real-time scheduling system
- Conflict-aware booking
- Intelligent rescheduling
- Production-ready architecture (MVP scale)
