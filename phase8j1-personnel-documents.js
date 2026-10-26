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
async function syncDocs(){if(!logged()||docBusy)return;docBusy=true;try{
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
const docObserver=new MutationObserver(()=>{const note=document.querySelector('.lspd-doc-note');if(note)note.textContent='Department document links are shared with signed-in personnel. Google controls access to the linked files.';});
docObserver.observe(document.body,{childList:true,subtree:true});
let personnelBusy=false;
const PROFILE_KEY='eflspddb_detective_profiles_v1';
function profiles(){try{const v=JSON.parse(localStorage.getItem(PROFILE_KEY)||'[]');return Array.isArray(v)?v:[]}catch{return []}}
function modal(record){if(!manager()){alert('Only authorised command personnel can edit the directory.');return}
 document.getElementById('ef8jPersonnelDialog')?.remove();const bg=document.createElement('div');bg.id='ef8jPersonnelDialog';bg.className='ef-overlay';bg.innerHTML=`<div class="ef-dialog"><div class="ef-dialog-head"><h2>${record?'Edit Personnel':'Add Personnel'}</h2><button type="button" data-close>✕</button></div><form id="ef8jPersonnelForm"><label>Name<input name="name" required maxlength="100" value="${esc(record?.name||'')}"></label><label>Rank<input name="rank" maxlength="80" value="${esc(record?.rank||'Detective')}"></label><label>Callsign<input name="callsign" maxlength="30" value="${esc(record?.callsign||'')}"></label><label>Badge Number<input name="badge" maxlength="30" value="${esc(record?.badge||'')}"></label><label>Profile Notes<textarea name="notes" rows="3">${esc(record?.notes||'')}</textarea></label><p id="ef8jPersonnelError" role="alert"></p><div class="ef-actions"><button type="button" data-close>Cancel</button><button class="blue" type="submit">Save Personnel</button></div></form></div>`;
 document.body.append(bg);bg.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>bg.remove());bg.querySelector('form').onsubmit=async e=>{e.preventDefault();if(personnelBusy)return;personnelBusy=true;const data=Object.fromEntries(new FormData(e.currentTarget));const old=profiles();const key=record?.id||record?.name;const idx=old.findIndex(p=>(p.id||p.name)===key);const row={...(idx>=0?old[idx]:{}),...data,id:record?.id||'personnel-'+crypto.randomUUID(),active:true};
 try{if(!logged())throw Error('Sign in to save shared personnel records.');const list=await req('personnel','list');const existing=(list.records||[]).find(r=>r.record_id===row.id);await req('personnel',existing?'update':'create',{id:row.id,body:row,...(existing?{version:existing.version}:{})});if(idx>=0)old[idx]=row;else old.push(row);localStorage.setItem(PROFILE_KEY,JSON.stringify(old));bg.remove();window.renderExtra?.('directory')}
 catch(err){bg.querySelector('#ef8jPersonnelError').textContent='Unable to save: '+err.message}finally{personnelBusy=false}};
}
async function refreshPersonnel(){if(!logged())return;try{const result=await req('personnel','list');const remote=(result.records||[]).filter(r=>r.body&&r.body.name).map(r=>r.body);if(!remote.length)return;const old=profiles();let changed=false;for(const p of remote){const i=old.findIndex(x=>x.id===p.id||(x.name&&x.name.toLowerCase()===p.name.toLowerCase()));if(i>=0){if(JSON.stringify(old[i])!==JSON.stringify({...old[i],...p})){old[i]={...old[i],...p};changed=true}}else{old.push(p);changed=true}}if(changed){localStorage.setItem(PROFILE_KEY,JSON.stringify(old));if(document.getElementById('extraTitle')?.textContent==='PERSONNEL DIRECTORY')window.renderExtra?.('directory')}}catch(e){console.warn('Personnel sharing:',e.message)}}
// Capture Add Record on the directory before the old browser-prompt handler.
document.getElementById('addEntryBtn')?.addEventListener('click',e=>{if(window.currentSection==='directory'||document.getElementById('extraTitle')?.textContent==='PERSONNEL DIRECTORY'){e.preventDefault();e.stopImmediatePropagation();modal(null)}},true);
// Provide edit controls for manual personnel profiles without modifying account permissions.
function addEdits(){if(document.getElementById('extraTitle')?.textContent!=='PERSONNEL DIRECTORY')return;for(const card of document.querySelectorAll('#efDirectoryGrid .ef8g-detective')){if(card.querySelector('.ef8j-edit'))continue;const name=card.querySelector('.ef8g-detective-name')?.textContent?.trim();if(!name)continue;const record=profiles().find(p=>p.name?.toLowerCase()===name.toLowerCase());if(!record)continue;const button=document.createElement('button');button.type='button';button.className='ef8j-edit';button.textContent='Edit Profile';button.onclick=()=>modal(record);card.append(button)}}
new MutationObserver(addEdits).observe(document.body,{childList:true,subtree:true});
function reset(){docReady=false;docVersion=null;docPending=false;docLast=''}
window.addEventListener('efdb-auth-login',()=>{reset();syncDocs();refreshPersonnel()});window.addEventListener('efdb-auth-logout',reset);
setInterval(()=>{if(logged()){syncDocs();refreshPersonnel()}},3000);
setTimeout(()=>{addEdits();syncDocs();refreshPersonnel()},1200);
})();
