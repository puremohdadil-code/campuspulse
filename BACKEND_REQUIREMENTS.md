# CampusPulse Backend Requirements

> Backend handoff specification for the CampusPulse student frontend  
> Version: 1.0 · 29 August 2026  
> Scope: student experience only

## 1. Purpose

CampusPulse gives an MMU student one focused view of attendance, grades, academic level, deadlines, calendar items, opportunities, and important notifications. The frontend is complete enough to run against sample data, but production behavior depends on the APIs in this document.

This document supplements `API_DOCUMENTATION.md`. Existing endpoints are listed first, followed by required additions that are not present in the current API contract.

## 2. Product rules that the backend must enforce

1. The only product-facing account role in this frontend is `student`.
2. The student's academic profile must be assigned from authoritative university data, not trusted from free-text registration input.
3. A student can read personal data and edit personal preferences. A student cannot create, edit, or delete the shared course catalog or official campus content.
4. Attendance starts at `100.00%` per course for the tracked period.
5. Every recorded absence deducts exactly `7.14` percentage points unless an approved excuse reverses that absence.
6. Attendance warnings use this progression:

| State | Trigger | UI severity |
|---|---:|---|
| First absence | 1 absence | informational/neutral |
| Second absence | 2 absences | yellow |
| Third absence | 3 absences | orange |
| Fourth absence | 4 absences | red |
| Attendance bar | percentage below 70% | black |

7. When attendance drops below 70%, the notification must tell the student to visit faculty staff and the lecturer and submit medical evidence for review.
8. Generated or AI-assisted notification text must never change the authoritative attendance percentage, grade, deadline, or academic record.
9. Gemini API credentials must exist only on the backend. They must never be exposed to the browser or returned by any endpoint.
10. APIs must be idempotent where duplicate attendance events, notification jobs, or retrying clients could otherwise create duplicate records.

## 3. Environments and transport

### Base URLs

| Environment | Base URL |
|---|---|
| Local development | `http://localhost:3000` |
| Deployed | same origin under `/api`, or the URL configured as `VITE_API_URL` |

### Required HTTP behavior

- JSON requests and responses use `Content-Type: application/json` unless an upload endpoint explicitly uses `multipart/form-data`.
- Authentication uses secure, `httpOnly` cookies named `accessToken` and `refreshToken`.
- The frontend always sends requests with credentials included.
- For cross-origin local development, allow the exact frontend origin and set `Access-Control-Allow-Credentials: true`. Do not use `*` with credentialed requests.
- Production cookies must use `Secure`, an appropriate `SameSite` value, and the narrowest practical `Path`.
- Use ISO 8601 UTC timestamps in API payloads, for example `2026-08-29T04:00:00.000Z`.
- All IDs are opaque strings. The frontend must not need to know the database technology.

## 4. Standard response and error contract

Successful responses may return the resource directly or the documented wrapper. Do not silently change shapes between endpoints or environments.

All errors must use this shape:

```json
{
  "statusCode": 400,
  "message": "Human-readable message",
  "error": "STABLE_MACHINE_CODE"
}
```

Validation may return multiple messages:

```json
{
  "statusCode": 400,
  "message": [
    "email must be an email",
    "password must be at least 8 characters"
  ],
  "error": "VALIDATION_ERROR"
}
```

Use stable machine codes for frontend decisions. Required examples include:

- `EMAIL_NOT_VERIFIED`
- `INVALID_CREDENTIALS`
- `ACCOUNT_LOCKED`
- `TOKEN_EXPIRED`
- `INVALID_OTP`
- `OTP_EXPIRED`
- `FORBIDDEN`
- `NOT_FOUND`
- `VALIDATION_ERROR`
- `DUPLICATE_ATTENDANCE_RECORD`
- `EXCUSE_ALREADY_REVIEWED`

## 5. Existing API contract consumed by the frontend

The following endpoints are already represented in the frontend API layer and must retain the request/response shapes documented in `API_DOCUMENTATION.md`.

### Health

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/health` | Liveness check |

Expected response:

```json
{
  "status": "ok",
  "timestamp": "2026-08-29T04:00:00.000Z"
}
```

### Authentication

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/auth/signup` | Create an unverified student account |
| POST | `/auth/login` | Create authenticated cookie session |
| POST | `/auth/refresh` | Rotate/refresh access cookie |
| POST | `/auth/logout` | Revoke session and clear cookies |
| GET | `/auth/me` | Return the authenticated user |
| POST | `/auth/verify-email` | Verify six-digit OTP |
| POST | `/auth/resend-verification` | Send a replacement OTP |
| POST | `/auth/request-password-reset` | Send reset link |
| POST | `/auth/reset-password` | Set password using reset token |

Signup request:

```json
{
  "firstName": "Aina",
  "lastName": "Noor",
  "addressLine": "Cyberjaya",
  "email": "aina@example.com",
  "password": "StrongPassword123"
}
```

Signup response:

```json
{
  "message": "Account created",
  "requiresVerification": true,
  "user": {
    "id": "user_123",
    "name": "Aina Noor",
    "email": "aina@example.com",
    "isVerified": false
  }
}
```

Login request:

```json
{
  "email": "aina@example.com",
  "password": "StrongPassword123"
}
```

Login response:

```json
{
  "user": {
    "id": "user_123",
    "name": "Aina Noor",
    "email": "aina@example.com",
    "isVerified": true
  }
}
```

Additional authentication requirements:

- `/auth/me` must return `401` when no valid session exists.
- `/auth/refresh` must rotate tokens and reject a revoked or reused refresh token.
- Return `EMAIL_NOT_VERIFIED` when correct credentials belong to an unverified account.
- Reset links must target `/auth/reset-password?token=...` in the frontend.
- OTPs and reset tokens must expire, be single-use, rate-limited, and stored hashed.
- Logout must revoke the refresh session, not only clear the browser cookie.

### Student settings and academic profile

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/user/settings` | Read notification and language settings |
| PUT | `/user/settings` | Update allowed settings |
| GET | `/user/academic` | Read academic assignment and interests |
| PUT | `/user/academic` | Update student-editable academic preferences |

The following academic fields are authoritative and must not be directly writable by a student: `studentId`, `university`, `faculty`, `major`, `yearOfStudy`, and enrolled course membership. If the existing `PUT /user/academic` accepts them, it must ignore or reject unauthorized changes.

The student may update `interests`. Course selection is only student-editable if the university explicitly treats it as preference data rather than enrollment data.

### Courses and campus content

| Method | Endpoint | Student access |
|---|---|---|
| GET | `/courses` | Allowed |
| GET | `/courses/code/:code` | Allowed |
| GET | `/courses/:id` | Allowed |
| POST | `/courses` | Forbidden |
| PATCH | `/courses/:id` | Forbidden |
| DELETE | `/courses/:id` | Forbidden |
| GET | `/campus-content` | Allowed |
| GET | `/campus-content/:id` | Allowed |
| POST | `/campus-content` | Forbidden |
| PUT | `/campus-content/:id` | Forbidden |
| DELETE | `/campus-content/:id` | Forbidden |

Staff/service authorization may use an internal role model even though the student UI does not expose role selection. Mutating shared catalog data must never be allowed to an ordinary authenticated student.

### Calendar and notifications

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/calendar?from=&to=` | Return content-derived calendar entries |
| POST | `/notifications/personalize` | Run personalization job |
| GET | `/notifications?unread=true` | List personal notifications |
| GET | `/notifications/daily-brief` | Return focused daily summary |
| GET | `/notifications/:id/explain` | Explain relevance |
| PATCH | `/notifications/:id/read` | Mark one notification read |
| PATCH | `/notifications/:id/dismiss` | Dismiss one notification |

Personalization must be safe to retry. A unique key such as `(userId, sourceType, sourceId, notificationKind)` should prevent duplicate notifications.

## 6. Required missing APIs — P0

These APIs are required to replace the remaining sample data in the student dashboard.

### 6.1 Student dashboard aggregate

`GET /dashboard/student`

Returns the four status cards, daily brief, today's agenda, and counters in one fast request.

```json
{
  "generatedAt": "2026-08-29T04:00:00.000Z",
  "student": {
    "id": "user_123",
    "name": "Aina Noor",
    "studentId": "1211100012",
    "university": "Multimedia University",
    "campus": "Cyberjaya",
    "faculty": "Faculty of Computing and Informatics",
    "major": "Bachelor of Computer Science",
    "yearOfStudy": 2
  },
  "status": {
    "attendancePercentage": 78.58,
    "gradeAverage": 82.4,
    "currentLevel": "Year 2",
    "upcomingDeadlineCount": 4,
    "attendanceBarredCourseCount": 1
  },
  "counters": {
    "upcomingDeadlines": 4,
    "matchedEvents": 8,
    "savedOpportunities": 3
  },
  "dailyBrief": {
    "summary": "Three things need your attention today.",
    "items": []
  },
  "agenda": []
}
```

Performance target: p95 below 500 ms with normal production data.

### 6.2 Attendance summary and course detail

`GET /attendance/summary`

```json
{
  "overallPercentage": 78.58,
  "activeCourseCount": 5,
  "barredCourseCount": 1,
  "deductionPerAbsence": 7.14,
  "barThreshold": 70,
  "courses": [
    {
      "courseId": "course_1",
      "courseCode": "TDS 2111",
      "courseName": "AI Ethics",
      "percentage": 92.86,
      "absenceCount": 1,
      "status": "notice",
      "lastUpdatedAt": "2026-08-29T02:00:00.000Z"
    }
  ]
}
```

`GET /attendance/courses/:courseId`

Returns the percentage calculation and complete record history.

```json
{
  "course": {
    "id": "course_1",
    "code": "TDS 2111",
    "name": "AI Ethics"
  },
  "percentage": 92.86,
  "absenceCount": 1,
  "status": "notice",
  "records": [
    {
      "id": "attendance_1",
      "classSessionId": "session_123",
      "occurredAt": "2026-08-29T01:00:00.000Z",
      "state": "absent",
      "deduction": 7.14,
      "excused": false,
      "source": "lecturer"
    }
  ]
}
```

Attendance statuses are: `good`, `notice`, `warning`, `elevated`, `critical`, `barred`.

The percentage must be calculated on the server and stored/audited with decimal-safe arithmetic. Clamp the displayed result to `0.00–100.00` and round to two decimal places only at the response boundary.

### 6.3 Recording attendance

`POST /attendance/records` — staff or trusted university integration only

```json
{
  "studentId": "user_123",
  "courseId": "course_1",
  "classSessionId": "session_123",
  "state": "absent",
  "occurredAt": "2026-08-29T01:00:00.000Z",
  "source": "lecturer"
}
```

Requirements:

- Unique constraint on `(studentId, classSessionId)`.
- Record creation and resulting notification must occur atomically or through an outbox pattern.
- Repeated delivery of the same record must return the existing result or a stable duplicate error without applying another 7.14 deduction.
- Changing/correcting a record requires an audited staff endpoint; never silently overwrite history.
- When the resulting status changes, enqueue exactly one severity-matched notification.

### 6.4 Medical excuses

`POST /attendance/excuses` — authenticated student

Use `multipart/form-data` with:

| Field | Type | Required |
|---|---|---|
| `attendanceRecordId` | string | yes |
| `reason` | string | yes |
| `document` | PDF/JPG/PNG | yes |

Response:

```json
{
  "id": "excuse_1",
  "status": "pending",
  "submittedAt": "2026-08-29T05:00:00.000Z"
}
```

`GET /attendance/excuses` — list the current student's submissions.

`PATCH /attendance/excuses/:id/review` — staff only

```json
{
  "decision": "approved",
  "note": "Medical certificate accepted"
}
```

Approval must reverse the related deduction exactly once, recalculate the course percentage/status, retain the audit trail, and notify the student. Reject executable files, validate MIME type and signature, limit size, scan uploads, use private object storage, and provide expiring signed download URLs only to authorized users.

### 6.5 Grades

`GET /grades/summary`

```json
{
  "overallAverage": 82.4,
  "updatedAt": "2026-08-29T04:00:00.000Z",
  "courses": [
    {
      "courseId": "course_1",
      "courseCode": "TDS 2111",
      "courseName": "AI Ethics",
      "percentage": 84.0,
      "letterGrade": "A-",
      "assessments": [
        {
          "id": "assessment_1",
          "title": "Responsible AI case study",
          "score": 42,
          "outOf": 50,
          "weight": 20,
          "publishedAt": "2026-08-27T03:00:00.000Z"
        }
      ]
    }
  ]
}
```

Grades are read-only for students. Staff or the university source system owns writes.

### 6.6 Automatic academic assignment

The backend must connect a verified account to the official student record. Registration should not ask the student to choose a faculty or role.

Recommended flow:

1. User verifies email.
2. Backend matches the verified email or student identifier against the authoritative academic database.
3. Backend stores the external record identifier and a synchronized snapshot.
4. `/user/academic` returns university, campus, faculty, major, year, and course enrollment.
5. If no unique match exists, return an explicit onboarding state such as `academicMatchStatus: "pending" | "matched" | "needs_support"`; do not guess.

Never expose database credentials or unnecessary institutional/student records to the frontend.

## 7. Required missing APIs — P1

### Personal calendar items

The current `/calendar` endpoint only describes content-derived items. The UI also offers “Add personal item,” so provide:

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/calendar/items` | Create personal event/reminder |
| PATCH | `/calendar/items/:id` | Edit own item |
| DELETE | `/calendar/items/:id` | Delete own item |

The aggregate `GET /calendar` response should include both official content and personal items with a `sourceType` field. A user must never read or mutate another student's private calendar item.

### Saved opportunities

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/saved-content` | List saved opportunities |
| POST | `/saved-content/:contentId` | Save one item; idempotent |
| DELETE | `/saved-content/:contentId` | Remove one saved item; idempotent |

### Notification bulk action

`PATCH /notifications/read-all`

```json
{
  "updated": 8,
  "readAt": "2026-08-29T05:00:00.000Z"
}
```

This prevents the frontend from issuing one request per unread notification.

### User profile fields

`GET /auth/me` currently returns only identity basics. Provide a safe profile update endpoint for student-editable fields such as address:

`PATCH /user/profile`

Do not mix editable contact data with authoritative academic assignment fields.

## 8. Notification model

Notifications should support both existing campus-content personalization and system events such as attendance or approved excuses.

Recommended normalized response:

```json
{
  "_id": "notification_1",
  "user": "user_123",
  "kind": "attendance.barred",
  "sourceType": "attendance",
  "sourceId": "attendance_1",
  "title": "Attendance bar reached",
  "body": "TDC 2211 is below 70%. Visit faculty staff and your lecturer with any medical evidence.",
  "priority": "critical",
  "severity": "barred",
  "relevanceScore": 1,
  "read": false,
  "dismissed": false,
  "createdAt": "2026-08-29T04:00:00.000Z",
  "readAt": null
}
```

Attendance severity mapping:

| Kind | Severity | Color token expected by frontend |
|---|---|---|
| `attendance.first_absence` | `notice` | neutral/information |
| `attendance.second_absence` | `warning` | yellow |
| `attendance.third_absence` | `elevated` | orange |
| `attendance.fourth_absence` | `critical` | red |
| `attendance.barred` | `barred` | black |

AI text generation requirements:

- Generate on the backend through Gemini.
- Pass only the minimum data needed for the message.
- Validate generated output against an allowlisted JSON schema.
- Always derive percentages and status from database values, never from the model.
- Store the deterministic fallback template and use it on timeout, quota failure, safety refusal, or malformed output.
- Log prompt version, model name, latency, result status, and notification ID without logging sensitive medical documents or access tokens.
- The system must still create the deterministic notification if Gemini is unavailable.

## 9. Authorization matrix

| Resource/action | Student | Staff/service |
|---|---:|---:|
| Read own profile/settings/academic data | yes | scoped |
| Update own preferences/settings/address | yes | scoped |
| Update own official faculty/major/year/enrollment | no | yes/sync only |
| Read course catalog/campus content | yes | yes |
| Mutate course catalog/campus content | no | yes |
| Read own attendance/grades | yes | scoped |
| Record or correct attendance | no | yes |
| Submit own medical excuse | yes | no/optional |
| Review medical excuse | no | yes |
| Read another student's personal data | no | only with explicit authorization |

Enforce authorization in the backend for every request. Hiding controls in the frontend is not a security boundary.

## 10. Data integrity and audit

- Keep immutable or append-only audit events for attendance corrections, excuse decisions, grade publication changes, role changes, and academic synchronization.
- Store actor, timestamp, reason, previous value, new value, and correlation ID.
- Use database transactions or an outbox pattern for record changes that create notifications.
- Define uniqueness constraints for user email, external student mapping, class session attendance, saved content, and personalized notification identity.
- Preserve original timestamps and source-system identifiers for synchronized records.
- Implement backups and a documented restore test before production use.

## 11. Security and privacy

- Hash passwords with Argon2id or an appropriately configured current password hashing algorithm.
- Rate-limit login, signup, OTP, resend, password reset, personalization, and upload endpoints.
- Add account lockout or progressive delay while avoiding user enumeration.
- Return the same password-reset response whether an email exists or not.
- Apply CSRF protection appropriate to cookie-based authentication.
- Validate and normalize every input server-side.
- Set a restrictive CORS allowlist and security headers.
- Redact cookies, passwords, OTPs, reset tokens, medical details, and Gemini credentials from logs.
- Define retention and deletion rules for medical documents and personal account data.
- Provide a process for account/session revocation.

## 12. Recommended pagination and filtering

Current list endpoints have no documented pagination. Before production, support cursor pagination for notifications and campus content:

```json
{
  "items": [],
  "nextCursor": "opaque-cursor-or-null"
}
```

Minimum filters:

- Notifications: `unread`, `kind`, `priority`, `cursor`, `limit`
- Campus content: `type`, `tag`, `from`, `to`, `upcoming`, `cursor`, `limit`
- Attendance records: `courseId`, `from`, `to`, `cursor`, `limit`

Document default sort order. Notifications should be newest first; calendar entries should be chronological.

## 13. Backend acceptance criteria

The backend is ready for frontend integration when all of the following pass:

- [ ] `GET /health` returns 200 from the configured frontend environment.
- [ ] Signup returns `requiresVerification: true` and sends a six-digit OTP.
- [ ] Verify, login, refresh, reload `/auth/me`, and logout work using cookies.
- [ ] Invalid credentials do not trigger frontend refresh loops.
- [ ] Password reset link opens the frontend with a single-use token and updates the password.
- [ ] Academic identity is automatically matched from authoritative data or reports a clear pending/support state.
- [ ] Students receive 403 for course/content mutation endpoints.
- [ ] Dashboard aggregate returns real attendance, grade, level, deadline, agenda, and brief data.
- [ ] A single absence deducts exactly 7.14 once.
- [ ] Duplicate delivery of the same absence does not deduct twice.
- [ ] Warning notifications progress neutral → yellow → orange → red → black/barred.
- [ ] Crossing below 70% creates exactly one barred notification.
- [ ] An approved medical excuse reverses the correct deduction exactly once and keeps an audit trail.
- [ ] Notification personalization is idempotent.
- [ ] Gemini outage uses a deterministic notification fallback.
- [ ] Students cannot access another student's profile, attendance, grades, calendar, notifications, or documents.
- [ ] Arabic, English, and Malay language settings persist through `/user/settings`.
- [ ] CORS, cookies, CSRF protection, rate limits, upload validation, and log redaction are verified in staging.

## 14. Suggested implementation priority

### P0 — required for the core demo

1. Harden authentication and academic matching.
2. Add attendance summary/detail, trusted recording, warning events, and medical excuses.
3. Add grades summary.
4. Add `/dashboard/student` aggregate.
5. Add attendance/system notification types and Gemini fallback behavior.
6. Enforce student read-only access to official courses and campus content.

### P1 — complete current frontend actions

1. Personal calendar CRUD.
2. Saved opportunity endpoints.
3. Bulk notification read.
4. Editable contact/profile endpoint.
5. Pagination and filtering.

### P2 — production hardening

1. Institutional source synchronization and reconciliation jobs.
2. Observability dashboards and alerting.
3. Full audit reporting and retention automation.
4. Load, resilience, security, accessibility-supporting content, and disaster-recovery tests.

## 15. Frontend integration notes

- Set `VITE_API_URL` to the backend origin for local/cross-origin development. Production may use same-origin `/api`.
- Set `VITE_DEMO_FALLBACK=false` in staging and production to prevent sample-data fallback.
- The frontend sends cookies automatically and retries one failed authenticated request after a shared `/auth/refresh` call.
- Authentication fallback is used only for a network outage. Read-only dashboard sections may display clearly non-authoritative sample content when live API data is unavailable during development; disable all fallback in staging and production.
- Any intentional response-shape change must update both this contract and `src/api/types.ts` before deployment.
