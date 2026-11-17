-- Applied to Supabase project ylobnofwmryltbzdtkla on 2026-11-17.
-- Founder / verified institute administrator seminar certificate reporting.
-- Existing student certificate issuance, token verification and downloads unchanged.
-- Legacy shared-code function intentionally retained temporarily pending migration of any external certificate-admin frontend.

create or replace function public.iac_admin_seminar_certificate_counts()
returns jsonb
language plpgsql stable security definer set search_path = ''
as $$
declare v_result jsonb;
begin
 if (select auth.uid()) is null or not public.iac_is_admin() then
   raise exception 'Verified institute administrator required' using errcode='42501';
 end if;
 select coalesce(jsonb_agg(jsonb_build_object(
    'school', e.school_name,
    'event', e.title,
    'date', e.event_date,
    'issued', coalesce(s.issued,0),
    'downloaded', coalesce(s.downloaded,0),
    'total_clicks', coalesce(s.total_clicks,0),
    'pdf_downloads', coalesce(s.pdf_clicks,0),
    'image_downloads', coalesce(s.image_clicks,0)
 ) order by e.school_name), '[]'::jsonb) into v_result
 from public.mst_seminar_events e
 left join lateral (
  select count(distinct c.id) filter(where c.revoked_at is null) as issued,
    count(distinct d.certificate_id) as downloaded,
    coalesce(sum(d.click_count),0) as total_clicks,
    coalesce(sum(d.click_count) filter (where d.format='pdf'),0) as pdf_clicks,
    coalesce(sum(d.click_count) filter (where d.format='image'),0) as image_clicks
  from public.mst_seminar_certificates c
  left join public.mst_seminar_certificate_downloads d on d.certificate_id=c.id
  where c.event_id=e.id
 ) s on true;
 return v_result;
end;
$$;
revoke all on function public.iac_admin_seminar_certificate_counts() from public, anon, authenticated;
grant execute on function public.iac_admin_seminar_certificate_counts() to authenticated, service_role;
