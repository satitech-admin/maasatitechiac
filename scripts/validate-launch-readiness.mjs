// Static release-preparation checks. This does not claim the website is publicly reachable.
import fs from 'node:fs';
import assert from 'node:assert/strict';

const read = file => fs.readFileSync(file, 'utf8');
const privatePages = [
  'account-acceptance.html', 'owner-register.html', 'my-learning.html', 'learning-journey.html', 'study-plan.html',
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

const mentorReviews=read('skill-review.html');
check(mentorReviews.includes('id="reviewSearch"') &&
  mentorReviews.includes("addEventListener('input',filterPendingReviews)") &&
  mentorReviews.includes("item.textContent.toLocaleLowerCase().includes(query)") &&
  mentorReviews.includes("filterPendingReviews();"),
  'Mentor review page must filter the loaded queue without hiding pending count or disabling pagination');
check(mentorReviews.includes("db.rpc('iac_is_admin')") &&
  mentorReviews.includes("db.rpc('iac_review_skill_project'") &&
  mentorReviews.includes("checks.length!==3"),
  'Mentor project approval requires administrator authorization, actual evidence checks and server-side review');

const studentAlerts=read('analytics.html');
check(studentAlerts.includes('id="notificationFilter"') &&
  studentAlerts.includes('id="notificationSummary"') &&
  studentAlerts.includes("get('notificationFilter').addEventListener('change',renderNotifications)") &&
  studentAlerts.includes("notificationRows.filter(n=>!n.read_at)"),
  'Student in-app inbox must provide an unread filter and counts derived from actual stored notifications');
check(studentAlerts.includes("sb.from('iac_notifications').update({read_at:new Date().toISOString()})") &&
  studentAlerts.includes(".eq('user_id',currentUser.id)"),
  'Notification read updates must remain restricted to the authenticated student');
check(studentAlerts.includes('Email, SMS and push delivery are separate services'),
  'In-app notifications must not be represented as independently verified outbound email or SMS');

const studentDashboard=read('my-learning.html');
check(studentDashboard.includes('id="reviewUpdateList"') &&
  studentDashboard.includes('function renderReviewUpdates(ownSkills)') &&
  studentDashboard.includes('renderReviewUpdates(ownSkills);'),
  'Student dashboard must show current real project review and mentor feedback updates');
check(studentDashboard.includes("s.project_feedback||''") &&
  studentDashboard.includes('esc(feedback)') &&
  studentDashboard.includes("['revise_project','mentor_review','credential_review','earned'].includes(s.next_step)"),
  'Mentor feedback updates must be escaped and derived from authorized learning snapshot states');
check(studentDashboard.includes('They are not email or push notifications.'),
  'Dashboard must clearly distinguish in-app review status from actual outbound notifications');

const studentJourney=read('learning-journey.html');
check(studentJourney.includes('id="courseOverview"') &&
  studentJourney.includes("['mentor_review','credential_review'].includes(s.next_step)") &&
  studentJourney.includes("s.next_step==='revise_project'"),
  'Student course overview must report earned badges, passed quizzes, pending reviews and requested revisions');
check(studentJourney.includes('class="task-actions"') &&
  studentJourney.includes("esc(a.url)") &&
  studentJourney.includes("getNext(s)"),
  'Every monthly skill must show its next action using the server-sourced learning state');
check(studentJourney.includes("s.badge_awarded&&s.certificate_code"),
  'Verified badge count requires an issued certificate code, not self-reported activity');

const learningRoom=read('platform.html');
check(learningRoom.includes("q('enrollments').select('status')") &&
  learningRoom.includes("['active','completed'].includes(own.data?.status)"),
  'Private lesson room must enforce approved enrollment before reading course content');
check(learningRoom.includes("createSignedUrl(path,1800)") &&
  learningRoom.includes('lesson.privateVideoReady') &&
  learningRoom.includes('<video controls preload="metadata" playsinline'),
  'Enrolled student lesson videos must use private signed playback and mobile-compatible controls');
check(learningRoom.includes('lesson.videoError') &&
  learningRoom.includes('Recording not uploaded yet.'),
  'Private playback failure and unavailable recording must have visible student states');

const launchHtml=read('launch.html');
check(launchHtml.includes('id="releaseDecision"')&&launchHtml.includes('id="releaseReasons"'),
  'Owner-only launch release gate is missing');
check(launchHtml.includes("db.rpc('iac_launch_readiness')")&&launchHtml.includes("db.from('iac_launch_acceptance')"),
  'Release gate must use authenticated production readiness and owner acceptance evidence');
check(launchHtml.includes('NOT independently approved for public launch')&&launchHtml.includes('Not launched'),
  'Release gate must never equate owner attestations with independent public launch approval');
check(launchHtml.includes("navigator.clipboard.writeText(latestReleaseSummary)"),
  'Owner release summary export is unavailable');
check(!launchHtml.includes("latestReleaseSummary=[...")||launchHtml.includes('No student names, emails, private notes or secrets included.'),
  'Release summary may contain sensitive student details');
check(launchHtml.includes("db.rpc('iac_course_content_readiness')"),
  'Founder launch screen must include the private read-only course content audit');
check(launchHtml.includes('recording_to_fix') && launchHtml.includes('id="courseContentSummary"'),
  'Catalog readiness must show missing recording lesson titles and counts');
check(launchHtml.includes("latestCatalog?.ready===true"),
  'Owner release gate must remain blocked when published catalog lacks course materials');
check(launchHtml.includes('/platform.html#admin') && launchHtml.includes('Upload private lesson video'),
  'Missing recording action must link to the existing private lesson upload form');


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
