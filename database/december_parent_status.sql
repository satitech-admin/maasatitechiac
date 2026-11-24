begin;

create function public.iac_december_parent_status(p_reference uuid, p_email text)
returns table(application_status text, submitted_on date)
language sql
stable
security definer
set search_path = ''
as $$
  select registration.status, (registration.created_at at time zone 'Asia/Kolkata')::date
  from public.iac_december_registrations registration
  where registration.reference = p_reference
    and registration.email = lower(trim(p_email))
    and length(p_email) <= 254;
$$;

revoke all on function public.iac_december_parent_status(uuid,text) from public, anon, authenticated;
grant execute on function public.iac_december_parent_status(uuid,text) to anon, authenticated;

commit;
