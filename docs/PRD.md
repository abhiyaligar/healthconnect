# Product Requirements Document (PRD)

## 1. Product Overview
- **Project Title**: MediSync — Healthcare Appointment Overbooking Stabilizer
- **Version**: 1.0
- **Last Updated**: 2026-05-05
- **Owner**: Team Straw Hats

## 2. Problem Statement
Hospitals intentionally overbook appointments to maximize utilization, but this leads to:
- Unpredictable wait times
- Scheduling conflicts (double-booking, overbooking overflow)
- Doctor fatigue due to uneven load distribution
- Patient dissatisfaction and drop-offs

Existing systems:
- Treat scheduling as static
- Do not adapt to real-time events (cancellations, delays)
- Do not optimize fairness vs priority

**Core Problem:**
There is no system that dynamically stabilizes overbooked appointment schedules in real-time while balancing patient priority, fairness, doctor workload constraints, and minimal disruption.

## 3. Goals & Objectives
### Business Goals
- Reduce patient wait time variance by ≥ 30%
- Reduce unresolved scheduling conflicts by ≥ 80%
- Improve doctor utilization efficiency by ≥ 20%

### User Goals
- Receptionists can manage queues without manual chaos
- Patients get predictable wait times and transparent expectations
- Doctors avoid overload and fatigue spikes

## 4. Success Metrics
- **Avg Wait Time Reduction**: Target ≤ 20 minutes per patient
- **Conflict Resolution Time**: ≤ 60 seconds per conflict
- **Auto-resolution Rate**: ≥ 70% of conflicts resolved automatically
- **Patient Reschedule Rate Satisfaction**: ≥ 80% acceptance
- **System Latency**: ≤ 500 ms (real-time updates)

## 5. Target Users & Personas

### Primary Persona: Receptionist (Operational Controller)
- **Demographics**: Hospital front desk staff
- **Pain Points**:
  - Manual rescheduling during overload
  - No visibility into queue dynamics
  - High cognitive load during peak hours
- **Goals**:
  - Manage queues efficiently
  - Resolve conflicts quickly
  - Maintain fairness across patients
- **Technical Proficiency**: Medium

### Secondary Persona: Patient
- **Pain Points**:
  - Long unpredictable wait times
  - Lack of transparency
  - Sudden rescheduling
- **Goals**:
  - Book reliable time slots
  - Minimize waiting
  - Understand risk of overbooking
- **Technical Proficiency**: Low–Medium

### Secondary Persona: Doctor
- **Pain Points**:
  - Overloaded schedules
  - Fatigue accumulation
  - Poor visibility of upcoming load
- **Goals**:
  - Balanced schedule
  - Break management
  - Predictable workflow
- **Technical Proficiency**: Medium

### System Actor: Scheduling Engine
- Automatically detects conflicts
- Resolves or suggests rescheduling
- Adjusts queue dynamically

## 6. Features & Requirements

### Must-Have Features (P0)

1. **Appointment Booking System**
   - Description: Allows patients or receptionists to book slots with overbooking awareness
   - User Story: As a patient, I want to book an appointment even if slots are overbooked so that I can still get treated
   - Acceptance Criteria:
     - [ ] System allows booking into overbooked slots with warning
     - [ ] Displays estimated wait time before confirmation
     - [ ] Assigns priority (P1/P2/P3)
     - [ ] Generates token number in queue order
   - Success Metric: ≥ 90% successful bookings without failure

2. **Real-Time Queue Management**
   - Description: Live queue display with patient status and wait time
   - User Story: As a receptionist, I want to see a real-time queue so that I can manage patient flow
   - Acceptance Criteria:
     - [ ] Queue updates instantly on booking/cancellation
     - [ ] Shows priority tags (P1/P2/P3)
     - [ ] Displays wait time per patient
     - [ ] Supports actions: Call Next, Mark No-show, Bump Priority
   - Success Metric: UI latency ≤ 500ms

3. **Overbooking Conflict Detection**
   - Description: Detects conflicts such as slot overcapacity and doctor double-booking
   - User Story: As a system, I want to detect conflicts instantly so that corrective action can be taken
   - Acceptance Criteria:
     - [ ] Conflict detected within 1 second of event
     - [ ] Conflict displayed in dashboard
     - [ ] Categorized by severity
   - Success Metric: 100% conflict detection accuracy

4. **Conflict Resolution Engine**
   - Description: Suggests or auto-resolves conflicts
   - User Story: As a receptionist, I want suggested solutions so I can resolve conflicts quickly
   - Acceptance Criteria:
     - [ ] Suggests optimal reschedule candidates
     - [ ] Considers priority + disruption cost
     - [ ] Provides “Auto-resolve” and “Manual override”
     - [ ] Logs all decisions
   - Success Metric: ≥ 70% auto-resolution success

5. **Dynamic Rescheduling Engine**
   - Description: Minimizes disruption while resolving conflicts
   - User Story: As a system, I want to reschedule patients with minimal disruption so fairness is maintained
   - Acceptance Criteria:
     - [ ] Minimizes number of affected patients
     - [ ] Avoids repeated rescheduling of same patient
     - [ ] Considers doctor availability and fatigue
   - Success Metric: ≤ 2 average reschedules per patient

6. **Doctor Availability & Fatigue Tracking**
   - Description: Tracks workload and fatigue levels
   - User Story: As a doctor, I want my workload monitored so I don’t get overworked
   - Acceptance Criteria:
     - [ ] Fatigue % calculated based on workload
     - [ ] Alerts triggered at thresholds (e.g., >80%)
     - [ ] Scheduling engine considers fatigue in decisions
   - Success Metric: ≤ 10% overload scenarios

7. **Cancellation Storm Handling**
   - Description: Handles high-volume cancellations
   - User Story: As a system, I want to stabilize schedules during mass cancellations
   - Acceptance Criteria:
     - [ ] Detects abnormal cancellation rate (> threshold)
     - [ ] Triggers batch rescheduling
     - [ ] Notifies affected users
   - Success Metric: System remains stable under burst load

### Should-Have Features (P1)
- Analytics dashboard (booking trends, load distribution)
- Broadcast messaging (e.g., delay alerts)
- Doctor panel for schedule control
- Priority bumping (manual override)

### Nice-to-Have Features (P2)
- ML-based wait time prediction
- Personalized patient prioritization
- Multi-hospital support
- Mobile app interface

## 7. Explicitly OUT OF SCOPE
- Full Electronic Health Records (EHR) system
- Payment processing / billing
- Insurance integration
- Telemedicine/video consultation
- AI diagnosis or medical decision-making
- Multi-language support (for MVP)
- Offline-first capability

## 8. User Scenarios

### Scenario 1: Overbooked Slot Booking
- **Context**: Patient selects a crowded slot
- **Steps**:
  1. Patient selects slot
  2. System detects overbooking
  3. Shows wait-time warning
  4. Patient confirms
- **Expected Outcome**: Patient added to queue
- **Edge Cases**: Slot becomes unavailable mid-process, Priority override occurs after booking

### Scenario 2: Conflict Resolution
- **Context**: Slot exceeds capacity
- **Steps**:
  1. System detects conflict
  2. Generates resolution options
  3. Receptionist selects or auto-resolve triggers
- **Expected Outcome**: Conflict resolved with minimal disruption
- **Edge Cases**: No valid reschedule slots, Multiple P1 patients

### Scenario 3: Cancellation Storm
- **Context**: High cancellation spike
- **Steps**:
  1. System detects abnormal rate
  2. Triggers batch reschedule
  3. Updates queue and notifications
- **Expected Outcome**: System stabilizes
- **Edge Cases**: Simultaneous booking spike, Doctor unavailable

## 9. Dependencies & Constraints
- **Technical Constraints**: Real-time system (WebSockets required), High concurrency handling, Low latency requirements
- **Business Constraints**: Hackathon timeline, Limited development resources
- **External Dependencies**: None (self-contained system)

## 10. Timeline & Milestones
- **MVP**: Core scheduling + conflict resolution + queue
- **V1.0**: Add analytics + fatigue + automation improvements

## 11. Risks & Assumptions
### Risks
- Complex scheduling logic may delay implementation
- Real-time sync issues under load
### Assumptions
- Priority categories are predefined (P1/P2/P3)
- Doctors have fixed availability windows
- Patients accept rescheduling suggestions within limits

## 12. Non-Functional Requirements
- **Performance**: Handle ≥ 500 concurrent users, Response time ≤ 500 ms
- **Security**: JWT-based authentication, Role-based access control
- **Accessibility**: Basic compliance (forms, contrast)
- **Scalability**: Horizontal scaling via stateless backend

## 13. References & Resources
- UI reference provided (Admin, Reception, Patient, Doctor panels)
- Problem statement: FS-02 Healthcare Stabilizer

## Project: HealthConnect Learning Scheduler

### Progress

#### Phase 1: The Foundation [COMPLETED]
- [x] Basic Slot Management
- [x] Consultation Duration Tracking

#### Phase 2: Identity & Intelligence [COMPLETED]
- [x] **Unified Signup**: Auto-role assignment & profile initialization.
- [x] **Rolling Average Analytics**: Dynamic speed calculation.

#### Phase 3: Clinical Interactions [COMPLETED]
- [x] **Clinical Documentation**: Diagnosis & Consultation Notes.
- [x] **Medical Record Storage**: File uploads (Reports/Scans) via Supabase Storage.
- [x] **Historical Timeline**: Full clinical history retrieval for Doctors.

#### Phase 4: The Stabilizer [COMPLETED]
- [x] Overbooking Detection & Fairness-based Bumping Logic.
- [x] Receptionist Dashboard with Live Metrics.
- [x] Conflict Resolution Panel (Auto-resolve & Manual Override).

#### Phase 5: Real-time & Oversight [COMPLETED]
- [x] Real-time Admin Analytics & System Overview.
- [x] Doctor Workload & Fatigue Monitoring.
- [x] Multi-Role Access Control (Admin/Receptionist/Doctor/Patient).

#### Phase 6: Slot Precision [COMPLETED]
- [x] Unique Slot Constraints to prevent scheduling duplicates.
- [x] Overlapping Slot Prevention at the database level.

#### Phase 7: Clinical Intelligence [COMPLETED]
- [x] Vitals Tracking (BP, Heart Rate, SpO2, Temperature).
- [x] Structured Prescription Engine with multi-item support.
- [x] ICD-10 Search & Diagnostic Standardization.

#### Phase 8: Storm & Surge Handling [COMPLETED]
- [x] Cancellation Velocity Tracking (Storm Detection).
- [x] Gap Compaction Service for schedule optimization.
- [x] Emergency Batch Rescheduling API.
- [x] Fatigue-Aware Surge Protection (Auto-disable overbooking).

#### Phase 9: Medical Resume & History [COMPLETED]
- [x] Comprehensive Patient Clinical Timeline.
- [x] Doctor Professional Portfolio & Archive.
- [x] Full Medical Profile with Historical Trends.