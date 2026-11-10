# Maa Sati IAC — Student Experience, Brand Alignment & Share Features
Release date: 10 November 2026

## Benchmarks reviewed
- Coursera: course discovery, in-progress learning paths, certificates and shareable verified accomplishments.
- Udemy: personalized learning, clear pricing, practice assessments and saved courses.
- Implementation is original to Maa Sati IAC's actual course catalog and permissions; no competitor branding, ratings, testimonials or fake achievements are used.

## Delivered UI and source files
- `index.html`: refreshed corporate-aligned Manrope / Instrument Serif, paper/coral/sage palette, main navigation, responsive spacing, warm hero, card styles, clear course monthly prices, internship fee display and course sharing links.
- `platform.html`: persistent logged-in account dropdown; Profile, My Learning, Roadmaps, Progress, Certificates, Support, Settings and Sign out; extra dashboard shortcuts; saved-course and course-share actions; same-route render/logout fixes; touch-friendly navigation.
- `profile.html`: logged-in private profile, editable name/school/year, course bookmarks, enrollment statuses, recorded lesson count and quiz attempts, verified certificate share actions, native share/WhatsApp/LinkedIn/copy link, logout, mobile layouts.
- `profile-extras.js`: authenticated private avatar upload, signed private preview, short bio, GitHub and LinkedIn portfolio links. No automatic public profile or school-student photo publishing.
- `programs.html`: correct hashtag deep links for Roadmaps / Quizzes / Interviews / My Performance tabs.
- `fees.html`: database-backed INR monthly price comparisons for the four published courses and three-month internships, totals and learner FAQs. Prices are not hard-coded into this page.
- `share-iac.js`: keyboard-accessible public program sharing on main website, LMS and programs page; native share, WhatsApp, LinkedIn and copy public URL. It deliberately excludes private user-specific URLs.

## Current published fees
- Web Development: ₹1,499 per month (12-month nominal total ₹17,988).
- AI and Data Science: ₹2,000 per month (12-month nominal total ₹24,000 each).
- App Development course: price not specified by institute.
- All 3-month internship tracks: ₹1,700/month, ₹5,100 total (Maa Sati Technologies).
- Automated monthly billing is not configured; checkout is disabled for recurring course payment until proper installment and renewal tracking is implemented.

## Privacy and access
- `iac_saved_courses` has owner-only RLS with owner read/add/remove policies.
- `iac_profiles` gains `bio`, `github_url`, `linkedin_url`, `avatar_path`; owner profile edit and column-specific privileges.
- Private `iac-avatars` Storage bucket, non-public, 3MB max and image JPEG/PNG/WebP only; storage policies check folder path matches authenticated user ID.
- Certificate sharing is limited to actually issued, non-revoked certificate verification URLs.
- The public sharing utility never includes another student's records, private dashboard URLs or access tokens.
- User's private profile information is not posted or shared automatically; minors need appropriate institutional safeguards and consent.

## Verification performed
- JavaScript syntax compilation: main site 9 inline scripts, LMS, programs, profile, fees, profile-extras, share-iac.
- Verified repository commits and the latest Vercel production deployment state.
- Supabase database confirmed public course/fee select privileges and private avatar bucket/RLS policies.
- Did not fabricate student accounts, learning progress, certificates or ratings.

## What is NOT yet end-to-end proven
- Actual signup/login/logout, profile photo uploading, bookmarks, sharing, quiz scores and certificate share from real student and teacher accounts across devices.
- Full screenshot-based responsive/browser UX audit: external site could not be opened through current web lookup; no visual rendering claim made.
- Reliable founder email/OTP delivery is still blocked by Supabase default sender limits, SMTP setup and redirect configuration; previous auth logs indicated an expired link and HTTP 429 rate limits.
- Razorpay automatic monthly installments/payment collection; AI model provider keys; real class recordings, notifications outside the site, real program scheduling; legally reviewed consent/deletion workflows.
- The launch should not be called complete or production-certified from deployment READY and syntax checks alone.

## Recommended real-device walkthrough
1. Open `/platform.html` on mobile and desktop; register or sign in with a genuine approved test student.
2. Use top-right Account → My Profile. Verify all profile routes, Save and Sign out.
3. Save a published course then open `/profile.html` and verify it persists across sessions. Remove and verify it disappears.
4. Upload one JPG private avatar (under 3 MB), test private preview and verify that other accounts cannot open its path.
5. Save bio, GitHub and LinkedIn links and verify only owner reads them.
6. Share course/verification URLs with WhatsApp and LinkedIn; verify no account data or tokens are present.
7. Open pricing `/fees.html`, compare with `iac_courses` and `iac_internship_tracks` official database rows.
8. Test in 375px, 390px, 768px and desktop viewports, keyboard focus and screen reader labels.
