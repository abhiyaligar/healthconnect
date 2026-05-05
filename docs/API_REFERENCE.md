# API Reference

## Authentication
Supabase Auth is used. Pass the access token in the `Authorization: Bearer <token>` header.

## Scheduling

### Slots
- `GET /api/v1/slots/`: List available slots.
- `POST /api/v1/slots/`: Create a new slot (Doctor only).

### Appointments
- `POST /api/v1/appointments/`: Book an appointment (inherits Patient priority).
- `GET /api/v1/appointments/me`: List current user's appointments.
- `PATCH /api/v1/appointments/{id}/call`: Mark as IN_PROGRESS (starts timer).
- `PATCH /api/v1/appointments/{id}/complete`: Mark as COMPLETED (calculates duration and triggers doctor speed update).

## Profiles

### Doctors
- `GET /api/v1/doctors/`: List active doctors with their **Live Average Time**.
- `GET /api/v1/doctors/{id}`: Detailed doctor profile.
- `PATCH /api/v1/doctors/me`: Update professional details and **Manual Speed Factor**.

### Patients
- `GET /api/v1/patients/me`: Get current user's medical profile.
- `POST /api/v1/patients/me`: Initialize profile.
- `PATCH /api/v1/patients/me`: Update medical history and basic details.

## Analytics
- **Rolling Average**: The system automatically recalculates the `avg_consultation_time` for a doctor after every **10** completed consultations.
