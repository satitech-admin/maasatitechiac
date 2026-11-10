# Maa Sati IAC — Production operations

## Live pages
- Public website: https://maasatitechiac.vercel.app/
- Authenticated learning platform: https://maasatitechiac.vercel.app/platform.html
- Course catalog: https://maasatitechiac.vercel.app/platform.html#courses
- My learning: https://maasatitechiac.vercel.app/platform.html#dashboard
- School seminars: https://maasatitechiac.vercel.app/platform.html#events
- Internships: https://maasatitechiac.vercel.app/platform.html#internships
- Student projects: https://maasatitechiac.vercel.app/platform.html#projects
- Certificate verification: https://maasatitechiac.vercel.app/platform.html#certificates

## Connected data and security
- Supabase public tables prefixed iac_ (separate from existing websites' tables).
- Student records and memberships are protected by row-level security.
- Authentic course catalog: Web Development, App Development, Artificial Intelligence, Data Science.
- Course lesson notes are published in the database, but videos are **not yet uploaded**.
- The iac-recordings private storage bucket has staff-upload and approved-enrollment read policies.
- Student XP is derived from authenticated lesson completion; no localStorage-only credentials or fake award issuance.
- Certificate lookup only returns records actually issued by an authorized admin.
- Student project gallery is sourced from actual approved, consent-verified student submissions; no sample students shown.

## Founder admin activation
1. Open the learning platform.
2. Sign up using the founder-authorized email address used for the institute and verify the email through the actual mailbox.
3. Sign in. The database checks the verified email against the preapproved founder email and grants admin role to that particular account.
4. Open Admin panel to approve enrollment requests, publish classes/events, review projects, manage courses, and approve certificate eligibility.
5. Do not enter password or API secrets into GitHub or public repository files.

## Before student launch
- Verify Supabase Authentication settings: Site URL and redirect allowlist must include https://maasatitechiac.vercel.app and https://maasatitechiac.vercel.app/platform.html.
- Test actual registration/confirmation/sign-in, role separation and sign-out with test accounts.
- Upload genuinely recorded class videos in the staff panel and check signed URLs from an enrolled test student.
- Schedule only real seminars and batches, with school and guardian approval processes.
- Set up payment provider via verified server-side integration; no payments currently collected through the platform.
- Connect a real LLM using a server-side secret before advertising the assistant as generative AI. Do not expose secret keys to browser code.
- Finish final certificate design and PDF issuance/QR route. No real credentials should be issued without records of eligibility.
- Test accessibility, mobile flows, abuse/rate limiting, consent management and user-requested data deletion flows.
- No production E2E verification has been claimed yet. Vercel deployment READY only confirms successful build/deployment.
