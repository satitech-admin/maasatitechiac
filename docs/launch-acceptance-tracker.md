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
