# Maa Sati IAC — Guardian Consent and Enrollment Acceptance
**Phase completed in code:** 16 November 2026
**Scope:** School guardians, verified institute reviewer decisions, enrolled learner access and private auditing. This is not a public launch sign-off.

## Implemented, deployed and verified
- Verified founder/admin signs in through the existing Supabase Auth flow. Student and staff routes retain their existing authentication and RLS checks.
- School student guardian requests are submitted via the existing `public.iac_resubmit_guardian` RPC. This does **not** constitute permission from a parent/guardian.
- Pending guardian requests in `onboarding.html` now require a real-world verification method on approval plus a review/rejection evidence note (20–800 characters). A private admin history shows the latest 20 guardian decisions.
- `public.iac_review_guardian_consent(uuid,boolean,text,text)` authorizes verified admins, locks and checks pending requests, validates school status and method, writes the decision and a private record in `public.iac_guardian_review_audit`. The old three-argument endpoint is not executable by `authenticated` or `anon`.
- `platform.html#admin` now requires evidence notes for **Approve**, **Reject** and **Mark course complete** actions, and uses `public.iac_review_enrollment(uuid,text,text)` instead of direct table updates.
- Enrollment RPC checks verified admin, real state transitions, confirmed student email, published course and student eligibility. The existing DB guardian enrollment trigger remains a second safety gate.
- `public.iac_enrollment_review_audit` stores enrollment status decisions with actor and timestamp. The admin workspace displays its latest 20 private reviews.
- Direct `UPDATE` privileges on `public.iac_guardian_consents` and `public.iac_enrollments` were revoked for anonymous and authenticated clients. New audit tables have RLS enabled and read access limited to verified administrators. Their writes are not exposed through browser table grants.
- Existing payment capture uses a separate backend `SECURITY DEFINER` flow; it was not converted into a manual reviewer action. Payment delivery and reconciliation still require real test transactions.

## Automated and database tests
GitHub Actions: [successful source checks](https://github.com/satitech-admin/maasatitechiac/actions/runs/43817105940).

Transaction-only SQL tests, with final `ROLLBACK`, passed:
1. Owner action cannot activate a school enrollment with no approved guardian.
2. School student can submit an unapproved guardian request through the permitted RPC.
3. Verified admin can reject a synthetic request with a note; audit record is written.
4. Synthetic approved guardian state permits approved enrollment transition and then completion status, each with audit records.
5. Unauthorized account cannot review enrollments or read the two audit histories.
6. Direct table updates and the obsolete three-argument guardian review RPC are not available to `authenticated`.

**No live consent was approved, no student enrollment was activated and no synthetic certificate was issued by these tests.** Simulated verification was isolated inside a rollback-only transaction and is **not** evidence of real guardian approval.

## Required human acceptance — do not mark complete until genuinely tested
1. Student signs up with their own verified email and correctly selects school level (Class 9–12).
2. Student uses [Account Onboarding](https://maasatitechiac.vercel.app/onboarding.html) to submit a real parent/guardian's name and email. Never put identity documents or OTPs in reviewer notes.
3. Institute staff independently confirms guardian authority and consent using a legitimate phone/school/in-person process, according to the institute's safeguarding policy.
4. Founder signs in to Onboarding, checks the actual result, selects the true method, records the evidence summary and approves **only if genuinely verified**. Check private guardian audit.
5. Founder goes to [Admin Enrollments](https://maasatitechiac.vercel.app/platform.html#admin), reviews the student's profile/course/consent, enters genuine admission evidence and approves.
6. Student logs in on a separate browser/device. Verify permitted lessons are visible, another learner's private data is inaccessible and progress/quiz/project checkpoints work.
7. Complete a real project, review work, issue one genuine credential and verify PDF/QR/revocation using the established certificate workflow.
8. Founder reviews [Launch Evidence](https://maasatitechiac.vercel.app/launch.html) and [Account Acceptance](https://maasatitechiac.vercel.app/account-acceptance.html), recording only real evidence with no student secrets.

## Remaining release gates
Production on the latest inspection had **1 pending school enrollment, 0 approved guardians, 0 active enrollments, 0 certificates and 0 persisted review-audit records**. This is expected until actual people complete the steps above.

The Vercel deployment is READY but the project still reports `live: false` and SSO protection enabled. Public HTTPS, genuine guardian identity validation, accounts for real staff and students, payment/webhook integration, SMTP delivery, mobile/browser acceptance and institute privacy/safeguarding owner approval remain open. Security Advisor flags for inherited SECURITY DEFINER functions and leaked-password protection should be reviewed separately, not silently waived.

**No production demo data was fabricated and no public access protection was disabled.**
