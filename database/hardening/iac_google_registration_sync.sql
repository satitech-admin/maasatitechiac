begin;

create table public.iac_registration_sync_config (
  singleton boolean primary key default true check (singleton),
  credential_hash bytea not null,
  configured_by uuid not null
);
alter table public.iac_registration_sync_config enable row level security;
revoke all on public.iac_registration_sync_config from public, anon, authenticated;

create function public.iac_rotate_registration_sync_credential()
returns text language plpgsql security definer set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  credential text := replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', '');
begin
  if actor is null or public.iac_is_admin() is distinct from true then
    raise exception using errcode = '42501', message = 'Administrator access required.';
  end if;
  insert into public.iac_registration_sync_config (credential_hash, configured_by)
    values (sha256(convert_to(credential, 'UTF8')), actor)
  on conflict (singleton) do update set
    credential_hash = excluded.credential_hash, configured_by = excluded.configured_by;
  return credential;
end;
$$;

create function public.iac_sync_google_registrations(p_credential text, p_rows jsonb)
returns integer language plpgsql security definer set search_path = ''
as $$
declare
  actor uuid;
  inserted integer;
begin
  if p_credential is null or p_credential !~ '^[a-f0-9]{64}$' then
    raise exception using errcode = '42501', message = 'Invalid sync credential.';
  end if;
  select configured_by into actor from public.iac_registration_sync_config
    where credential_hash = sha256(convert_to(p_credential, 'UTF8'));
  if actor is null then
    raise exception using errcode = '42501', message = 'Invalid sync credential.';
  end if;
  if jsonb_typeof(p_rows) is distinct from 'array' or pg_column_size(p_rows) > 131072 then
    raise exception using errcode = '22023', message = 'Invalid sync batch.';
  end if;
  if jsonb_array_length(p_rows) not between 1 and 100 then
    raise exception using errcode = '22023', message = 'Invalid sync batch size.';
  end if;
  insert into public.iac_google_registrations
    (response_timestamp, student, grade, school, guardian_mobile, imported_by)
  select trim(r.response_timestamp), trim(r.student), trim(r.grade),
    trim(r.school), trim(r.guardian_mobile), actor
  from jsonb_to_recordset(p_rows) as r
    (response_timestamp text, student text, grade text, school text, guardian_mobile text)
  on conflict (response_timestamp, student, guardian_mobile) do nothing;
  get diagnostics inserted = row_count;
  return inserted;
end;
$$;

revoke all on function public.iac_rotate_registration_sync_credential() from public, anon, authenticated;
grant execute on function public.iac_rotate_registration_sync_credential() to authenticated;
revoke all on function public.iac_sync_google_registrations(text,jsonb) from public, anon, authenticated;
grant execute on function public.iac_sync_google_registrations(text,jsonb) to anon;

commit;
