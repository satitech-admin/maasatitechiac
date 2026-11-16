# Maa Sati IAC — Verified Course Completion & Certificate Readiness
**Implemented:** 16 November 2026  
**Scope:** student learning progress, founder completion review, verified skill badges and course certificate integrity.

## Completed changes

1. **Server-side completion evidence:** `public.iac_course_completion_readiness(p_enrollment)` returns course enrollment state, completed/total published lessons, earned/required verified monthly badges, and a Boolean completion gate. The function requires a signed-in, verified institute administrator; it does not allow anonymous or ordinary student inspection of another learner.
2. **Real completion gate:** The existing `public.iac_review_enrollment` now rejects a manual transition to `completed` unless all published lessons have real recorded completion and **every published skill assessment has a valid, nonrevoked, mentor-awarded badge**. An admin note alone is not enough. Admission approval and rejection continue to use evidence notes and audit history.
3. **Founder UI:** `platform.html#admin` now provides a **Check course completion evidence** button on active enrollments. It shows actual lesson and badge counts. The **Mark course complete** action starts disabled and only unlocks after the backend confirms readiness; the backend rechecks at decision time.
4. **Fixed certificate uniqueness:** The former `iac_one_valid_course_certificate` index mistakenly limited all `skill` certificates for the same student and course to **one total**, which prevented issuing months 2–12. It now excludes `certificate_type='skill'` while retaining the existing unique **recipient + skill month** index and non-skill course certificate duplication protections. No live certificates were present when the index changed.
5. **Mentor review evidence:** `public.iac_review_skill_project` now requires a real-world project review note of **20–1,500 characters for approved projects**. Rejected projects continue to require a reason. The mentor screen requires the same note and keeps the three project-review checkboxes.
6. **Correct lesson progress:** `public.iac_get_progress` now counts only completed *published* lessons, avoiding totals inflated by content later unpublished. `my-learning.html` displays the student's real published lesson completion alongside verified skill badges.

## Validation performed

- [GitHub CI passed](https://github.com/satitech-admin/maasatitechiac/actions/runs/43819568008): page JS syntax, navigation, learner stage scenarios, release safety and new evidence-flow regression guards.
- **Database negative-path test passed:** In a rollback-only guardian/enrollment fixture, a full-course completion attempt was rejected without the five published lessons and twelve verified badges. No real records were retained.
- **Database permission test passed:** a verified founder can obtain private course completion counts, whereas a signed-in ordinary student cannot invoke the admin-only readiness endpoint.
- **Certificate index fixture test passed:** twelve distinct monthly skill awards coexist, a repeated skill month is blocked, and a duplicate full-course certificate is blocked using an isolated *temporary* SQL fixture. Production index definitions were also inspected and matched the intended predicate.
- **Actual positive-path certificate issuance is NOT yet verified with a real learner.** An attempt to simulate the full production path was not run through to completion by the connected tool's safeguards. It must be tested using genuinely approved, consenting learner records and authorized mentor review; no fake grades, projects, awards or guardian consent should be added to make a dashboard green.

## Measured catalog requirements

Each of the four published courses (App Development, Artificial Intelligence, Data Science and Web Development) currently has **5 published lessons and 12 published skill assessments**. The system must **not** hardcode these values: both completion counts are dynamically derived from current published content.

## Real-user acceptance before launch

1. Student and guardian complete *genuine* enrollment and consent verification.
2. Founder approves that real enrollment through the audited admin route.
3. Student completes and saves each of the five published lessons.
4. Student passes the twelve skill quizzes and submits twelve genuine project examples.
5. Verified mentor or founder reviews each real project and records meaningful feedback. Only then are twelve unique badges and certificates issued.
6. Founder checks **Course completion evidence**. Once all published requirements have been met, reviews the audit evidence and marks course complete.
7. Founder issues and verifies the official full-course certificate, its online verification/QR result and recipient-only signed PDF download.
8. Confirm a second skill badge can be awarded for a *different* month, but the *same* skill month and active full-course certificate cannot be duplicated.
9. Run mobile and browser acceptance tests; verify privacy/RLS and recovery, payments, email deliverability, school guardian consent and HTTPS launch separately.

## Current operational status
As of the final production data check, there was **1 pending enrollment, 0 approved guardians, 0 active learners, 0 course completions, 0 recorded lessons, 0 earned skill badges and 0 issued certificates**. These are actual live counts, not defects to conceal.

Vercel reports latest deployment `READY`, but project `live:false` and SSO protection are still enabled. Do not claim public launch completion.

**The technical implementation of this phase is deployed and its current negative-path/permission tests passed. The full positive-path journey remains a real-user acceptance requirement.**
