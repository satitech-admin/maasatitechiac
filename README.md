# Maa Sati IAC — Retro Pixel Academy

**Website:** https://maasatitechiac.vercel.app  
**Repository:** https://github.com/satitech-admin/maasatitechiac

This repository contains the initial responsive website demo in the user-selected **Theme 9**: dark purple 1980s synthwave / retro pixel aesthetic with a CRT terminal, neon pink/cyan accents, bright course cards and a retro grid horizon.

## Included in the live demo

- School and college landing sections
- Courses: Web Development, App Development, Artificial Intelligence, Data Science
- School seminars (Class 9–12) and seven-day coding + AI mini-project program
- Three-month college internship information and inquiry placeholders
- Best Student Mini Project in School showcase with deliberately fictional sample profiles
- Student learning demo: nickname, 6 interactive lesson XP claims, level tracking, local browser storage
- Certificate information and a fail-safe verifier that never presents a non-issued credential as valid
- Curated FAQ chat assistant (not a connected generative AI system)
- Responsive desktop and mobile layouts

## Important production blockers

The current site is a **frontend/demo**, not a fully functioning authenticated LMS.

To launch with real users, add:
1. Exact official IAC logo asset; maintain aspect ratio and do not redraw, crop or stretch it. The current header is **temporary text branding**.
2. Secure authentication, database and role permissions (students, teachers, admins and school coordinators).
3. Course and batch content management; protected private recordings; authorized live class sessions.
4. Real student submissions, attendance, assignments, teacher feedback and school project moderation/guardian consent.
5. Secure certificate issuance, downloadable PDF, approval policy, revocation and QR-based registry verification.
6. Server-side AI assistant credentials, model integration, retrieval and safety/rate limits.
7. Payment gateway webhooks, automated emails, contact routing and production QA.

**No fake student records, achievements, certificates or company metrics should be represented as real.** All current sample identities are visibly labeled DEMO.

## Development

This preview is a dependency-free static site. Open `index.html` locally or deploy the repository to Vercel as a static website. Each push to `main` updates the linked Vercel project.

## Suggested next architecture

Next.js + TypeScript, Supabase Auth/Postgres/Storage with RLS, Zoom/Meet for live classes, protected streaming for videos, server-side PDF and QR generation, managed AI endpoint for course questions, Razorpay with signed webhooks and an admin CMS.
