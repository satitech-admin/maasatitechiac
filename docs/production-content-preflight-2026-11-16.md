# Maa Sati IAC — Production Content and Payments Preflight
**Date:** 16 November 2026  
**Status:** Admin-only preflight deployed, release HOLD pending genuine content and owner acceptance.

## What was tested against the live project

The institute currently has **4 published courses, 20 published lessons, 48 published skill assessments and 48 complete active quiz configurations**. Every published assessment inspected has at least 3 questions and no missing answer key. Each published course has 5 lessons and 12 skills.

**Recorded-lesson blocker:** All 20 published lessons still lack an attached recording link (5 per course). This means the recorded-class journey cannot be accepted as complete. Lecture notes may still exist, but the video playback journey is not verified. Do not insert fake video URLs to pass this gate.

**Prices:** The production catalog has monthly INR prices configured: App Development and Web Development ₹1,499; Artificial Intelligence and Data Science ₹2,000. These are NOT full-course prices.

**Payments:** The Razorpay Edge Function `iac-razorpay` exists and restricts unauthenticated actions in its handler. The `create-order` branch **rejects course payments** while installment/renewal handling is unavailable, and the payment settlement RPC `iac_process_captured_payment` is callable by service-role only (not anonymous or signed-in browser clients). The production payment-orders table had **zero recorded orders** when checked. The merchant's KYC, SMTP delivery, Razorpay secrets, live payment capture and signed webhooks are **not confirmed**.

**Admissions:** Founder admin role exists; 1 pending enrollment, 0 active course learners and 0 issued certificates at inspection. Genuine school guardian approval, learner access and official certificate PDF tests are pending.

**Public access:** Vercel deployment is `READY` but project SSO is still enabled and project `live=false`. Public HTTPS must not be assumed or advertised until owner-approved launch validation.

## Development completed

1. Implemented admin-only, read-only Supabase RPC `iac_course_content_readiness()`, including course-specific published lesson totals, lesson IDs/titles missing video links, published skill count, question/answer-key coverage, monthly fee configuration and precise readiness flags.
2. Server authorization and no-write tests: a verified founder received the expected course readiness values, and a signed-in ordinary account was denied access with SQLSTATE `42501`. All checks ran inside transactions with rollback.
3. Added a **Published Course Content — Real Readiness** section to the [Founder Launch Dashboard](https://maasatitechiac.vercel.app/launch.html). It shows missing lesson names so the founder can upload the real videos, and updates as recorded content changes.
4. The private release decision stays **HOLD** if required published lessons lack recording references, quizzes are not valid, or course price values are missing. A successful database count does **not** prove real-world private playback.
5. Updated [Admin Workspace](https://maasatitechiac.vercel.app/platform.html#admin) to show each course's count of published lessons needing recordings. The video-upload selector now prioritizes lessons with missing recordings. On storage upload, it checks whether the lesson row was **actually updated**; a zero-row update or database error no longer produces a false linked-success message.
6. Fixed outdated `RAZORPAY_SETUP.md` text that incorrectly claimed all course fees were NULL, while keeping course monthly checkout disabled until billing renewals and authorized merchant testing exist.
7. Extended `scripts/validate-launch-readiness.mjs` to verify content audit UI, founder-only RPC use and safe link to the actual video-upload form. Existing GitHub CI also runs static syntax, learning state, 53 headless Chrome mobile viewports and route/privacy checks.

## Real owner tasks (do not invent evidence)

- **Upload the 20 genuine class recordings** via Admin Workspace → Manage courses → Upload private lesson video → Select the existing lesson. Current browser uploader accepts MP4/WebM/MOV files up to 40 MB; larger classes require properly secured, resumable video hosting.
- Sign in as an actually enrolled test learner and confirm each stored video generates a valid private signed URL, plays on Android and desktop, and is inaccessible to other users.
- Confirm quiz correctness manually rather than assuming a complete answer-key count means content is educationally correct.
- Configure and test SMTP outbound email delivery, password recovery and guardian communications.
- Complete Razorpay test-mode merchant/webhook reconciliation, design recurring or installment billing safely, then test authorized paid course workflows without interpreting one monthly fee as full-course payment.
- Obtain genuine guardian verification and review evidence, then test one real student course, monthly projects, mentor reviews, signed certificate PDF and QR validation.
- Obtain owner approval before changing Vercel deployment protection. Use the release acceptance dashboard to record human evidence, not guessed confirmations.

**No student, payment, certificate or private contact records were fabricated or modified by this development phase.**
