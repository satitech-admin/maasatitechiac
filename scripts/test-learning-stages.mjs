import fs from 'node:fs';
import assert from 'node:assert/strict';

// Exercise the real stage-state function used by the student journey.
// No personal accounts or database writes are required.
const html=fs.readFileSync('learning-journey.html','utf8');
const start=html.indexOf('function stageStates(s){');
const end=html.indexOf('\nfunction drawStep(s){',start);
assert.ok(start>=0&&end>start,'Expected learning stage function exists');
const source=html.slice(start,end);
const checkpoints=new Map();
const stageStates=new Function('checkpoints',source+'\nreturn stageStates;')(checkpoints);
const cases=[
 {name:'new student',skill:{month_id:'1',next_step:'quiz',project_status:'not_submitted'},expected:['next','waiting','waiting','waiting','waiting']},
 {name:'practice saved',skill:{month_id:'2',next_step:'quiz',project_status:'not_submitted'},checkpoint:{lesson_read:true,practice_done:true},expected:['done','next','waiting','waiting','waiting']},
 {name:'quiz passed',skill:{month_id:'3',next_step:'submit_project',quiz_passed:true,project_status:'not_submitted'},expected:['available','done','next','waiting','waiting']},
 {name:'review pending',skill:{month_id:'4',next_step:'mentor_review',quiz_passed:true,project_status:'pending'},expected:['available','done','done','next','waiting']},
 {name:'verified badge',skill:{month_id:'5',next_step:'earned',quiz_passed:true,project_status:'approved',badge_awarded:true,certificate_code:'TEST-ONLY'},expected:['available','done','done','done','done']}
];
for(const t of cases){
 if(t.checkpoint)checkpoints.set(t.skill.month_id,t.checkpoint);
 assert.deepEqual(Array.from(stageStates(t.skill)),t.expected,t.name);
 console.log('PASS '+t.name);
}
console.log('PASS five learner stage-state scenarios');
