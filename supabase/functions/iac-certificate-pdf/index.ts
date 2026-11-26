import {createClient} from 'https://esm.sh/@supabase/supabase-js@2.119.0';
import {renderIssuedCertificate} from './render.mjs';

const website = 'https://maasatitechiac.vercel.app';
const apiUrl = Deno.env.get('SUPABASE_URL') ?? '';
const publicKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
const storageKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const assetBucket = Deno.env.get('IAC_CERTIFICATE_ASSET_BUCKET') ?? '';

const headers = {
  'Access-Control-Allow-Origin': website,
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Cache-Control': 'private, no-store',
  'X-Content-Type-Options': 'nosniff',
  Vary: 'Origin',
};
function error(message: string, status: number) {
  return Response.json({error: message}, {status, headers});
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response(null, {status: 204, headers});
  if (request.method !== 'POST') return error('Method not allowed.', 405);
  const authorization = request.headers.get('Authorization') ?? '';
  if (!/^Bearer [^\s]+$/.test(authorization)) return error('Sign in to download a certificate.', 401);
  const body = await request.json().catch(() => null);
  const code = typeof body?.code === 'string' ? body.code.trim().toUpperCase() : '';
  if (!/^MSIAC-[A-Z0-9-]{8,70}$/.test(code)) return error('Invalid certificate code.', 400);

  try {
    const owner = createClient(apiUrl, publicKey, {
      global: {headers: {Authorization: authorization}},
      auth: {persistSession: false, autoRefreshToken: false},
    });
    const {data: auth, error: authError} = await owner.auth.getUser(authorization.slice(7));
    if (authError || !auth?.user) return error('Sign in to download a certificate.', 401);

    const {data: record, error: recordError} = await owner.from('iac_certificates')
      .select('certificate_code,certificate_type,program_title,recipient_name,issued_at,revoked')
      .eq('recipient_id', auth.user.id).eq('certificate_code', code).eq('revoked', false).maybeSingle();
    if (recordError) return error('Certificate lookup temporarily unavailable.', 503);
    if (!record || record.revoked !== false) return error('Certificate not available for this account.', 404);

    const publicLookup = await owner.rpc('iac_verify_certificate', {p_code: code});
    if (publicLookup.error) return error('Certificate verification temporarily unavailable.', 503);
    const publicRecord = Array.isArray(publicLookup.data) ? publicLookup.data[0] : publicLookup.data;
    if (publicRecord?.valid !== true) return error('Certificate not available for this account.', 404);

    if (!assetBucket || !storageKey) return error('Certificate artwork is temporarily unavailable.', 503);
    // This client reads only two fixed private artwork files, after ownership and revocation checks.
    const storage = createClient(apiUrl, storageKey, {auth: {persistSession: false, autoRefreshToken: false}});
    const [art, font] = await Promise.all([
      storage.storage.from(assetBucket).download('approved-frame.jpg'),
      storage.storage.from(assetBucket).download('certificate-font.ttf'),
    ]);
    if (art.error || !art.data || font.error || !font.data) {
      return error('Certificate artwork is temporarily unavailable.', 503);
    }
    const pdf = await renderIssuedCertificate({
      record: {...record, achievement_description: publicRecord.achievement_description},
      artwork: new Uint8Array(await art.data.arrayBuffer()),
      fontBytes: new Uint8Array(await font.data.arrayBuffer()),
    });
    return new Response(Uint8Array.from(pdf), {
      headers: {...headers, 'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Maa_Sati_IAC_${code}.pdf"`},
    });
  } catch {
    return error('Certificate PDF could not be generated.', 503);
  }
});
