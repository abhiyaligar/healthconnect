# API Reference

## Base URL
`https://healthconnect-psi.vercel.app/api/v1` (Production)
`http://localhost:8000/api/v1` (Local)

## Authentication
Most endpoints require a Bearer Token in the `Authorization` header.
`Authorization: Bearer <your_access_token>`

### Auth Endpoints
- `POST /auth/signup`: Create a new account.
- `POST /auth/login`: Authenticate and receive a JWT.
- `GET /auth/me`: Retrieve the current user's profile.

### Slots Endpoints
- `GET /slots/`: List available slots. (Filter by `doctor_id` optional).
- `POST /slots/`: Create a new availability slot.
- `GET /slots/{id}`: Get specific slot details.

### Appointment Endpoints
- `POST /appointments/`: Book a slot. Returns a unique `queue_token`.
- `GET /appointments/me`: List all appointments for the current authenticated user.
- `GET /appointments/{id}`: Get specific appointment details (includes nested Slot info).
- `PATCH /appointments/{id}/call`: (Doctor/Nurse) Start a consultation.
- `PATCH /appointments/{id}/complete`: (Doctor/Nurse) End a consultation and record duration.
