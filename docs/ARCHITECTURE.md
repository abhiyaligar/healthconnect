# Architecture Overview

HealthConnect is built on a **Learning Scheduler** architecture, which minimizes overbooking by adapting to real-world consultation speeds.

## Core Layers

1.  **Identity & Profile Layer**: Manages the persistent data for Doctors and Patients, including historical performance metrics and priority flags.
2.  **Tracking & Analytics Layer**: Captures real-time consultation durations and calculates a **Rolling Average (last 10)** to feed into the scheduler.
3.  **The Stabilizer (Phase 2)**: Resolves overbooked slots by adjusting future appointments based on the doctor's current pace.

## Data Flow (Intelligence)

1.  **Event**: Doctor clicks "Complete Consultation".
2.  **Capture**: System records `actual_end_time` and calculates `duration`.
3.  **Analyze**: `AnalyticsService` fetches the last 10 records and updates `DoctorProfile.avg_consultation_time`.
4.  **Feedback**: Future bookings for this doctor use the updated average for more accurate slot sizing.

## Tech Stack
- **Backend**: FastAPI (Python)
- **Database**: PostgreSQL (Supabase)
- **ORM**: SQLAlchemy 2.0
- **Migrations**: Alembic
- **Real-time**: Supabase Realtime (Planned)
