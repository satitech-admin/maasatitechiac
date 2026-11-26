begin;

-- Only enabled quizzes enter this workflow. Existing attempts and awards stay intact.
create table public.iac_timed_quiz_banks (
  quiz_id uuid primary key references public.iac_mock_quizzes(id),
  questions jsonb not null check (jsonb_typeof(questions)='array'),
  enabled boolean not null default false
);

create table public.iac_timed_quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.iac_timed_quiz_banks(quiz_id),
  user_id uuid not null,
  questions jsonb not null,
  answers jsonb not null default '{}'::jsonb,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  submitted_at timestamptz,
  correct_count integer check (correct_count between 0 and 20)
);
create unique index iac_one_open_timed_quiz_attempt
  on public.iac_timed_quiz_attempts (user_id, quiz_id) where submitted_at is null;

alter table public.iac_timed_quiz_banks enable row level security;
alter table public.iac_timed_quiz_attempts enable row level security;
revoke all on public.iac_timed_quiz_banks, public.iac_timed_quiz_attempts from public, anon, authenticated;

-- Rows are locked before saving or finalizing. Expiry always uses server time.
create function public.iac_timed_quiz_action(
  p_quiz uuid, p_action text, p_attempt uuid default null, p_answers jsonb default '{}'::jsonb
) returns jsonb language plpgsql security definer set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  attempt public.iac_timed_quiz_attempts;
  bank jsonb;
  public_questions jsonb;
  clock timestamptz;
  marks integer;
begin
  if actor is null then raise exception using errcode='42501',message='Sign in first.'; end if;
  if p_action is null or p_action not in ('start','save','submit') then
    raise exception using errcode='22023',message='Invalid quiz action.';
  end if;
  perform pg_advisory_xact_lock(hashtextextended(actor::text || ':' || p_quiz::text, 0));
  if p_action='start' then
    select * into attempt from public.iac_timed_quiz_attempts
      where quiz_id=p_quiz and user_id=actor and submitted_at is null for update;
    if not found then
      select b.questions into bank from public.iac_timed_quiz_banks b
        join public.iac_mock_quizzes q on q.id=b.quiz_id
        where b.quiz_id=p_quiz and b.enabled and q.published;
      if bank is null or jsonb_array_length(bank)<>20 or
        (select count(distinct lower(trim(q->>'prompt'))) from jsonb_array_elements(bank) q)<>20 or
        exists (
          select 1 from jsonb_array_elements(bank) q
          where jsonb_typeof(q) is distinct from 'object'
             or jsonb_typeof(q->'prompt') is distinct from 'string'
             or nullif(trim(q->>'prompt'),'') is null
             or jsonb_typeof(q->'options') is distinct from 'array'
             or case when jsonb_typeof(q->'options')='array' then jsonb_array_length(q->'options')<>4
                     else true end
             or jsonb_typeof(q->'correct') is distinct from 'number'
             or coalesce(q->>'correct','') !~ '^[0-3]$'
        ) then
        raise exception using errcode='22023',message='This timed quiz does not have an approved twenty-question bank.';
      end if;
      if exists(select 1 from jsonb_array_elements(bank) q
        where (select count(distinct lower(trim(o #>> '{}'))) from jsonb_array_elements(q->'options') o
          where jsonb_typeof(o)='string' and nullif(trim(o #>> '{}'),'') is not null)<>4) then
        raise exception using errcode='22023',message='This timed quiz has invalid answer choices.';
      end if;
      clock := clock_timestamp();
      insert into public.iac_timed_quiz_attempts (quiz_id,user_id,questions,starts_at,ends_at)
       values (p_quiz,actor,bank,clock,clock+interval '5 minutes') returning * into attempt;
    end if;
  else
    select * into attempt from public.iac_timed_quiz_attempts
      where id=p_attempt and quiz_id=p_quiz and user_id=actor for update;
    if not found then raise exception using errcode='42501',message='Quiz attempt unavailable.'; end if;
  end if;
  clock := clock_timestamp();
  if attempt.submitted_at is null then
    if clock<attempt.ends_at and p_action in ('save','submit') then
      if jsonb_typeof(p_answers) is distinct from 'object' or pg_column_size(p_answers)>4096 then
        raise exception using errcode='22023',message='Invalid quiz answers.';
      end if;
      if exists(select 1 from jsonb_each(p_answers) a
         where a.key !~ '^([1-9]|1[0-9]|20)$' or a.value::text !~ '^[0-3]$') then
        raise exception using errcode='22023',message='Invalid quiz answer or question number.';
      end if;
      update public.iac_timed_quiz_attempts set answers=answers || p_answers
        where id=attempt.id returning * into attempt;
    end if;
    if p_action='submit' or clock>=attempt.ends_at then
      select count(*) into marks from jsonb_array_elements(attempt.questions) with ordinality q(question,n)
        where attempt.answers->q.n::text = q.question->'correct';
      update public.iac_timed_quiz_attempts set correct_count=marks, submitted_at=clock
        where id=attempt.id returning * into attempt;
    end if;
  end if;
  select jsonb_agg(jsonb_build_object('number',q.n,'prompt',q.question->'prompt','options',q.question->'options') order by q.n)
    into public_questions from jsonb_array_elements(attempt.questions) with ordinality q(question,n);
  return jsonb_build_object(
    'attempt_id',attempt.id,'server_time',clock,'expires_at',attempt.ends_at,
    'questions',public_questions,'answers',attempt.answers,
    'submitted_at',attempt.submitted_at,'correct_count',attempt.correct_count,
    'question_count',20,'score',attempt.correct_count*5,
    'qualifies',case when attempt.submitted_at is not null then attempt.correct_count>=18 end
  );
end;
$$;

create function public.iac_timed_quiz_available(p_quiz uuid)
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.iac_timed_quiz_banks b
    join public.iac_mock_quizzes q on q.id=b.quiz_id
    where b.quiz_id=p_quiz and b.enabled and q.published
  );
$$;
revoke all on function public.iac_timed_quiz_available(uuid) from public, anon, authenticated;
grant execute on function public.iac_timed_quiz_available(uuid) to anon, authenticated;

revoke all on function public.iac_timed_quiz_action(uuid,text,uuid,jsonb) from public, anon, authenticated;
grant execute on function public.iac_timed_quiz_action(uuid,text,uuid,jsonb) to authenticated;

commit;
