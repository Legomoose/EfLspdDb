/* Phase 8J-1: shared document directory and personnel editing. */
(()=>{'use strict';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const req=(dataset,action,rest={})=>window.EFDBAuth.request('/live-records',{dataset,action,...rest});
const logged=()=>!!window.EFDBAuth?.loggedIn;
const manager=()=>['owner','admin','high_command','super_admin'].includes(String(window.EFDBAuth?.user?.role||'').toLowerCase());
const DOC_KEY='lspddb_department_documents_v1',DOC_ID='department-documents-directory';
let docVersion=null,docReady=false,docBusy=false,docLast='',docPending=false;
const readDocs=()=>{try{const v=JSON.parse(localStorage.getItem(DOC_KEY)||'[]');return Array.isArray(v)?v:[]}catch{return []}};
const docsText=()=>JSON.stringify(readDocs());
function drawDocs(){if(document.getElementById('extraTitle')?.textContent==='DEPARTMENT DOCUMENTS')window.renderExtra?.('documents')}
async function syncDocs(){if(!logged()||docBusy||document.hidden)return;docBusy=true;try{
 const response=await req('intelligence','list');const remote=(response.records||[]).find(r=>r.record_id===DOC_ID);
 const local=docsText();
 if(!docReady){docReady=true;docVersion=remote?.version??null;if(remote&&Array.isArray(remote.body?.documents)){localStorage.setItem(DOC_KEY,JSON.stringify(remote.body.documents));docLast=docsText();drawDocs()}else{docLast=local;if(readDocs().length&&manager())docPending=true}return}
 if(remote&&docVersion!==remote.version&&!docPending){docVersion=remote.version;if(Array.isArray(remote.body?.documents)){localStorage.setItem(DOC_KEY,JSON.stringify(remote.body.documents));docLast=docsText();drawDocs()}}
 if(local!==docLast&&manager())docPending=true;
 if(docPending&&manager()){
  const body={id:DOC_ID,documents:readDocs(),updated:new Date().toISOString()};
  const action=remote?'update':'create';
  const result=await req('intelligence',action,{id:DOC_ID,body,...(remote?{version:remote.version}:{})});
  docVersion=result.record?.version??null;docLast=docsText();docPending=false;
 }
 }catch(e){console.warn('Department documents sharing:',e.message)}finally{docBusy=false}}
// Local document editor is retained; this watches its saves and sends them to shared storage.
const docObserver=new MutationObserver(()=>{const note=document.querySelector('.lspd-doc-note');if(note && note.textContent !== 'Department document links are shared with signed-in personnel. Google controls access to the linked files.')note.textContent='Department document links are shared with signed-in personnel. Google controls access to the linked files.';});
docObserver.observe(document.body,{childList:true,subtree:true});
let personnelBusy=false;
let personnelRefreshBusy=false;
const PROFILE_KEY='eflspddb_detective_profiles_v1';
function profiles(){try{const v=JSON.parse(localStorage.getItem(PROFILE_KEY)||'[]');return Array.isArray(v)?v:[]}catch{return []}}
const norm=v=>String(v??'').trim().toLowerCase();
const match=(a,b)=>!!((a.account_id||a.accountId)&&(a.account_id||a.accountId)===(b.account_id||b.accountId))||!!(a.id&&b.id&&a.id===b.id)||!!(norm(a.badge)&&norm(a.badge)===norm(b.badge))||!!(norm(a.callsign)&&norm(a.callsign)===norm(b.callsign));
function collapse(rows){const out=[];for(const p of rows){const i=out.findIndex(x=>match(x,p));if(i<0){out.push(p);continue}const a=out[i], account=(a.account_id||a.accountId)?a:((p.account_id||p.accountId)?p:a);const override=a.sharedPersonnelOverride?a:(p.sharedPersonnelOverride?p:null);out[i]={...a,...p,...account,...(override?{name:override.name,rank:override.rank,badge:override.badge,callsign:override.callsign,notes:override.notes,sharedPersonnelOverride:true}:{}),id:account.id||a.id||p.id};}return out;}
function saveProfiles(rows){const cleaned=collapse(rows);if(JSON.stringify(cleaned)!==JSON.stringify(rows))localStorage.setItem(PROFILE_KEY,JSON.stringify(cleaned));return cleaned;}
function modal(record){if(!manager()){alert('Only authorised command personnel can edit the directory.');return}
 document.getElementById('ef8jPersonnelDialog')?.remove();const bg=document.createElement('div');bg.id='ef8jPersonnelDialog';bg.className='ef-overlay';bg.innerHTML=`<div class="ef-dialog"><div class="ef-dialog-head"><h2>${record?'Edit Personnel':'Add Personnel'}</h2><button type="button" data-close>✕</button></div><form id="ef8jPersonnelForm"><label>Name<input name="name" required maxlength="100" value="${esc(record?.name||'')}"></label><label>Rank<input name="rank" maxlength="80" value="${esc(record?.rank||'Detective')}"></label><label>Callsign<input name="callsign" maxlength="30" value="${esc(record?.callsign||'')}"></label><label>Badge Number<input name="badge" maxlength="30" value="${esc(record?.badge||'')}"></label><label>Profile Notes<textarea name="notes" rows="3">${esc(record?.notes||'')}</textarea></label><p id="ef8jPersonnelError" role="alert"></p><div class="ef-actions"><button type="button" data-close>Cancel</button><button class="blue" type="submit">Save Personnel</button></div></form></div>`;
 document.body.append(bg);bg.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>bg.remove());bg.querySelector('form').onsubmit=async e=>{e.preventDefault();if(personnelBusy)return;personnelBusy=true;const data=Object.fromEntries(new FormData(e.currentTarget));const old=profiles();const key=record?.id||record?.name;const idx=old.findIndex(p=>match(p,record||{})||(p.id||p.name)===key);const accountId=record?.account_id||record?.accountId;const row={...(idx>=0?old[idx]:{}),...data,id:accountId?'personnel-account-'+accountId:(record?.id||'personnel-'+crypto.randomUUID()),...(accountId?{account_id:accountId,accountId,sharedPersonnelOverride:true}:{}),active:true};
 try{if(!logged())throw Error('Sign in to save shared personnel records.');const list=await req('personnel','list');const existing=(list.records||[]).find(r=>r.record_id===row.id);await req('personnel',existing?'update':'create',{id:row.id,body:row,...(existing?{version:existing.version}:{})});if(idx>=0)old[idx]={...old[idx],...row,id:old[idx].id||row.id};else old.push(row);localStorage.setItem(PROFILE_KEY,JSON.stringify(collapse(old)));bg.remove();window.renderExtra?.('directory')}
 catch(err){bg.querySelector('#ef8jPersonnelError').textContent='Unable to save: '+err.message}finally{personnelBusy=false}};
}
async function refreshPersonnel(){if(!logged()||personnelRefreshBusy||document.hidden)return;personnelRefreshBusy=true;try{const result=await req('personnel','list');const remote=(result.records||[]).filter(r=>r.body&&r.body.name).map(r=>r.body);const remoteIds=new Set((result.records||[]).map(r=>r.record_id));
 const knownKey='ef8j_known_remote_personnel_ids';
 const known=new Set(JSON.parse(localStorage.getItem(knownKey)||'[]'));
 const removed=new Set(JSON.parse(localStorage.getItem('ef8j_removed_personnel_ids')||'[]'));
 const old=profiles().filter(p=>!removed.has(p.id)&&(!known.has(p.id)||remoteIds.has(p.id)||p.account_id||p.accountId));
 let changed=old.length!==profiles().length;
 for(const p of remote){const i=old.findIndex(x=>match(x,p)||norm(x.name)===norm(p.name));if(i>=0){const merged={...old[i],...p,id:old[i].id||p.id,account_id:old[i].account_id||p.account_id,accountId:old[i].accountId||p.accountId};if(JSON.stringify(old[i])!==JSON.stringify(merged)){old[i]=merged;changed=true}}else{old.push(p);changed=true}}for(const id of remoteIds)known.add(id);
 localStorage.setItem(knownKey,JSON.stringify([...known]));
 const cleaned=collapse(old);
 // Compare the final, deduplicated state rather than intermediate merges.
 // The old `changed` flag could be true on every poll even when the visible
 // profiles were unchanged, causing the entire Personnel + HC grid to flicker.
 const previous=profiles();
 if(JSON.stringify(cleaned)!==JSON.stringify(previous)){
   localStorage.setItem(PROFILE_KEY,JSON.stringify(cleaned));
   if(document.getElementById('extraTitle')?.textContent==='PERSONNEL DIRECTORY')window.renderExtra?.('directory');
 }}catch(e){console.warn('Personnel sharing:',e.message)}finally{personnelRefreshBusy=false}}
// Capture Add Record on the directory before the old browser-prompt handler.
document.getElementById('addEntryBtn')?.addEventListener('click',e=>{if(window.currentSection==='directory'||document.getElementById('extraTitle')?.textContent==='PERSONNEL DIRECTORY'){e.preventDefault();e.stopImmediatePropagation();modal(null)}},true);
// Provide edit controls for manual personnel profiles without modifying account permissions.
function addEdits(){if(document.getElementById('extraTitle')?.textContent!=='PERSONNEL DIRECTORY')return;for(const card of document.querySelectorAll('#efDirectoryGrid .ef8g-detective')){if(card.querySelector('.ef8j-edit'))continue;const name=card.querySelector('.ef8g-detective-name')?.textContent?.trim();if(!name)continue;const meta=card.querySelector('.ef8g-detective-meta')?.textContent||'';const badge=(meta.match(/Badge\s*#\s*([^\s]+)/i)||[])[1];const record=profiles().find(p=>norm(p.name)===norm(name))||profiles().find(p=>badge&&norm(p.badge)===norm(badge));if(!record)continue;const button=document.createElement('button');button.type='button';button.className='ef8j-edit';button.textContent='Edit Profile';button.onclick=()=>modal(record);card.append(button)}}

// Phase 8J-3: safely remove manual directory entries; never delete detective accounts.
let personnelRemoving=false;
async function removePersonnel(record){
 if(!manager()||personnelRemoving)return;
 const account=!!(record.account_id||record.accountId);
 if(account){alert('This profile belongs to a detective account. Manage the account in Account Management; its login cannot be deleted here.');return}
 const id=String(record.id||'');
 if(!confirm('Remove this manually created personnel profile from the shared directory? This will not delete any detective login.'))return;
 personnelRemoving=true;
 try{
  if(!logged())throw Error('Sign in to remove a shared profile.');
  const list=await req('personnel','list');
  const remote=(list.records||[]).find(r=>r.record_id===id);
  if(remote)await req('personnel','delete',{id:remote.record_id,version:remote.version});
  // Remember the deletion on this device so the profile cannot be reintroduced by stale local state.
  const removed=new Set(JSON.parse(localStorage.getItem('ef8j_removed_personnel_ids')||'[]'));
  if(id)removed.add(id);
  localStorage.setItem('ef8j_removed_personnel_ids',JSON.stringify([...removed]));
  localStorage.setItem(PROFILE_KEY,JSON.stringify(profiles().filter(p=>p.id!==id)));
  window.renderExtra?.('directory');
 }catch(err){alert('Profile was not removed: '+err.message)}finally{personnelRemoving=false}
}
function addDeleteControls(){
 if(!manager()||document.getElementById('extraTitle')?.textContent!=='PERSONNEL DIRECTORY')return;
 for(const card of document.querySelectorAll('#efDirectoryGrid .ef8g-detective')){
  if(card.querySelector('.ef8j-remove'))continue;
  const name=card.querySelector('.ef8g-detective-name')?.textContent?.trim();
  const meta=card.querySelector('.ef8g-detective-meta')?.textContent||'';
  const badge=(meta.match(/Badge\s*#\s*([^\s]+)/i)||[])[1];
  const record=profiles().find(p=>norm(p.name)===norm(name))||profiles().find(p=>badge&&norm(p.badge)===norm(badge));
  if(!record||record.account_id||record.accountId)continue;
  const button=document.createElement('button');button.type='button';button.className='ef8j-remove';button.textContent='Remove Profile';
  button.onclick=()=>removePersonnel(record);card.append(button);
 }
}
new MutationObserver(addDeleteControls).observe(document.body,{childList:true,subtree:true});
new MutationObserver(addEdits).observe(document.body,{childList:true,subtree:true});
function reset(){docReady=false;docVersion=null;docPending=false;docLast=''}
window.addEventListener('efdb-auth-login',()=>{reset();syncDocs();refreshPersonnel()});window.addEventListener('efdb-auth-logout',reset);
setInterval(()=>{if(logged()&&!document.hidden){syncDocs();refreshPersonnel()}},60000);
window.addEventListener('focus',()=>{if(logged()){syncDocs();refreshPersonnel()}});
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&logged()){syncDocs();refreshPersonnel()}});
setTimeout(()=>{addEdits();addDeleteControls();syncDocs();refreshPersonnel()},1200);
})();
