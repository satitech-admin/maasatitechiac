import {achievementDescription, issuer} from '../credential-share.js';

const origin = 'https://maasatitechiac.vercel.app';
const lookup = 'https://ylobnofwmryltbzdtkla.supabase.co/rest/v1/rpc/iac_verify_certificate';
const publishableKey = 'sb_publishable_YqLFRfMUlW5hzTOh_50hQQ_Ntr0pYa9';
const codePattern = /^MSIAC-[A-Z0-9-]{8,70}$/;
const escape = text => String(text).replace(/[&<>"']/g, c => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[c]));

function page({title, description, link, canonical, code, date, status}) {
  const textTitle = escape(title);
  const textDescription = escape(description);
  const verified = status === 200;
  const metadata = verified ? `
<meta property="og:type" content="website">
<meta property="og:site_name" content="${issuer}">
<meta property="og:title" content="${textTitle} · ${issuer}">
<meta property="og:description" content="${textDescription}">
<meta property="og:url" content="${escape(canonical)}">
<meta property="og:image" content="${origin}/assets/maa-sati-iac-logo.webp">
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="${textTitle} · ${issuer}">
<meta name="twitter:description" content="${textDescription}">` : '';
  return new Response(`<!doctype html><html lang="en-IN"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex">
<title>${textTitle} · ${issuer}</title><meta name="description" content="${textDescription}">${metadata}
<style>
*{box-sizing:border-box}body{margin:0;background:#f8f3e8;color:#10274a;font:1rem/1.6 system-ui,sans-serif}
main{width:min(44rem,calc(100% - 2rem));margin:clamp(1rem,9vw,5rem) auto;background:#fffdf7;border:1px solid #d9c49b;border-radius:1rem;padding:clamp(1rem,5vw,2.8rem);overflow-wrap:anywhere}
img{display:block;width:5rem;height:5rem;object-fit:contain}h1{font-size:clamp(1.5rem,5vw,2.4rem);line-height:1.18}
dt{font-weight:700}dd{margin:0 0 .6rem}a{display:inline-block;padding:.55rem .85rem;background:#10274a;color:#fff;border-radius:.45rem;text-decoration:none}
a:focus-visible{outline:3px solid #407ab0;outline-offset:3px}
</style></head><body><main><img src="/assets/maa-sati-iac-logo.webp" width="80" height="80" alt="MAA SATI IAC">
<p>${verified ? 'Verified by ' : ''}${issuer}</p><h1>${textTitle}</h1><p>${textDescription}</p>
${verified ? `<dl><dt>Credential ID</dt><dd>${escape(code)}</dd>${date ? `<dt>Issued</dt><dd>${escape(date)}</dd>` : ''}</dl>` : ''}
<a href="${escape(link)}">Open Certificate Center</a></main></body></html>`, {
    status,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'no-referrer'
    }
  });
}

export async function GET(request) {
  const params = new URL(request.url).searchParams;
  const badge = params.get('kind') === 'badge';
  const code = String(params.get('code') || '').trim().toUpperCase();
  const link = new URL(badge ? '/skill-badge.html' : '/certificate.html', origin);
  const fail = (status, title, description) => page({status, title, description, link: link.href});
  if (!codePattern.test(code)) return fail(400, 'Invalid credential code', 'Enter an official MAA SATI IAC credential ID.');
  link.searchParams.set('code', code);
  try {
    const response = await fetch(lookup, {
      method: 'POST',
      headers: {apikey: publishableKey, 'Content-Type': 'application/json'},
      body: JSON.stringify({p_code: code}), signal: AbortSignal.timeout(5000),
      cache: 'no-store'
    });
    if (!response.ok) throw Error('Credential registry unavailable');
    const data = await response.json();
    const row = Array.isArray(data) ? data[0] : data;
    if (row?.valid !== true || (badge && row.certificate_type !== 'skill')) {
      return fail(404, 'Credential unavailable', 'The registry did not return a valid credential for this link.');
    }
    const kind = badge ? 'Skill Badge' : 'Certificate';
    const program = String(row.program_title || '').trim();
    const title = program ? `${program} | ${kind}` : kind;
    // Only public achievement data reaches HTML or crawler metadata.
    const description = achievementDescription(row);
    const parsedDate = row.issued_at && new Date(row.issued_at);
    const date = parsedDate && !Number.isNaN(parsedDate.getTime()) ?
      parsedDate.toLocaleDateString('en-IN', {dateStyle: 'long', timeZone: 'UTC'}) : '';
    const canonical = new URL('/api/credential-share', origin);
    canonical.searchParams.set('kind', badge ? 'badge' : 'certificate');
    canonical.searchParams.set('code', code);
    return page({title, description, link: link.href, canonical: canonical.href, code, date, status: 200});
  } catch {
    return fail(503, 'Verification temporarily unavailable', 'Try the Certificate Center or check again later.');
  }
}

export default {fetch: GET};
