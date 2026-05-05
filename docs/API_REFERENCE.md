# API Reference

## Authentication

### `POST /api/v1/auth/signup`
Creates a new user and initializes their profile.
- **Body**: `email`, `password`, `full_name`, `role` (DOCTOR/PATIENT).

## Appointments & Clinical

### Consultation Management
- `PATCH /api/v1/appointments/{id}/call`: Start session.
- `PATCH /api/v1/appointments/{id}/clinical-notes`: Update diagnosis and notes (Doctor only).
- `PATCH /api/v1/appointments/{id}/complete`: End session and update analytics.

### Medical Records
- `POST /api/v1/appointments/{id}/records`: Upload a medical report/file (Multi-part form).
    - Fields: `file` (File), `file_type` (String), `description` (String).

## History & Records

### `GET /api/v1/history/{patient_id}`
Returns a chronological list of all **completed** appointments and their notes.
- **Access**: Assigned Doctor or the Patient themselves.

### `GET /api/v1/history/{patient_id}/records`
Returns a list of all medical records/files ever uploaded for this patient.

## Scheduling & Slots

### `GET /api/v1/slots/`
Returns available slots.
- **Query Params**: `doctor_id` (Optional), `date` (Optional, YYYY-MM-DD).

### `POST /api/v1/schedules/availability`
Create a weekly availability template (Doctor/Staff only).
- **Body**: `day_of_week` (0-6), `start_time`, `end_time`.

### `POST /api/v1/schedules/launch`
Generate slots for a specific date based on templates.
- **Body**: `doctor_id`, `date` (YYYY-MM-DD).

## Profiles
- `GET /api/v1/doctors/`: List doctors with live performance averages.
- `GET /api/v1/doctors/me`: Get logged-in doctor's profile.
- `GET /api/v1/patients/me`: Get logged-in patient's profile.
