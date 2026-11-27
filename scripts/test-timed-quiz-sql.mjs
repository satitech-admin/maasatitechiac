import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';

const local = createRequire(import.meta.url);
const {PGlite} = local(process.env.IAC_PGLITE_MODULE || '@electric-sql/pglite');
const db = new PGlite();
const quiz = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const student = '11111111-1111-4111-8111-111111111111';
const other = '22222222-2222-4222-8222-222222222222';
const query = (action, id = null, answers = {}) =>
  db.query('select public.iac_timed_quiz_action($1,$2,$3,$4::jsonb) as attempt',
    [quiz, action, id, JSON.stringify(answers)]).then(response => response.rows[0].attempt);
const as = uid => db.exec(`set role authenticated; set request.jwt.claim.sub='${uid}'`);
const bank = Array.from({length: 20}, (_, i) => ({prompt:`Synthetic question ${i + 1}`, options:['A','B','C','D'], correct:0}));
const correct = count => Object.fromEntries(Array.from({length: count}, (_, i) => [String(i + 1), 0]));

try {
  await db.exec(`create role anon; create role authenticated; create schema auth;
  create function auth.uid() returns uuid language sql stable as 'select nullif(current_setting(''request.jwt.claim.sub'', true), '''')::uuid';
  create table public.iac_mock_quizzes(id uuid primary key,published boolean);
  create table public.iac_mock_attempts(id uuid primary key default gen_random_uuid(),user_id uuid,quiz_id uuid,answers jsonb,score integer,correct_count integer,total_questions integer,submitted_at timestamptz);
  insert into public.iac_mock_quizzes values ('${quiz}',true);`);
  await db.exec(fs.readFileSync(new URL('../database/hardening/iac_timed_skill_quiz.sql', import.meta.url), 'utf8'));
  await db.exec(fs.readFileSync(new URL('../database/hardening/iac_timed_quiz_history_bridge.sql', import.meta.url), 'utf8'));
  const legacy = () => db.query("insert into public.iac_mock_attempts (user_id,quiz_id,score,total_questions) values ($1,$2,100,3)", [student,quiz]);
  await legacy();
  await db.query('insert into public.iac_timed_quiz_banks(quiz_id,questions,enabled) values($1,$2::jsonb,true)', [quiz, JSON.stringify(bank)]);
  await assert.rejects(legacy(), /Use the server-timed assessment/);
  await as(student);

  for (const n of [16, 17, 18, 20]) {
    const attempt = await query('start');
    assert.equal(attempt.questions.length, 20);
    assert.equal(attempt.questions.some(q => 'correct' in q), false);
    assert.ok(Date.parse(attempt.expires_at) - Date.parse(attempt.server_time) <= 300000);
    const saved = await query('save', attempt.attempt_id, correct(n));
    const reopened = await query('start');
    assert.equal(reopened.attempt_id, attempt.attempt_id);
    assert.equal(reopened.expires_at, attempt.expires_at);
    assert.deepEqual(reopened.answers, saved.answers);
    const result = await query('submit', attempt.attempt_id);
    assert.equal(result.correct_count, n);
    assert.equal(result.score, n * 5);
    assert.equal(result.qualifies, n >= 18);
    const repeated = await query('submit', attempt.attempt_id, correct(20));
    assert.equal(repeated.submitted_at, result.submitted_at);
    assert.equal(repeated.correct_count, n);
    console.log(`PASS ${n}/20, resume, saved answers, duplicate submission`);
  }

  const expiring = await query('start');
  await query('save', expiring.attempt_id, correct(16));
  await as(other);
  await assert.rejects(query('save', expiring.attempt_id, correct(20)), /Quiz attempt unavailable/);
  await db.exec('reset role');
  const history = (await db.query('select score,total_questions from public.iac_mock_attempts order by total_questions,score')).rows;
  assert.deepEqual(history.map(x=>[x.total_questions,x.score]), [[3,100],[20,80],[20,85],[20,90],[20,100]]);
  console.log('PASS grade history bridge, legacy attempt preservation and rejection of new untimed submissions');
  await db.query("update public.iac_timed_quiz_attempts set ends_at=now()-interval '1 second' where id=$1", [expiring.attempt_id]);
  await as(student);
  const expired = await query('save', expiring.attempt_id, correct(20));
  assert.equal(expired.correct_count, 16);
  assert.ok(expired.submitted_at);
  assert.equal(expired.qualifies, false);
  await assert.rejects(db.query('select questions from public.iac_timed_quiz_banks'), /permission denied/);
  console.log('PASS expiry finalizes saved answers, late write rejected, and other users/answer keys are protected');
} finally {
  await db.close();
}
