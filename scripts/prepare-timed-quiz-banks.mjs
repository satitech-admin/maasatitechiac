// Generate a transaction for review in the authorized database console.
// Usage: node scripts/prepare-timed-quiz-banks.mjs /private/banks /private/bindings.json
import fs from 'node:fs';
import path from 'node:path';

const [directory, configPath] = process.argv.slice(2);
if (!directory || !configPath) throw new Error('Provide the private bank directory and bindings JSON.');
const slugs = [
  'web-development', 'python-programming', 'ai-fundamentals', 'ui-ux-design',
  'data-analytics', 'digital-creativity', 'prompt-engineering', 'cyber-safety',
  'logic-problem-solving'
];
const bindings = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const sqlString = value => "'" + value.replaceAll("'", "''") + "'";
const validUuid = /^[a-f\d]{8}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{12}$/i;
const normalize = text => typeof text === 'string' ? text.trim().toLowerCase() : '';
const seen = new Set();
const rows = slugs.map(slug => {
  const {quizId, expectedTitle} = bindings[slug] || {};
  if (!validUuid.test(quizId) || !normalize(expectedTitle) || seen.has(quizId.toLowerCase())) {
    throw new Error(`Specify a distinct quiz ID and its exact database title for ${slug}.`);
  }
  seen.add(quizId.toLowerCase());
  const bank = JSON.parse(fs.readFileSync(path.join(directory, slug + '.json'), 'utf8'));
  const prompts = new Set();
  if (!Array.isArray(bank) || bank.length !== 20) throw new Error(`${slug} must have 20 questions.`);
  for (const question of bank) {
    const prompt = normalize(question?.prompt);
    const options = Array.isArray(question?.options) ? question.options.map(normalize) : [];
    if (!prompt || prompts.has(prompt) || options.length !== 4 || options.includes('') ||
        new Set(options).size !== 4 || !Number.isInteger(question.correct) ||
        question.correct < 0 || question.correct > 3) {
      throw new Error(`Invalid or duplicate question in ${slug}.`);
    }
    prompts.add(prompt);
  }
  return `(${sqlString(quizId)}::uuid,${sqlString(expectedTitle)},${sqlString(JSON.stringify(bank))}::jsonb)`;
});
console.log(`begin;

create temporary table iac_review_banks (quiz_id uuid primary key, expected_title text, questions jsonb) on commit drop;
insert into iac_review_banks values
${rows.join(',\n')};

do $checks$
begin
  if exists (
    select 1 from iac_review_banks b
    left join public.iac_mock_quizzes q on q.id=b.quiz_id
    where q.id is null or q.title is distinct from b.expected_title or q.published is distinct from true
  ) then
    raise exception 'A binding did not match a published quiz and its exact title.';
  end if;
end
$checks$;

-- New banks are disabled until scoring and issuance have been validated together.
-- Do not overwrite existing configured banks on retry.
insert into public.iac_timed_quiz_banks (quiz_id, questions, enabled)
select quiz_id, questions, false from iac_review_banks
on conflict (quiz_id) do nothing;

commit;`);
