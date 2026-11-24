// Browser-only mobile smoke: local static pages, no credentials or production API calls.
// Node 22+ and Chrome/Chromium are needed. Does not replace manual authenticated tests.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import {spawn} from 'node:child_process';
const pages=['index.html','december-bootcamp.html','december-registration.html','december-admin.html','platform.html','programs.html','my-learning.html','onboarding.html',
 'founder.html','certificate.html','fees.html','profile.html','skill-review.html',
 'analytics.html','curriculum-admin.html','launch.html','mentor-operations.html',
 'assistant.html','account-acceptance.html','owner-register.html','payments.html',
 'learning-journey.html','skill-badge.html','study-plan.html','about.html','start-here.html'];
const extra=new Set(['index.html','platform.html','programs.html','my-learning.html','onboarding.html','founder.html','certificate.html']);
const binary=[process.env.CHROME_BINARY,'/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium','/usr/bin/chromium-browser'].find(p=>p&&fs.existsSync(p));
if(!binary)throw Error('Chrome/Chromium not found for viewport test');
if(typeof WebSocket!=='function')throw Error('Node 22+ global WebSocket required');
const root=process.cwd(),profile=fs.mkdtempSync(path.join(os.tmpdir(),'iac-mobile-smoke-'));
const server=http.createServer((req,res)=>{
 let url;try{url=decodeURIComponent(new URL(req.url,'http://localhost').pathname)}catch{res.writeHead(400);res.end();return}
 const file=path.resolve(root,'.'+url);
 if(!file.startsWith(root+path.sep)||!/\.(html|css|js|png|webp|svg|ico|jpg|jpeg)$/i.test(file)||!fs.existsSync(file)){
  res.writeHead(404);res.end();return;
 }
 res.setHeader('Content-Security-Policy',"default-src 'self' data: blob:; connect-src 'none'; img-src 'self' data: blob:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; font-src 'self' data:; object-src 'none'");
 res.setHeader('Content-Type',file.endsWith('.css')?'text/css':file.endsWith('.js')?'text/javascript':file.endsWith('.html')?'text/html':'application/octet-stream');
 res.end(fs.readFileSync(file));
});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
function inspectLayout(){
 const width=innerWidth;
 const right=Math.max(document.documentElement.scrollWidth,document.body.scrollWidth);
 const nav=document.querySelector('header nav'),native=document.getElementById('menuToggle');
 const toggle=document.querySelector('.iac-mobile-nav-toggle');
 const navNeeded=nav&&!native&&Array.from(nav.children).filter(x=>x.matches('a,button,details')).length>=2;
 let menuOK=true;
 if(width<=760&&native){
  menuOK=getComputedStyle(native).display!=='none'&&getComputedStyle(nav).display==='none';
  if(menuOK){
   native.click();
   menuOK=native.getAttribute('aria-expanded')==='true'&&getComputedStyle(nav).display!=='none';
   native.click();
   menuOK=menuOK&&native.getAttribute('aria-expanded')==='false';
  }
 }

 if(width<=760&&navNeeded){
  menuOK=!!toggle&&getComputedStyle(toggle).display!=='none';
  if(menuOK){
   toggle.click();
   menuOK=toggle.getAttribute('aria-expanded')==='true'&&getComputedStyle(nav).display!=='none';
   toggle.click();
   menuOK=menuOK&&toggle.getAttribute('aria-expanded')==='false';
  }
 }
 const offenders=Array.from(document.querySelectorAll('body *')).filter(el=>{
  const b=el.getBoundingClientRect(),s=getComputedStyle(el);
  return b.width>0&&b.right>width+8&&!['fixed','absolute'].includes(s.position);
 }).slice(0,4).map(el=>el.tagName.toLowerCase()+'.'+String(el.className||'').slice(0,36));
 return {width,scroll:right,menuOK,offenders};
}
let chrome,ws,count=0;const errors=[];
try{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const address=server.address().port;
 chrome=spawn(binary,['--headless=new','--no-sandbox','--disable-gpu','--disable-dev-shm-usage',
  '--disable-background-networking','--no-first-run','--no-default-browser-check',
  '--remote-debugging-port=9229','--user-data-dir='+profile,'about:blank'],{stdio:'ignore'});
 let tab;
 for(let i=0;i<75;i++){
  if(chrome.exitCode!==null)throw Error('Chrome exited: '+chrome.exitCode);
  try{const r=await fetch('http://127.0.0.1:9229/json/list');if(r.ok){
   tab=(await r.json()).find(x=>x.type==='page');if(tab)break;
  }}catch{}
  await sleep(160);
 }
 if(!tab)throw Error('Chrome debugging port unavailable');
 ws=new WebSocket(tab.webSocketDebuggerUrl);
 await new Promise((resolve,reject)=>{ws.addEventListener('open',resolve,{once:true});ws.addEventListener('error',reject,{once:true})});
 const pending=new Map();let id=0;
 ws.addEventListener('message',event=>{
  const m=JSON.parse(event.data);if(!m.id)return;const p=pending.get(m.id);
  if(!p)return;pending.delete(m.id);m.error?p.reject(Error(m.error.message)):p.resolve(m.result);
 });
 const send=(method,params={})=>new Promise((resolve,reject)=>{
  const ticket=++id;pending.set(ticket,{resolve,reject});ws.send(JSON.stringify({id:ticket,method,params}));
 });
 const evaluate=async expression=>{
  const data=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});
  if(data.exceptionDetails)throw Error(data.exceptionDetails.text);
  return data.result.value;
 };
 await send('Page.enable');
 for(const file of pages){
  const widths=extra.has(file)?[320,360,768]:[360,768];
  for(const width of widths){
   await send('Emulation.setDeviceMetricsOverride',{width,height:820,deviceScaleFactor:1,mobile:true});
   await send('Page.navigate',{url:'http://127.0.0.1:'+address+'/'+file});
   for(let t=0;t<25;t++){
    try{if(await evaluate('document.readyState')!=='loading')break}catch{}
    await sleep(60);
   }
   await sleep(90);
   const result=await evaluate('('+inspectLayout.toString()+')()');
   count++;
   if(result.scroll>result.width+4||!result.menuOK)errors.push({file,target:width,...result});
  }
 }
 console.log('Headless browser: '+count+' mobile/tablet viewports across '+pages.length+' pages');
 if(errors.length){console.error(JSON.stringify(errors,null,2));process.exitCode=1}
 else console.log('PASS: responsive body widths and real mobile menu interactions');
}finally{
 try{ws?.close()}catch{}
 if(chrome&&chrome.exitCode===null){
  const exit=new Promise(resolve=>chrome.once('exit',resolve));
  chrome.kill('SIGTERM');
  await Promise.race([exit,sleep(2000)]);
 }
 await new Promise(r=>server.close(r));
 try{fs.rmSync(profile,{recursive:true,force:true,maxRetries:12,retryDelay:200})}
 catch(error){console.warn('Temporary Chrome profile cleanup warning (runner will delete it): '+String(error?.code||error))}
}
