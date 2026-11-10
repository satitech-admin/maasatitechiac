# Maa Sati IAC — Approved Monthly Fees & Founder Email Login

Updated on 10 November 2026.

## Training course fees
- Web Development (12-month program): **₹1,499 per month**. Twelve-month nominal total if all months are charged at this rate: ₹17,988.
- Artificial Intelligence & Machine Learning (12-month program): **₹2,000 per month**. Twelve-month nominal total: ₹24,000.
- Data Science & Analytics (12-month program): **₹2,000 per month**. Twelve-month nominal total: ₹24,000.
- App Development course: **price not provided by institute** and remains unpublished. Do not infer from the internship pricing.

## Three-month internship fees — all tracks
Each track costs **₹1,700 per month** for 3 months, nominal total **₹5,100**.
- Web Development Internship
- App Development Internship
- Artificial Intelligence Internship
- Data Science Internship

Data sources:
- `public.iac_courses.fee_paise` (paise per month)
- `public.iac_internship_tracks.fee_paise_per_month`, `duration_months` (3 months)

The learner portal and the 12-month program cards display the fees from actual database records. No automatic recurring payment/subscription is in place. Monthly course checkout is explicitly disabled in both browser and Razorpay backend until installments, renewal expiration, receipts, refunds and access duration are implemented securely. Do not interpret a successful first payment as a lifetime enrollment.

## Founder magic-link/OTP diagnosis
The Supabase Auth logs for **10 November 2026** show:
- At **07:47:34 UTC (13:17:34 IST)**, an OTP/login-link request was accepted (HTTP 200) and a mail.send event was logged for `nikhilbaraskar551@gmail.com`, through the default Supabase sender `noreply@mail.app.supabase.io`.
- At **07:47:53 UTC**, one verification link failed as **invalid or expired**.
- Subsequent requests at **07:47:56** and **07:48:51 UTC** failed with **HTTP 429 (email send rate limit)**.
- Auth log requests had a localhost referer; this alone does not prove the redirect setting, but the Site URL and redirect allowlist must be checked to ensure links lead to the production website, not localhost.

The log's mail.send event is **not** proof of mailbox delivery. The default Supabase Auth template may send a magic link rather than a numeric OTP; do not expect a numeric code unless the email template is configured accordingly.

### Action to restore reliable founder login
1. Supabase Dashboard: **Authentication → URL Configuration**. Set Site URL to `https://maasatitechiac.vercel.app`. Allow `https://maasatitechiac.vercel.app/onboarding.html` and other correct production auth routes explicitly. Avoid localhost redirects for public launch.
2. Supabase Dashboard: **Authentication → SMTP Settings**. Configure a verified sender with proper email provider credentials and DNS SPF/DKIM as appropriate. The default sender has low sending limits and is unsuitable for high-volume enrollments.
3. Review **Authentication → Email Templates**. Use a magic-link link template, or explicitly include a numeric OTP token if that flow is preferred. The founder website now labels the OTP field optional.
4. Wait for rate limits to reset, request **one** fresh link at `https://maasatitechiac.vercel.app/founder.html`. Check Gmail Inbox, Spam and Promotions for the latest message. Do not reuse an expired link.
5. Open the link in the same browser where possible and visit the founder page. The existing database function grants admin only if the user is authenticated with the exact **verified** founder email.
6. Never share an OTP, password, Supabase service role key or email login link in ChatGPT or GitHub.

No bypass to founder admin permissions has been attempted.
