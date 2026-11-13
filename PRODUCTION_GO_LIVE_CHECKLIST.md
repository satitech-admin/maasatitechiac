# Maa Sati IAC — Final Production Security & Launch Readiness

Date: 10 November 2026

## Live launch diagnostic
https://maasatitechiac.vercel.app/launch.html

This page is intended for the **verified founder/admin only**. It uses `iac_launch_readiness()` and displays current real database counts, RLS checks, installed enrollment/notification gates, and external verification tasks. Unauthorized accounts receive no aggregate data.

## Technical work completed in this phase
- Added `public.iac_launch_readiness()` (SECURITY INVOKER) with explicit `iac_is_admin()` authorization.
- Restricted direct API execution of `iac_guardian_ready(uuid)`: arbitrary signed-in users cannot probe another student's guardian approval status. Internal security-definer validation triggers still use the function.
- Added guarded launch dashboard (`launch.html`) displaying live, not invented, numbers.
- Linked launch dashboard from the student learning platform.
- Confirmed web page syntax, Supabase permissions and production deployment.
- Existing student data and prior IAC courses were not modified.

## Findings at time of audit
- 4 published courses.
- 20 published lesson records.
- 0 student profiles.
- 0 activated founder/admin roles.
- 0 published school events.
- 0 private recording URLs.
- 0 issued certificates.
- 0 verified course payments.
- Anonymous users cannot invoke the launch readiness database function.
- Authenticated users can invoke the function but receive a 42501 authorization error unless `iac_is_admin()` is true.
- Supabase security advisors still report warnings for existing intentional `SECURITY DEFINER` functions (certificate lookup, claims and approvals). They were not silently marked as passed; authorization details must be reviewed with real identity tests. An RLS-no-policy info warning for the **internal** payment webhook event table reflects deliberate no-client-access.

## Release blockers requiring owner credentials or live tests
1. Founder: register/confirm the institute-authorized email via the actual learning portal. The founder role cannot be activated for an unconfirmed account.
2. Supabase Auth: verify production site URL and exact `/onboarding.html` redirect allowlist; configure real SMTP sender and test registration, confirmation, password recovery and logout.
3. Create actual, consented student/teacher/guardian test accounts and verify RLS isolation, administrative approvals and guardian enrollment restrictions in separate sessions.
4. Upload one real course recording and verify only an active student can access it. Publish a real class and test assignment, notifications and grading.
5. Complete Razorpay merchant onboarding and secrets in Supabase. Run Razorpay TEST-mode authorized transaction and confirm server-side capture before any live charge.
6. Configure AI API key on the server if generative tutoring is intended. Validate model cost, provenance and student safety.
7. Approve one genuine project/certificate based on actual completion, then download the signed PDF and verify its QR code and revocation.
8. Adopt appropriate guardian-consent policy, retention period, account deletion procedure and support response expectations.
9. Validate mobile devices, keyboard access, route redirects and production email delivery. Deployment READY alone does not validate user workflows.

## Production policy
Do NOT claim fully launched, 100% tested, production-certified or real payment ready based only on a successful Vercel build. Keep payment checkout disabled without provider credentials and real fee configuration. Do not fabricate user/student records to make dashboards appear populated.


## Launch hardening update — 13 November 2026

Source and deployment checks performed on the live-connected repository/project:

- 21 main HTML pages, 26 embedded scripts, and 200 internal routes passed automated checks in the GitHub Actions QA workflow.
- 15 private student/staff/administration pages now receive `X-Robots-Tag: noindex, nofollow, noarchive` and `Cache-Control: private, no-store, max-age=0` in addition to existing page-level noindex metadata. These headers help prevent search indexing and caching; they do **not** replace login permissions or database RLS.
- `robots.txt` / `sitemap.xml` list only the six established public institute routes. Public pages were not placed under private noindex headers.
- The existing opt-in `scripts/verify-public-http.mjs` tests public HTTPS access. Do not run or declare it passed as launch acceptance until deployment protection and the domain are intentionally configured.
- At the 13 November audit, Vercel reported deployment `READY` but project `live: false` and SSO protection enabled on Vercel subdomains. The `maasatitechiac.vercel.app` domain itself was verified in Vercel, but public reachability remains blocked.
- Supabase had zero active student enrollments and no real projects/certificates. Real student, instructor, guardian, password recovery and payment acceptance are still pending.

### Owner release sequence (no bypass)
1. Choose a public production domain and determine whether Vercel's project-wide SSO protection should remain for preview deployments only. Preserve protection for internal previews and admin functions where possible.
2. Verify domain ownership, DNS/SSL, and public HTTPS response using the opt-in smoke test. Keep API keys and private data out of static web assets.
3. Verify Supabase Auth production Site URL, redirect allowlist, registration email delivery and recovery with authorized users.
4. Test one real enrolled adult learner and one guardian-approved school learner, with appropriate staff approval, quiz/project workflow and genuine certificate issuance.
5. Test support notices, fee/payment confirmation, mobile layout, keyboard navigation and anonymous authorization failures.
6. Only after these checks are green: obtain launch approval and update the project status from **deployment ready** to **production accepted**.

### Open security configuration
Supabase advisor reported leaked-password protection disabled; enable/check this in Supabase Auth settings if available. Keep actual certificate and payment approvals governed by backend policies.
