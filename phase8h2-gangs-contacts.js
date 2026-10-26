/* Phase 8H-2 repair: access the application's global lexical state (not window.database). */
(()=>{'use strict';
const names=['gangs','contacts'],state=Object.fromEntries(names.map(n=>[n,{versions:new Map(),baseline:new Map(),pending:new Map(),ready:false,busy:false,sent:0,received:0}]));
const valid=x=>x&&typeof x==='object'&&!Array.isArray(x)&&typeof x.id==='string'&&/^[A-Za-z0-9_-]{1,100}$/.test(x.id);
const copy=x=>JSON.parse(JSON.stringify(x)),finger=x=>JSON.stringify(x);
function rows(n){try{return n==='gangs'?(Array.isArray(database.gangs)?database.gangs:[]):(Array.isArray(contacts)?contacts:[])}catch{return []}}
function store(n){if(n==='gangs'){localStorage.setItem(DB_KEY,JSON.stringify(database))}else{localStorage.setItem(CONTACT_KEY,JSON.stringify(contacts))}}
function repaint(n){try{if(currentSection===n){if(n==='contacts')renderContacts();else renderExtra('gangs')}}catch(e){console.warn('8H2 repaint',e)}}
function baseline(n){state[n].baseline=new Map(rows(n).filter(valid).map(x=>[x.id,finger(x)]))}
function status(n,msg,error=false){const el=document.getElementById('ef8h2-'+n);if(el){el.textContent=msg;el.style.color=error?'#ffb5b5':'#a6e4c0'}}
function changed(n){const s=state[n];if(!s.ready)return;const current=new Map(rows(n).filter(valid).map(x=>[x.id,finger(x)]));for(const x of rows(n).filter(valid)){if(current.get(x.id)!==s.baseline.get(x.id))s.pending.set(x.id,copy(x))}for(const id of s.baseline.keys())if(!current.has(id)){s.pending.delete(id);status(n,'Local deletion not yet shared',true)}s.baseline=current}
window.EF8H2={localChanged:changed};
async function cycle(n){const s=state[n];if(s.busy||!window.EFDBAuth?.loggedIn||document.visibilityState==='hidden')return;s.busy=true;let conflicts=0;try{
const response=await window.EFDBAuth.request('/live-records',{dataset:n,action:'list'});
const remote=(response.records||[]).filter(r=>valid(r.body)&&r.record_id===r.body.id),local=new Map(rows(n).filter(valid).map(x=>[x.id,x]));
for(const r of remote){const id=r.record_id,known=s.versions.get(id);if(s.pending.has(id)){if(known===undefined||known!==r.version){s.pending.delete(id);conflicts++}s.versions.set(id,r.version);continue}
if(!local.has(id)){rows(n).push(copy(r.body));store(n);local.set(id,r.body);s.received++;repaint(n)}
else if(known!==undefined&&known!==r.version){if(finger(local.get(id))!==s.baseline.get(id))conflicts++;else{const i=rows(n).findIndex(x=>x.id===id);if(i>=0){rows(n)[i]=copy(r.body);store(n);s.received++;repaint(n)}}}
s.versions.set(id,r.version)}
for(const [id,body] of [...s.pending]){if(finger(body).length>240000){s.pending.delete(id);conflicts++;continue}const r=remote.find(x=>x.record_id===id);try{const result=await window.EFDBAuth.request('/live-records',{dataset:n,action:r?'update':'create',id,body,...(r?{version:r.version}:{})});s.versions.set(id,result.record.version);s.pending.delete(id);s.sent++}catch(e){if(/conflict|duplicate|already|409/i.test(String(e.message))){s.pending.delete(id);conflicts++}else throw e}}
s.ready=true;baseline(n);status(n,conflicts?`${conflicts} conflict(s); local records kept`:`Online · ${s.sent} sent · ${s.received} received · 2-second checks`,conflicts>0);
}catch(e){status(n,'Sync unavailable: '+e.message,true)}finally{s.busy=false}}
function mount(){const host=document.getElementById('ef7bShared');if(!host||document.getElementById('ef8h2-panel'))return;const section=document.createElement('section');section.id='ef8h2-panel';section.className='db-card';section.style.cssText='border:1px solid #3c705c;padding:16px;border-radius:10px;margin-top:16px;background:#0b172a;color:#e5f1eb';section.innerHTML='<h3>GANG & CONTACT SYNC</h3><p>New records and edits share automatically. Existing local records are not bulk-uploaded; deletion sync is not enabled.</p><p>Gangs: <span id="ef8h2-gangs">Waiting for login…</span></p><p>Contacts: <span id="ef8h2-contacts">Waiting for login…</span></p><button type="button" id="ef8h2-check">Check now</button>';host.appendChild(section);section.querySelector('button').onclick=()=>names.forEach(cycle)}
function reset(){for(const n of names){const s=state[n];s.ready=false;s.busy=false;s.versions.clear();s.pending.clear();baseline(n)}}
new MutationObserver(mount).observe(document.body,{childList:true,subtree:true});mount();reset();
window.addEventListener('efdb-auth-login',()=>{reset();names.forEach(cycle)});window.addEventListener('efdb-auth-logout',reset);
setInterval(()=>{if(window.EFDBAuth?.loggedIn)for(const n of names){changed(n);cycle(n)}},2000);
window.addEventListener('focus',()=>names.forEach(cycle));
})();
