# Architecture Overview

HealthConnect is a data-driven scheduling engine.

## Key Layers

1.  **Identity Layer**: Manages roles and profiles.
2.  **Tracking Layer**: Captures live performance data.
3.  **Clinical Layer (New)**: Handles medical documentation, diagnoses, and secure file storage (via Supabase Storage).
4.  **History Layer (New)**: Provides a consolidated view of patient interactions across multiple consultations.

## Infrastructure

### Medical Storage
Medical reports are stored in the **`medical-records`** Supabase bucket. Access is mediated through the Backend API to ensure that only authorized doctors and the specific patient can retrieve the file URLs.

### Data Model Logic
- **Appointments** act as the central "event" record.
- **MedicalRecords** are linked to appointments but can also exist as general patient files.
- **Profiles** store the "State" (Avg duration, Priority).
