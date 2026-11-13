// Static release-preparation checks. This does not claim the website is publicly reachable.
import fs from 'node:fs';
import assert from 'node:assert/strict';

const read = file => fs.readFileSync(file, 'utf8');
const privatePages = [
  'account-acceptance.html', 'my-learning.html', 'learning-journey.html', 'study-plan.html',
  'profile.html', 'analytics.html', 'onboarding.html', 'assistant.html',
  'payments.html', 'certificate.html', 'skill-badge.html',
  'curriculum-admin.html', 'founder.html', 'mentor-operations.html', 'skill-review.html'
];
const publicPages = ['index.html', 'platform.html', 'programs.html', 'start-here.html', 'fees.html', 'about.html'];
const errors = [];
const check = (condition, message) => { if (!condition) errors.push(message); };

for (const file of privatePages) {
  check(fs.existsSync(file), file + ': not found');
  if (!fs.existsSync(file)) continue;
  const head = read(file).split('</head>')[0];
  check(/<meta\s+name=["']robots["']\s+content=["']noindex,nofollow["']\s*\/?>/i.test(head),
    file + ': private page must be excluded from search indexing');
}

for (const file of publicPages) {
  check(fs.existsSync(file), file + ': public sitemap destination missing');
  if (!fs.existsSync(file)) continue;
  const head = read(file).split('</head>')[0];
  check(!/<meta\s+name=["']robots["']\s+content=["'][^"']*noindex/i.test(head),
    file + ': public page is accidentally noindexed');
}

const conf = JSON.parse(read('vercel.json'));
const headers = (conf.headers || []).find(entry => entry.source === '/(.*)')?.headers || [];
const headerMap = new Map(headers.map(item => [item.key.toLowerCase(), item.value]));
check(headerMap.get('x-content-type-options') === 'nosniff', 'Missing nosniff response header');
check(headerMap.get('referrer-policy') === 'strict-origin-when-cross-origin', 'Missing safe Referrer-Policy');
check(['sameorigin', 'deny'].includes(headerMap.get('x-frame-options')?.toLowerCase()),
  'Missing anti-framing response header');
check(!JSON.stringify(conf).includes('service_role'), 'Never include service-role credentials in static config');

const robots = read('robots.txt');
const xml = read('sitemap.xml');
check(robots.includes('Sitemap: https://maasatitechiac.vercel.app/sitemap.xml'),
  'robots.txt and sitemap URL mismatch');
const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
check(locs.length === publicPages.length, 'Sitemap must list only approved public pages');
const expectedUrls = new Set(publicPages.map(f => 'https://maasatitechiac.vercel.app/' +
  (f === 'index.html' ? '' : f)));
for (const url of locs) check(expectedUrls.has(url), 'Sitemap contains unexpected or private page: ' + url);

for (const page of [...privatePages, ...publicPages]) {
  if (!fs.existsSync(page)) continue;
  check(!/\bsb_secret_[A-Za-z0-9_-]+/.test(read(page)), page + ': exposed Supabase secret key');
  check(!/\bsk-proj-[A-Za-z0-9_-]{12,}/.test(read(page)), page + ': exposed API key');
}
console.log('Checked ' + privatePages.length + ' private pages, ' + publicPages.length +
  ' public routes, headers, robots and sitemap');
if (errors.length) {
  console.error(errors.map(s => 'FAIL ' + s).join('\n'));
  process.exitCode = 1;
} else {
  console.log('PASS static launch readiness. Public HTTP access and actual student workflows require separate verification.');
}
