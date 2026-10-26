/* EFLSPDDB combined UI update. Additive only: never mutates shared records. */
(()=>{'use strict';
const KEY='eflspddb_ui_preferences_v1',ACT='eflspddb_ui_activity_v1';
const defaults={theme:'classic',density:'comfortable',font:'normal',motion:'on',widgets:['database','realtime','workers','storage'],hidden:[]};
const safeParse=(s,f)=>{try{return JSON.parse(s)||f}catch{return f}};
let pref={...defaults,...safeParse(localStorage.getItem(KEY),{})};
const persist=()=>{localStorage.setItem(KEY,JSON.stringify(pref));apply()};
function apply(){for(const [attr,val] of [['theme',pref.theme],['density',pref.density],['font',pref.font],['motion',pref.motion]])document.documentElement.setAttribute('data-ef-'+attr,val)}apply();
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const names={database:'🗄️ Database',realtime:'⚡ Realtime',workers:'☁️ Worker Requests',storage:'💾 File Storage'};
let metrics={};let lastHealth='Not checked';let lastHealthAt='';let latestNotification=[];
const actor=()=>window.EFDBAuth?.user?.name||'Current detective';
function log(action,detail){const entries=safeParse(localStorage.getItem(ACT),[]);entries.unshift({action,detail,at:new Date().toISOString(),actor:actor()});localStorage.setItem(ACT,JSON.stringify(entries.slice(0,120)));}
function getActivity(){return safeParse(localStorage.getItem(ACT),[])}
function section(){return document.getElementById('extraTitle')?.textContent?.trim().toLowerCase()==='settings'}
const root=()=>document.getElementById('extraContent');
function panels(){const host=root();return host?.querySelector('.ef7b-settings')}
function card(id,value,desc){return `<div class="ef-update-card ef-update-dashboard-card" draggable="true" data-widget="${id}"><small>${names[id]}</small><strong>${escape(value)}</strong><small>${escape(desc)}</small></div>`}
function getMetric(id){if(id==='database')return [metrics.database||'—','Supabase database size'];if(id==='workers')return [metrics.workers||'—','Last 24 hours · account-wide'];if(id==='storage')return [metrics.storage||'—','Supabase file storage'];return [window.EFDBAuth?.loggedIn?'Connected*':'Not signed in','*Authenticated; check Realtime separately']}
function content(tab){if(tab==='overview')return `<div class="ef-update-grid" id="efUpdateDashboard">${pref.widgets.filter(k=>!pref.hidden.includes(k)).map(k=>{const m=getMetric(k);return card(k,...m)}).join('')}</div><div class="ef-update-panel"><h3>🛡️ System summary</h3><p>Signed in: ${window.EFDBAuth?.loggedIn?'Yes':'No'} · Session timeout: 10 minutes · Last diagnostic: ${escape(lastHealthAt||'Not checked')}</p><p class="ef-update-note">These are display indicators, not guarantees of live database or Realtime connectivity. Use Check connection for a fresh test.</p></div>`;
if(tab==='appearance')return `<div class="ef-update-panel"><h3>🎨 Choose a theme</h3><div class="ef-update-themes">${[['classic','🔵 LSPD Classic','#10233d','#4b91f5'],['midnight','🟣 Midnight','#171328','#a78bfa'],['emerald','🟢 Emerald','#112e29','#35bd91'],['crimson','🔴 Crimson','#321923','#e66a89'],['dark','⚫ Dark Mode','#17181d','#8996e9']].map(([id,name,bg,ac])=>`<button class="ef-update-theme" type="button" data-theme="${id}" aria-pressed="${pref.theme===id}" style="background:${bg};border-color:${ac}"><b>${name}</b><span>${id===pref.theme?'✓ Selected':'Apply theme'}</span></button>`).join('')}</div></div><div class="ef-update-panel"><h3>🖥️ Display customisation</h3><p><label>Layout density <select id="efDensity"><option value="comfortable">Comfortable</option><option value="compact">Compact</option></select></label></p><p><label>Text size <select id="efFont"><option value="normal">Standard</option><option value="large">Large</option></select></label></p><p><label>Animations <select id="efMotion"><option value="on">On</option><option value="off">Off</option></select></label></p><p class="ef-update-note">Preferences are saved on this browser only; each detective can choose independently.</p><button id="efResetAppearance" type="button">Restore LSPD Classic defaults</button></div>`;
if(tab==='dashboard')return `<div class="ef-update-panel"><h3>📊 Custom dashboard</h3><p>Choose which overview cards appear and drag cards to change their order.</p>${pref.widgets.map(k=>`<label style="display:inline-flex;align-items:center;gap:7px;margin:8px 14px 8px 0"><input type="checkbox" data-widget-toggle="${k}" ${pref.hidden.includes(k)?'':'checked'}> ${names[k]}</label>`).join('')}<div class="ef-update-grid" id="efUpdateDashboard">${pref.widgets.map(k=>card(k,...getMetric(k))).join('')}</div></div>`;
if(tab==='security')return `<div class="ef-update-panel"><h3>🔐 Security & Sessions</h3><p>Automatic inactivity sign-out: <strong>10 minutes</strong>. This setting is enforced by the existing authentication system.</p><p>Use the existing Log out button below to end this session.</p></div>`;
if(tab==='database')return `<div class="ef-update-panel"><h3>🛡️ System health</h3><p>Worker and authenticated database checks; Realtime subscriptions are not independently verified by this test.</p><button id="efUpdateHealth" type="button">Check connection</button><p id="efUpdateHealthResult">${escape(lastHealth)}</p><small>Last checked: ${escape(lastHealthAt||'Never')}</small></div><div class="ef-update-panel"><h3>🗄️ Storage & usage</h3><p>Existing read-only storage statistics remain available below. Request counts cover the previous 24 hours, not this session.</p></div>`;
if(tab==='recovery')return `<div class="ef-update-panel"><h3>♻️ Recovery & retention</h3><p>Browser backup, restore and Recycle Bin controls are preserved below. A browser backup is not a complete Supabase database backup.</p><p class="ef-update-note">Permanent deletion requires confirmation through the original recovery controls.</p></div>`;
if(tab==='activity')return `<div class="ef-update-panel"><h3>📋 Recent activity</h3><p>Local UI events on this browser only. This is not a department-wide server audit log.</p><div class="ef-update-activity">${getActivity().length?getActivity().map(a=>`<div><strong>${escape(a.action)}</strong> · ${escape(a.detail)}<br><small>${escape(a.actor)} · ${escape(new Date(a.at).toLocaleString())}</small></div>`).join(''):'<p>No local activity recorded yet.</p>'}</div><button id="efActivityDownload" type="button">Export local activity</button></div>`;
return ''}
const tabs=[['overview','🏠 Overview'],['appearance','🎨 Appearance'],['dashboard','📊 Dashboard'],['security','🔐 Security'],['database','🗄️ Database'],['recovery','♻️ Recovery'],['activity','📋 Activity']];
let activeTab='overview';
function enhance(){if(!section())return;const host=panels();if(!host||host.querySelector('#efUpdateShell'))return;
 const shell=document.createElement('div');shell.id='efUpdateShell';shell.className='ef-update-shell';host.prepend(shell);
 // Existing controls are kept in the DOM with their listeners. Move sections into logical tabs.
 const original=[...host.querySelectorAll(':scope > .ef7b-grid > section, :scope > section')];
 const groups={security:[],database:[],recovery:[],activity:[],appearance:[]};
 for(const el of original){const h=el.querySelector('h3')?.textContent?.toLowerCase()||'';if(h.includes('my profile')){el.classList.add('ef-update-hidden');continue}
 if(h.includes('appearance')){el.classList.add('ef-update-hidden');continue}
 if(h.includes('backup')||h.includes('retention')||h.includes('recycle'))groups.recovery.push(el);
 else if(h.includes('security'))groups.security.push(el);
 else if(h.includes('database')||h.includes('storage')||h.includes('shared'))groups.database.push(el);
 else if(h.includes('audit'))groups.activity.push(el);
 else el.classList.add('ef-update-hidden');}
 const containers={};for(const key of Object.keys(groups)){const c=document.createElement('div');c.className='ef-update-originals';c.dataset.efGroup=key;host.appendChild(c);groups[key].forEach(el=>c.appendChild(el));containers[key]=c}
 // Obsolete migration controls are hidden, not removed. Preserve data and original JS handlers.
 for(const el of containers.database.querySelectorAll('.db-card')){const h=el.querySelector('h3')?.textContent?.toLowerCase()||'';if(h.includes('shared database setup'))el.classList.add('ef-update-hidden')}
 const oldGrid=host.querySelector(':scope > .ef7b-grid');if(oldGrid)oldGrid.classList.add('ef-update-hidden');
 function render(){shell.innerHTML=`<div class="ef-update-top"><div><h2>⚙️ SETTINGS</h2><p>LSPD Detective Bureau · Administration</p></div><button class="ef-notify-button" id="efNotificationButton" type="button">🔔 Notifications (${latestNotification.length})</button></div><div class="ef-update-tabs">${tabs.map(([id,label])=>`<button type="button" data-ef-tab="${id}" class="${id===activeTab?'ef-selected':''}">${label}</button>`).join('')}</div><div id="efUpdateBody">${content(activeTab)}</div><p class="ef-update-note">Existing accounts, data and synchronisation are unchanged.</p>`;
  for(const [key,c] of Object.entries(containers))c.classList.toggle('ef-update-hidden',activeTab!==key);
  if(activeTab==='appearance'){shell.querySelector('#efDensity').value=pref.density;shell.querySelector('#efFont').value=pref.font;shell.querySelector('#efMotion').value=pref.motion}
 }
 render();
 shell.addEventListener('click',e=>{const t=e.target.closest('button');if(!t)return;
 if(t.dataset.efTab){activeTab=t.dataset.efTab;render();return}
 if(t.dataset.theme){pref.theme=t.dataset.theme;persist();log('Appearance changed',pref.theme);render();return}
 if(t.id==='efResetAppearance'){pref={...pref,theme:'classic',density:'comfortable',font:'normal',motion:'on'};persist();render();return}
 if(t.id==='efUpdateHealth'){checkHealth(shell);return}
 if(t.id==='efActivityDownload'){download('EFLSPDDB-local-ui-activity.json',getActivity());return}
 if(t.id==='efNotificationButton'){toggleNotifications();return}
 });
 shell.addEventListener('change',e=>{const t=e.target;if(t.id==='efDensity')pref.density=t.value;else if(t.id==='efFont')pref.font=t.value;else if(t.id==='efMotion')pref.motion=t.value;else if(t.dataset.widgetToggle){pref.hidden=t.checked?pref.hidden.filter(x=>x!==t.dataset.widgetToggle):[...new Set([...pref.hidden,t.dataset.widgetToggle])]}else return;persist();if(t.dataset.widgetToggle)render()});
 let dragging='';shell.addEventListener('dragstart',e=>{dragging=e.target.closest('[data-widget]')?.dataset.widget||''});shell.addEventListener('dragover',e=>{if(e.target.closest('[data-widget]'))e.preventDefault()});shell.addEventListener('drop',e=>{const to=e.target.closest('[data-widget]')?.dataset.widget;if(!to||!dragging||to===dragging)return;e.preventDefault();pref.widgets=pref.widgets.filter(x=>x!==dragging);pref.widgets.splice(pref.widgets.indexOf(to),0,dragging);persist();render()});
 refreshMetrics();}
async function checkHealth(shell){const out=shell.querySelector('#efUpdateHealthResult');if(out)out.textContent='Checking…';try{const url='https://eflspddb-auth.danielmcmahon1995.workers.dev/health';const r=await fetch(url);if(!r.ok)throw Error('Worker HTTP '+r.status);const health=await r.json();if(!health.ok)throw Error('Unexpected Worker response');if(!window.EFDBAuth?.loggedIn)throw Error('Not signed in');await window.EFDBAuth.request('/live-records',{dataset:'contacts',action:'list'});lastHealth='Worker online · Authenticated database read successful';lastHealthAt=new Date().toLocaleString();log('System health','Connection test passed')}catch(e){lastHealth='Connection test failed: '+e.message;lastHealthAt=new Date().toLocaleString();log('System health','Connection test failed')}if(out)out.textContent=lastHealth;const small=shell.querySelector('#efUpdateHealthResult+small');if(small)small.textContent='Last checked: '+lastHealthAt}
function download(filename,obj){const url=URL.createObjectURL(new Blob([JSON.stringify(obj,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
function refreshMetrics(){const el=document.getElementById('lspdStorage');if(!el)return;const s=el.textContent||'';const mb=[...s.matchAll(/(\d+(?:\.\d+)?)\s*MB/g)].map(x=>x[0]);if(mb[0])metrics.database=mb[0];if(mb[1])metrics.storage=mb[1];const req=s.match(/([\d,]+)\s*requests/i);if(req)metrics.workers=req[1]}
function toggleNotifications(){let pop=document.getElementById('efNotificationPopover');if(!pop){pop=document.createElement('div');pop.id='efNotificationPopover';pop.className='ef-notify-pop';document.body.appendChild(pop)}pop.hidden=!pop.hidden;if(!pop.hidden){pop.innerHTML=`<h3>🔔 Notification Centre</h3><p>Local activity notices. Cross-device case assignment alerts require a dedicated backend notification feed.</p>${latestNotification.length?latestNotification.map(n=>`<p>• ${escape(n)}</p>`).join(''):'<p>No new notifications.</p>'}<button type="button" id="efDismissNotifications">Dismiss</button>`;pop.querySelector('button').onclick=()=>{latestNotification=[];pop.hidden=true}}}
// Watch only for Settings being freshly rendered; observer does not write outside the settings root.
let pending=false;const observer=new MutationObserver(()=>{if(pending)return;pending=true;queueMicrotask(()=>{pending=false;if(section()&&panels()&&!document.getElementById('efUpdateShell'))enhance()})});
function boot(){const r=root();if(r)observer.observe(r,{childList:true,subtree:false});enhance();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
window.EFLSPDDBUI={log,refreshMetrics};
})();
