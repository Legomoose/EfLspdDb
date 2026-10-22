// Phase 7A controlled shared migration panel. Never automatically overwrites local detective data.
(()=>{'use strict';
const sets={cases:'everfall_lspd_cases_satmap_v1',contacts:'eflspddb_contacts_v1',gangs:'eflspddb_gangs_v1',intelligence:'everfall_db_records_v1',icons:'everfall_custom_icons_v1'};
const supported=['cases','intelligence','icons']; // other datasets need a verified mapping in the next stage
let revisions={};
function show(msg){const e=document.getElementById('efSharedStatus');if(e)e.textContent=msg;}
function panel(){
 const host=document.getElementById('extraContent');if(!host||document.getElementById('efSharedPanel'))return;
 const d=document.createElement('div');d.id='efSharedPanel';d.className='db-card';
 d.innerHTML='<h3>PHASE 7 · SHARED DATABASE SETUP</h3><p>This is a controlled migration preview. Existing browser data is untouched unless you explicitly choose to download a backup or publish a dataset. Publishing makes it available to other authorised detectives, but this version does not automatically replace their local records.</p><p><strong>Before publishing:</strong> export your backup using the existing Settings button. Large embedded images may exceed the 2 MB server limit.</p><label>Dataset <select id="efSharedDataset"><option value="cases">Cases and map pins</option><option value="intelligence">Intelligence records</option><option value="icons">Custom icons</option></select></label> <button id="efSharedCheck">Check Shared Version</button> <button id="efSharedPublish">Publish Local Dataset</button> <button id="efSharedDownload">Download Shared JSON</button><p id="efSharedStatus" role="status">Requires the Phase 7 SQL and Worker deployment.</p>';
 host.appendChild(d);
 const sel=d.querySelector('#efSharedDataset');
 d.querySelector('#efSharedCheck').onclick=async()=>{try{const key=sel.value;const r=await window.EFDBAuth.request('/shared-document',{key,action:'read'});revisions[key]=r.document?.revision||0;show(r.document?'Shared revision '+r.document.revision+' · updated '+new Date(r.document.updated_at).toLocaleString():'No shared copy exists yet.');}catch(e){show(e.message)}};
 d.querySelector('#efSharedPublish').onclick=async()=>{const key=sel.value;try{if(!Object.hasOwn(revisions,key))throw Error('Check the shared version first.');const raw=localStorage.getItem(sets[key]);if(!raw)throw Error('No local data for this dataset.');const payload=JSON.parse(raw);if(!confirm('Publish your LOCAL '+key+' data as the shared version? This will update what other detectives can download.'))return;const r=await window.EFDBAuth.request('/shared-document',{key,action:'write',revision:revisions[key],payload});revisions[key]=r.revision;show('Published revision '+r.revision+'. Other detectives can download this dataset.');}catch(e){show(e.message)}};
 d.querySelector('#efSharedDownload').onclick=async()=>{try{const key=sel.value;const r=await window.EFDBAuth.request('/shared-document',{key,action:'read'});if(!r.document)throw Error('No shared copy available.');const blob=new Blob([JSON.stringify(r.document,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='EFLSPDDB-shared-'+key+'-revision-'+r.document.revision+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),2000);show('Downloaded shared copy. Your local data has NOT been changed.');}catch(e){show(e.message)}};
}
// Render after Settings is opened; no modifications to original render code.
document.addEventListener('click',()=>{setTimeout(()=>{if(document.getElementById('extraTitle')?.textContent?.toLowerCase()==='settings')panel()},0)});
})();
