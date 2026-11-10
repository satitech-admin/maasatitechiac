# Maa Sati IAC — Certificate System (Phase 3)

## Deployed modules
- Student certificate center: /platform.html#certificates
- Public verification and owner-only PDF download: /certificate.html?code=MSIAC-...
- Supabase Edge Function: iac-certificate-pdf (JWT required)
- Original Maa Sati IAC blue-and-gold logo and founder-provided handwritten signature are embedded only in the server-side PDF function, **not** in the public certificate page.
- PDF is generated for an authenticated account only after Supabase certificate ownership and revoked=false are confirmed. Download requires the owner's valid session.
- Landscape A4 PDF contains student name, program, issue date, unique ID, founder sign, and QR verification link.
- Public verification returns masked recipient name, program, date, certificate type and valid/revoked status without publishing full private record.

## Eligibility and issuance
- Seminar: verified attendance in the relevant seminar event.
- One-week training: minimum verified attendance days configured for the event, plus project approval.
- Course: enrollment must be marked completed by an authorized admin.
- Internship: reviewed approved task evidence and completed/approved application required.
- Only founder/admin role can issue real certificates.
- Unique indexes prevent multiple simultaneously valid certificates for the same student, event/course and type.
- No real certificate is generated for an unregistered student or fake/sample record.

## Pending verification / production operational checklist
1. Founder signs up, verifies email and activates admin role.
2. Publish real seminar events and 7-day programs with school approval.
3. Enroll a real test student, mark attendance/project approval, issue a certificate through admin.
4. Test certificate PDF generation/download, QR scanning and recipient-only access.
5. Test revoked certificate denial, forged certificate ID denial, and user A trying to download user B's certificate.
6. Confirm email redirects, registration, mobile viewing, PDF library runtime and printer output.
7. Coordinate consent requirements for minors, school names, public projects and publication.
8. The printed graphic founder signature is an image of the handwritten signature, not a cryptographically signed PDF certificate.

**Deployment READY is not an end-to-end test.** Until the account/role workflows are tested, this is implemented and deployed but not independently production-certified.
