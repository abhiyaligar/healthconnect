# Application Flow Documentation (APP_FLOW.md)

## 1. Entry Points

### Primary Entry Points
- **Reception Dashboard** (Primary System Entry)
  - Used by receptionist to manage queues and conflicts
  - Loads real-time queue state via WebSocket
- **Patient Booking Interface**
  - Entry via hospital kiosk / web app
  - Starts booking flow (specialty → doctor → slot)
- **Doctor Panel**
  - Entry for doctors to view schedule + fatigue
- **Admin Dashboard**
  - Entry for analytics and system monitoring

### Secondary Entry Points
- **Deep Links**
  - Notification-based (e.g., rescheduled appointment)
- **System-triggered UI updates**
  - Conflict alerts
  - Cancellation storm alerts

---

## 2. Core User Flows

### Flow 1: Patient Appointment Booking
- **Goal**: Book a slot with awareness of overbooking
- **Entry Point**: Patient UI
- **Frequency**: High

#### Happy Path
1. **Page: Select Specialty**
   - User selects department (e.g., Cardiology)
   - Trigger → Load doctors
2. **Page: Select Doctor**
   - Displays doctor profile + rating
   - User selects doctor
   - Trigger → Load available slots
3. **Page: Select Slot**
   - Slot states: Green = Available, Yellow = Overbooked, Red = Full
   - User selects slot
4. **System Action**
   - Calculates: Estimated wait time, Overbooking risk, Priority classification (P1/P2/P3)
5. **Page: Confirmation Panel**
   - Shows: Token number, Wait time, Overbooking warning (if applicable)
6. **User Action**
   - Clicks "Confirm Appointment"
7. **System Action**
   - Inserts into queue
   - Updates real-time queue

#### Error States
- **Slot becomes full**
  - Display: "Slot no longer available"
  - Action: Refresh slots
- **High overload**
  - Display: "High delay expected (> X min)"

#### Edge Cases
- User selects overbooked slot → later gets rescheduled
- Multiple users booking same slot concurrently

#### Exit Points
- **Success** → Appointment confirmed
- **Abort** → User exits flow

---

### Flow 2: Reception Queue Management
- **Goal**: Manage live queue and patient flow
- **Entry Point**: Reception Dashboard

#### Happy Path
1. **Page: Dashboard Load**
   - WebSocket connects
   - Loads queue + doctor panels
2. **Reception Actions**
   - Call Next → Moves patient to "In Consultation"
   - Mark No-show → Removes from queue
   - Bump Priority → Upgrades priority
3. **System Updates**
   - Reorders queue
   - Updates wait times

#### Error States
- **Network delay**
  - Display: "Reconnecting..."
- **Action conflict**
  - Example: Patient already called elsewhere

#### Edge Cases
- Multiple receptionists modifying queue
- Simultaneous actions on same patient

---

### Flow 3: Conflict Detection & Resolution
- **Goal**: Resolve overbooking conflicts
- **Entry Point**: System-triggered

#### Happy Path
1. **System Detects Conflict**
   - Conditions: Slot capacity exceeded, Doctor double-booked
2. **System Generates Solutions**
   - Candidate patients for rescheduling
   - Alternative slots
3. **Page: Conflict Panel**
   - Displays: Conflict details, Suggested actions
4. **User Action**
   - Option A: Auto-resolve
   - Option B: Manual override
5. **System Action**
   - Applies changes
   - Updates queue + slots

#### Error States
- **No alternative slots available**
- **High-priority conflict (P1 vs P1)**

#### Edge Cases
- Multiple conflicts simultaneously
- Conflict during reschedule operation

#### Exit Points
- **Conflict resolved**
- **Escalated** (manual handling required)

---

### Flow 4: Cancellation Storm Handling (System Flow)
- **Goal**: Stabilize schedule during mass cancellations

#### Happy Path
1. **System Monitors Cancellation Rate**
2. **Threshold Breach Detected**
3. **Trigger Alert**
   - UI shows "Cancellation Storm"
4. **System Action**
   - Rebalance queue
   - Fill gaps with waiting patients
5. **Reception Action**
   - Option to trigger batch reschedule

#### Edge Cases
- Simultaneous booking spike
- Doctor unavailable mid-storm

---

### Flow 5: Doctor Schedule & Fatigue Monitoring
- **Goal**: Prevent overload

#### Happy Path
1. **Doctor Views Schedule**
2. **System Calculates Fatigue**
   - Based on: Patients seen, Time active
3. **Threshold Reached**
   - Alert triggered
4. **System Action**
   - Adjusts scheduling weight
   - Reduces booking priority

#### Edge Cases
- Doctor overrides fatigue
- Emergency patient (P1) bypasses limit

---

## 3. Navigation Map

```text
Dashboard (Reception)
├── Queue Panel
├── Conflict Panel
├── Doctor Panel
├── Walk-in Form
├── Alerts

Patient App
├── Patient Dashboard (Home)
│   ├── Upcoming Appointment
│   └── Medical History
├── Specialty Selection
├── Doctor Selection
├── Slot Selection (with Date Picker)
└── Confirmation

Doctor Panel
├── My Schedule (Consultations)
├── Scheduling (Availability Templates)
└── Fatigue Monitoring

Admin Control Center
├── Analytics (Main Landing)
│   ├── KPI Strip
│   ├── Hourly Volume
│   └── Doctor Load
├── Admin Panel (User Mgmt & Logs)
├── Queue Panel
├── Scheduling (Doctor Templates & Launch)
└── Conflict Panel
```

---

## 4. Screen Inventory

### Screen: Patient Dashboard
- **Route**: `/dashboard`
- **Access**: Authenticated (Patient)
- **Purpose**: Overview of upcoming and past appointments.

### Screen: Patient Booking
- **Route**: `/book`
- **Access**: Authenticated (Patient/Admin)
- **Purpose**: New appointment booking flow with calendar integration.

### Screen: Scheduling Manager
- **Route**: `/scheduling`
- **Access**: Authenticated (Doctor/Receptionist)
- **Purpose**: Manage weekly templates and launch daily slots.

---

## 5. Decision Points

### Decision: Slot Booking
```text
IF slot capacity < limit
THEN allow normal booking
ELSE IF slot overbook threshold not exceeded
THEN allow booking with warning
ELSE
THEN block booking
```

### Decision: Conflict Resolution
```text
IF conflict severity = low
THEN auto-resolve
ELSE IF severity = medium
THEN suggest resolution
ELSE
THEN require manual override
```

### Decision: Priority Handling
```text
IF patient priority = P1
THEN override queue order
ELSE IF P2
THEN moderate priority
ELSE
THEN FIFO
```

---

## 6. Error Handling Flows

- **Network Failure**
  - Display: "Reconnecting..."
  - Retry automatically
- **Conflict Failure**
  - Display: "Unable to resolve automatically"
  - Action: Manual override required
- **Slot Booking Failure**
  - Display: "Slot unavailable"
  - Suggest alternatives

---

## 7. Responsive Behavior

- **Mobile (Patient)**
  - Step-by-step booking flow
  - Single-column layout
- **Desktop (Reception/Admin)**
  - Multi-panel dashboards
  - Real-time updates

---

## 8. Animations & Transitions

- **Queue updates**: smooth reorder animation
- **Conflict alerts**: pulse/red highlight
- **Slot selection**: color transition
- **Loading**: skeleton + spinner
