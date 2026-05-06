# API Reference

## Authentication

### `POST /api/v1/auth/signup`
Creates a new user and initializes their profile.
- **Body**: `email`, `password`, `full_name`, `role` (DOCTOR/PATIENT).
- **Safety Valves**:
    - `403 Forbidden`: Returned if a doctor is fatigued (delay > 40m) and overbooking is attempted.
    - `429 Too Many Requests`: Returned if the lobby walk-in rate limit (5/15m) is exceeded.

## Appointments & Clinical

### Consultation Management
- `PATCH /api/v1/appointments/{id}/call`: Start session.
- `PATCH /api/v1/appointments/{id}/clinical-notes`: Update diagnosis and notes (Doctor only).
- `PATCH /api/v1/appointments/{id}/complete`: End session and update analytics.
- `POST /api/v1/appointments/{id}/rate`: Submit patient rating and feedback.

### Clinical Data Management
- `POST /api/v1/clinical/vitals`: Record vitals (BP, SpO2, Heart Rate, etc).
- `GET /api/v1/clinical/vitals/history/{patient_id}`: Get historical vitals for a patient.
- `POST /api/v1/clinical/prescription`: Create a structured multi-item prescription.
- `GET /api/v1/clinical/prescription/{appointment_id}`: Fetch the prescription for an appointment.
- `GET /api/v1/clinical/icd10?query=...`: Search for standardized ICD-10 medical codes.

### Medical Records
- `POST /api/v1/appointments/{id}/records`: Upload a medical report/file (Multi-part form).
    - Fields: `file` (File), `file_type` (String), `description` (String).

## History & Records

### `GET /api/v1/history/{patient_id}`
Returns a chronological list of all **completed** appointments and their notes.
- **Access**: Assigned Doctor or the Patient themselves.

### `GET /api/v1/history/{patient_id}/records`
Returns a list of all medical records/files ever uploaded for this patient.

### `GET /api/v1/history/me/full`
Returns the full clinical timeline for the logged-in patient (Vitals, Prescriptions, Notes).

### `GET /api/v1/history/doctor/me`
Returns the consultation archive for the logged-in doctor.

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

## Analytics & Conflicts

### `GET /api/v1/analytics/dashboard`
Returns live reception stats: total bookings, queue length, available capacity, and active conflicts.

### `GET /api/v1/analytics/conflicts/detailed`
Returns a list of active scheduling conflicts with fairness-based priority scores and AI suggestions.

### `GET /api/v1/analytics/admin/overview`
Returns system-wide intelligence: KPIs, hourly booking trends, and doctor workload distribution (Admin only).

### `GET /api/v1/analytics/surge-status`
Returns "Storm Detection" status, cancellation velocity, and schedule gap percentage.

## Optimization & Batch
- `GET /api/v1/optimization/suggestions/{doctor_id}`: Get "Gap Compaction" suggestions.
- `POST /api/v1/optimization/apply`: Bulk apply schedule compaction and send alerts.
- `GET /api/v1/optimization/notifications`: Get live log of system alerts.
- `GET /api/v1/emergency/preview`: Preview mass rescheduling impact with priority sorting.
- `POST /api/v1/emergency/execute`: Execute bulk move for a doctor's entire day.
- `POST /api/v1/appointments/batch-reschedule`: Emergency tool to move multiple appointments.

## Profiles
- `GET /api/v1/doctors/`: List doctors with live performance averages.
- `GET /api/v1/doctors/me`: Get logged-in doctor's profile.
- `GET /api/v1/patients/me`: Get logged-in patient's profile.
