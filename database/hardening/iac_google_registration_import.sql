begin;

create table public.iac_google_registrations (
  id uuid primary key default gen_random_uuid(),
  response_timestamp text not null check (length(response_timestamp) between 5 and 60),
  student text not null check (length(student) between 2 and 120),
  grade text not null check (grade in ('9','10','11','12')),
  school text not null check (length(school) between 2 and 160),
  guardian_mobile text not null check (guardian_mobile ~ '^[6-9][0-9]{9}$'),
  payment_status text not null default 'pending' check (payment_status in ('pending','verified','needs_follow_up')),
  imported_at timestamptz not null default now(),
  imported_by uuid not null default auth.uid(),
  unique (response_timestamp,student,guardian_mobile)
);

alter table public.iac_google_registrations enable row level security;
revoke all on public.iac_google_registrations from public, anon, authenticated;
grant select, insert on public.iac_google_registrations to authenticated;
grant update (payment_status) on public.iac_google_registrations to authenticated;

create policy iac_google_registration_admin on public.iac_google_registrations
  to authenticated using ((select public.iac_is_admin()))
  with check ((select public.iac_is_admin()));
create policy iac_google_registration_attribution on public.iac_google_registrations
  as restrictive for insert to authenticated
  with check (imported_by=(select auth.uid()) and payment_status='pending');

commit;
