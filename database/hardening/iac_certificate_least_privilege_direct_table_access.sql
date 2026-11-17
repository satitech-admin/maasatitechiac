-- Applied to Maa Sati IAC Supabase project ylobnofwmryltbzdtkla on 2026-11-17.
-- Public certificate verification intentionally remains available through
-- public.iac_verify_certificate(text), which returns masked recipient information.
-- The privileged mentor-review RPC is callable only by authenticated users
-- and independently checks the administrator role before issuing a certificate.
-- Protect direct certificate table access with least privilege. Existing RLS
-- continues to limit SELECT to recipient/admin and UPDATE to administrator.
-- The issuance SECURITY DEFINER workflow and service_role retain privileges.
revoke all privileges on table public.iac_certificates from anon, authenticated;
grant select on table public.iac_certificates to authenticated;
grant update (revoked) on table public.iac_certificates to authenticated;

-- Verification queries (run separately after applying):
-- select has_table_privilege('anon','public.iac_certificates','SELECT');
-- select has_table_privilege('authenticated','public.iac_certificates','INSERT');
-- select has_column_privilege('authenticated','public.iac_certificates','recipient_id','UPDATE');
-- select has_column_privilege('authenticated','public.iac_certificates','revoked','UPDATE');
