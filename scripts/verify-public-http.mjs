// Opt-in public launch smoke test. Run only after domain access is approved by owner.
// It fails deliberately if Vercel SSO or another login challenge blocks visitors.
const base = new URL(process.env.IAC_PUBLIC_URL || 'https://maasatitechiac.vercel.app');
if (base.protocol !== 'https:') throw new Error('Only HTTPS public URLs are accepted');
const paths = ['/', '/platform.html', '/programs.html', '/robots.txt', '/sitemap.xml'];

for (const pathname of paths) {
  const url = new URL(pathname, base);
  const response = await fetch(url, { redirect: 'manual', signal: AbortSignal.timeout(15000) });
  if (response.status !== 200) {
    throw new Error('Not public yet: ' + pathname + ' responded HTTP ' + response.status +
      '. Check deployment protection, domain verification and SSL.');
  }
  if (response.headers.get('x-content-type-options')?.toLowerCase() !== 'nosniff')
    throw new Error('Missing nosniff header at ' + pathname);
  if (response.headers.get('referrer-policy') !== 'strict-origin-when-cross-origin')
    throw new Error('Missing Referrer-Policy at ' + pathname);
  if (pathname.endsWith('.html') || pathname === '/') {
    const text = await response.text();
    if (!/maa sati iac/i.test(text)) throw new Error('Wrong website content at ' + pathname);
  }
  console.log('PASS', pathname, 'HTTP 200 with configured headers');
}
console.log('Public HTTP smoke checks passed. Signed-in enrollment and staff acceptance tests remain separate.');
