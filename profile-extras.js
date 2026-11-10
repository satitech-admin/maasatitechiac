import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.119.0';
const db=createClient('https://ylobnofwmryltbzdtkla.supabase.co','sb_publishable_YqLFRfMUlW5hzTOh_50hQQ_Ntr0pYa9');
const el=id=>document.getElementById(id);
let uid=null,oldAvatar=null;
function info(message,bad=false){
 const n=document.createElement('div');n.className='notice'+(bad?' error':'');n.textContent=message;el('privateAvatarPreview').replaceChildren(n);
}
async function loadDetails(){
 const auth=await db.auth.getUser();
 if(auth.error||!auth.data.user)return;
 uid=auth.data.user.id;
 const result=await db.from('iac_profiles').select('bio,github_url,linkedin_url,avatar_path').eq('id',uid).maybeSingle();
 if(result.error)throw result.error;
 const p=result.data||{};oldAvatar=p.avatar_path||null;
 el('privateBio').value=p.bio||'';el('privateGithub').value=p.github_url||'';el('privateLinkedin').value=p.linkedin_url||'';
 if(oldAvatar){
  const signed=await db.storage.from('iac-avatars').createSignedUrl(oldAvatar,3600);
  if(!signed.error&&signed.data?.signedUrl){
   const pic=document.createElement('img');pic.src=signed.data.signedUrl;pic.alt='Private profile photo';pic.style.cssText='width:96px;height:96px;border-radius:17px;object-fit:cover;border:1px solid #d4ddd1';
   el('privateAvatarPreview').replaceChildren(pic);
   const avatar=el('avatar');if(avatar){const copy=pic.cloneNode(true);copy.style.cssText='width:100%;height:100%;object-fit:cover;border-radius:22px';avatar.replaceChildren(copy);}
  }
 }
}
el('uploadAvatar').onclick=async()=>{
 if(!uid)return info('Please sign in.',true);
 const file=el('avatarUpload').files?.[0];
 if(!file)return info('Choose a photo first.',true);
 if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size===0||file.size>3145728)return info('Please use JPG, PNG or WebP under 3 MB.',true);
 const btn=el('uploadAvatar');btn.disabled=true;
 try{
  const suffix=file.type==='image/jpeg'?'jpg':file.type==='image/png'?'png':'webp';
  const path=uid+'/'+crypto.randomUUID()+'.'+suffix;
  const result=await db.storage.from('iac-avatars').upload(path,file,{contentType:file.type,upsert:false});
  if(result.error)throw result.error;
  const updated=await db.from('iac_profiles').update({avatar_path:path}).eq('id',uid);
  if(updated.error){await db.storage.from('iac-avatars').remove([path]);throw updated.error;}
  if(oldAvatar&&oldAvatar.startsWith(uid+'/'))await db.storage.from('iac-avatars').remove([oldAvatar]);
  el('avatarUpload').value='';await loadDetails();info('Your profile photo was saved privately.');
 }catch(e){info(e.message||'Upload failed',true)}finally{btn.disabled=false;}
};
el('portfolioForm').onsubmit=async event=>{
 event.preventDefault();if(!uid)return info('Sign in first.',true);
 const btn=el('savePortfolio');btn.disabled=true;
 try{
  const gh=el('privateGithub').value.trim(),li=el('privateLinkedin').value.trim();
  const githubPattern=new RegExp('^https://(www\\.)?github\\.com/[A-Za-z0-9-]+/?$');
  const linkedInPattern=new RegExp('^https://(www\\.)?linkedin\\.com/in/[A-Za-z0-9_-]+/?$');
  if(gh&&!githubPattern.test(gh))throw Error('Enter a valid GitHub profile URL.');
  if(li&&!linkedInPattern.test(li))throw Error('Enter a valid LinkedIn profile URL.');
  const result=await db.from('iac_profiles').update({bio:el('privateBio').value.trim()||null,github_url:gh||null,linkedin_url:li||null}).eq('id',uid);
  if(result.error)throw result.error;
  info('Private profile details saved.');
 }catch(e){info(e.message,true)}finally{btn.disabled=false;}
};
loadDetails().catch(e=>info(e.message,true));
