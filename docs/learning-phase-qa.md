# Maa Sati IAC — Learning Journey & Skill Verification QA
Updated: 2026-11-13

## Scope
This phase covers beginner onboarding, the learning dashboard, the private guided journey, all 48 skill guides, lesson/practice checkpoints, quiz results, skill-project submissions, mentor feedback, and authorized certificate issuance.

## Verified in connected source and database
- 4 published career programs, 48 monthly skills, 48 published skill guides, and 48 published skill assessments.
- Student dashboard calls `iac_student_learning_snapshot` for authenticated progress and `iac_student_quiz_history` for paginated scores.
- Private lesson checkpoints have owner-only SELECT, INSERT, UPDATE policies, with active enrollment checked on writes.
- Read-only permission check: anonymous role has no checkpoint SELECT or INSERT, authenticated role has SELECT/INSERT but no DELETE. RLS is enabled with three owner policies.
- Transaction-scoped negative authorization tests passed: unauthorized authenticated caller was rejected by `iac_review_skill_project`, and an unenrolled identity was rejected by checkpoint INSERT. Both transactions were rolled back; no student rows created.
- Private practice reflections are limited to 2,000 characters in the database. Their self-reported status is separate from certified progress.
- Skill-project submission requires actual enrollment, a recorded passing assessment and a student-owned submission (database RLS).
- Skill-project approval calls `iac_review_skill_project`: authenticated administrators only, no self-approval, rechecks student enrollment and quiz eligibility, issues badge+certificate transactionally.
- Project form includes functional link, testing/explanation, and original-work confirmations. Mentor page includes separate verification checkboxes.
- Pending mentor queue is fetched separately from recent decisions and paginated oldest-first.
- Latest page JavaScript was individually syntax-checked; five pure journey-status scenarios passed.
- Local route inventory: 15 unique .html targets among the eight main pages, all verified to exist in GitHub.
- Vercel production deployments for these commits reported READY.

## Production reachability blocker
- Vercel's current project settings show `ssoProtection.enabled = true`, `deploymentType = all_except_custom_domains`, and `live = false`.
- Its domains currently listed are Vercel subdomains, not an exempt custom public domain. A `READY` deployment therefore does **not** establish public student accessibility.
- Do not disable SSO, create an indefinite bypass, or publish private administrative material as an automatic side effect of QA. Deployment protection needs deliberate owner configuration before a public launch.

## Not yet validated end-to-end
- A real, authorized student signing in, enrolling, saving a lesson and practice reflection, passing an assessment, and submitting a working project.
- An authorized institute admin opening that submission, requesting changes, approving a revised project and confirming certificate verification.
- Full device/browser accessibility and navigation testing behind Vercel SSO.

At the time of the database audit there were 3 registered accounts but **0 active enrollments, 0 skill project submissions and 0 lesson checkpoints**. Do not create synthetic production credentials, falsely award certificates, or mark these E2E tests as passed.

## Manual acceptance flow (authorized real accounts only)
1. Sign in as an enrolled student. Open `/learning-journey.html`, select an active program and open a Month 1 lesson.
2. On `/programs.html` record `lesson_read`, a practice reflection (15+ characters if marking practice done), and `practice_done`. Refresh the journey and verify the state is labeled **Self-reported**.
3. Save personal notes separately. Verify notes are still writable and that another student cannot read them.
4. Take the real skill assessment. Confirm the score appears in My Learning without claiming a badge.
5. Submit a real working HTTPS project link, write the explanation and check all three confirmations. Verify status is pending review.
6. Sign in as an authorized institute admin at `/skill-review.html`. Review the demo and source. Request changes and include written feedback.
7. Back as the student, view the feedback, revise and resubmit. Confirm status returns to pending.
8. As an admin, review the resubmitted project, complete verification checks, and approve. Confirm the real certificate appears in the student profile and verification endpoint.
9. Verify anonymous users or other students cannot access private records, admin review pages, or issue credentials.
10. Repeat on narrow mobile and desktop browser widths; verify keyboard focus, input labels and links.

## Automation
`node scripts/validate-iac-site.mjs` checks inline JavaScript syntax, essential internal routes and expected workflow integration. GitHub Actions is configured at `.github/workflows/iac-learning-qa.yml`. Workflow execution status must be checked independently before claiming a successful run.

## Operational protection
- Never use service-role keys in browser JavaScript.
- Never create or approve certificates based solely on lesson-viewed/practice checkbox state.
- Keep student data private; students' project content should be publicly showcased only after proper authorization and consent.
- Vercel production READY means deployed files built successfully. It does not prove signed-in end-to-end flows have passed.
