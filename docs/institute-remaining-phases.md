# Maa Sati IAC — Remaining Website Phases
Updated 2026-11-13. Scope: existing institute website and learner platform (not a replacement project).

## Current completed development milestone: Personal Study Planner
- Private study preferences for 3/5/7 days weekly and 20/40/60 minutes per day, protected by owner-only RLS.
- Personal enrolled-course selection, next-skill suggestions from actual learner snapshot and lesson checkpoints.
- Navigation from My Learning and My Learning Journey.
- Source syntax checks and DB RLS/security negative check performed.
- Pending: signed-in student acceptance test and public Vercel site access verification.

## Mentor & Administration Operations — implemented development milestone
- New private `mentor-operations.html` dashboard with verified staff login, ticket status filters, paginated ticket list, replies, status updates and pending project review counts.
- Existing student support and project review tables reused rather than building duplicate systems.
- Internal in-app notifications for staff support replies and skill-project decisions use the existing student notification inbox. Private trigger functions are not callable by anonymous or ordinary signed-in accounts.
- New operations navigation appears for staff on the institute learning portal; review page links back to operations.
- Remaining operational acceptance: sign in with real verified staff role and real student ticket, verify reply, update, notification delivery and closed-ticket behavior. Currently no real support tickets or active skill submissions to exercise.

## Two major phases still remaining after this milestone
1. **Complete integrated QA & security.** Real student-to-mentor-to-verified-credential flow; responsive/mobile/accessibility checks; data privacy, payment and login verification; resolve defects found.
2. **Public launch & handover.** Configure safe public Vercel access, validate production domain and SSL, verify communications, finalize operations guide/backups/monitoring and obtain release sign-off.

## Known external acceptance blockers
- At the last connected database check there were no active student enrollments and no skill-project submissions, so a real authorized student-to-certificate flow was unavailable to test.
- Vercel reports production deployments READY, but the project has SSO protection on its vercel.app domains and `live: false`. This is not proof of public student access.
- Do not create fake production student grades, bypass deployment protection or issue unearned badges to obtain a superficially green QA status.

Status labels:
- Implemented = code/schema created and deployed.
- Technically verified = source checks + database access checks succeeded.
- Acceptance verified = authorized real-user workflow passed.
- Production ready = acceptance verified, public access checked and release approved.
