# Maa Sati IAC — Final Launch Acceptance Evidence

Status checked: 14 November 2026 (Asia/Kolkata).

## Latest development milestone
- The private administrator launch dashboard at `/launch.html` now shows an **evidence-based release decision** separate from green database-security checks.
- Its decision includes objectively measured conditions: at least one activated administrator, one approved real learner, one genuine issued certificate, and key notification/guardian database controls.
- It also counts all 12 administrator-reported acceptance checks. Unrecorded and blocked checks keep the release decision on **HOLD**.
- Even when every owner-reported check is saved, the dashboard says **OWNER REVIEW — Not launched**, never “public launch complete.”
- Owner administrators may copy a redacted summary of gate status. The summary excludes student identity information and private evidence notes.
- All acceptance records remain restricted to authorized administrators. A transaction-scoped database test verified authorized writes, audit-history creation and unauthorized read/write denial. The transaction was rolled back.

## Current live-data blockers
The connected database reported 0 activated admin roles, 0 active student enrollments and 0 saved acceptance records on 14 November 2026. Do not fabricate production student results or issue certificates to make this green.

The Vercel deployment may report `READY` even while the project is `live: false`. Deployment protection (SSO) was enabled on Vercel subdomains at the most recent project check. The website is **not independently verified as publicly accessible**.

## Security and verification boundaries
- **Backend integration tests passed:** rollback-only student progress/privacy, skill project approval/certificate issuance, support reply and status transaction, course announcements, admin acceptance write and audit.
- **Static CI passed:** source syntax, essential routes, privilege-sensitive release markup, private headers, public sitemap and learner state scenarios.
- **Not independently passed:** live login/recovery emails; real school guardian consent; real student/instructor browser accounts; paid checkout/webhook/refund; mobile accessibility; public HTTPS smoke test.

## Owner acceptance procedure
1. Open `https://maasatitechiac.vercel.app/onboarding.html` with the authorized founder account, complete email verification and founder access setup without sharing password/OTP.
2. Open `https://maasatitechiac.vercel.app/account-acceptance.html` while signed in. Run read-only checks and keep the result private.
3. Open `https://maasatitechiac.vercel.app/launch.html` as an authorized administrator. Record each real test as **Pending**, **Blocked**, or **Owner-verified** with a concrete evidence note. The log is append-only for regular clients.
4. Complete guardian consent, real student enrollment/quiz/project/certificate, signed support communications, payment test, mobile/accessibility, privacy and account deletion acceptance.
5. Decide public exposure/production domain explicitly with the owner. Configure safe Vercel protection, DNS and SSL without exposing staff-only data.
6. Run the GitHub Actions **Optional public HTTPS smoke check** after owner approval. Confirm production HTTP 200 and private `noindex`/`no-store` headers.
7. Export the private release summary and complete owner sign-off only after evidence and independent public access checks are complete.

**Important:** This document is a technical handover, not a declaration of production readiness.
