import{createClient}from'https://esm.sh/@supabase/supabase-js@2.119.0';
const IAC_AUTH_ORIGIN='https://maasatitechiac.vercel.app';
const db=createClient('https://ylobnofwmryltbzdtkla.supabase.co','sb_publishable_YqLFRfMUlW5hzTOh_50hQQ_Ntr0pYa9',{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
const $=id=>document.getElementById(id);
const area=document.body.dataset.accountArea;
const safe=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]||'&#39;'));
const displayDate=value=>value?new Date(value).toLocaleString('en-IN',{dateStyle:'medium',timeStyle:'short'}):'Pending';
let currentUser=null,profile=null;
function notice(message,error=false){$('notice').innerHTML='<div class="notice'+(error?' error':'')+'">'+safe(message)+'</div>'}
function checked(result){if(result.error)throw new Error(result.error.message);return result.data}
function pill(status){return '<span class="pill '+safe(status)+'">'+safe(status)+'</span>'}
function listEmpty(message){return '<p class="small">'+safe(message)+'</p>'}
async function load(){
 let auth=await db.auth.getUser();
 if(auth.error||!auth.data.user){
  if(area==='teacher'){ $('guest').classList.remove('hidden'); return; }
  if(area==='admin'){ $('guest').innerHTML='<a href="/owner-register.html">Sign in as an institute administrator</a>'; return; }$('workspace').classList.add('hidden');$('guest').innerHTML='<h2>Sign in or create your student account</h2><p>Use the account registered for courses, seminars or internships.</p><a class="linkbutton" href="/platform.html#dashboard">Sign in / Register →</a><p class="small">Already registered but email not verified? Open Sign in, enter your registered email and use <strong>Resend verification email</strong>. Check inbox and spam. Your email link returns to the official IAC domain.</p><h3 id="guest-password-recovery" style="margin-top:25px">Forgot your password?</h3><form id="guestReset"><label>Registered email<input required type="email" id="guestResetEmail" autocomplete="email"></label><button type="submit">Send password reset link</button></form>'; $('guestReset').onsubmit=async event=>{event.preventDefault();await requestReset($('guestResetEmail').value.trim(),event.submitter)};if(location.hash==='#password-recovery'){$('guest-password-recovery').scrollIntoView();$('guestResetEmail').focus({preventScroll:true});}return}
 currentUser=auth.data.user;
 // Keep email-verified signups functional even if they arrive here before opening the LMS.
 const existingProfile=await db.from('iac_profiles').select('id').eq('id',currentUser.id).maybeSingle();
 if(existingProfile.error)throw existingProfile.error;
 if(!existingProfile.data){
  const meta=currentUser.user_metadata||{};
  const level=['school','college','other'].includes(meta.student_level)?meta.student_level:'other';
  const rawName=String(meta.full_name||currentUser.email?.split('@')[0]||'Student').trim();
  const fullname=rawName.length>=2?rawName.slice(0,120):'IAC Student';
  checked(await db.from('iac_profiles').insert({
   id:currentUser.id,full_name:fullname,student_level:level,
   school_or_college:String(meta.school_or_college||'').slice(0,140)||null,
   class_or_year:String(meta.class_or_year||'').slice(0,40)||null
  }));
 }
 if(area==='admin'){
  await db.rpc('iac_claim_founder_admin');
  if(checked(await db.rpc('iac_is_admin'))!==true){
   $('guest').textContent='Verified administrator access is required.';
   return;
  }
  await loadAdmin();
  $('adminArea').classList.remove('hidden');
 }else if(area==='teacher'){
  const [requestResult,staffResult]=await Promise.all([
   db.from('iac_staff_requests').select('id,requested_role,institution,status,created_at').eq('applicant_id',currentUser.id).order('created_at',{ascending:false}),
   db.rpc('iac_is_staff')
  ]);
  const requests=checked(requestResult);
  $('myStaffRequest').innerHTML=requests.length?requests.map(x=>'<div class="item">'+safe(x.requested_role)+' at '+safe(x.institution)+' '+pill(x.status)+' <small>'+displayDate(x.created_at)+'</small></div>').join(''):listEmpty('No staff role requested yet.');
  const hasStaffAccess=checked(staffResult)===true;
  $('teacherTools').classList.toggle('hidden',!hasStaffAccess);
  if(!currentUser.email_confirmed_at){
   $('staffRequest').classList.add('hidden');
   notice('Verify your email before submitting a teacher application.');
  }else{
   $('staffRequest').classList.toggle('hidden',hasStaffAccess||requests.some(request=>request.status==='pending'));
  }
 }else{
 const [p,guardian]=await Promise.all([
  db.from('iac_profiles').select('*').eq('id',currentUser.id).maybeSingle(),
  db.from('iac_guardian_consents').select('*').eq('student_id',currentUser.id).maybeSingle()
 ]);
 profile=checked(p);
 const consent=checked(guardian);
 if(currentUser.user_metadata?.account_area==='teacher'){
  const link=document.createElement('a');
  link.href='/teachers.html';
  link.textContent='Open your teacher workspace';
  $('notice').replaceChildren(link);
 }
 $('accountEmail').textContent=currentUser.email||'';
 $('resetEmail').value=currentUser.email||'';
 $('emailStatus').textContent=currentUser.email_confirmed_at?'Email verified':'Email confirmation pending';
 $('accountInfo').innerHTML='<p><strong>'+safe(profile?.full_name||'Profile pending')+'</strong> · '+safe(profile?.student_level||'Unspecified')+'</p><p>'+safe(profile?.school_or_college||'School/college not specified')+'</p>';
 $('guardianStatus').innerHTML=consent?'<p>Current status: '+pill(consent.status)+'</p><p class="small">Submitted '+displayDate(consent.submitted_at)+' · '+safe(consent.guardian_email)+'</p>':listEmpty(profile?.student_level==='school'?'Guardian approval required before joining school programs.':'Guardian approval is required for minors. Adults do not need to submit this form.');
 $('guardianForm').classList.toggle('hidden',consent?.status==='approved');
 if(consent){$('guardianName').value=consent.guardian_name;$('guardianEmail').value=consent.guardian_email}
 }
 $('workspace').classList.remove('hidden');
 $('guest').classList.add('hidden');
}
async function loadAdmin(){
 const [apps,consents,people,audit,guardianAudit]=await Promise.all([
 db.from('iac_staff_requests').select('id,applicant_id,requested_role,institution,experience_summary,status,created_at').eq('status','pending').order('created_at',{ascending:true}).limit(100),
 db.from('iac_guardian_consents').select('student_id,guardian_name,guardian_email,status,submitted_at').eq('status','pending').order('submitted_at',{ascending:true}).limit(100),
 db.from('iac_profiles').select('id,full_name,school_or_college').limit(300),
 db.from('iac_staff_access_audit').select('action,occurred_at,subject_user_id').order('occurred_at',{ascending:false}).limit(20),
 db.from('iac_guardian_review_audit').select('student_id,decision,verification_method,evidence_note,reviewed_at').order('reviewed_at',{ascending:false}).limit(20)
 ]);
 const profiles=new Map(checked(people).map(p=>[p.id,p]));
 const applications=checked(apps),guardianList=checked(consents);
 $('staffQueue').innerHTML=applications.length?applications.map(a=>'<div class="item"><strong>'+safe(profiles.get(a.applicant_id)?.full_name||'Applicant')+'</strong><p>'+safe(a.institution)+' · '+safe(a.requested_role)+'</p><p class="small">'+safe(a.experience_summary)+'</p><div class="row"><button data-action="staff-approve" data-id="'+safe(a.id)+'">Approve</button><button class="danger" data-action="staff-reject" data-id="'+safe(a.id)+'">Reject</button></div></div>').join(''):listEmpty('No pending staff applications.');
 $('guardianQueue').innerHTML=guardianList.length?guardianList.map(g=>'<div class="item"><strong>'+safe(profiles.get(g.student_id)?.full_name||'Student')+'</strong><p>'+safe(profiles.get(g.student_id)?.school_or_college||'')+'</p><p class="small">Guardian: '+safe(g.guardian_name)+' · '+safe(g.guardian_email)+'</p><label>Actual verification method<select class="verifyMethod" data-id="'+safe(g.student_id)+'"><option value="">Choose after verification</option><option value="verified_phone">Verified phone</option><option value="verified_school_record">Verified school record</option><option value="in_person">In person</option></select></label><label for="guardian-note-'+safe(g.student_id)+'">Verification / rejection evidence note (20–800 characters)</label><textarea class="guardianEvidenceNote" data-id="'+safe(g.student_id)+'" id="guardian-note-'+safe(g.student_id)+'" minlength="20" maxlength="800" placeholder="Summarize genuine verification or reason for rejection. Do not add private identifiers."></textarea><div class="row"><button data-action="guardian-approve" data-id="'+safe(g.student_id)+'">Approve verified consent</button><button class="danger" data-action="guardian-reject" data-id="'+safe(g.student_id)+'">Reject</button></div></div>').join(''):listEmpty('No pending guardian verification requests.');
 $('guardianAuditLog').innerHTML=checked(guardianAudit).length?checked(guardianAudit).map(a=>'<div class="item"><strong>'+safe(profiles.get(a.student_id)?.full_name||'Learner')+' · '+safe(a.decision)+'</strong><p class="small">'+safe(a.verification_method||'No method selected')+' · '+displayDate(a.reviewed_at)+'</p><p class="small">'+safe(a.evidence_note)+'</p></div>').join(''):listEmpty('No guardian review decisions recorded yet.');
 $('auditLog').innerHTML=checked(audit).length?checked(audit).map(a=>'<div class="item"><strong>'+safe(a.action)+'</strong><span class="small"> · '+displayDate(a.occurred_at)+'</span></div>').join(''):listEmpty('No staff access decisions recorded.');
 document.querySelectorAll('[data-action]').forEach(b=>b.onclick=()=>review(b));
}
async function review(button){
 const action=button.dataset.action,id=button.dataset.id,approve=action.endsWith('approve');
 let method='',evidence='';
 if(action.startsWith('guardian-')){
  method=document.querySelector('.verifyMethod[data-id="'+id+'"]')?.value||'';
  evidence=document.querySelector('.guardianEvidenceNote[data-id="'+id+'"]')?.value.trim()||'';
  if(approve&&!method){notice('Verify consent first and select the actual method.',true);return;}
  if(evidence.length<20||evidence.length>800){notice('Write a 20–800 character note explaining the actual verification or reason for rejection.',true);return;}
 }
 if(!confirm((approve?'Confirm actual verification and decision':'Reject request')+'?'))return;
 button.disabled=true;
 try{
  if(action.startsWith('staff-'))checked(await db.rpc('iac_review_staff_request',{p_request:id,p_approve:approve}));
  else checked(await db.rpc('iac_review_guardian_consent',{p_student:id,p_approve:approve,p_method:approve?method:null,p_note:evidence}));
  notice('Approval decision saved.');await load();
 }catch(e){notice(e.message,true)}finally{button.disabled=false}
}
if($('guardianForm'))$('guardianForm').onsubmit=async e=>{
 e.preventDefault();const button=$('guardianForm').querySelector('button');button.disabled=true;
 try{checked(await db.rpc('iac_resubmit_guardian',{p_name:$('guardianName').value.trim(),p_email:$('guardianEmail').value.trim()}));notice('Guardian details submitted. Access remains pending until the institute verifies permission.');await load()}
 catch(error){notice(error.message,true)}finally{button.disabled=false}
};
if($('staffRequest'))$('staffRequest').onsubmit=async e=>{
 e.preventDefault();const button=$('staffRequest').querySelector('button');button.disabled=true;
 try{
  checked(await db.from('iac_staff_requests').insert({applicant_id:currentUser.id,requested_role:$('role').value,institution:$('institution').value.trim(),experience_summary:$('experience').value.trim()}));
  $('staffRequest').reset();notice('Your staff application was submitted. Admin verification is required.');await load();
 }catch(error){notice(error.message,true)}finally{button.disabled=false}
};
async function requestReset(email,button){
 if(button)button.disabled=true;
 try{
  checked(await db.auth.resetPasswordForEmail(email,{redirectTo:IAC_AUTH_ORIGIN+'/onboarding.html'}));
  notice('If this email has a registered account, a password reset link will be sent.');
 }catch{notice('A reset link could not be requested right now. Please try again shortly.',true)}
 finally{if(button)button.disabled=false;}
}
if($('resetRequest'))$('resetRequest').onsubmit=e=>{e.preventDefault();requestReset($('resetEmail').value.trim(),e.submitter)};
if($('changePassword'))$('changePassword').onsubmit=async e=>{
 e.preventDefault();
 try{const pass=$('newPassword').value;if(pass.length<10)throw new Error('Use at least 10 characters.');checked(await db.auth.updateUser({password:pass}));$('newPassword').value='';notice('Password updated. Sign out other devices if you suspect unauthorized access.')}
 catch(error){notice(error.message,true)}
};
if(area==='teacher'){
 for(const form of [$('teacherLogin'),$('teacherSignup')]){
  form.onsubmit=async event=>{
   event.preventDefault();
   const button=event.submitter;
   button.disabled=true;
   const fields=new FormData(form);
   if(form.id==='teacherSignup'&&!fields.get('terms')){button.disabled=false;return;}
   const email=String(fields.get('email')).trim();
   const password=String(fields.get('password'));
   try{
    if(form.id==='teacherLogin'){
     checked(await db.auth.signInWithPassword({email,password}));
     await load();
    }else{
     const signup=checked(await db.auth.signUp({email,password,options:{
      emailRedirectTo:IAC_AUTH_ORIGIN+'/onboarding.html',
      data:{full_name:String(fields.get('full_name')).trim(),student_level:'other',account_area:'teacher'}
     }}));
     form.reset();
     if(signup.session)await load();
     else notice('Check your work email to verify the account, then return here to sign in and submit your teacher application.');
    }
   }catch(error){notice(error.message,true)}finally{button.disabled=false}
  };
 }
}
db.auth.onAuthStateChange((event)=>{if(event==='PASSWORD_RECOVERY')notice('Password recovery session confirmed. Set a new password below.')});
load().catch(e=>notice(e.message,true));
