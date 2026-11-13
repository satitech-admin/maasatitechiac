# Maa Sati IAC — Guardian consent & payment preflight QA
Updated: 13 November 2026

## Scope
Before a student can request a Razorpay payment order, verify that their enrollment/registration is eligible and any mandatory guardian permission has already been approved. No real transaction was initiated during these tests.

## Production changes
1. A new protected PostgreSQL `BEFORE INSERT` trigger, `iac_payment_order_preflight_guard`, rejects provider-order records when `iac_guardian_ready(student_id)` is false, when the order is not initially `created`, or when there is no eligible pending course enrollment or published event registration.
2. The `iac-razorpay` Edge Function now explicitly calls the **server-side** `iac_guardian_ready` RPC using its existing service-role client **before calling Razorpay to create a provider order**. Invalid eligibility results in a nonpayment error and an instruction to finish Onboarding. Version **4** was successfully deployed and is active; original webhook HMAC signature verification was preserved.
3. Student payment page `payments.html` shows account-specific eligibility guidance, enables event checkout only after a positive local status, and links students to `/onboarding.html` for guardian verification. This UI state is a guide only; Edge/SQL remain the authoritative security gates.
4. GitHub mirrors the deployed Edge Function at `supabase/functions/iac-razorpay/index.ts` and includes regression checks ensuring the preflight runs before provider-order creation, signed webhooks remain verified, and the browser checks are shown.

## Transaction-only test evidence
Tests ran with temporary profiles and enrollments inside SQL `BEGIN`...`ROLLBACK`, without persisting synthetic payments, guardian approvals or enrollments:

| Scenario | Result |
| --- | --- |
| School learner without guardian approval → create internal provider-order record | Rejected |
| College learner with a pending course enrollment → create record | Allowed |
| School learner after verified admin guardian approval → create record | Allowed |
| Guardian verification recorded through admin RPC | Passed |
| Payment page and Edge Function JavaScript parsed | Passed |
| Deployed Edge code matches GitHub source | Passed |

## Release limitations and safeguards
- Course installment checkout remains intentionally disabled until genuine recurring billing/renewal tracking is operational.
- The project had **zero published school events**, **zero real payment orders**, and **zero activated admin accounts** at the time of inspection; no merchant sandbox/live Razorpay capture, refunds, webhook retry, or chargeback tests were performed.
- A read-only student-type declaration does not independently establish age. Guardian identity must be checked by authorized institute management before school permissions are approved.
- A scenario where permission is revoked **after** a provider order has been generated but **before** payment capture requires a separate reconciliation/refund procedure. The inserted-order gate is not a complete payment dispute workflow.
- Real customer payment acceptance must follow merchant sandbox testing, webhook event deduplication and financial reconciliation, without collecting money until a successful trial.

## Still blocked for final public launch
Founder verification has not been completed, public Vercel access remains SSO-protected, and real student/staff browser acceptance is pending. A READY deployment or a passing test suite is not enough to mark full release accepted.
