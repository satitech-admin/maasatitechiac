# Maa Sati IAC — Security & Integration QA, 13 November 2026

## Scope
Student learning and practice, skill quiz evidence, real project review/approval, skill certificate generation, general course certificates, student support, staff notifications, course announcements and minor-learner enrollment safeguards.

## Fixes applied
1. **Atomic staff support RPC** `iac_staff_respond_ticket` saves the reply and any accompanying status change within one database transaction after checking a verified staff role. Invalid transitions do not leave a partial reply. Both `mentor-operations.html` and staff actions in `assistant.html` use this RPC.
2. **Ticket filter race**: `mentor-operations.html` queues pending refreshes instead of dropping changed filters while data is loading.
3. **Certificate code generation**: both `iac_review_skill_project` and `iac_issue_certificate` now call the schema-qualified `extensions.gen_random_bytes(7)`. The prior unqualified lookup failed with “function gen_random_bytes(integer) does not exist” under their protected search path.
4. **Guardian classification safeguards**: school accounts still need approved guardian consent; unclassified (“other”) accounts no longer bypass classification for enrollment. Student type cannot be self-changed after profile creation. Signup now requires an explicit student-type choice rather than defaulting to college. The staff navigation entry is hidden on logout.
5. **Regression checks** updated for atomic support actions and classification.

## Database rollback-only integration test results
All successful cases below ran inside explicit SQL transactions ending in `ROLLBACK`; no synthetic production enrollment, grade, badge, support request, or announcement was retained.

| Tested workflow | Outcome |
| --- | --- |
| Unauthenticated/nonstaff staff-response RPC call | Rejected |
| Open-ticket reply + premature close | Rejected; reply not persisted |
| Valid staff reply + in-progress transition | One reply, correct status |
| Staff support reply notification | Exactly one private alert |
| Quiz evidence → project → admin approval → skill badge + certificate | Passed |
| Skill certificate public verification | Passed |
| Completed course → admin course certificate → verification | Passed |
| Enrolled learner checkpoint, notes and study-plan writes | Passed |
| Different signed-in account reading private learner data | Blocked |
| Course announcement to one enrolled learner + audit entry | Passed |
| School profile without approved guardian consent | Enrollment gate not ready |
| Unclassified profile without verified student type | Enrollment gate not ready |
| School student changing classification to college | Blocked |

## Verification and caveats
- The SQL migrations and function definitions are in the connected Supabase project's migration history; the web pages and regression checks are in GitHub `satitech-admin/maasatitechiac`.
- A server-side simulated flow passing does **not** prove the browser, registration email, checkout, mobile layout, or actual roles are tested.
- No active enrolled accounts or real skill-project submissions were present at last database check.
- Vercel builds may be `READY` even though the project is not publicly accessible. SSO deployment protection was still enabled on Vercel subdomains at last check.
- Supabase security advisor noted leaked-password protection was disabled. Enable it in the Auth configuration if supported. Do not change account security defaults without an owner-approved launch plan.
- Account student-level selection is a self-declaration on signup. Independent proof of age/student category and required guardian authorization must be part of the real-user acceptance process before school onboarding.

## Release gates (not yet passed)
1. Authorized **real student and staff** sign-ins, complete assignment/quiz/project/resubmission/review/verified certificate flow in browser.
2. Real support-ticket reply + notification and real course announcement recipient delivery in signed-in clients.
3. Mobile keyboard/focus, responsiveness, email verification, fees/payments and guardian identity acceptance testing.
4. Intentionally configure public access with the owner, validate production domain/SSL and private-page/RLS behavior, then sign off launch.

## Relevant pages
- `/learning-journey.html`: learner journey.
- `/programs.html`: lessons, notes, practice and projects.
- `/study-plan.html`: private study preferences.
- `/mentor-operations.html`: authorized staff response queue and announcements.
- `/skill-review.html`: authorized admin credential reviews.
- `/analytics.html`: private notifications and academic progress.
