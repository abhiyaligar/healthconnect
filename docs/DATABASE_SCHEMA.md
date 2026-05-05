# Database Schema

HealthConnect uses a Supabase-managed PostgreSQL database.

## Tables

### `slots`
- `id`: UUID (PK)
- `doctor_id`: UUID
- `start_time`: TIMESTAMPTZ
- `end_time`: TIMESTAMPTZ
- `status`: VARCHAR
- `max_capacity`: INTEGER

### `appointments`
- `id`: UUID (PK)
- `patient_id`: UUID
- `slot_id`: UUID (FK)
- `status`: VARCHAR
- `queue_token`: VARCHAR
- `priority_score`: INTEGER
- **Clinical Tracking**:
    - `clinical_notes`: TEXT (Doctor's notes)
    - `diagnosis`: TEXT (Clinical diagnosis)
    - `actual_start_time`: TIMESTAMPTZ
    - `actual_end_time`: TIMESTAMPTZ
    - `consultation_duration`: INTEGER

### `medical_records`
Stores links to files uploaded to Supabase Storage.
- `id`: UUID (PK)
- `appointment_id`: UUID (FK, Optional)
- `patient_id`: UUID (FK)
- `doctor_id`: UUID (FK)
- `file_url`: VARCHAR (Supabase Storage URL)
- `file_type`: VARCHAR (e.g., LAB_REPORT, PRESCRIPTION)
- `description`: VARCHAR
- `created_at`: TIMESTAMPTZ

### `doctor_profiles`
- `id`: UUID (PK)
- `user_id`: UUID
- `full_name`: VARCHAR
- `specialty`: VARCHAR
- `bio`: TEXT
- `avg_consultation_time`: INTEGER
- `manual_speed_factor`: FLOAT

### `patient_profiles`
- `id`: UUID (PK)
- `user_id`: UUID
- `full_name`: VARCHAR
- `date_of_birth`: DATE
- `gender`: VARCHAR
- `base_priority`: INTEGER

## Relationships

```mermaid
erDiagram
    slots ||--o{ appointments : contains
    appointments ||--o{ medical_records : "has reports"
    patient_profiles ||--o{ appointments : books
    doctor_profiles ||--o{ slots : manages
```
