begin;

-- Enabled assessments only accept finalized server-timed evidence.
create function public.iac_check_timed_quiz_history_insert()
returns trigger language plpgsql security definer set search_path=''
as $$
begin
  if exists (select 1 from public.iac_timed_quiz_banks where quiz_id=new.quiz_id and enabled)
  and not exists (
    select 1 from public.iac_timed_quiz_attempts a
    where a.id=new.id and a.user_id=new.user_id and a.quiz_id=new.quiz_id
      and a.submitted_at=new.submitted_at and a.correct_count=new.correct_count
      and a.questions is not null and new.total_questions=20
      and new.score=a.correct_count*5 and a.answers=new.answers
  ) then
    raise exception using errcode='42501', message='Use the server-timed assessment for this skill.';
  end if;
  return new;
end;
$$;

create function public.iac_record_timed_quiz_history()
returns trigger language plpgsql security definer set search_path=''
as $$
begin
  insert into public.iac_mock_attempts (id,user_id,quiz_id,answers,score,correct_count,total_questions,submitted_at)
  values (new.id,new.user_id,new.quiz_id,new.answers,new.correct_count*5,new.correct_count,20,new.submitted_at)
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke all on function public.iac_check_timed_quiz_history_insert() from public, anon, authenticated;
revoke all on function public.iac_record_timed_quiz_history() from public, anon, authenticated;

create trigger iac_check_timed_quiz_history_insert
before insert on public.iac_mock_attempts
for each row execute function public.iac_check_timed_quiz_history_insert();

create trigger iac_record_timed_quiz_history
after update of submitted_at on public.iac_timed_quiz_attempts
for each row when (old.submitted_at is null and new.submitted_at is not null)
execute function public.iac_record_timed_quiz_history();

commit;
