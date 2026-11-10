# Maa Sati IAC — Onboarding & Launch Audit (10 November 2026)

## Shipped
- Live onboarding page: https://maasatitechiac.vercel.app/onboarding.html
- Linked from homepage and learning platform navigation
- Student profile completion after email confirmation
- Teacher / School Coordinator requests, subject to **verified founder/admin approval**
- Guardian name/email submission and administrative consent verification for school learners (Class 9–12)
- Enrollment and school-program database gates for school learners with pending guardian verification
- Admin-side staff approvals / rejections, staff access audit, guardian verification method
- Password reset request and password update UI
- RLS and database constraints ensure only approved staff have privileged access and approved guardian consents include verifier/time/method
- Full course/LMS site and existing features preserved

## Database resources
- iac_staff_requests
- iac_guardian_consents
- iac_staff_access_audit
- RPC: iac_resubmit_guardian, iac_review_staff_request, iac_review_guardian_consent, iac_guardian_ready
- Triggers: iac_enrollment_guardian_gate_trigger and iac_registration_guardian_gate_trigger

## Confirmed technical validation
- Both platform.html and onboarding.html JavaScript syntax checks passed.
- Vercel production deployment READY.
- Eight RLS policies and two guardian-gating database triggers verified.
- Anonymous callers are not granted staff-approval or guardian-approval RPC execution.
- Database constraints enforce evidence on approved guardian/staff decisions.
- Supabase security advisor still reports intentional SECURITY DEFINER RPC warnings; the approval endpoints require an authenticated admin inside their function bodies. These should receive a security review before a broad public launch.
- There were **0 activated admins, 0 real student profiles, 0 guardian requests, 0 teacher requests** at audit time. This is not a substitute for end-to-end authorization tests.

## Required owner actions BEFORE full production student admissions
1. Open https://maasatitechiac.vercel.app/platform.html and register with the authorized founder email already configured for admin bootstrapping. Confirm the email from the mailbox. Open https://maasatitechiac.vercel.app/onboarding.html; this invokes the founder claim, after which Admin access can be used. Never share account passwords or OTPs here.
2. Open Supabase Dashboard > Authentication > URL Configuration and set the exact production Site URL `https://maasatitechiac.vercel.app` and allowlist the exact onboarding redirect URL `https://maasatitechiac.vercel.app/onboarding.html`. This account's current Auth configuration could not be inspected with available connector actions.
3. Configure custom SMTP/email delivery in Supabase Auth for real confirmation and reset emails. Supabase's default Auth sender has low rates and is unsuitable for large enrollment volumes.
4. Create real test accounts through the public registration UI: one adult college student, one school student, one teacher applicant. Do not seed fake public student identities.
5. Verify a school student cannot register for seminar or gain active course access until guardian permission is **genuinely verified** by an institute admin (a checkbox is not sufficient).
6. Verify a teacher applicant cannot access admin tools before approval, and can view authorized staff data only after founder approval.
7. Test password reset from email delivery, expiry, login from a second browser, sign out, and account recovery.
8. Test duplicate account attempts, email confirmation link redirects, role escalation attempts, and guardian rejection/resubmission.
9. Set a real consent/privacy retention policy for minors, clarify guardian approval collection, and implement user deletion/data-rights processes before large-scale launch.
10. Validate a course enrollment and actual recording visibility for an approved student; then validate no access for non-enrolled users.

## Known limitations
- No end-to-end email-delivery or multi-account test is completed.
- There is no integrated automatic parent email approval link yet; guardian permission must be confirmed out of band (school record/phone/in person) and approved by admin. The site does **not** automatically email guardians.
- College-age minors could self-report another category; school/student eligibility should be verified by the institute's admissions process, not inferred solely from signup metadata.
- Teacher applicant verification is manual; the institute must verify employment/qualification externally.
- Real recordings, live schedules, merchant keys, LLM credentials, and student data remain as documented in other setup files.
- Preview and deployment status do not prove a complete production admission workflow.

## Useful documentation
- https://supabase.com/docs/guides/auth/passwords
- https://supabase.com/docs/guides/auth/auth-email-templates
