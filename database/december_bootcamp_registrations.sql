begin;

create table public.iac_december_registrations (
  reference uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  student text not null,
  grade text not null check (grade in ('9','10','11','12')),
  school text not null,
  city text not null,
  district text not null,
  state text not null,
  guardian text not null,
  mobile text not null,
  email text not null,
  experience text not null check (experience in ('none','some','regular')),
  remarks text not null,
  status text not null default 'pending' check (status in ('pending','verified','approved','declined')),
  notes text not null default '',
  verified_at timestamptz,
  verification_evidence text,
  verified_by uuid,
  reviewed_at timestamptz,
  reviewed_by uuid
);
create unique index iac_december_registration_dedupe
  on public.iac_december_registrations (lower(student), grade, lower(school), mobile);
create index iac_december_registration_created on public.iac_december_registrations (created_at desc);
create index iac_december_registration_contact on public.iac_december_registrations (mobile, email);

alter table public.iac_december_registrations enable row level security;
revoke all on public.iac_december_registrations from public, anon, authenticated;
grant select on public.iac_december_registrations to authenticated;
create policy iac_december_admin_read on public.iac_december_registrations
  for select to authenticated using ((select public.iac_is_admin()));

create function public.iac_december_submit(p jsonb) returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  v_reference uuid := gen_random_uuid();
  v_student text := regexp_replace(trim(p->>'student'), '\s+', ' ', 'g');
  v_school text := regexp_replace(trim(p->>'school'), '\s+', ' ', 'g');
  v_city text := trim(p->>'city');
  v_district text := trim(p->>'district');
  v_state text := trim(p->>'state');
  v_guardian text := trim(p->>'guardian');
  v_mobile text := regexp_replace(trim(p->>'mobile'), '^\+91[ ]*', '');
  v_email text := lower(trim(p->>'email'));
  v_remarks text := coalesce(trim(p->>'remarks'), '');
begin
  if p is null or jsonb_typeof(p) <> 'object' or pg_column_size(p) > 8192
    or now() >= '2026-12-06 00:00:00+05:30'::timestamptz
    or coalesce(p->>'website','') <> ''
    or p->'consent' is distinct from 'true'::jsonb
    or p->'privacy' is distinct from 'true'::jsonb
    or p->'eligible' is distinct from 'true'::jsonb
    or not coalesce(
      length(v_student) between 2 and 100 and length(v_school) between 2 and 150
      and length(v_city) between 2 and 100 and length(v_district) between 2 and 100
      and length(v_state) between 2 and 100 and length(v_guardian) between 2 and 100
      and v_mobile ~ '^[6-9][0-9]{9}$' and length(v_email) <= 254
      and v_email ~ '^[^[:space:]@]+@[^[:space:]@.]+([.][^[:space:]@.]+)+$'
      and length(v_remarks) <= 500 and p->>'grade' in ('9','10','11','12')
      and p->>'experience' in ('none','some','regular'), false)
  then raise exception using errcode = '22023', message = 'Registration details are invalid or registration has closed.'; end if;

  perform pg_advisory_xact_lock(9130401);
  if (select count(*) from public.iac_december_registrations where created_at > now() - interval '1 hour') >= 150
    or (select count(*) from public.iac_december_registrations
        where created_at > now() - interval '1 day' and (mobile = v_mobile or email = v_email)) >= 6
  then raise exception using errcode = 'P0001', message = 'Registration temporarily limited. Please contact the institute for help.'; end if;

  insert into public.iac_december_registrations
    (reference, student, grade, school, city, district, state, guardian, mobile, email, experience, remarks)
  values (v_reference, v_student, p->>'grade', v_school, v_city, v_district, v_state,
    v_guardian, v_mobile, v_email, p->>'experience', v_remarks);
  return v_reference;
end;
$$;
revoke all on function public.iac_december_submit(jsonb) from public, anon, authenticated;
grant execute on function public.iac_december_submit(jsonb) to anon, authenticated;

create function public.iac_december_review(p_reference uuid, p_action text, p_notes text) returns void
language plpgsql security definer set search_path = '' as $$
declare
  v_status text;
  v_staff uuid := auth.uid();
  v_notes text := trim(coalesce(p_notes, ''));
begin
  if v_staff is null or public.iac_is_admin() is distinct from true then
    raise exception using errcode = '42501', message = 'Verified administrator access required.';
  end if;
  if length(v_notes) > 1000 or p_action is null or p_action not in ('notes','verify','approve','decline') then
    raise exception using errcode = '22023', message = 'Invalid review details.';
  end if;
  select status into v_status from public.iac_december_registrations where reference = p_reference for update;
  if not found then raise exception 'Registration not found.'; end if;
  if p_action = 'verify' and (v_status <> 'pending' or length(v_notes) < 20) then
    raise exception 'Record independent guardian verification before continuing.';
  elsif p_action = 'approve' and v_status <> 'verified' then
    raise exception 'Verify the guardian before approving this registration.';
  elsif p_action = 'decline' and v_status not in ('pending','verified') then
    raise exception 'This registration already has a final decision.';
  end if;
  update public.iac_december_registrations set
    status = case p_action when 'verify' then 'verified' when 'approve' then 'approved' when 'decline' then 'declined' else status end,
    notes = v_notes,
    verified_at = case when p_action = 'verify' then now() else verified_at end,
    verification_evidence = case when p_action = 'verify' then v_notes else verification_evidence end,
    verified_by = case when p_action = 'verify' then v_staff else verified_by end,
    reviewed_at = now(), reviewed_by = v_staff
  where reference = p_reference;
end;
$$;
revoke all on function public.iac_december_review(uuid,text,text) from public, anon, authenticated;
grant execute on function public.iac_december_review(uuid,text,text) to authenticated;

commit;
