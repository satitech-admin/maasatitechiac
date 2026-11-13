# Maa Sati IAC — Founder Account Activation & Email Verification
Updated: 13 November 2026

## Verified production blocker
At the last connected Supabase database check:
- The pre-authorized founder account **exists**.
- Its registered email is **not yet confirmed**.
- **Zero admin roles** are activated.

The `iac_claim_founder_admin()` database function intentionally grants an administrator role only when the logged-in user matches the pre-authorized founder account **and** has a verified email address. It is working as a security gate; do not bypass it or manually grant an administrator role to an unverified account.

## Work completed in the repository
1. `platform.html` now has an explicit **Resend verification email** action on the login dialog. It uses Supabase Auth `resend({type:'signup',email,options:{emailRedirectTo}})` when a user clicks the button, with no automatic send, a client cooldown and neutral messaging that avoids confirming whether an account exists.
2. Sign-up and password recovery use a single explicit callback: `https://maasatitechiac.vercel.app/onboarding.html`. They no longer derive email links from arbitrary Vercel preview hostnames.
3. `onboarding.html` tells unverified visitors where to find the resend option.
4. GitHub static workflow validates the exact production callback and resend UI presence.
5. A transaction-based backend test confirmed an authorized temporary administrator can invoke `iac_launch_readiness()`; all temporary changes were rolled back.

## Actions for the authorized mailbox owner
1. Access the official registered founder mailbox; search inbox, promotions and spam for the earlier Supabase confirmation message.
2. If the link is expired or missing, open the IAC platform login dialog, enter the registered email and press **Resend verification email**. A fresh link is requested only by a direct button click; delivery depends on Supabase Auth email configuration and rate limits.
3. Open the confirmation link in a browser with authorized Vercel access. If the target is blocked by Vercel SSO, resolve the project deployment protection through the owner-approved Vercel settings instead of bypassing it.
4. Sign in to `/platform.html`; navigate to `/onboarding.html`. That page attempts the founder role claim with the verified session.
5. Open `/launch.html` to confirm authorized access, then record real acceptance evidence for remaining checks.

Do not send passwords, one-time codes, full confirmation links, API keys or private student data to anyone.

## Supabase Auth settings to check (requires authorized console access)
- **Authentication → URL Configuration → Site URL:** `https://maasatitechiac.vercel.app`
- **Redirect URLs:** add `https://maasatitechiac.vercel.app/onboarding.html` exactly.
- **Email Templates:** verify that signup confirmation and password recovery links honor your chosen redirect setting. The standard `{{ .ConfirmationURL }}` template typically includes redirect information; custom templates require review.
- **SMTP:** configure a verified sender, test send/delivery and observe provider limits before onboarding actual students.
- **Password Security:** review the leaked-password-protection warning and enable protection when supported by the project plan.
- **Future custom domain:** update the canonical callback and the Auth allowlist together after the domain is configured and publicly verified; do not expand production redirects to an unbounded wildcard.

## Not yet tested end-to-end
A source-code and SQL check does **not** prove an actual email was delivered, clicked or confirmed, nor does it prove public reachability. The owner must complete the real mailbox steps. Vercel deployment limits and SSO/public accessibility remain separate release blockers.

Useful links:
- Platform: https://maasatitechiac.vercel.app/platform.html
- Account onboarding: https://maasatitechiac.vercel.app/onboarding.html
- Owner launch dashboard: https://maasatitechiac.vercel.app/launch.html
- Supabase Auth URL settings: https://supabase.com/dashboard/project/ylobnofwmryltbzdtkla/auth/url-configuration
- Supabase email templates: https://supabase.com/dashboard/project/ylobnofwmryltbzdtkla/auth/templates
