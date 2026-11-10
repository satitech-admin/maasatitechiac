# Maa Sati IAC — Private Student Learning Backend & Beginner UX

Updated: 10 November 2026
Production: https://maasatitechiac.vercel.app/

## Working student URLs
- Personal learning hub: https://maasatitechiac.vercel.app/my-learning.html
- Full private profile: https://maasatitechiac.vercel.app/profile.html
- Published beginner-friendly roadmaps: https://maasatitechiac.vercel.app/programs.html
- Classes, assignments, institute notices: https://maasatitechiac.vercel.app/analytics.html
- Signed-in portal: https://maasatitechiac.vercel.app/platform.html
- Verified badge public check: https://maasatitechiac.vercel.app/skill-badge.html

## Backend added
### Authenticated student snapshot
`public.iac_student_learning_snapshot()` is a stable, SECURITY DEFINER, JSONB function for use only by `authenticated`. It obtains `auth.uid()` itself, accepts no user ID parameter, and refuses unauthenticated sessions. It combines:
- Each of four programs with actual enrollment status, total published monthly skill assessments, genuinely awarded non-revoked badges, passing skill quizzes and project submission counts.
- All 48 published monthly skill modules with titles, topics, month number, actual student best/latest score and quiz attempt count, quiz pass status, real project submission/review/feedback status, verified certificate code if earned, enrollment flag and one current "next step" hint.
- Up to 100 recent actual quiz submissions (for light initial profile summaries).
- All genuine non-revoked skill badges linked to a verified official certificate record.
- Unread authenticated notification count.

No scores or badges are fabricated for a user with no quiz or certificate records.

### Paginated complete quiz history
`public.iac_student_quiz_history(p_page integer,p_page_size integer)` serves score, question-count, quiz name, program, timestamp and complete private attempts in pages of 1–50, with total and has_more. It never exposes answer keys or other users' attempts. The student hub shows 25 per page and a Load More button.

### Beginner learning guides and notes
- `public.iac_skill_guides`: 48 publicly readable, published, curated mini-lessons, one per monthly skill. Specific short explanation, small hands-on activity, four progress steps and links to legitimate official docs.
- `public.iac_skill_notes`: private, row-level student-owned notes tied to each skill, up to 3,000 characters. Signed-in users may write notes even before course enrollment, but cannot access someone else's notes.
- Anonymous table-level access was explicitly revoked from private notes. RLS restricts every operation by `auth.uid()`. Neither note content nor personal quiz results are publicly shared.

### Existing verified assessment backend preserved
- 48 published monthly skill assessments and 144 questions, with private answer keys.
- Quiz results stored in `iac_mock_attempts` by the server scoring RPC.
- Real project submissions and mentor feedback stored in `iac_skill_project_submissions`.
- Badges issued only on actual enrolled student passing quiz and instructor-approved project, via secured administrator RPC `iac_review_skill_project`.
- Official skill certificates in `iac_certificates`, matching entries in `iac_skill_badges`, and an in-app notification after successful approval.
- The old self-claimed monthly-completion write path is not enabled: earned progress derives from actual verified credentials.

## Student-facing UI
### /my-learning.html
- Four obvious metrics: earned badges, passed skill quizzes, actual quiz attempt count and project reviews.
- "Your next step" action that prioritizes a project needing changes, a passed quiz waiting on project, or an unpassed quiz.
- Course-specific progress bars computed from genuine awarded badges / total skill modules, not arbitrary visit counts.
- Filters: by program, enrolled skills, quiz needed, project ready, project awaiting mentor, revisions needed and earned badges.
- Each skill card: best score, attempt count, project status, next action and earned badge link.
- Paginated all-attempt quiz history and real certificate/badge links.
- Privacy-aware login/registration gate for guests.

### /profile.html
- Genuine progress summary counts in addition to existing enrolled-course / lesson / certificate metrics.
- Recent actual quiz marks, next skills and project status, direct continue-learning links.
- One-click entry into full learning dashboard.

### /programs.html
- All 48 monthly roadmap cards now have a collapsed "Learn this skill" beginner guide, practice task, official tutorial link, project, quiz and submission progression.
- Signed-in learners can save private notes per skill.
- Dashboard links `?program=<actual-program-slug>&skill=<month-UUID>&action=quiz|project` deep-link to the correct skill and corresponding quiz or project.
- Existing topic lists, photography, actual monthly tuition and interview preparation remain.

### Navigation integration
- Learning Portal account menu + student dashboard quick links: My Learning Scores, Roadmaps, Profile, Classes & Notifications.
- Analytics page links to the new private skill/quiz hub.
- Programs and Profile navigation directly link to My Progress.

## Verified
- Database: 4 programs, 48 skill modules, 48 learning guides and 144 skill-specific scored questions.
- Anonymous cannot execute private student snapshot or quiz history RPC, and cannot read the private notes table.
- Read-only synthetic-account SQL check returned public learning paths but **zero private quiz/badge data**, with no persisted test users.
- Production browser read-only regression verified all 12 Web Development cards, real beginner mini-lesson, practical activity, tutorial link and quiz button. AI, Data Science and App Development also showed their guides. Guest My Learning and Profile screens correctly required login and showed no fabricated marks.
- GitHub frontend JavaScript syntax and latest Vercel production READY status checked.

## Important pending live acceptance tests
1. Supabase Auth SMTP / magic-link delivery remains unresolved; user requested to leave founder login aside. Real student accounts must work for learning records to populate.
2. A genuine signed-in student needs to pass a quiz, save notes, submit a real project, see score in Profile and My Learning, then verify private access from a second student.
3. Verified admin must review a real project and issue an actual badge/certificate; download PDF, public verification, notification and revocation flows need multi-account E2E tests.
4. Full mobile-device accessibility and real course teaching-material quality reviews still needed. Quiz count is currently **3 per monthly skill**; this is suitable for introductory knowledge checks but not a high-stakes credential exam without practical instructor review.
5. Per-skill completion represents one **monthly roadmap module**, not a separate certificate for each individual bullet-point topic.
6. Real student/quiz/project/badge/notes counts were all zero when the changes were inspected; no fake records added.
