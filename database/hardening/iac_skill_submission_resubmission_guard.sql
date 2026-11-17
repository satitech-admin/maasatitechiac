-- Maa Sati IAC security hardening
-- Applied to Supabase project ylobnofwmryltbzdtkla on 2026-11-17.
-- Purpose: prevent student project resubmission retargeting to another skill,
-- and recheck enrollment + genuine passing quiz evidence on each retry.
-- This file documents the applied migration. It does not attest to end-to-end learner testing.

create or replace function public.iac_guard_skill_submission_identity()
returns trigger language plpgsql security invoker set search_path = ''
as $$
begin
 if new.id is distinct from old.id
    or new.user_id is distinct from old.user_id
    or new.month_id is distinct from old.month_id
 then
  raise exception 'Project submission identity and skill cannot be changed after creation' using errcode='42501';
 end if;
 return new;
end;
$$;

drop trigger if exists iac_guard_skill_submission_identity on public.iac_skill_project_submissions;
create trigger iac_guard_skill_submission_identity
before update on public.iac_skill_project_submissions
for each row execute function public.iac_guard_skill_submission_identity();

drop policy if exists iac_skill_submissions_student_retry on public.iac_skill_project_submissions;
create policy iac_skill_submissions_student_retry
on public.iac_skill_project_submissions
for update to authenticated
using (
 user_id = (select auth.uid())
 and status in ('changes_requested','rejected')
)
with check (
 user_id = (select auth.uid())
 and status = 'pending'
 and reviewed_by is null
 and reviewed_at is null
 and instructor_feedback is null
 and exists (
  select 1 from public.iac_skill_assessments a
  join public.iac_program_months m on m.id = a.month_id
  join public.iac_programs p on p.id = m.program_id
  join public.iac_enrollments e on e.course_id = p.course_id
  where a.month_id = iac_skill_project_submissions.month_id
    and a.published
    and p.published
    and e.user_id = (select auth.uid())
    and e.status in ('active','completed')
    and exists (
      select 1 from public.iac_mock_attempts t
      where t.user_id = (select auth.uid())
        and t.quiz_id = a.quiz_id
        and t.score >= a.pass_score
        and t.total_questions >= 3
    )
 )
);
