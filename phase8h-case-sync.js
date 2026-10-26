/* EFLSPDDB Phase 8H1: automatic investigation case creation/edit sync.
   No bulk upload, shared deletion, no automatic overwrite on conflict. */
(()=>{'use strict';
const KEY='eflspddb_investigation_files_v1', DATASET='case_files';
const versions=new Map(), pending=new Map(), pendingDeletes=new Map();
let baseline=new Map(),busy=false,initialized=false,saved=0,received=0;
const valid=x=>x&&typeof x==='object'&&!Array.isArray(x)&&typeof x.id==='string'&&/^[A-Za-z0-9_-]{1,100}$/.test(x.id);
const read=()=>{try{const x=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(x)?x:[]}catch{return []}};
const fingerprint=x=>JSON.stringify(x);
const snap=()=>{baseline=new Map(read().filter(valid).map(x=>[x.id,fingerprint(x)]))};
const api=(action,extra={})=>window.EFDBAuth.request('/live-records',{dataset:DATASET,action,...extra});
const label=(message,error=false)=>{const el=document.getElementById('ef8h-case-status');if(el){el.textContent=message;el.style.color=error?'#ffb3b3':'#a6e4c0'}};
window.EF8H={onLocalSave(rows){if(!initialized||!window.EFDBAuth?.loggedIn)return;const now=new Map(rows.filter(valid).map(x=>[x.id,fingerprint(x)]));for(const item of rows.filter(valid)){if(now.get(item.id)!==baseline.get(item.id))pending.set(item.id,structuredClone(item))}for(const id of baseline.keys())if(!now.has(id)){pending.delete(id);if(versions.has(id))pendingDeletes.set(id,versions.get(id));else label('Local-only case removed (not previously shared).',true)}baseline=now}};
async function cycle(){if(busy||!window.EFDBAuth?.loggedIn||document.visibilityState==='hidden')return;busy=true;try{
 const response=await api('list'),remote=(response.records||[]).filter(x=>valid(x.body)&&x.body.id===x.record_id);
 const local=new Map(read().filter(valid).map(x=>[x.id,x]));let conflicts=0;
 const remoteIds=new Set(remote.map(x=>x.record_id));
 for(const [id] of [...versions])if(!remoteIds.has(id)&&!pendingDeletes.has(id)&&!pending.has(id)){if(window.EF8H3RemoveCase?.(id)){versions.delete(id);received++}}
 const deletedThisCycle=new Set();for(const [id,version] of [...pendingDeletes]){try{await api('delete',{id,version});pendingDeletes.delete(id);versions.delete(id);deletedThisCycle.add(id)}catch(err){if(/409|conflict|missing/i.test(err.message)){pendingDeletes.delete(id);conflicts++}else throw err}}
 for(const entry of remote){if(deletedThisCycle.has(entry.record_id))continue;const id=entry.record_id,old=versions.get(id);
   if(pending.has(id)){if(old===undefined||old!==entry.version){pending.delete(id);conflicts++}continue}
   if(!local.has(id)){if(window.EF8HApplyRemoteCase?.(structuredClone(entry.body))){received++;local.set(id,entry.body)}}
   else if(old!==undefined&&old!==entry.version){if(fingerprint(local.get(id))===baseline.get(id)){if(window.EF8HApplyRemoteCase?.(structuredClone(entry.body)))received++}else conflicts++}
   versions.set(id,entry.version);
 }
 for(const [id,body] of [...pending]){if(fingerprint(body).length>240000){pending.delete(id);conflicts++;continue}
   const existing=remote.find(x=>x.record_id===id);
   try{let result;if(existing){const known=versions.get(id);if(known===undefined||known!==existing.version){pending.delete(id);conflicts++;continue}result=await api('update',{id,version:known,body})}
   else result=await api('create',{id,body});versions.set(id,result.record.version);pending.delete(id);saved++;
   }catch(err){if(/409|conflict|already|duplicate/i.test(err.message)){pending.delete(id);conflicts++}else throw err}
 }
 initialized=true;snap();label(conflicts?`${conflicts} case conflict(s) detected. Local copies preserved.`:`Case sync active · ${saved} saved · ${received} received · checks every 2 seconds`,conflicts>0);
}catch(err){label('Case sync unavailable: '+err.message+'. Local cases preserved.',true)}finally{busy=false}}
function mount(){const parent=document.getElementById('ef7bShared');if(!parent||document.getElementById('ef8h-case-panel'))return;const box=document.createElement('section');box.id='ef8h-case-panel';box.className='db-card';box.style.cssText='border:1px solid #3c705c;padding:16px;border-radius:10px;margin-top:16px;background:#0b172a;color:#e5f1eb';box.innerHTML='<h3>PHASE 8H · INVESTIGATION CASE SYNC</h3><p>New cases and edits share automatically while logged in. Existing local cases are not bulk-uploaded. Shared deletion is enabled for previously synchronised cases.</p><p id="ef8h-case-status" role="status">Waiting for login…</p><button type="button" id="ef8h-case-check">Check cases now</button>';parent.append(box);box.querySelector('button').onclick=cycle}
new MutationObserver(mount).observe(document.body,{childList:true,subtree:true});mount();snap();
window.addEventListener('efdb-auth-login',()=>{initialized=false;pending.clear();pendingDeletes.clear();versions.clear();snap();cycle()});
window.addEventListener('efdb-auth-logout',()=>{initialized=false;pending.clear();pendingDeletes.clear();versions.clear()});
setInterval(()=>{if(window.EFDBAuth?.loggedIn)cycle()},2000);
window.addEventListener('focus',cycle);document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')cycle()});
})();
