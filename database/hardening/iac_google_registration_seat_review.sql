begin;

alter table public.iac_google_registrations
  add column seat_confirmed_at timestamptz,
  add column seat_confirmed_by uuid,
  add column notification_channel text,
  add column notified_at timestamptz,
  add column notified_by uuid,
  add constraint google_reg_seat_requires_payment
    check (seat_confirmed_at is null or payment_status = 'verified'),
  add constraint google_reg_notification_requires_seat
    check (notified_at is null or (seat_confirmed_at is not null and notification_channel in ('email', 'sms')));

revoke insert on public.iac_google_registrations from authenticated;
grant insert (response_timestamp, student, grade, school, guardian_mobile)
  on public.iac_google_registrations to authenticated;

create function public.iac_google_registration_follow_up(p_id uuid, p_action text)
returns void language plpgsql security definer set search_path = ''
as $$
declare staff_id uuid := auth.uid();
begin
  if staff_id is null or public.iac_is_admin() is distinct from true then
    raise exception using errcode = '42501', message = 'Verified administrator access required.';
  end if;
  if p_action = 'confirm' then
    update public.iac_google_registrations
      set seat_confirmed_at = now(), seat_confirmed_by = staff_id
      where id = p_id and payment_status = 'verified' and seat_confirmed_at is null;
  elsif p_action in ('email', 'sms') then
    update public.iac_google_registrations
      set notified_at = now(), notified_by = staff_id, notification_channel = p_action
      where id = p_id and seat_confirmed_at is not null and notified_at is null;
  else
    raise exception using errcode = '22023', message = 'Unknown follow-up action.';
  end if;
  if not found then
    raise exception using errcode = '22023', message = 'This registration cannot transition to that state.';
  end if;
end;
$$;

revoke all on function public.iac_google_registration_follow_up(uuid,text) from public, anon, authenticated;
grant execute on function public.iac_google_registration_follow_up(uuid,text) to authenticated;

commit;
