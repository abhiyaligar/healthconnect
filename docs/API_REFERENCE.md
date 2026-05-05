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

## Profiles
- `GET /api/v1/doctors/`: List doctors with live performance averages.
- `GET /api/v1/patients/me`: Get patient's medical profile.
