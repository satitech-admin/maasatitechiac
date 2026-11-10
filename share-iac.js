(function(){
if(document.getElementById('iacGlobalShare'))return;
const css=[
'#iacGlobalShare{position:fixed;left:16px;bottom:17px;z-index:88;font:700 12px Manrope,system-ui,sans-serif}',
'#iacGlobalShare button{font:inherit;cursor:pointer}',
'#iacGlobalShare .trigger{padding:12px 16px;border-radius:30px;border:1px solid #bdcabc;background:#17212b;color:white;box-shadow:0 8px 25px #17212b35}',
'#iacGlobalShare .menu{position:absolute;bottom:calc(100% + 10px);left:0;min-width:185px;padding:8px;background:#fcfaf6;border:1px solid #dcd5cb;border-radius:14px;box-shadow:0 18px 33px #17212b2d}',
'#iacGlobalShare .menu[hidden]{display:none}',
'#iacGlobalShare .menu button{display:block;width:100%;text-align:left;padding:11px;background:transparent;border:0;border-radius:8px;color:#17212b}',
'#iacGlobalShare .menu button:hover{background:#e6ebe4}',
'#iacGlobalShare .message{display:block;margin-top:5px;background:#17212b;color:white;border-radius:7px;font-size:11px}',
'@media(max-width:600px){#iacGlobalShare{left:12px;bottom:13px}#iacGlobalShare .trigger{padding:11px 13px}}'
].join('');
const style=document.createElement('style');style.textContent=css;document.head.appendChild(style);
const wrap=document.createElement('div');wrap.id='iacGlobalShare';
wrap.innerHTML='<button type="button" class="trigger" aria-expanded="false" aria-controls="iacShareMenu">↗ Share IAC</button><div class="menu" id="iacShareMenu" hidden><button data-share="native">↗ Share on my phone</button><button data-share="whatsapp">WhatsApp</button><button data-share="linkedin">LinkedIn</button><button data-share="copy">⧉ Copy public link</button></div><span class="message" aria-live="polite"></span>';
document.body.appendChild(wrap);
const button=wrap.querySelector('.trigger'),menu=wrap.querySelector('.menu'),msg=wrap.querySelector('.message');
function urlToShare(){
 const base=location.origin+'/programs.html';
 if(location.pathname!='/programs.html')return base;
 const slug=new URLSearchParams(location.search).get('program');
 const allowed=['web-development-12-months','ai-ml-12-months','data-science-12-months','app-development-12-months'];
 return allowed.includes(slug)?base+'?program='+slug:base;
}
function close(){menu.hidden=true;button.setAttribute('aria-expanded','false')}
function inform(s){msg.textContent=s}
button.addEventListener('click',()=>{menu.hidden=!menu.hidden;button.setAttribute('aria-expanded',String(!menu.hidden));if(!menu.hidden)menu.querySelector('button')?.focus()});
document.addEventListener('click',e=>{if(!wrap.contains(e.target))close()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){close();button.focus()}});
wrap.addEventListener('click',async e=>{
 const item=e.target.closest('[data-share]');if(!item)return;
 const shareUrl=urlToShare(),mode=item.dataset.share;close();msg.textContent='';
 if(mode==='whatsapp'){window.open('https://api.whatsapp.com/send?text='+encodeURIComponent('Explore Maa Sati IAC tech programs: '+shareUrl),'_blank','noopener,noreferrer');return;}
 if(mode==='linkedin'){window.open('https://www.linkedin.com/sharing/share-offsite/?url='+encodeURIComponent(shareUrl),'_blank','noopener,noreferrer');return;}
 try{
  if(mode==='native'&&navigator.share){await navigator.share({title:'Maa Sati IAC Career Programs',url:shareUrl});return;}
  if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(shareUrl);inform('Public program link copied!');return;}
  const field=document.createElement('textarea');field.value=shareUrl;field.style.position='fixed';field.style.top='-9000px';document.body.appendChild(field);field.select();const result=document.execCommand('copy');field.remove();inform(result?'Link copied':'Please copy: '+shareUrl);
 }catch(err){if(err.name!=='AbortError')inform('Sharing unavailable. Use copy link.');}
});
})();