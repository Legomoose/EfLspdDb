/* EFLSPDDB Phase 8H2: shared gang and contact records. No bulk upload/deletion. */
(()=>{'use strict';
const CONFIG={gangs:{dataset:'gangs',key:null},contacts:{dataset:'contacts',key:'eflspddb_contacts_v1'}};
const states={};for(const name of Object.keys(CONFIG))states[name]={versions:new Map(),baseline:new Map(),pending:new Map(),ready:false,busy:false,sent:0,received:0,conflicts:0};
const good=x=>x&&typeof x==='object'&&!Array.isArray(x)&&typeof x.id==='string'&&/^[A-Za-z0-9_-]{1,100}$/.test(x.id);
const clone=x=>JSON.parse(JSON.stringify(x));
const list=name=>{if(name==='gangs')return Array.isArray(window.database?.gangs)?window.database.gangs:[];try{const v=JSON.parse(localStorage.getItem(CONFIG[name].key)||'[]');return Array.isArray(v)?v:[]}catch{return []}};
const hash=x=>JSON.stringify(x);
const snapshot=name=>{states[name].baseline=new Map(list(name).filter(good).map(x=>[x.id,hash(x)]))};
const api=(name,action,extra={})=>window.EFDBAuth.request('/live-records',{dataset:CONFIG[name].dataset,action,...extra});
const status=(name,message,bad=false)=>{const el=document.getElementById('ef8h2-'+name);if(el){el.textContent=message;el.style.color=bad?'#ffb3b3':'#a6e4c0'}};
function apply(name,entry){const rows=list(name);if(rows.some(x=>x.id===entry.id))return false;rows.push(clone(entry));
 if(name==='gangs') {if(!window.database)return false;window.database.gangs=rows;localStorage.setItem(typeof DB_KEY==='string'?DB_KEY:'everfall_db_records_v1',JSON.stringify(window.database));}
 else {localStorage.setItem(CONFIG[name].key,JSON.stringify(rows));if(typeof contacts!=='undefined')contacts=rows;}
 try{if(typeof currentSection!=='undefined'&&currentSection===name){if(name==='contacts'&&typeof renderContacts==='function')renderContacts();else if(typeof renderExtra==='function')renderExtra(name)}}catch{}
 return true;
}
function track(name){const s=states[name];if(!s.ready)return;const rows=list(name).filter(good),current=new Map(rows.map(x=>[x.id,hash(x)]));for(const row of rows){if(current.get(row.id)!==s.baseline.get(row.id))s.pending.set(row.id,clone(row))}for(const id of s.baseline.keys())if(!current.has(id)){s.pending.delete(id);status(name,'Local deletion detected; shared deletion is not enabled yet.',true)}s.baseline=current;}
window.EF8H2={localChanged:track};
async function cycle(name){const s=states[name];if(s.busy||!window.EFDBAuth?.loggedIn||document.visibilityState==='hidden')return;s.busy=true;try{
 const result=await api(name,'list'),remote=(result.records||[]).filter(x=>good(x.body)&&x.record_id===x.body.id),local=new Map(list(name).filter(good).map(x=>[x.id,x]));let issues=0;
 for(const r of remote){const id=r.record_id,known=s.versions.get(id);if(s.pending.has(id)){if(known===undefined||known!==r.version){s.pending.delete(id);issues++}continue}
 if(!local.has(id)){if(apply(name,r.body)){s.received++;local.set(id,r.body)}}
 else if(known!==undefined&&known!==r.version){if(hash(local.get(id))!==s.baseline.get(id))issues++;else{const rows=list(name);const index=rows.findIndex(x=>x.id===id);if(index>=0){rows[index]=clone(r.body);if(name==='gangs'){window.database.gangs=rows;localStorage.setItem(DB_KEY,JSON.stringify(window.database))}else{contacts=rows;localStorage.setItem(CONFIG[name].key,JSON.stringify(rows))}s.received++;try{if(currentSection===name){if(name==='contacts')renderContacts();else renderExtra(name)}}catch{}}}}
 s.versions.set(id,r.version);
 }
 for(const [id,body] of [...s.pending]){if(hash(body).length>240000){s.pending.delete(id);issues++;continue}const existing=remote.find(x=>x.record_id===id);try{let res;if(existing){const version=s.versions.get(id);if(version===undefined||version!==existing.version){s.pending.delete(id);issues++;continue}res=await api(name,'update',{id,version,body})}else res=await api(name,'create',{id,body});s.versions.set(id,res.record.version);s.pending.delete(id);s.sent++}catch(e){if(/409|conflict|duplicate|already/i.test(e.message)){s.pending.delete(id);issues++}else throw e}}
 s.ready=true;snapshot(name);s.conflicts+=issues;status(name,issues?`${issues} conflict(s). Local data preserved.`:`Online · ${s.sent} sent · ${s.received} received · 2-second checks`,issues>0);
 }catch(e){status(name,'Sync unavailable: '+e.message+'. Local data preserved.',true)}finally{s.busy=false}}
function mount(){const host=document.getElementById('ef7bShared');if(!host||document.getElementById('ef8h2-panel'))return;const el=document.createElement('section');el.id='ef8h2-panel';el.className='db-card';el.style.cssText='border:1px solid #3c705c;padding:16px;border-radius:10px;margin-top:16px;background:#0b172a;color:#e5f1eb';el.innerHTML='<h3>PHASE 8H-2 · GANGS & CONTACTS</h3><p>New records and edits sync between detectives. Existing local records are not bulk-uploaded; shared deletion is not enabled.</p><p>Gangs: <span id="ef8h2-gangs">Waiting for login…</span></p><p>Contacts: <span id="ef8h2-contacts">Waiting for login…</span></p><button type="button" id="ef8h2-check">Check now</button>';host.append(el);el.querySelector('button').onclick=()=>Promise.all(Object.keys(CONFIG).map(cycle))}
function reset(){for(const name of Object.keys(CONFIG)){const s=states[name];s.ready=false;s.busy=false;s.versions.clear();s.pending.clear();snapshot(name)}}
new MutationObserver(mount).observe(document.body,{childList:true,subtree:true});mount();reset();
window.addEventListener('efdb-auth-login',()=>{reset();Object.keys(CONFIG).forEach(cycle)});
window.addEventListener('efdb-auth-logout',reset);
setInterval(()=>{if(window.EFDBAuth?.loggedIn)for(const name of Object.keys(CONFIG)){track(name);cycle(name)}},2000);
window.addEventListener('focus',()=>Object.keys(CONFIG).forEach(cycle));
})();
