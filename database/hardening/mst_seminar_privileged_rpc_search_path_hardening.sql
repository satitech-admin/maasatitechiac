-- Maa Sati IAC seminar certificate API hardening
-- Applied to Supabase ylobnofwmryltbzdtkla on 2026-11-17.
-- These RPCs were SECURITY DEFINER with search_path='public,pg_temp'.
-- Each application table reference is already public-schema-qualified.
-- Pin their runtime search path to an empty list to prevent object shadowing.
-- Public issuance and QR verification grants remain unchanged.
alter function public.mst_get_seminar_certificate_counts(text) set search_path = '';
alter function public.mst_record_seminar_certificate_download(uuid,text) set search_path = '';

-- Evidence:
-- pg_proc.proconfig reports search_path="" for both RPCs.
-- Call mst_record_seminar_certificate_download(random UUID,'pdf') -> false
-- (unknown token makes no download counter update).
--
-- Outstanding review:
-- 1. Anonymous SECURITY DEFINER RPCs remain intentionally reachable for
--    student certificate issuance, QR verification and token-based downloads.
-- 2. Counts RPC still uses an embedded hash of a shared admin code; evaluate
--    replacing this with authenticated founder access and migrating the
--    certificate-admin frontend before revoking public RPC access.
-- 3. Conduct live mobile/desktop issuance, download and certificate
--    verification tests with consented users before public launch.
