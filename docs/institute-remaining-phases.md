# Maa Sati IAC — Remaining Website Phases
Updated 2026-11-13. Scope: existing institute website and learner platform (not a replacement project).

## Current completed development milestone: Personal Study Planner
- Private study preferences for 3/5/7 days weekly and 20/40/60 minutes per day, protected by owner-only RLS.
- Personal enrolled-course selection, next-skill suggestions from actual learner snapshot and lesson checkpoints.
- Navigation from My Learning and My Learning Journey.
- Source syntax checks and DB RLS/security negative check performed.
- Pending: signed-in student acceptance test and public Vercel site access verification.

## Three major phases still remaining after this milestone
1. **Mentor & administration operations.** Review workflow UX improvements, class/batch communication, learner support and notifications. Keep all approvals server-enforced.
2. **Complete integrated QA & security.** Real student-to-mentor-to-verified-credential flow; responsive/mobile/accessibility checks; data privacy, payment and login verification; resolve defects found.
3. **Public launch & handover.** Configure safe public Vercel access, validate the production domain and SSL, confirm communications, publish operations guide, document backups and monitoring, and obtain explicit release sign-off.

## Known external acceptance blockers
- At the last connected database check there were no active student enrollments and no skill-project submissions, so a real authorized student-to-certificate flow was unavailable to test.
- Vercel reports production deployments READY, but the project has SSO protection on its vercel.app domains and `live: false`. This is not proof of public student access.
- Do not create fake production student grades, bypass deployment protection or issue unearned badges to obtain a superficially green QA status.

Status labels:
- Implemented = code/schema created and deployed.
- Technically verified = source checks + database access checks succeeded.
- Acceptance verified = authorized real-user workflow passed.
- Production ready = acceptance verified, public access checked and release approved.
