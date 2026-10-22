/* Phase 7E: local detective directory bridge and separate case-file recycle UI. */
(()=>{'use strict';
const PROFILE_KEY='eflspddb_detective_profiles_v1', BIN_KEY='eflspddb_deleted_case_files_v1';
const get=(k)=>{try{return JSON.parse(localStorage.getItem(k))||[]}catch{return []}};
const save=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','"':'&quot;',"'":'&#39;'}[c]));
window.EFDBDirectoryRegister=function(a){
 if(!a?.id||!a.name)return;
 const all=get(PROFILE_KEY);
 const i=all.findIndex(d=>d.accountId===a.id);
 const match=i>=0?i:all.findIndex(d=>d.name?.toLowerCase()===a.name.toLowerCase()&&!d.accountId);
 const entry={...(all[match]||{}),accountId:a.id,name:a.name,rank:({'owner':'Office of Operations','director':'Director','deputy_director':'Deputy Director','supervisory_detective':'Supervisory Detective','detective':'Detective','junior_detective':'Junior Detective','probationary_detective':'Probationary Detective'}[a.role]||a.role||'Detective'),badge:a.badge_number||'',callsign:a.callsign||'',phone:a.phone_number||'',status:'Active'};
 if(match>=0)all[match]=entry;else all.push(entry);
 save(PROFILE_KEY,all);
 window.EFCaseFiles?.setRoster(all.map(d=>d.name));
};
function renderBin(){
 const host=document.getElementById('ef7eCaseFileBin');if(!host)return;
 const rows=get(BIN_KEY);
 host.innerHTML='<h3>🗃️ CASE FILE RECYCLE BIN ('+rows.length+')</h3><p>Deleted case files from this browser. Linked map pins are preserved. No automatic purging.</p>'+
 (rows.length?rows.map((r,i)=>'<div class="ef7e-bin-row"><span><strong>'+esc(r.case?.number||'Case')+'</strong> · '+esc(r.case?.title||'')+' · '+esc(new Date(r.deletedAt).toLocaleString())+'</span><button type="button" data-restore-case="'+i+'">Restore Case</button></div>').join(''):'<p>No deleted case files.</p>');
 host.onclick=e=>{
  const btn=e.target.closest('[data-restore-case]');if(!btn)return;
  if(!['owner','director','deputy_director','supervisory_detective','admin'].includes(window.EFDBAuth?.user?.role))return;
  const all=get(BIN_KEY),i=Number(btn.dataset.restoreCase),r=all[i];if(!r)return;
  if(!window.EFCaseFiles?.restoreDeleted(r.case)){alert('Unable to restore. A case with this ID or number may already exist.');return;}
  all.splice(i,1);save(BIN_KEY,all);renderBin();
 };
}
function mount(){
 const settings=document.querySelector('.ef7b-settings');
 if(!settings)return;
 if(!document.getElementById('ef7eCaseFileBin')){
  const sec=document.createElement('section');sec.className='db-card';sec.id='ef7eCaseFileBin';
  const existing=document.querySelector('#ef7bBin')?.closest('section');(existing||settings).insertAdjacentElement('afterend',sec);
 }
 renderBin();
}
const observer=new MutationObserver(()=>{if(document.querySelector('.ef7b-settings')&&!document.getElementById('ef7eCaseFileBin'))mount()});
observer.observe(document.body,{childList:true,subtree:true});
document.addEventListener('click',e=>{if(e.target.closest('[data-section="settings"]'))setTimeout(mount,80)});
})();
