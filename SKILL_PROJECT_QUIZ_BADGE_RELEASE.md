# Maa Sati IAC — 48 Skill Projects, Assessments, Badges & Certificates

Implementation: 10 November 2026
Repository: `satitech-admin/maasatitechiac`
Production: https://maasatitechiac.vercel.app

## Live pages
- Course catalogs and 12-month photography-backed roadmaps: https://maasatitechiac.vercel.app/programs.html
- Web Development: https://maasatitechiac.vercel.app/programs.html?program=web-development-12-months
- Artificial Intelligence: https://maasatitechiac.vercel.app/programs.html?program=ai-ml-12-months
- Data Science: https://maasatitechiac.vercel.app/programs.html?program=data-science-12-months
- App Development: https://maasatitechiac.vercel.app/programs.html?program=app-development-12-months
- Badge verification and SVG download: https://maasatitechiac.vercel.app/skill-badge.html
- Certificate verification and authenticated signed PDF: https://maasatitechiac.vercel.app/certificate.html
- Admin-only skill project reviews: https://maasatitechiac.vercel.app/skill-review.html
- Student profile and issued certificates: https://maasatitechiac.vercel.app/profile.html

## Course content now published
- 4 career programs / 12 months per course
- 48 published monthly skill assessments, each linked to one roadmap milestone, one prescribed practical project and one original skill-specific quiz
- 48 separate skill quizzes, 3 questions each: 144 scored questions with 144 private correct-answer records
- Real photographic imagery for each course and each monthly roadmap milestone, loaded over HTTPS from Unsplash Images. Images show real workplaces, not fictitious student accomplishments.
- Existing broad mock quizzes and interview preparation remain available.
- Course fee amounts remain unchanged: Web/App Development ₹1,499/month, AI/Data Science ₹2,000/month.

## Strict eligibility for a verified skill completion certificate
1. Student signs in to an actual verified IAC learning account.
2. Student is enrolled in the matching course with an `active` or `completed` status.
3. Student passes the corresponding 3-question monthly skill quiz: **100% threshold** (all questions correct). The correct answer key is evaluated server-side and is not downloadable.
4. Student submits a real HTTPS project URL and a 30–2,500 character description of their contribution and practical evidence.
5. The project remains `pending` until an authorized institute administrator reviews the actual project.
6. Admin approves the submitted work using the restricted `iac_review_skill_project` RPC, which checks authentic enrollment and passing quiz attempt again on the server. Admin cannot approve their own submission.
7. The database issues one unique `MSIAC-YYYY-XXXXXXXXXXXX` code in the official `iac_certificates` registry with `certificate_type='skill'`, a related entry in `iac_skill_badges`, a completed milestone and a learner notification.
8. The student can download an authenticated official signed PDF and a shareable official digital badge in SVG, and others can verify the unique code publicly without disclosing the student's full private profile.

Neither viewing a page nor manually marking a month as completed grants a badge or certificate. Self-marking of monthly progress through the former public Insert policy has been disabled. New skill badges are issued only after real review.

## Project submission safety
- Real HTTPS repository/demo links required. Student must have passed the relevant quiz and must hold approved enrollment.
- One project submission per student/skill; rejected or change-requested submissions may be revised.
- Students can see their own submission, feedback and status. Authorized staff can see relevant submissions.
- Admin-only RPC reviews project evidence; students cannot insert their own badge, certificate or completed milestone.
- Approval checks the complete quiz record, course enrollment, and genuine account profile.
- Badge notification appears in the in-app student notification inbox.

## What was technically verified
- Database count: 48 published skill assessments, 48 associated quizzes, 144 corresponding quiz questions, 144 answer keys.
- Sample Web Development quiz answer keys correspond to correctly stated HTML/CSS definitions, practices and relevant risks.
- Browser automation loaded the real deployed Web Development route and checked 12 photographic roadmap cards and 3-question/4-choice quiz. Other programs each showed 12 monthly cards.
- Browser as a guest displayed no badge as earned on `/skill-badge.html` and restricted `/skill-review.html` to verified admins.
- Anonymous cannot call `iac_review_skill_project`; students cannot insert skill badges or self-mark monthly progress via direct table permissions.
- The existing private PDF Edge Function `iac-certificate-pdf` was updated to version 2 with a skill-specific title and award description, while preserving its restricted owner-only signed-PDF logic.

## Outstanding live-account acceptance tests
- A genuine enrolled student must pass a quiz, submit a working project, and see a pending status.
- A verified founder/institute admin must review the actual code and approve, then validate generated unique certificate and badge.
- Verify ownership of private PDF download, revocation behavior, QR code, mobile SVG rendering and notification delivery with real accounts.
- Founder email activation, SMTP, actual student records, and full external billing remain prerequisites. At release time there were 0 real skill submissions and 0 genuine skill badges; the platform must never display a fake awarded certificate.
- Current assessment granularity is one skill checkpoint per **monthly roadmap module**, not a separate badge for every individual bullet-point topic.

## Future quality upgrades
- Increase each quiz from 3 questions to a larger mixed reasoning/coding assessment with instructor-maintained question pools, time limits and rotation.
- Add sandboxed code submission/automated tests, plagiarism checks and a formal mentor rubric before large-scale certification.
- Improve image licensing and asset hosting for stable self-hosted copies.
- Test on physical mobile devices with actual student accounts before promotion.
