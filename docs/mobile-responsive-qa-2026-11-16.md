# Maa Sati IAC — Responsive Mobile Release & QA

**Implementation date:** 16 November 2026  
**Repository:** `satitech-admin/maasatitechiac`  
**Scope:** All 23 static HTML pages, not only the home screen.

## Implemented

- Created shared `mobile-iac.css` and `mobile-iac.js`, loaded on **all 23** institute pages after the existing CSS.
- Enforced safe sizing, flexible wrapping, reasonable mobile padding and scrollable wide tables.
- Added mobile-first adjustments at **900, 760, 600 and 380 CSS pixels**, plus reduced-motion support.
- Built a compact collapsible institute navigation menu on pages that previously had long header navigation. The menu supports tap/click, keyboard Escape, closing on navigation, outside click, correct `aria-expanded` state, focus restoration and automatic reset on desktop resize.
- Preserved the **existing Home menu** rather than creating a duplicate toggle.
- Preserved logo proportions by using `object-fit: contain`. No original image/logo asset was changed or re-cropped.
- Improved student portal, founder operations, admin approval forms, course roadmaps, practice/quiz views, learning metrics and certificate pages without changing their Supabase authorization or database records.

## Actual automated QA

1. `scripts/validate-iac-site.mjs` verifies root-relative links, page syntax, important learning and release invariants.
2. `scripts/validate-mobile-layout.mjs` checks every page has a viewport meta tag, a single shared stylesheet and script, and runs mobile menu interaction simulations (tap, click, Escape, outside click and desktop resizing).
3. `scripts/check-mobile-browser.mjs` launches **real headless Chrome** on an isolated local HTTP server and tests **53 screen renders** over all 23 pages at **320, 360 and 768 pixels** (critical pages also at 320). It checks `document.documentElement.scrollWidth`, `document.body.scrollWidth` and interactive menu open/close state. External services are blocked deliberately via CSP so it cannot send email, change data, charge money or access student accounts.
4. GitHub Actions runs these checks on page, mobile stylesheet, shared JS and QA changes. It also runs the existing learning-stage, private/public route and optional manually triggered public HTTPS checks.

### Validation boundaries

Headless Chrome checks **real rendered CSS sizing and menu interaction**, but it does **not** verify logged-in student/teacher/founder content, image loading from third-party servers, actual 4G latency or touch/voice input on a physical phone.

The website is deployed to Vercel but still has **SSO protection enabled** and `live:false` until the owner approves public release. A `READY` deployment means the build is ready, not that the site is publicly accessible.

## Manual phone acceptance — owner session

Test on a small Android browser (360px logical viewport, e.g., Samsung) and optionally iPhone Safari:

1. Home: hero, buttons, logo, header menu, courses, cards, footer, images and animations.
2. Platform: account login and logout, mobile navigation, course browsing, enrollment request. Ensure the page does not shift horizontally.
3. Student dashboard: quiz history table, badges, lesson progress, course metrics and links.
4. School guardian form and founder approvals: keyboard, dropdown, notes, submission errors and confirmation states.
5. Mentor review: project evidence notes, touch targets and scroll-to-review.
6. Certificate: full certificate preview, logo aspect ratio, QR visibility and authenticated PDF generation.
7. Orientation change: portrait/landscape, 320/360/390/412/768px widths. Verify no buttons are behind a sticky header and keyboard focus is visible.
8. Confirm real-life image and video loading, network errors, email verification, payments and consent using real authorized test accounts.

## Next release process

After mobile acceptance, record actual tests in [Founder Launch Dashboard](https://maasatitechiac.vercel.app/launch.html). Complete guardian approval, real course progression, verified mentor review, certificate PDF, SMTP email and payment checkout/webhook verification before public go-live. Do not invent approvals or student data merely to make the report green.

**No user accounts, consent decisions, prices or public deployment-protection settings were altered in this responsive-layout phase.**
