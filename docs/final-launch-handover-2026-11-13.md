# Maa Sati IAC — Final Launch & Operations Handover
Date: 13 November 2026

## Verified project identities
- Source: GitHub `satitech-admin/maasatitechiac`, branch `main`
- Deployment: Vercel project `maasatitechiac`
- Current alias: https://maasatitechiac.vercel.app
- Database/Auth: connected Supabase project `ylobnofwmryltbzdtkla`
- Browser app uses only a Supabase publishable key. Never put service-role/secret keys into HTML.

## What is technically implemented
- 4 published study programs, 48 published guides, 48 published skill assessments.
- Student enrollment, personal study plan, practice reflections, quiz/project submissions, private progress, mentor review, feedback and verified badges/certificates.
- Private student support, atomic staff replies/status changes, in-app notifications and admin-only course announcements.
- Guardian consent gate and explicit student category signup.
- Static response security headers: `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`, `Permissions-Policy`.
- `noindex,nofollow` metadata on private student, payment and administrative pages.
- `robots.txt` and `sitemap.xml` listing six public institute page URLs only.
- CI: `.github/workflows/iac-learning-qa.yml` runs source syntax/navigation, learning-state tests and launch privacy/config checks on pushes; opt-in manual public HTTP probe.

**Verification scope:** Database rollback-only integration and permission tests passed. Vercel reports the latest build READY. These results do not prove a browser-side or public visitor flow.

## Release gates: NO-GO until owner completes and verifies them

### 1. Institute admin activation
- Current connected DB check: 3 Auth users, 1 confirmed email, **0 active admin staff roles**. The specifically configured institute founder email has **not yet been confirmed** in this project.
- The existing `iac_claim_founder_admin` function grants founder access only to an authenticated, verified, specifically configured email. Do **not** grant an ad hoc admin row to bypass onboarding.
- Owner must sign in/create the correct verified institute owner account, complete its profile and open `/onboarding.html` or the institute portal, then verify a proper admin role appears.
- If the institute ownership email has changed, review and securely update the founder bootstrap configuration with owner authorization, not user-editable profile data.

### 2. Genuine student/instructor acceptance
- Current DB check: 0 active enrollments, 0 submitted skill projects and 0 support tickets.
- Use real authorized students and mentor accounts to test signup, consent where required, enrollment, lesson checkpoint, practice reflection, quiz result, project submission, instructor feedback/resubmission, approval, badge and certificate verification.
- Test genuine support replies and announcement delivery. Do not invent grades, purchase records, consents or student identities.
- Verify narrow mobile, desktop, keyboard access, student privacy and staff access denial.

### 3. Public domain and release protection
- Vercel deploy state READY but project `live = false` with SSO deployment protection enabled for its `vercel.app` domains. No custom domain is currently listed.
- The owner must deliberately decide how/when the public pages become accessible: configure/verify an owned custom domain or review Vercel Deployment Protection. Do **not** silently disable SSO or create an unaudited bypass.
- Confirm DNS, domain ownership, automatic SSL, HTTPS redirects and production URL. Once a different public hostname is selected, update `robots.txt`, `sitemap.xml`, any canonical URLs and Supabase Auth Site URL / Redirect URLs.
- Run `scripts/verify-public-http.mjs` against the actual HTTPS public base, or use the GitHub Actions **workflow_dispatch** option `public_http_check=true`. This test intentionally fails while SSO blocks visitors.
- Confirm that private URLs remain inaccessible without authorization even after public marketing pages open.

### 4. Auth, email, payments and operational safety
- Supabase security advisor reports **leaked-password protection disabled**; the owner should enable it if the Auth tier/configuration supports it.
- Verify confirmation/reset emails, sender reputation, production email links and the configured Auth redirect allowlist. Code uses `/onboarding.html` in confirmation flows.
- Check actual pricing/payment gateway callbacks and payment acknowledgment before taking real student fees. No claims of successful production payment tests have been made.
- Establish authorized access to Vercel, GitHub and Supabase; review role separation, backup/recovery plan, database migrations, incident contacts and renewal billing.
- Owner must approve accurate Privacy Notice / Student Terms, including a policy for children/guardian approvals, retention/deletion and contact details, before open school enrollment.
- Run full QA workflow and review **both** GitHub Actions run results and Vercel deployment logs; a Vercel-only green commit status is not proof that the separate GitHub Actions checks ran.

## Routine operations after launch
1. Use `/mentor-operations.html` to triage private support tickets, send admin-only course notices, and inspect pending review metrics.
2. Use `/skill-review.html` for genuine instructor review and verified badges; never approve projects based solely on self-reported lesson checkboxes.
3. Monitor enrollment, notification delivery and certificate verification; review Supabase security advisors after database migrations.
4. Re-test one student journey after any changes to `platform.html`, authentication functions, quiz grading, RLS, or certificate issuance.
5. Never paste service-role credentials into GitHub static files, HTML, or client-side JavaScript.

## Links
- Study plan: https://maasatitechiac.vercel.app/study-plan.html
- Student journey: https://maasatitechiac.vercel.app/learning-journey.html
- Support: https://maasatitechiac.vercel.app/assistant.html
- Mentor operations: https://maasatitechiac.vercel.app/mentor-operations.html
- QA report: `docs/qa-security-integration-2026-11-13.md`
- Static release test: `node scripts/validate-launch-readiness.mjs`
- Manual public test: `node scripts/verify-public-http.mjs`

## Final sign-off
The launch is **not fully signed off** until the owner confirms admin access, real-user testing, payment/email readiness, legal notices, and the public-domain HTTP smoke test. Deploying an SSO-protected build does not equal making the institute publicly live.
