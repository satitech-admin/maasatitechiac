# Maa Sati IAC — Academic Analytics & Notifications

## Live
- Student + Staff Academic Dashboard: https://maasatitechiac.vercel.app/analytics.html
- LMS: https://maasatitechiac.vercel.app/platform.html
- Learning Assistant: https://maasatitechiac.vercel.app/assistant.html

## Implemented
This phase uses actual, authenticated Supabase data—not fake charts, sample grades, or localStorage award counters.

### Student view
- Real course enrollments with verified lesson completion ratios
- Upcoming course classes and practical session schedules
- Assignment due dates, submitted statuses and instructor grades
- In-app notification inbox with unread highlighting, mark read and mark all read
- Notifications link only to allowlisted IAC destinations, not arbitrary redirects

### Institute / trainer view
- Aggregate registration, active/pending enrollment, assignments, grades, class and attendance totals
- Per-course active/completed enrollment, lesson completions and submission counts
- CSV export of aggregate course reports (no student names or identifiable details)
- Admin-only certificate totals where the existing RLS permits it

### Automated database alerts
The `iac_notifications` table receives verified events from existing IAC workflows:
1. Staff create a live class for an enrolled course.
2. Staff publish a new assignment to enrolled students.
3. Staff grade a submitted assignment.
4. Admin changes a student's enrollment status.
5. Staff publish or change a registered school event.

Database triggers create alerts only for authorized, relevant users. A unique source key prevents duplicated creation for the same event. No fake activity is inserted.

### Security
- RLS enabled on `iac_notifications`; only the owning user can read or mark notifications read.
- Column-specific UPDATE permission limits students to `read_at`, not message content or recipient.
- No anonymous read access to notifications or analytics functions.
- Academic aggregate RPCs are SECURITY INVOKER, and staff mode requires existing verified IAC staff permissions.
- Data displayed in analytics is escaped before DOM insertion; URLs are restricted to approved on-site destinations.

## Deployment and operational notes
- Pages update when the user refreshes/visits. These are **in-app** alerts. No SMS, email, WhatsApp, OS push notifications or automatic 30-minute countdown reminders are claimed.
- No real student accounts or scheduled classes exist yet. Real student/staff end-to-end testing must follow verified account setup.
- Set up instructor accounts and schedule a class in the admin platform, then verify the enrolled student receives exactly one related notification.
- Create an assignment, verify notification to currently active enrollees, submit and grade work; verify grades and metrics.
- Verify that a non-enrolled user does not receive alerts or view another student's records.
- Revoke a student enrollment and verify loss of class/assignment visibility.
- In the event of hundreds of thousands of records, monitor aggregate RPC latency and add materialized summaries if necessary.
- External email/SMS delivery should be a separate, opt-in implementation with legally compliant consent and the institute's verified provider credentials.

## Source of truth
Supabase project id `ylobnofwmryltbzdtkla`. Relevant tables: `iac_notifications`, `iac_courses`, `iac_enrollments`, `iac_live_classes`, `iac_assignments`, `iac_submissions`, `iac_lesson_progress`, `iac_event_registrations`, `iac_day_attendance`, `iac_profiles`. Functions: `iac_personal_analytics()`, `iac_academic_analytics()`.
