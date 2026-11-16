// Maa Sati IAC mobile regression checks: no network, accounts, or browser secrets.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import vm from 'node:vm';

const files=['account-acceptance.html','owner-register.html','index.html','about.html','analytics.html','assistant.html',
'certificate.html','curriculum-admin.html','fees.html','founder.html','launch.html','learning-journey.html',
'mentor-operations.html','my-learning.html','onboarding.html','payments.html','platform.html','profile.html',
'programs.html','skill-badge.html','skill-review.html','start-here.html','study-plan.html'];
const css=fs.readFileSync('mobile-iac.css','utf8');
const js=fs.readFileSync('mobile-iac.js','utf8');
let checked=0;
for(const file of files){
 const html=fs.readFileSync(file,'utf8');
 assert.match(html,/<meta\s+name=["']viewport["']/i,file+' must use responsive viewport');
 assert.equal((html.match(/href=["']\/mobile-iac\.css["']/g)||[]).length,1,file+' needs exactly one mobile CSS link');
 assert.equal((html.match(/src=["']\/mobile-iac\.js["']/g)||[]).length,1,file+' needs exactly one mobile JS link');
 assert(html.indexOf('href="/mobile-iac.css"')<html.indexOf('</head>'),file+' stylesheet must be in head');
 checked++;
}
for(const clause of ['max-width:760px','max-width:600px','max-width:380px','prefers-reduced-motion']){
 assert(css.replace(/\s/g,'').includes(clause),clause+' breakpoint missing');
}
for(const clause of ['table{display:block','overflow-x:auto','.iac-mobile-nav-expanded','min-height:44px','object-fit:contain']){
 assert(css.includes(clause),'Missing required mobile usability feature: '+clause);
}
assert(!css.includes('transform:scale('),'Mobile stylesheet must not distort logos or certificate artwork');
assert(/class="menu-toggle"|id="menuToggle"/.test(fs.readFileSync('index.html','utf8')),'Home page original menu must be preserved');

function classList(){
 const state=new Set();
 return {add:name=>state.add(name),contains:name=>state.has(name),toggle:(name,on)=>{
   if(on)state.add(name); else state.delete(name);
   return state.has(name);
 }};
}
function fixture(options={}){
 const listeners={};const attrs=new Map();const added=[];
 const label={textContent:'Menu'};
 const button={classList:classList(),attrs:new Map(),listeners:{},focused:false,
  setAttribute(k,v){this.attrs.set(k,v)},
  getAttribute(k){return this.attrs.get(k)},
  addEventListener(type,fn){this.listeners[type]=fn},
  querySelector(sel){return sel==='span:last-child'?label:null},
  focus(){this.focused=true}
 };
 const nav={children:Array.from({length:options.links??4},()=>({matches:()=>true})),
  id:'',classList:classList(),attrs:new Map(),listeners:{},
  hasAttribute(k){return this.attrs.has(k)},
  setAttribute(k,v){this.attrs.set(k,v)},
  addEventListener(type,fn){this.listeners[type]=fn}
 };
 const parent={classList:classList(),insertBefore(child,before){assert.equal(before,nav);added.push(child)},contains(el){return el===nav||el===button}};
 nav.parentElement=parent;
 const header={querySelector(sel){
    if(sel==='nav')return nav;
    if(sel.includes('menu-toggle'))return options.nativeMenu?{}:null;
    return null;
 }};
 const doc={querySelector:sel=>sel==='header'?header:null,
  createElement:tag=>{assert.equal(tag,'button');return button},
  addEventListener(type,fn){listeners[type]=fn}
 };
 let mediaListener;
 const window={matchMedia:()=>({addEventListener:(type,fn)=>{mediaListener=fn}})};
 vm.runInNewContext(js,{document:doc,window});
 return {nav,button,parent,label,listeners,added,get mediaListener(){return mediaListener}};
}

let x=fixture();
assert.equal(x.added.length,1,'Navigation toggle should be inserted once');
assert.equal(x.nav.id,'iac-mobile-navigation','Navigation needs accessible ID');
assert.equal(x.button.getAttribute('aria-expanded'),'false');
x.button.listeners.click();
assert.equal(x.button.getAttribute('aria-expanded'),'true','Tap must open menu');
assert(x.nav.classList.contains('iac-mobile-nav-expanded'));
x.nav.listeners.click({target:{closest:()=>({})}});
assert.equal(x.button.getAttribute('aria-expanded'),'false','Navigation action must close menu');
x.button.listeners.click();
x.listeners.keydown({key:'Escape'});
assert.equal(x.button.getAttribute('aria-expanded'),'false','Escape must close menu');
assert(x.button.focused,'Escape must restore focus');
x.button.listeners.click();
x.listeners.click({target:{}});
assert.equal(x.button.getAttribute('aria-expanded'),'false','Outside click must close menu');
x.button.listeners.click();
x.mediaListener({matches:true});
assert.equal(x.button.getAttribute('aria-expanded'),'false','Desktop resize must close menu');
assert.equal(fixture({nativeMenu:true}).added.length,0,'Home native menu must not be duplicated');
assert.equal(fixture({links:1}).added.length,0,'Short navigation needs no new toggle');
console.log('PASS mobile: '+checked+' page links/viewports, 4 responsive/a11y breakpoints, touch, table/logo handling, and 8 menu behaviors');
