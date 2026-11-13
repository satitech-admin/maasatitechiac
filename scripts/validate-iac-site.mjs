// Maa Sati IAC: static checks (no student accounts, no secrets, no database writes).
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';

const pages=['index.html','programs.html','start-here.html','onboarding.html',
  'my-learning.html','learning-journey.html','study-plan.html','skill-review.html','profile.html'];
const errors=[];
let checkedScripts=0,checkedLinks=0;
for(const page of pages){
  if(!fs.existsSync(page)){errors.push('Missing required page: '+page);continue}
  const html=fs.readFileSync(page,'utf8');
  if(!/<meta\s+name=["']viewport["']/i.test(html))errors.push(page+': missing mobile viewport');
  const scriptRx=/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi;
  for(const match of html.matchAll(scriptRx)){
    const attributes=match[1],src=match[2];
    if(/\bsrc\s*=/.test(attributes)||!src.trim())continue;
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
const check=(file,fragments)=>{
 if(!fs.existsSync(file))return;
 const text=fs.readFileSync(file,'utf8');
 for(const fragment of fragments)if(!text.includes(fragment))errors.push(file+': missing expected behavior '+fragment);
};
check('programs.html',['iac_lesson_checkpoints','lessonCheckpointForm','practice_reflection','check_original','iac_skill_project_submissions','iac_skill_notes']);
check('learning-journey.html',['iac_student_learning_snapshot','iac_lesson_checkpoints','Start lesson & practice']);
check('study-plan.html',['iac_student_learning_snapshot','iac_study_preferences','iac_lesson_checkpoints','days_per_week']);
check('skill-review.html',['iac_is_admin','iac_review_skill_project','Approval checks (required)']);
check('my-learning.html',['iac_student_learning_snapshot','iac_student_quiz_history']);
console.log('Checked '+pages.length+' pages, '+checkedScripts+' inline scripts, '+checkedLinks+' internal routes');
if(errors.length){
 console.error(errors.map(x=>'FAIL '+x).join('\n'));
 process.exitCode=1;
}else console.log('PASS static syntax, route integrity and core workflow invariants');
