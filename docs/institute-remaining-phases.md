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
- Admin-only course announcements now use an explicit confirmation, published-course selector, audited database function and private delivery log. The server enforces admin status, 5-120 character title, 15-700 character body, no empty recipient batch, max 500 recipients and a 60-second same-admin/same-course cooldown. Sending does not trigger external SMS or WhatsApp.
- Database restrictions checked: no anonymous reads or direct INSERT to announcement log; authenticated users may execute the RPC but non-admin callers are rejected by the function. Both notification trigger functions deny direct execution.
- SQL advisor flags the authenticated-executable privileged announcement RPC as a generic warning; use is intentional because the server function explicitly verifies `iac_is_admin()` before any data write. Review this in future security audits.
- Remaining acceptance: first real enrolled-student notice, staff reply alert, student inbox read, status decision notification; no recipient data or sent announcements exist yet.
- New operations navigation appears for staff on the institute learning portal; review page links back to operations.
- Remaining operational acceptance: sign in with real verified staff role and real student ticket, verify reply, update, notification delivery and closed-ticket behavior. Currently no real support tickets or active skill submissions to exercise.

## Final Launch Preparation — source and deployment configuration implemented
- 14 personal/admin pages now declare `noindex,nofollow`; six public routes appear in `sitemap.xml` and `robots.txt`.
- `vercel.json` adds baseline headers without breaking inline scripts or external Supabase clients with a premature Content Security Policy.
- Automatic static checks in `scripts/validate-launch-readiness.mjs` validate private indexing, public sitemap destinations, headers and client-side secret signatures.
- An opt-in `scripts/verify-public-http.mjs` probe checks real HTTPS page accessibility and headers; GitHub Actions only executes it when the owner manually requests public verification.
- The release/operations handover is documented in `docs/final-launch-handover-2026-11-13.md`.
- Owner activation remains blocked: at the latest check the database had 3 registered accounts, 1 email-confirmed account, **0 admin staff roles**, **0 active enrollments**; the specifically configured founder identity was not yet confirmed.
- Latest Vercel production build is READY; deployment protection is still enabled and `live=false`. This is NOT a public launch.

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
