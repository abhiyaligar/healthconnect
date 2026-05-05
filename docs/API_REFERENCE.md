# API Reference

## Base URL
`http://localhost:8000/api/v1`

## Authentication
Most endpoints require a Bearer Token in the `Authorization` header.
`Authorization: Bearer <your_access_token>`

### Auth Endpoints
- `POST /auth/signup`: Create a new account.
- `POST /auth/login`: Authenticate and receive a JWT.
- `GET /auth/me`: Retrieve the current user's profile.

### Doctor Endpoints (Planned)
- `GET /doctors`: List all available doctors.
- `GET /doctors/{id}/availability`: Check specific availability.

### Appointment Endpoints (Planned)
- `POST /appointments/book`: Request a slot.
- `POST /appointments/cancel`: Cancel a booking.
- `GET /appointments/queue`: View live queue status.
