/* EFLSPDDB Storage & Usage - secure role-controlled reporting */
(()=>{'use strict';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=n=>Number.isFinite(Number(n))?new Intl.NumberFormat('en-GB',{maximumFractionDigits:2}).format(Number(n)/1048576)+' MB':'Unavailable';
const bytes=s=>new Blob([s]).size;
const root=()=>document.getElementById('lspdStorage');
function localStats(){let total=0,rows=[];try{for(let i=0;i<localStorage.length;i++){let k=localStorage.key(i),v=localStorage.getItem(k)||'',b=bytes(k)+bytes(v);total+=b;rows.push({k,b});}}catch{}return {total,rows:rows.sort((a,b)=>b.b-a.b)};}
function tile(title,id,description){return `<article class="lspd-storage-tile"><div class="lspd-storage-label">${title}</div><strong id="${id}">Checking…</strong><div class="lspd-storage-track"><div id="${id}Bar"></div></div><small id="${id}Note">${description}</small></article>`;}
async function refresh(){let el=root();if(!el)return;
 const local=localStats();el.querySelector('#lspdLocal').textContent=fmt(local.total)+' stored';
 el.querySelector('#lspdStorageRows').innerHTML=local.rows.slice(0,8).map(r=>`<div class="lspd-storage-row"><span title="${esc(r.k)}">${esc(r.k)}</span><b>${fmt(r.b)}</b></div>`).join('')||'<p>No browser records.</p>';
 try{if(navigator.storage?.estimate){const e=await navigator.storage.estimate();if(e.quota&&Number.isFinite(e.usage)){el.querySelector('#lspdLocalNote').textContent=`Origin estimate ${fmt(e.usage)} of ~${fmt(e.quota)} browser quota`;let pct=e.usage/e.quota*100;const bar=el.querySelector('#lspdLocalBar');bar.style.width=Math.min(100,pct)+'%';bar.style.background=pct>=95?'#f45e72':pct>=80?'#f4b94e':'#3aabec';}}}catch{}
 try{const r=await window.EFDBAuth.request('/storage-usage',{});el=root();if(!el)return;
 const sup=r.supabase||{};if(sup.status==='connected'){
 el.querySelector('#lspdDatabase').textContent=fmt(sup.database_bytes);
 el.querySelector('#lspdDatabaseNote').textContent='Actual database size · Provider plan limit not available';
 el.querySelector('#lspdFiles').textContent=fmt(sup.file_storage_bytes);
 el.querySelector('#lspdFilesNote').textContent=`${Number(sup.file_count||0).toLocaleString()} stored objects · Provider plan limit not available`;
 }else for(const [id,defaultText] of [['lspdDatabase','Database'],['lspdFiles','File storage']]){el.querySelector('#'+id).textContent='Not connected';el.querySelector('#'+id+'Note').textContent=sup.message||defaultText+' metrics unavailable';}
 const cf=r.cloudflare||{};el.querySelector('#lspdCloudflare').textContent=cf.status==='connected'?Number(cf.requests_24h||0).toLocaleString()+' requests':'Not connected';el.querySelector('#lspdCloudflareNote').textContent=cf.status==='connected'?'Last 24 hours · Account-wide Workers · No quota available':cf.message||'Add CF_ACCOUNT_ID and CF_API_TOKEN as Worker secrets';
 el.querySelector('#lspdStorageUpdated').textContent='Cloud figures checked '+new Date(r.checked_at).toLocaleString();
 }catch(err){el=root();if(el)el.querySelector('#lspdStorageUpdated').textContent='Could not load usage: '+err.message;}
}
let loading=false;
async function mount(){if(loading||root()||!window.EFDBAuth?.loggedIn)return;
 const host=document.getElementById('extraContent');if(!host||document.getElementById('extraTitle')?.textContent?.trim().toLowerCase()!=='settings')return;
 loading=true;try{
 // Do not display even the dashboard to a role without the server-side permission.
 const initial=await window.EFDBAuth.request('/storage-usage',{});
 if(document.getElementById('extraTitle')?.textContent?.trim().toLowerCase()!=='settings'||root())return;
 const section=document.createElement('section');section.id='lspdStorage';section.className='lspd-storage';
 section.innerHTML=`<div class="lspd-storage-head"><div><h2>Storage &amp; Usage</h2><p>Read-only usage statistics · Cloud plan limits are not automatically available</p></div><button type="button" id="lspdStorageRefresh">Refresh</button></div><div class="lspd-storage-grid">${tile('Supabase Database','lspdDatabase','Database usage')}${tile('Supabase File Storage','lspdFiles','Stored object usage')}${tile('Cloudflare Workers','lspdCloudflare','Requests in the last 24 hours')}${tile('Browser Storage','lspdLocal','This device only')}</div><div class="lspd-storage-bottom"><article class="lspd-storage-panel"><h3>Local Data Breakdown</h3><div id="lspdStorageRows"></div></article><article class="lspd-storage-panel"><h3>Limits &amp; Warnings</h3><p>80% warning / 95% critical applies only where a real quota is available. Cloud plan quotas are not reported here; no invented percentages are displayed.</p><p><a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer">Supabase Dashboard</a> · <a href="https://dash.cloudflare.com/" target="_blank" rel="noopener noreferrer">Cloudflare Dashboard</a></p><small id="lspdStorageUpdated"></small></article></div>`;
 host.prepend(section);section.querySelector('#lspdStorageRefresh').addEventListener('click',refresh);
 // Refresh obtains fresh server-side data; initial authorization already checked.
 await refresh();
 }catch(e){if(e.message!=='Forbidden')console.warn('Storage dashboard:',e.message);}finally{loading=false;}}
 document.addEventListener('click',e=>{if(e.target.closest('[data-section="settings"],#efHeaderAccountToggle')){setTimeout(mount,180);setTimeout(mount,550);}});
 const host=document.getElementById('extraContent');if(host)new MutationObserver(()=>{if(!root()&&document.getElementById('extraTitle')?.textContent?.trim().toLowerCase()==='settings')queueMicrotask(mount);}).observe(host,{childList:true});
 window.addEventListener('efdb-auth-login',()=>setTimeout(mount,250));setTimeout(mount,500);
})();
