# Maa Sati IAC — Quiz Privacy & Authoring QA
Updated: 13 November 2026

## What was discovered
The published-question table `public.iac_mock_questions` stored **184** answer explanations alongside public quiz prompts and choices. This was an unnecessary assessment-integrity risk because the table also had a public-row RLS policy. **Important nuance:** a direct anonymous SELECT was initially blocked by missing SQL column/table SELECT grants, so the initial audit did **not** establish that anonymous visitors could retrieve the explanations through the Data API. The same missing grant also prevented the legitimate `programs.html` quiz-question query from loading.

A second functional bug appeared in real rollback testing: `iac_admin_add_quiz_question` declared a local variable `id` that conflicted with `WHERE id=p_quiz`, leading to `column reference "id" is ambiguous`. The protected admin question-creation function has been corrected.

## Fixes applied in connected Supabase
1. Added `explanation` to the existing **RLS-protected and non-public** `iac_mock_answer_keys` table and migrated all 184 explanations with their associated question IDs.
2. Cleared `iac_mock_questions.explanation` for every record; enforce `CHECK(explanation='')` and a blank default to prevent new client-readable hints.
3. Granted `anon` and `authenticated` **column-specific SELECT** on `id, quiz_id, sort_order, prompt, options` of `iac_mock_questions`. Existing row policy limits anonymous/public retrieval to published quizzes. Neither role can read the `explanation` column or the answer-key table.
4. Updated `iac_admin_add_quiz_question` to save prompt/options in the question table, private explanation/correct index in the answer-key table, and renamed its conflicting local `id` variable.
5. Updated `iac_submit_mock_quiz` to return feedback explanations from private keys **only after** a valid server-scored quiz submission. Actual grades are still written by the server.
6. Extended GitHub static QA: `programs.html` must request only safe question columns and use the scoring RPC; the curriculum page must use the admin authoring RPC.

## Database QA results
All tests were transaction scoped and ended with `ROLLBACK` where records might be created.

| Check | Result |
| --- | --- |
| Public published-question explanations after migration | **0** |
| Private explanations preserved | **184/184** |
| Anonymous published question read, safe columns only | Pass (184 available) |
| Anonymous `explanation` column read | Denied |
| Anonymous private answer-key read | Denied |
| Existing quiz: signed-in submit → graded feedback | Passed |
| New quiz: temporary admin creates 3 questions → publishes → student submits | Passed |
| Post-submission score and explanation returned | Passed |
| Synthetic test quiz/attempt retained | No; rollback |

The original 184 published quiz items and their post-submission educational explanations remain available for real students.

## Remaining acceptance
- Test actual browser quiz loading and submission as an authorized signed-in user after the latest **Supabase backend** migration.
- Test a real curriculum administrator creating a genuine draft (no grades invented) after authorized admin email verification.
- Continue Vercel release-gate verification; GitHub source QA passing is not proof the latest frontend has been deployed or the SSO-protected domain is publicly reachable.

## Security note
Public question prompts/options are not secret exam answers. `correct_index` and explanation are kept in a private table with no direct anonymous/authenticated SELECT grant. Never add unrestricted table-level SELECT grants to that answer-key table or restore answer explanations to the public question table.
