# Razorpay setup — Maa Sati IAC

The institute payment gateway uses Razorpay India, not Stripe. The deployed payment endpoint is `https://ylobnofwmryltbzdtkla.supabase.co/functions/v1/iac-razorpay`.

## Required merchant activation (not yet completed)
1. Create/verify the institute's own Razorpay merchant account at https://dashboard.razorpay.com and complete required business/KYC and website verification. Razorpay may require additional documents and approval.
2. In the Supabase project `ylobnofwmryltbzdtkla`, set Edge Function secrets: `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`. Store secrets ONLY in Supabase Edge Function secrets, never in the website, HTML, GitHub or ChatGPT. Use TEST credentials for test transactions first, then LIVE credentials after successful verification.
3. In Razorpay Dashboard -> Webhooks, register `https://ylobnofwmryltbzdtkla.supabase.co/functions/v1/iac-razorpay/webhook`, subscribe to `payment.captured`, and use the **same webhook secret** as the Supabase secret. The webhook verifies the HMAC-SHA256 signature of raw payload bytes and deduplicates events.
4. Set automatic capture/confirm it is enabled, and test captured-payment status, declined payments, duplicate webhooks and retry behavior. Only captured payments activate course enrollment.
5. Sign into the IAC platform with authorized founder/admin account and set official INR fees on `https://maasatitechiac.vercel.app/payments.html`. Prices are deliberately NULL until the institute sets them. No price is inferred for the four college courses. For school events, create a real published event and set its actual fee.
6. Students first register/request enrollment, then use their own login on the payments page. Server calculates amounts from the database, creates the Razorpay Order, validates callback HMAC, fetches payment's captured state and matches amount/currency/order before granting access.
7. Reconcile first live transaction against Razorpay Dashboard, verify enrollment activated exactly once and generate payment/fee receipts as applicable.

## Deployed resources
- Public page: https://maasatitechiac.vercel.app/payments.html
- Learning portal: https://maasatitechiac.vercel.app/platform.html
- Supabase Edge Function: `iac-razorpay` (JWT validation is performed in the handler for authenticated actions; webhook verifies Razorpay signature)
- Database: `iac_payment_orders`, `iac_payment_webhook_events`; fee columns on `iac_courses` and `iac_events`; `iac_process_captured_payment` stored procedure callable only by service_role.
- Existing PDF/certificate functions and registered course data remain unchanged.

## Safety and limitations
- No merchant secrets are configured via this repository; without them checkout fails closed with a 503.
- Fees for the four courses and all events are currently not published; setting a price is an explicit admin decision.
- There are no successful orders or test purchases yet. Live payment collection and final end-to-end payment gateway testing therefore remain pending.
- A payment return URL or screenshot does not prove capture. Use trusted Razorpay server checks and signed webhooks.
- Refund/reversal and automated receipt workflows require separate production implementation/testing before refund self-service is advertised.
