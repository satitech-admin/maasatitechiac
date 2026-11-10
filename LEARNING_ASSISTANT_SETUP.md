# Maa Sati IAC — Course-grounded assistant & student support

## Live routes
- Main site: https://maasatitechiac.vercel.app
- Learning portal: https://maasatitechiac.vercel.app/platform.html
- Assistant and private support: https://maasatitechiac.vercel.app/assistant.html

## Implemented
- Authenticated student knowledge search over **actually accessible** lessons using Supabase user token and RLS.
- Search sources show course and lesson title. Without an LLM key, results are transparently described as **course knowledge search**, not generated AI answers.
- Server-side Edge Function `iac-learning-assistant`, input validation, hourly question cap, course context filtering and request history.
- Private support tickets, instructor responses, status changes and individual access control.
- Staff can triage tickets; students can see only their own support records.
- Website/LMS navigation to the new portal, using the existing Sati Technologies-inspired design.

## Generative model activation — still required
1. Obtain an OpenAI API key for Maa Sati IAC's **own billed API project** (this is distinct from a ChatGPT subscription).
2. Configure it only in Supabase Dashboard > Edge Functions > Secrets as `OPENAI_API_KEY`. Never paste the key into GitHub, frontend code or public logs.
3. Optionally configure `IAC_AI_MODEL` (default: `gpt-4.1-mini`).
4. The existing `iac-learning-assistant` Edge Function will then use Responses API with `store:false`. It will restrict institute-specific claims to accessible course content, and gracefully fall back to known notes if unavailable.
5. Verify student session, private lesson restrictions, latency, billing/usage limit, prompt-injection resistance and responses before broadly advertising it as generative AI.

## Production checks outstanding
- Actual signup, session refresh and ticket reply from separate student/staff test accounts.
- Live LLM test with valid secret and real questions after configuration.
- If Google Meet/Zoom and recordings are to be included in answers, add explicit authorized course metadata instead of suggesting invented schedules.
- Develop escalation handling, notifications and monitored response times based on real staff availability.
- For minors: consent and data retention process before launch.

## Database
- `iac_support_tickets`, `iac_support_replies`, `iac_learning_help_queries`
- RLS enforces ownership or staff role for sensitive content.
- Query logs should be retained only for the institute's documented policy and deleted on request.
