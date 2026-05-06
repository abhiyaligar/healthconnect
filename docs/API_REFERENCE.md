# API Reference

**Base URL**: `http://localhost:8000/api/v1`  
**Auth**: All protected routes require `Authorization: Bearer <access_token>` header.  
**Last Updated**: 2026-05-06

---

## Pagination

All list endpoints now return a **standardized paginated envelope** instead of a raw array.

### Query Parameters (all list endpoints)
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | int | `1` | Page number (1-indexed) |
| `limit` | int | `10` | Items per page |

### Response Schema
```json
{
  "items": [...],
  "total": 42,
  "page": 1,
  "size": 10,
  "pages": 5
}
```

> **Breaking change from legacy**: Previously these endpoints returned a flat `List[T]`. Frontend code must now read `res.data.items` instead of `res.data`.

---

## Authentication (`/auth`)

### `POST /auth/signup`
Registers a new user (Doctor, Patient, or Admin) and initializes their profile.

**Body**:
```json
{
  "email": "user@example.com",
  "password": "string",
  "full_name": "string",
  "mobile": "string",
  "role": "DOCTOR | PATIENT | ADMIN",
  "dob": "YYYY-MM-DD (optional, patient only)",
  "gender": "string (optional)",
  "specialty": "string (optional, doctor only)",
  "bio": "string (optional, doctor only)",
  "medical_history": "string (optional, patient only)"
}
```

**Response**: `UserResponse` — includes `id`, `email`, `full_name`, `role`, `custom_id`.

**Notes**:
- Atomically creates Supabase Auth user + profile row in DB.
- `custom_id` is derived from `mobile[:5] + full_name[:4].upper()`.
- Sends a verification email in the background.

---

### `POST /auth/register-admin`
Registers an Admin account. Uses the service role key (bypasses email confirmation).

**Body**:
```json
{
  "email": "admin@hospital.com",
  "password": "string",
  "full_name": "string"
}
```

---

### `POST /auth/login`
Authenticates a user and returns a session token.

**Body**: `{ "email": "...", "password": "..." }`

**Response**: `TokenResponse` — includes `access_token`, `token_type: "bearer"`, and `user` object.

---

### `GET /auth/me`
Returns the currently authenticated user's profile.

**Headers**: `Authorization: Bearer <token>`

---

### `POST /auth/forgot-password`
Generates a 6-digit OTP and sends it to the user's email for password reset.

**Query Params**: `email=user@example.com`

**Response**: `{ "message": "If this email is registered, a reset code has been sent." }`

---

### `POST /auth/reset-password`
Validates OTP and resets the user's password.

**Body**:
```json
{
  "email": "user@example.com",
  "otp": "123456",
  "new_password": "new_secure_password"
}
```

- OTP expires after **10 minutes**.
- Each OTP is single-use (`is_used` flag).

---

### `POST /auth/resend-otp`
Resends the email verification OTP.

**Query Params**: `email=user@example.com`

---

## Doctors (`/doctors`)

### `GET /doctors/`
Lists all doctors with live performance metrics.

**Query Params**: `page`, `limit`

**Response**: `PaginatedResponse[DoctorOut]`

---

### `GET /doctors/me`
Returns the profile of the currently authenticated doctor.

---

### `GET /doctors/recommend`
Returns recommended doctors filtered by specialty, sorted by current load.

**Query Params**: `specialty=Cardiology`

---

## Appointments (`/appointments`)

### `POST /appointments/`
Books a new appointment for the authenticated patient.

**Body**: `{ "slot_id": "uuid" }`

**Safety Valves**:
- `403 Forbidden` — if the doctor has been running 40+ minutes late (fatigue protection).
- `429 Too Many Requests` — if the lobby walk-in rate exceeds 5 bookings per 15 minutes.
- `400 Bad Request` — if the slot has exceeded its maximum overbooking capacity.

**Response**: `AppointmentOut` — includes `queue_token`, `priority_score`, `status`.

---

### `GET /appointments/me`
Returns the authenticated patient's appointments.

**Query Params**: `page`, `limit`  
**Response**: `PaginatedResponse[AppointmentOut]`

---

### `GET /appointments/doctor/me`
Returns today's appointments for the authenticated doctor.

**Query Params**: `page`, `limit`  
**Response**: `PaginatedResponse[AppointmentOut]`

---

### `GET /appointments/all`
Returns all appointments (Reception/Admin only).

**Query Params**: `page`, `limit`  
**Response**: `PaginatedResponse[AppointmentOut]`

---

### `GET /appointments/{id}`
Returns a single appointment by ID.

---

### `PATCH /appointments/{id}/call`
Marks an appointment as `IN_PROGRESS`. Records `actual_start_time`.

---

### `PATCH /appointments/{id}/complete`
Marks an appointment as `COMPLETED`. Records `actual_end_time` and recalculates the doctor's rolling average consultation time.

---

### `PATCH /appointments/{id}/clinical-notes`
Updates the diagnosis and clinical notes for an appointment (Doctor only).

**Body**: `{ "diagnosis": "string", "clinical_notes": "string" }`

---

### `PATCH /appointments/{id}/no-show`
Marks appointment as `CANCELLED` due to no-show (Reception only).

---

### `PATCH /appointments/{id}/bump`
Increases the priority score of an appointment (Reception only).

---

### `POST /appointments/{id}/rate`
Submits patient rating and feedback.

**Body**: `{ "rating": 1-5, "feedback": "string" }`

---

### `POST /appointments/{id}/records`
Uploads a medical document for a specific appointment (multipart form).

**Form Fields**: `file` (File), `file_type` (string), `description` (string)

---

## History (`/history`)

All history endpoints now return paginated responses.

### `GET /history/{patient_id}`
Returns completed appointments for a patient.

**Access**: Assigned doctor OR the patient themselves.  
**Query Params**: `page`, `limit`  
**Response**: `PaginatedResponse[AppointmentOut]`

---

### `GET /history/{patient_id}/records`
Returns all uploaded medical files for a patient.

**Access**: Assigned doctor OR the patient themselves.  
**Query Params**: `page`, `limit`  
**Response**: `PaginatedResponse[MedicalRecordOut]`

---

### `GET /history/me/full`
Returns the complete clinical timeline for the logged-in patient.

**Query Params**: `page`, `limit`  
**Response**: `PaginatedResponse[AppointmentOut]`

---

### `GET /history/doctor/me`
Returns all completed consultations for the logged-in doctor.

**Query Params**: `page`, `limit`  
**Response**: `PaginatedResponse[AppointmentOut]`

---

## Clinical (`/clinical`)

### `POST /clinical/vitals`
Records patient vitals for a given appointment.

**Body**: `{ "appointment_id", "patient_id", "bp_systolic", "bp_diastolic", "heart_rate", "spo2", "temperature", "weight" }`

---

### `GET /clinical/vitals/history/{patient_id}`
Returns historical vitals readings for a patient.

---

### `POST /clinical/prescription`
Creates a structured, multi-item prescription linked to an appointment.

**Body**: `{ "appointment_id", "patient_id", "doctor_id", "notes", "items": [{ "medicine_name", "dosage", "frequency", "duration", "instructions" }] }`

---

### `GET /clinical/prescription/{appointment_id}`
Fetches the prescription for a given appointment.

---

### `GET /clinical/icd10`
Searches for standardized ICD-10 medical codes.

**Query Params**: `query=chest+pain`

---

## Admin (`/admin`)

> **All admin routes require `ADMIN` role.**

### `GET /admin/users`
Lists all system users (Doctors + Patients) with optional filtering.

**Query Params**: `query` (search by name/email), `role`, `page`, `limit`  
**Response**: Paginated envelope with user objects.

---

### `POST /admin/users`
Creates a new user of any role (Admin, Doctor, or Patient) using the service role key.

**Body**: Same as `/auth/signup` (uses `SignupRequest` schema).  
**Response**: `UserResponse`

- Bypasses email confirmation.
- Atomically creates Supabase Auth user + DB profile.
- Writes an audit log entry.

---

### `PATCH /admin/users/{user_id}/status`
Toggles a user's status between `ACTIVE` and `INACTIVE`.

**Query Params**: `active=true|false`

---

### `PATCH /admin/users/{user_id}/role`
Changes a user's role in Supabase metadata.

**Query Params**: `new_role=DOCTOR|PATIENT|ADMIN`

---

### `GET /admin/settings`
Returns all system configuration key-value pairs.

---

### `POST /admin/settings`
Updates one or more system settings.

**Body**: `{ "key": "value", ... }`

---

### `GET /admin/audit-logs`
Returns a paginated list of system audit events.

**Query Params**: `page`, `limit`  
**Response**: Paginated envelope with `AuditLog` objects (`action`, `performed_by`, `details`, `timestamp`).

---

## Scheduling (`/schedules`)

### `GET /schedules/availability`
Returns weekly availability templates for a doctor.

**Query Params**: `doctor_id`

---

### `POST /schedules/availability`
Creates a weekly recurring availability block.

**Body**: `{ "doctor_id", "day_of_week" (0=Mon, 6=Sun), "start_time", "end_time" }`

---

### `DELETE /schedules/availability/{id}`
Deletes an availability template block.

---

### `POST /schedules/launch`
Generates bookable slots for a single date based on templates.

**Body**: `{ "doctor_id", "date": "YYYY-MM-DD" }`

---

### `POST /schedules/launch/bulk`
Generates slots for the next N days.

**Query Params**: `doctor_id`, `days=7`

---

## Slots (`/slots`)

### `GET /slots/`
Returns available slots.

**Query Params**: `doctor_id` (optional), `date` (optional, YYYY-MM-DD)

---

## Analytics (`/analytics`)

### `GET /analytics/dashboard`
Returns live reception stats: total bookings, queue length, available capacity, and active conflicts.

---

### `GET /analytics/conflicts/detailed`
Returns active scheduling conflicts with fairness-based priority scores and suggested resolutions.

---

### `GET /analytics/admin/overview`
Returns system-wide KPIs, hourly booking trends, and doctor workload distribution.

**Access**: Admin only.

---

### `GET /analytics/surge-status`
Returns "Storm Detection" status: cancellation velocity and schedule gap percentage.

---

## Optimization (`/optimization`)

### `GET /optimization/suggestions/{doctor_id}`
Returns "Gap Compaction" suggestions for a doctor's schedule.

---

### `POST /optimization/apply`
Bulk applies schedule compaction and sends patient alerts.

---

### `GET /optimization/notifications`
Returns a live log of system-generated alerts and optimization actions.

---

## Emergency (`/emergency`)

### `GET /emergency/preview`
Previews the impact of a bulk mass rescheduling operation with priority-sorted patient mapping.

**Query Params**: `source_doctor_id`, `source_date`, `target_doctor_id`, `target_date`

---

### `POST /emergency/execute`
Executes a bulk move for a doctor's entire day to another doctor/date.

**Body**: `{ "source_doctor_id", "source_date", "target_doctor_id", "target_date" }`

---

## Patients (`/patients`)

### `GET /patients/me`
Returns the authenticated patient's profile.

---

## Health Check

### `GET /`
Returns a welcome message with the project name.

### `GET /health`
Returns `{ "status": "healthy" }`.
