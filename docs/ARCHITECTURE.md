# System Architecture

## Overview
HealthConnect is built on a **Modular Monolith** architecture using FastAPI. It is designed to handle high concurrency and dynamic rescheduling using a "Learning Scheduler" model.

## Core Modules

### 1. Scheduling Engine (Phase 1)
Handles the lifecycle of slots and appointments. 
- **Dynamic Tracking**: Captures real-time "Call" and "Complete" events to measure doctor efficiency.
- **Resource Management**: Decouples `Slots` (time blocks) from `Appointments` (bookings) to support controlled overbooking.

### 2. The Stabilizer (Conflict Resolver - Phase 2)
The "Brain" of the system. It dynamically adjusts the schedule when a doctor runs behind schedule or a slot is overbooked. It uses the **Rolling Average Consultation Time** (calculated from Phase 1 data) to predict future conflicts.

### 3. Real-time Engine (Phase 3)
- **Supabase Realtime**: Leverages Postgres change data capture (CDC) to push live status updates (`IN_PROGRESS`, `BUMPED`) to frontends.
- **Wait Time Predictor**: Calculates live ETA based on current average consultation times and queue depth.

### 4. Domain & Resource Management
Handles doctor profiles, patient medical records, and notification routing.

## Infrastructure
- **API**: FastAPI (Python)
- **Database**: PostgreSQL (Supabase)
- **Real-time**: Supabase Realtime (WebSockets)
- **File Storage**: Supabase Storage
