# Application Flow

**Last Updated**: 2026-05-06

---

## 1. Entry Points & Role Routing

When a user logs in, `AuthContext` reads the `role` from Supabase `user_metadata` and redirects to their home dashboard:

| Role | Landing Route | Dashboard |
|------|--------------|-----------|
| `patient` | `/dashboard` | `PatientDashboard` |
| `doctor` | `/doctors` | `DoctorDashboard` |
| `receptionist` | `/reception` | `ReceptionDashboard` |
| `admin` | `/analytics` | `AdminDashboard` |

Public routes: `/` (Landing Page), `/reset-password`

---

## 2. Authentication Flow

```
Landing Page
    │
    ├── Login (email + password)
    │       │
    │       ▼
    │   POST /auth/login ──────────────► Supabase Auth validates credentials
    │       │                            Returns JWT + user_metadata (role)
    │       ▼
    │   AuthContext.setUser(token, role)
    │       │
    │       ▼
    │   Navigate to role home
    │
    └── Forgot Password
            │
            ▼
        POST /auth/forgot-password?email=...
            │  Generates 6-digit OTP (10 min TTL)
            │  Sends via SMTP email
            ▼
        /reset-password page
            │  User enters email + OTP + new password
            ▼
        POST /auth/reset-password
            │  Validates OTP, marks is_used=true
            │  Updates password via Supabase Admin API
            ▼
        Redirect to login
```

---

## 3. Core User Flows

### Flow A — Patient Appointment Booking (`/book`)

```
Step 1: Select Specialty
    GET /doctors/ → extract unique specialties
    User clicks specialty → GET /doctors/recommend?specialty=X

Step 2: Select Doctor
    Doctor cards shown (sorted by current load)
    User selects → proceed to slot selection

Step 3: Select Time Slot
    GET /slots/?doctor_id=X&date=YYYY-MM-DD
    User picks an OPEN slot

Step 4: Enter Details
    Symptoms, severity, optional medical history (frontend only, not sent to backend yet)
    User clicks "Confirm"

Step 5: Confirm
    POST /appointments/  { slot_id }
    Response: { queue_token, priority_score, status: CONFIRMED }
    ✅ Success screen with token number
```

**Safety Valves** during booking:
- `403` — Doctor fatigue (running 40+ min late)
- `429` — Walk-in rate limit (5 bookings per 15 min)
- `400` — Slot at max overbooking capacity

---

### Flow B — Reception Queue Management (`/queue`)

```
Page Load
    GET /appointments/all (paginated, page=1, limit=10)
    GET /doctors/
    Auto-polls every 10 seconds

Reception Actions:
    "Call" → PATCH /appointments/{id}/call
              status: CONFIRMED → IN_PROGRESS
              records actual_start_time

    "Bump" → PATCH /appointments/{id}/bump
              increases priority_score

    "No Show" → PATCH /appointments/{id}/no-show
                 status: CANCELLED
```

---

### Flow C — Doctor Consultation (`/doctors`)

```
Page Load
    GET /doctors/me (profile + avg_consultation_time)
    GET /appointments/doctor/me (today's queue, paginated)

Doctor selects a patient card
    Side panel opens
    GET /history/{patient_id} (clinical history, paginated)
    GET /clinical/vitals/history/{patient_id}
    GET /clinical/prescription/{appointment_id}

"Start Consultation"
    PATCH /appointments/{id}/call → IN_PROGRESS

During consultation:
    Fill vitals → POST /clinical/vitals
    ICD-10 diagnosis search → GET /clinical/icd10?query=...
    Clinical notes → saved in form state
    Add prescriptions → PrescriptionBuilder
    Save all → PATCH /appointments/{id}/clinical-notes
              → POST /clinical/vitals
              → POST /clinical/prescription

"Complete & Close"
    PATCH /appointments/{id}/complete → COMPLETED
    Triggers recalculation of doctor's avg_consultation_time
```

---

### Flow D — Admin User Management (`/admin`)

```
Tab: Users
    GET /admin/users?query=...&page=1&limit=10
    Displays paginated user table (Doctors + Patients)
    Actions:
        - Change Role → PATCH /admin/users/{id}/role
        - Toggle Status → PATCH /admin/users/{id}/status
        - Add New User → POST /admin/users (modal form)
            Uses SUPABASE_SERVICE_ROLE_KEY
            Creates Supabase Auth user + DB profile atomically
            Writes AuditLog entry

Tab: Audit Logs
    GET /admin/audit-logs?page=1&limit=10
    Paginated list of all admin actions

Tab: Settings
    GET /admin/settings
    POST /admin/settings { key: value }
```

---

### Flow E — Password Reset (OTP-Based)

```
User clicks "Forgot Password"
    POST /auth/forgot-password?email=...
    Backend generates 6-digit OTP
    Stores in otp_records (purpose=RESET_PASSWORD, expires=+10min)
    Sends via SMTP in background task

User receives email, navigates to /reset-password
    Enters: email + OTP + new password
    POST /auth/reset-password
    Backend validates OTP:
        - Matches stored code?
        - Not expired?
        - Not already used?
    If valid:
        Updates password via Supabase Admin API
        Marks OTP as is_used=true
    Redirect to login
```

---

### Flow F — Walk-in Patient Registration (`/reception/walkin`)

```
Step 1: Create Account
    POST /auth/signup (role=PATIENT, auto-generated password)
    System creates Supabase Auth user + PatientProfile

Step 2: Assign Slot
    GET /doctors/ (paginated)
    Receptionist selects a doctor
    GET /slots/?doctor_id=X (filter OPEN)
    Receptionist selects a slot

Booking:
    POST /appointments/ { slot_id, patient_id }
    Patient added to live queue
```

---

### Flow G — Schedule Management (`/scheduling`)

```
Doctor / Receptionist
    │
    ├── View weekly availability grid
    │       GET /schedules/availability?doctor_id=X
    │
    ├── Add block
    │       POST /schedules/availability
    │       { doctor_id, day_of_week, start_time, end_time }
    │
    ├── Delete block
    │       DELETE /schedules/availability/{id}
    │
    ├── Launch for date
    │       POST /schedules/launch { doctor_id, date }
    │       Generates Slot records for the day
    │
    └── Bulk launch (next 7 days)
            POST /schedules/launch/bulk?doctor_id=X&days=7
```

---

## 4. Navigation Map

```
/ (Landing Page — public)
│
├── /reset-password (public)
│
├── /dashboard (patient)
│   └── /book
│   └── /appointment/:id
│   └── /patient/profile
│
├── /doctors (doctor)
│   └── /doctor/profile
│   └── /scheduling
│
├── /reception (receptionist)
│   └── /reception/walkin
│   └── /reception/conflicts
│   └── /queue
│   └── /conflicts
│   └── /scheduling
│
└── /analytics (admin)
    └── /admin
    └── /queue
    └── /scheduling
    └── /conflicts
```

---

## 5. Paginated Response Convention

All list-returning GET endpoints follow this envelope:

```json
{
  "items": [...],
  "total": 42,
  "page": 1,
  "size": 10,
  "pages": 5
}
```

Frontend pages store `page` state and send `?page=N&limit=10` query params. Admin Panel has explicit Previous/Next pagination controls.

---

## 6. Error States

| HTTP Status | Meaning | Typical Cause |
|-------------|---------|---------------|
| `400` | Bad Request | Validation failure, slot full |
| `401` | Unauthorized | Missing or invalid JWT |
| `403` | Forbidden | Wrong role, or doctor fatigue valve |
| `404` | Not Found | Resource doesn't exist |
| `409` | Conflict | Email already registered |
| `422` | Unprocessable | FastAPI validation error |
| `429` | Too Many Requests | Walk-in rate limit exceeded |
| `500` | Server Error | Unexpected backend failure |

---

## 7. Responsive Behavior

| Viewport | Layout |
|----------|--------|
| Mobile (Patient) | Single-column step-by-step booking flow |
| Tablet | Two-column grids |
| Desktop (Reception/Admin) | Multi-panel dashboards with side panels |

---

## 8. Screen Inventory

| Route | Component | Access |
|-------|-----------|--------|
| `/` | `LandingPage` | Public |
| `/reset-password` | `ResetPassword` | Public |
| `/dashboard` | `PatientDashboard` | Patient |
| `/book` | `PatientBooking` | Patient |
| `/appointment/:id` | `AppointmentDetails` | Patient |
| `/patient/profile` | `PatientProfileView` | Patient |
| `/doctors` | `DoctorDashboard` | Doctor |
| `/doctor/profile` | `DoctorProfileView` | Doctor |
| `/scheduling` | `ScheduleManager` | Doctor, Receptionist |
| `/reception` | `ReceptionDashboard` | Receptionist |
| `/reception/walkin` | `WalkinRegistration` | Receptionist |
| `/reception/conflicts` | `ConflictResolution` | Receptionist |
| `/queue` | `QueuePanel` | Receptionist, Admin |
| `/conflicts` | `ConflictsPanel` | Receptionist, Admin |
| `/analytics` | `AdminDashboard` | Admin |
| `/admin` | `AdminPanel` | Admin |
