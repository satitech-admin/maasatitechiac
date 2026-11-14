// Maa Sati IAC: static checks (no student accounts, no secrets, no database writes).
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';

const pages=['account-acceptance.html','owner-register.html','index.html','about.html','analytics.html','assistant.html','certificate.html',
  'curriculum-admin.html','fees.html','founder.html','launch.html','learning-journey.html',
  'mentor-operations.html','my-learning.html','onboarding.html','payments.html',
  'platform.html','profile.html','programs.html','skill-badge.html','skill-review.html',
  'start-here.html','study-plan.html'];
const privatePages=['account-acceptance','owner-register','analytics','assistant','certificate','curriculum-admin','founder','launch','learning-journey',
  'mentor-operations','my-learning','onboarding','payments','profile','skill-badge','skill-review','study-plan'];
const errors=[];
let checkedScripts=0,checkedLinks=0;
for(const page of pages){
  if(!fs.existsSync(page)){errors.push('Missing required page: '+page);continue}
  const html=fs.readFileSync(page,'utf8');
  if(!/<meta\s+name=["']viewport["']/i.test(html))errors.push(page+': missing mobile viewport');
  const scriptRx=/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi;
  for(const match of html.matchAll(scriptRx)){
    const attributes=match[1],src=match[2];
    if(/\bsrc\s*=/.test(attributes)||!src.trim()||/\btype\s*=\s*["'](?:application\/ld\+json|application\/json|text\/plain)["']/i.test(attributes))continue;
    const mode=/\btype\s*=\s*["']module["']/i.test(attributes)?'module':'commonjs';
    const result=spawnSync(process.execPath,['--check','--input-type='+mode],{input:src,encoding:'utf8',maxBuffer:1024*1024*4});
    checkedScripts++;
    if(result.status!==0)errors.push(page+': inline '+mode+' script syntax: '+(result.stderr||'error').trim().slice(0,450));
  }
  for(const m of html.matchAll(/<a\b[^>]*\bhref\s*=\s*["'](\/[^"'?#]+\.html)(?:[?#][^"']*)?["']/gi)){
    const relative=m[1].replace(/^\/+/, '');
    if(relative.includes('..')){errors.push(page+': unsafe route '+m[1]);continue}
    if(!fs.existsSync(path.join('.',relative)))errors.push(page+': broken local route '+m[1]);
    checkedLinks++;
  }
}
// Protect private pages from search indexing and browser/CDN persistence.
const config=JSON.parse(fs.readFileSync('vercel.json','utf8'));
const globalHeaders=(config.headers||[]).find(h=>h.source==='/(.*)');
if(!globalHeaders||!globalHeaders.headers?.some(h=>h.key==='X-Content-Type-Options'&&h.value==='nosniff'))errors.push('Missing global content-type protection');
for(const shortName of privatePages){
  const file=shortName+'.html';
  const html=fs.readFileSync(file,'utf8');
  if(!/<meta\s+name=["']robots["'][^>]*noindex/i.test(html))errors.push(file+': missing noindex metadata');
  const rule=(config.headers||[]).find(h=>h.source==='/'+file);
  if(!rule?.headers?.some(h=>h.key==='X-Robots-Tag'&&h.value.includes('noindex')))errors.push(file+': missing private X-Robots-Tag');
  if(!rule?.headers?.some(h=>h.key==='Cache-Control'&&h.value.includes('no-store')))errors.push(file+': missing no-store Cache-Control');
}
const siteMap=fs.readFileSync('sitemap.xml','utf8');
for(const entry of siteMap.matchAll(new RegExp('<loc>[^<]*</loc>', 'g'))){
  const url=entry[0].slice(5,-6);
  try{
    const path=new URL(url).pathname;
    if(privatePages.some(name=>path==='/'+name+'.html'))errors.push('Private page was listed in sitemap: '+path);
    if(path!=='/'&&!fs.existsSync(path.slice(1)))errors.push('Sitemap points to missing page: '+path);
  }catch{errors.push('Invalid sitemap URL: '+url)}
}
if(!fs.readFileSync('robots.txt','utf8').includes('Sitemap:'))errors.push('Missing sitemap reference in robots.txt');

const check=(file,fragments)=>{
 if(!fs.existsSync(file))return;
 const text=fs.readFileSync(file,'utf8');
 for(const fragment of fragments)if(!text.includes(fragment))errors.push(file+': missing expected behavior '+fragment);
};
check('programs.html',['iac_lesson_checkpoints','lessonCheckpointForm','practice_reflection','check_original','iac_skill_project_submissions','iac_skill_notes']);
check('learning-journey.html',['iac_student_learning_snapshot','iac_lesson_checkpoints','Start lesson & practice']);
check('study-plan.html',['iac_student_learning_snapshot','iac_study_preferences','iac_lesson_checkpoints','days_per_week']);
check('mentor-operations.html',['iac_is_staff','iac_is_admin','iac_support_tickets','iac_support_replies','iac_skill_project_submissions','iac_send_course_announcement','iac_course_announcements']);
check('skill-review.html',['iac_is_admin','iac_review_skill_project','Approval checks (required)']);
check('my-learning.html',['iac_student_learning_snapshot','iac_student_quiz_history']);
check('account-acceptance.html',['db.auth.getUser()','iac_student_learning_snapshot','iac_student_quiz_history','iac_is_staff','iac_is_admin','iac_notifications','iac_skill_project_submissions','No grades, credentials, payment or account permissions are modified']);
check('launch.html',['iac_launch_readiness','iac_launch_acceptance','iac_launch_acceptance_audit','iac_save_launch_acceptance','owner_verified','acceptanceHistory']);
// Guard against past regressions: project-only checkbox validation must never run on student notes.
const programsJs=fs.readFileSync('programs.html','utf8');
const sliceBetween=(str,first,last)=>{const a=str.indexOf(first),b=str.indexOf(last,a+first.length);return a<0||b<a?'':str.slice(a,b)};
const noteHandler=sliceBetween(programsJs,'async function saveStudentNote(event){','function renderMonths(){');
const projectHandler=sliceBetween(programsJs,'async function submitSkillProject(event){','function renderQuizzes(){');
if(!noteHandler||!projectHandler)errors.push('Missing private-note or project handler');
if(noteHandler.includes('check_original')||noteHandler.includes('values.get('))errors.push('Private notes incorrectly require project checkbox state');
if(!projectHandler.includes('check_original')||!projectHandler.includes(".select('id').single()"))errors.push('Project submit lacks checklist or persisted-result verification');
const mentorJs=fs.readFileSync('mentor-operations.html','utf8');
if(!mentorJs.includes("iac_is_staff")||!mentorJs.includes("iac_is_admin"))errors.push('Missing staff and admin access controls');
if(!mentorJs.includes("db.rpc('iac_staff_respond_ticket'"))errors.push('Mentor ticket replies and status changes must use the atomic staff RPC');
if(mentorJs.includes("db.from('iac_support_tickets').update(")||mentorJs.includes("db.from('iac_support_replies').insert("))errors.push('Mentor operations must not split support ticket writes into separate database calls');
const assistantJs=fs.readFileSync('assistant.html','utf8');
if(!assistantJs.includes("client.rpc('iac_staff_respond_ticket'"))errors.push('Staff replies in Student Support must use the atomic staff RPC');
if(assistantJs.includes("client.from('iac_support_tickets').update("))errors.push('Student Support must not perform separate staff status updates');
if(!mentorJs.includes('pendingRefresh'))errors.push('Mentor ticket filters must queue refreshes while loading');
// Acceptance diagnostics must be read-only; neither the browser nor CI should fabricate proof.
const acceptanceSource=fs.readFileSync('account-acceptance.html','utf8');
for(const unsafe of [".insert(", ".update(", ".upsert(", ".delete(", "db.auth.updateUser(", "db.auth.signUp(", "db.auth.signInWithPassword("]){
 if(acceptanceSource.includes(unsafe))errors.push('Account acceptance diagnostics must stay read-only: '+unsafe);
}
if(!acceptanceSource.includes("lastReport=['Maa Sati IAC — private account readiness result'"))errors.push('Account diagnostic must build a user-redacted report');
for(const key of ["['guardian','Guardian eligibility'","['badge','Verified skill badge'","['certificate','Certificate authenticity'"]){
 if(!acceptanceSource.includes(key))errors.push('Missing real-user acceptance check: '+key);
}
if(!acceptanceSource.includes("db.from('iac_guardian_consents')")||!acceptanceSource.includes('verified_at'))
 errors.push('Guardian acceptance must verify the approved record, not a self-declared checkbox');
if(!acceptanceSource.includes("db.rpc('iac_verify_certificate',{p_code:cert.certificate_code})"))
 errors.push('Certificate authenticity must be verified with the server RPC');
if(!acceptanceSource.includes("r.data?.badges")||!acceptanceSource.includes('iac_student_learning_snapshot'))
 errors.push('Skill badges must derive from server-issued, unrevoked snapshot');
if(!acceptanceSource.includes('[email]')||!acceptanceSource.includes('[account-id]'))
 errors.push('Copied diagnostic errors must redact private identity data');
if(acceptanceSource.includes("'certificate_code'"))
 errors.push('Acceptance diagnostic must not expose student certificate codes directly in result text');
// A published quiz may expose prompts/options, never the private answer key or explanation.
const quizClient=fs.readFileSync('programs.html','utf8');
if(!quizClient.includes("db.from('iac_mock_questions').select('id,prompt,options,sort_order')"))
  errors.push('Quiz client must request only safe question columns (not answer explanations)');
if(!quizClient.includes("db.rpc('iac_submit_mock_quiz'"))
  errors.push('Post-submission quiz feedback must come from the server scoring RPC');
const adminQuizClient=fs.readFileSync('curriculum-admin.html','utf8');
if(!adminQuizClient.includes('iac_admin_add_quiz_question'))
  errors.push('Quiz authoring must use the protected admin RPC');
// Billing preflight: never enable a school checkout before verified guardian permission.
// The server enforces the final decision; frontend checks are only a clear explanation for learners.
const paymentUi=fs.readFileSync('payments.html','utf8');
const paymentServer=fs.readFileSync('supabase/functions/iac-razorpay/index.ts','utf8');
if(!paymentUi.includes('ready&&eligibilityReady&&kind'))errors.push('Payment UI could enable checkout before guardian eligibility');
if(!paymentUi.includes("iac_guardian_consents")||!paymentUi.includes("Go to Onboarding"))errors.push('Payment UI must show guardian consent and onboarding actions');
if(!paymentServer.includes('admin.rpc("iac_guardian_ready"'))errors.push('Razorpay edge function must check guardian eligibility before creating provider orders');
if(!paymentServer.includes('X-Razorpay-Signature')||!paymentServer.includes('const user=await getUser(req)'))
 errors.push('Razorpay webhook verification or user authentication was removed');
const eligibilityIndex=paymentServer.indexOf('admin.rpc("iac_guardian_ready"');
const providerOrderIndex=paymentServer.indexOf('const order=await rz("orders"');
if(eligibilityIndex<0||providerOrderIndex<0||eligibilityIndex>providerOrderIndex)
 errors.push('Razorpay eligibility must precede provider order creation');
const ownerJs=fs.readFileSync('owner-register.html','utf8');
if(!ownerJs.includes("OWNER_EMAIL='satitechinfo@gmail.com'"))errors.push('Founder registration must use the authorized institute email only');
if(!ownerJs.includes('db.auth.signInWithOtp('))errors.push('Founder registration must use email-based verification');
if(!ownerJs.includes("emailRedirectTo:CALLBACK")||!ownerJs.includes("CALLBACK='https://maasatitechiac.vercel.app/onboarding.html'"))errors.push('Founder confirmation callback must use canonical onboarding');
if(!ownerJs.includes("db.rpc('iac_claim_founder_admin')"))errors.push('Founder portal must claim role through restricted backend RPC');
if(!ownerJs.includes('user.email_confirmed_at'))errors.push('Founder portal must check verified mailbox before role claim');
const platformJs=fs.readFileSync('platform.html','utf8');
if(!platformJs.includes('<option value="" selected disabled>Choose student type</option>'))errors.push('Student type must require explicit signup selection');
if(!platformJs.includes('mentorNav.hidden=true'))errors.push('Staff navigation must be hidden after logout');
// Production auth email links must not point back to random protected Vercel preview URLs.
const authOrigin='https://maasatitechiac.vercel.app';
const onboardingJs=fs.readFileSync('onboarding.html','utf8');
for(const [filename,html] of [['platform.html',platformJs],['onboarding.html',onboardingJs]]){
 if(!html.includes("const IAC_AUTH_ORIGIN='"+authOrigin+"'"))errors.push(filename+': missing canonical auth email origin');
 if(html.includes("location.origin+'/onboarding.html"))errors.push(filename+': unsafe current-origin auth callback');
}
if(!platformJs.includes("sb.auth.resend({type:'signup'"))errors.push('Missing email-verification resend action');
if(!platformJs.includes('data-action="resend-confirmation"'))errors.push('Missing resend button in login dialog');
if(!platformJs.includes("error?.code==='email_not_confirmed'"))errors.push('Unverified login must show email resend guidance');
if(!platformJs.includes("querySelector('[data-action=\"resend-confirmation\"]')"))errors.push('Unverified login should focus the email resend action');
if(!platformJs.includes("emailRedirectTo:IAC_AUTH_ORIGIN+'/onboarding.html'"))errors.push('Signup email callback is not canonical');
if(!onboardingJs.includes("redirectTo:IAC_AUTH_ORIGIN+'/onboarding.html'"))errors.push('Password recovery callback must match canonical signup destination');
if(onboardingJs.includes("checked(await db.rpc('iac_claim_founder_admin'))"))errors.push('Founder claim failure must not break normal learner onboarding');
if(!onboardingJs.includes('const founderClaim=await db.rpc(\'iac_claim_founder_admin\')'))errors.push('Missing founder role activation check in onboarding');
const learningJs=fs.readFileSync('learning-journey.html','utf8');
if(!learningJs.includes('iac_student_learning_snapshot')||!learningJs.includes('badge_awarded'))errors.push('Learning journey lost verified backend provenance');

console.log('Checked '+pages.length+' pages, '+checkedScripts+' inline scripts, '+checkedLinks+' internal routes');
if(errors.length){
 console.error(errors.map(x=>'FAIL '+x).join('\n'));
 process.exitCode=1;
}else console.log('PASS static syntax, route integrity and core workflow invariants');
