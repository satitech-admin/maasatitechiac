# Maa Sati IAC — Owner Launch Acceptance Tracker
Updated: 13 November 2026

## Purpose
This is the administrative record of real-world launch acceptance results. It **does not run** external verification automatically and must not be used to claim that a Vercel deployment marked READY has passed school-student, payment, email or public-access testing.

Open `/launch.html` after signing in to an authorized Maa Sati IAC admin account. The page checks `iac_launch_readiness()` before displaying institute information, and then displays the **Launch Acceptance Evidence** section.

## Using the checklist
For each of the 12 release checks, select:
- **Pending** — no verified real test performed yet.
- **Blocked** — an issue remains; write what failed and how to reproduce it.
- **Owner-verified** — an authorized person actually performed the required test and documented the result.

Click **Save this check**. Blocked or verified results require a 15+ character evidence note and all notes are capped at 1,500 characters. Owner-verified status also requires an explicit confirmation in the browser. Notes must **not** include passwords, OTPs, API keys, government IDs or personal information about minors.

Recent decisions appear in the private launch audit history. The database automatically records who made each change and when.

## The 12 required checks

| Check | Suggested acceptance evidence |
| --- | --- |
| Founder account | Confirm actual founder email and administrator access |
| Login and recovery | Test registration confirmation, sign-in, sign-out and password reset |
| Guardian consent | Test rejected/pending school learner access and genuine verified approval |
| Student enrollment | Real enrolled student's lesson access; cross-account privacy |
| Quiz, project, certificate | Real quiz result, project, mentor review, signed credential and verification |
| Support notifications | Student support request, staff response and notification delivery |
| Payment gateway | Provider TEST mode, verified webhook, receipt, duplicate events and refund |
| Course recordings | Real private lesson/recording, enrolled and unenrolled access |
| AI tutor | Server credentials, grounded answers, student safety and usage limits |
| Mobile and accessibility | Phone and desktop layouts, keyboard focus, forms and navigation |
| Public DNS/HTTPS | Owner-approved public site access, SSL and opt-in HTTP smoke checks |
| Legal/privacy | Institute-approved privacy, guardians, deletion, retention and safeguarding policies |

## Technical safety
- Data tables: `iac_launch_acceptance` (current state) and `iac_launch_acceptance_audit` (append-only admin change log).
- Both tables have row-level security and admin-only read policies. Browser roles have **no direct INSERT or UPDATE** permission.
- Admin updates pass through `iac_save_launch_acceptance(p_key,p_state,p_note)`, which checks the verified admin role and validates gate keys/status/evidence. Anonymous callers cannot invoke the RPC.
- A successful owner attestation is **not independent proof** of a completed external workflow.
- Database integration tests used temporary role setup and ended with `ROLLBACK`. They left **zero** acceptance results and audit entries.
- CI checks the launch page integration and maintains the normal HTML/JS, route and privacy-header regression tests.

## Current release blockers (checked 13 November 2026)
- Supabase had **zero activated institute admin roles**, no active student enrollment and no real issued certificates.
- Vercel production deploy was **READY** but project **live=false**, with SSO protection enabled on Vercel subdomains. Do not claim public access is available.
- Real identity checks, school guardian approval, payment integration/checkout, AI model activation and production HTTPS tests must still be completed with authorized users.
- Leaked-password protection was flagged disabled by Supabase security advisor and should be reviewed in the Authentication configuration.

## Release rule
Consider a public launch **accepted only after** all required checks are documented with real evidence, the actual public HTTPS smoke test succeeds, security and privacy checks pass for real accounts, and the project owner explicitly approves the release. The dashboard does not automatically disable Vercel SSO or publish a site.

## Deployment quota observation — 13 November 2026

The source for the acceptance-history display and regression checks was committed to `main`; latest GitHub Actions validation succeeded. Vercel production was still serving an earlier READY build when this was checked. A new Git-backed production deployment attempt was rejected with **402 `api-deployments-free-per-day`** (daily deployment quota reached). No deployment was created by that attempt. An authenticated Vercel CLI fallback is not available in the current working environment.

**Do not mark the latest acceptance-history UI as deployed** until a later Vercel deployment reports a Git SHA that contains the `launch.html` audit-history change. Owner may resolve the Vercel usage limit from their project/team dashboard and then run the intended production deployment. This quota issue is separate from the pre-existing SSO public-access block.


## Account self-test workflow — source implemented

The `account-acceptance.html` diagnostic complements the admin-only 12-gate acceptance tracker. It is read-only, and any account owner may use it **after** being able to access the site and sign in. A signed-in user can check identity verification, account profile, enrolled courses, lesson checkpoints, quiz attempts, real project records, notification inbox access and assigned staff role. Each outcome is explicitly PASS, PENDING or ERROR. A copied plain-text result excludes email addresses and account IDs.

A green checkpoint-access test proves only that the signed-in user can query their own records; it **does not** prove course completion or cross-account privacy. The real mentor/staff and guardian flow still needs separate authorized tests. The diagnostic does not record or issue certificates, approve grades, accept payments or mark owner acceptance gates as verified.

User acceptance steps: activate founder email, test one adult learner and one school student with real guardian permission, complete a genuine quiz/project workflow, then run the diagnostic as each authorized account and document the results in `/launch.html`.

**Deploy caveat:** Vercel's last observed production SHA predates this page. GitHub Actions passing does not mean the new page is publicly reachable. A later successful production deployment and an owner-approved public-access configuration are mandatory.


## Expanded read-only learner acceptance — 13 November 2026

The `account-acceptance.html` diagnostic now shows **12 checks** instead of nine: authenticated account, email verification, declared student profile, verified school guardian permission, actual enrollment, checkpoint access, quiz attempts, project submissions, current valid skill badges, official certificate authenticity, notification visibility and correct learner/staff role separation.

Important behavior:
- A school learner sees **Pending** until the institute's consent record is approved with reviewer and verification timestamp. An ordinary college learner does not require school guardian approval, though self-declared status does not substitute for independent identity verification.
- Badge eligibility is based on the private `iac_student_learning_snapshot` result containing current **non-revoked** badges. Merely viewing lessons or submitting a project never earns a badge.
- A certificate is only counted after the signed-in recipient can read their own active certificate and `iac_verify_certificate` returns `valid=true`. Certificate codes, recipient names and email are **not included** in the copied summary.
- Standard learner permissions are shown as an expected PASS when they have **no staff/admin role**; this does not imply they qualify for a mentor role.
- Error-message copies redact email addresses, UUIDs and links. The client performs only reads and verification RPCs, never issues credentials or mutates enrolment.
- Database rollback-only integration tests passed for signed-in learner access to a genuinely issued test course certificate, official validation, a distinct signed-in non-admin account being unable to read that certificate, and revoked certificate validation returning false. Every synthetic account fixture/certificate was rolled back.
- GitHub automated QA checks all new acceptance cases and read-only behavior; real student/mentor browser sign-off still requires owner-controlled verified accounts.

**Launch result remains pending:** no active enrollments, real badges/certificates or owner-verified launch checks were found at the latest database inspection. The production build is READY but the site remains SSO protected and `live=false`.
