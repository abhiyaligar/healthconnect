# System Architecture

## Overview
HealthConnect is built on a **Modular Monolith** architecture using FastAPI. It is designed to handle high concurrency, specifically "cancellation storms" and appointment overbooking.

## Core Modules

### 1. Appointment Service
Handles the lifecycle of an appointment (Booking, Cancellation, Completion).

### 2. Queue Engine
Manages the real-time order of patients. Uses a combination of PostgreSQL for persistence and (optionally) Redis for low-latency lookups.

### 3. Conflict Resolver
The "Brain" of the system. When a doctor is overbooked or a cancellation occurs, this module dynamically adjusts the schedule based on:
- Patient Priority (Emergency vs. Routine)
- Time of Booking (Fairness)
- Doctor Fatigue

### 4. Doctor Management
Tracks doctor availability, specialties, and fatigue levels to prevent burnout.

## Real-time Communication
- **WebSockets**: Used for pushing live queue updates to patients.
- **Background Tasks**: Used for sending notifications without blocking API responses.
