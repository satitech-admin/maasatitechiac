# Maa Sati IAC — 12-Month Career Programs and Founder Curriculum Studio

Date: 10 November 2026

## Live pages
- Student programs: https://maasatitechiac.vercel.app/programs.html
- Founder email activation: https://maasatitechiac.vercel.app/founder.html
- Founder curriculum authoring: https://maasatitechiac.vercel.app/curriculum-admin.html
- Existing learning portal: https://maasatitechiac.vercel.app/platform.html
- Existing student support: https://maasatitechiac.vercel.app/assistant.html

## Four 12-month program tracks (published)
1. Full Stack Web Development
2. Artificial Intelligence & Machine Learning
3. Data Science & Analytics
4. Mobile App Development

Each track contains twelve curated month-by-month units. Each unit has topics, a project milestone and a measurable outcome, for a total of 48 monthly units. Roadmaps are public to browse. Students must have an active or completed paid/approved enrollment record in the related course to mark a milestone complete. No fabricated progress is generated.

## Mock assessment
- 8 published quizzes, two per program.
- 40 hand-authored multiple-choice questions, five per quiz.
- Question/choice content is readable publicly.
- Correct answer keys and full explanations cannot be read directly by anonymous visitors or authenticated students.
- Students sign in to submit. The database RPC `iac_submit_mock_quiz(uuid,jsonb)` checks answer count, choices, source quiz and the session user; it computes an authentic score, saves that attempt and returns feedback.
- Up to 15 quiz submissions per student per rolling hour; this is a simple user-level abuse limit, not comprehensive anti-fraud.
- Retakes are educational practice. Scores are not official exam certificates or guaranteed program completion.

## Interview preparation
- 32 question prompts across 4 tracks, split into technical, behavioral, project-defense and scenario categories.
- Answer practice is saved under the student's account with RLS; an instructor/authorized staff role may review those records.
- Rubric and self-review guidance are visible without claiming an AI score.
- The `iac-interview-coach` Edge Function implements optional AI-generated feedback after a valid secret is configured; if no secret exists, it returns a disclosed rubric-only fallback, not a fake model response.
- The coaching endpoint validates session, published question, answer size, and hourly usage limits. Feedback history is private; the student's original answer is **not** copied to the coaching-log table.
- AI activation requires `OPENAI_API_KEY` in the Supabase project Edge Functions' secrets and provider billing/eligibility. Do not place keys in GitHub or frontend code.

## Founder administration
The authorized founder mailbox is **nikhilbaraskar551@gmail.com**. This address is already hardcoded in the database founder claim function, which **only** grants admin after a user successfully authenticates with this *verified* mailbox.

1. Open `/founder.html`.
2. Request an email OTP/magic link to the approved mailbox, then verify it in the browser.
3. After the session's email is confirmed, the page invokes `iac_claim_founder_admin()` to assign the `admin` role to that authenticated user.
4. Use `/curriculum-admin.html` to edit roadmap months, add technical/behavioral interview questions, create draft mock quizzes, add answer-keyed questions and publish only when at least three valid questions are present.
5. Use `/platform.html#admin` for course, school, enrollment, instructor and certificate operations.

The founder account **has not been registered or email-verified yet** as of the last audit. ChatGPT cannot verify an email without the owner's inbox action and must not assign a privileged role through a bypass.

## Supabase implementation details
- `iac_programs`, `iac_program_months`, `iac_program_progress`
- `iac_mock_quizzes`, `iac_mock_questions`, `iac_mock_answer_keys`, `iac_mock_attempts`
- `iac_interview_questions`, `iac_interview_practice`, `iac_interview_coaching`
- RPCs: `iac_submit_mock_quiz`, `iac_admin_add_quiz_question`, `iac_admin_publish_mock_quiz`, existing `iac_claim_founder_admin`.

Every new table has RLS enabled. Quiz answer keys are not directly accessible to client roles; curriculum authoring is restricted by admin checks and database policies.

## Remaining production checks
- Authenticate actual founder account through live email and verify the role claim, outbound email configuration, passwordless/magic-link redirects, and access from separate browsers.
- End-to-end quiz scoring with a real authenticated test student, including repeated attempts, correct/wrong answers and rate limits.
- Real enrollment and progress tracking with an actual approved student account; public visitors must not mark course months complete.
- Founder curriculum edits, new draft quiz and publish from the UI; verify students only see published quizzes.
- AI interview coaching with a valid server-side secret and provider billing after explicit configuration.
- Real video recordings, live classes, assignment grading, parent/guardian workflow, institute-approved course fees/payment and certificate issuance remain separate launch requirements.
- Review minors' privacy, account deletion, consent and any employment/placement-related marketing claims.
- A Vercel READY status and static syntax check do not constitute multi-user end-to-end certification.
