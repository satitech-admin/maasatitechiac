# Maa Sati IAC — Live Website QA & Bug Fixes
Audit date: 10 November 2026.

## Inspection method
- Actual public website browser navigation on desktop using a connected live browser.
- Tested homepage, Courses, Learning Portal, Fees, Roadmaps, Profile, About, Certificates and Projects without creating accounts or payments.
- Re-ran browser regression audit after major navigation and course-card fixes.
- Checked GitHub JavaScript syntax, duplicate HTML IDs and in-repository links.
- Checked latest Vercel production deployment status.

## Corrected
1. Main homepage navigation reduced from duplicate/auto-appended links to a clear top-level navigation + More menu. Retired redundant page-link injection scripts.
2. Learning Portal header reduced from 14+ navigation actions to learner-first links and More dropdown. Account menu retains private actions and logout.
3. Mobile navigation rules, drop-down positioning, responsive fonts and course-card grid sizing corrected to prevent clipping and repeated nav rows.
4. Fixed invalid About route: new public `about.html` with institute description, program links and consent transparency.
5. Cleaned excessive/off-brand stylesheet collisions for course card sizing and hero spacing.
6. Clarified benefits: no unqualified claims of recorded classes or automatic certificates.
7. Corrected App Development price display: official amount remains unspecified rather than fabricating a fee or showing broken '/month' labels.
8. Clarified 3-month internship applications: apply, wait for institute review; no false promise of active recurring payment.
9. Replaced vague empty Projects panel with a real, consent-gated submission path; guest CTA explicitly says 'Sign in to submit project'.
10. Fixed empty Certificates state with account sign-in CTA and explanation of real verified issuance.
11. Retired obsolete browser-local static prototype pages from the rendered main homepage; real courses, events, projects and certificate workflows route to their authenticated pages.
12. Added noindex directive to internal owner launch audit while keeping its database RPC admin-protected.

## Regression verification
- Connected browser observed homepage course cards, hero, More menu, Fees, Roadmaps and About without overlap or 404 after the navigation fixes.
- Connected browser confirmed certificate input/verify UI, verified course catalog layout and actual no-published-project state.
- Static compilation of JavaScript on main public pages passed.
- No duplicate IDs found in the inspected static HTML.
- Relative link routes in the inspected files resolve to existing repository paths.
- Latest production Vercel deployment should be checked for READY state when reviewing this audit.

## Not yet validated in actual accounts/devices
- Real student/teacher login, password recovery, projects submission after login, avatar upload, private course saving and RLS isolation end-to-end.
- Mobile physical-device browser audit below 400px. Responsive CSS changes are present, but full manual device QA remains.
- Empty real project showcase is not a code error; no approved student projects exist. Never add made-up winners.
- App Development 12-month course fee needs founder decision; it cannot be invented.
- Payment gateway credentials, recurring-monthly invoicing and founder email delivery still need real provider setup.
- Issued certificates and attendance cannot be tested without real authorized student records.

## Live URLs
- https://maasatitechiac.vercel.app/
- https://maasatitechiac.vercel.app/about.html
- https://maasatitechiac.vercel.app/platform.html
- https://maasatitechiac.vercel.app/programs.html
- https://maasatitechiac.vercel.app/fees.html
- https://maasatitechiac.vercel.app/profile.html
