/* Phase 8G: additive fixes, no data migration or destructive actions. */
(()=>{'use strict';
const $=s=>document.querySelector(s), esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const get=(k,def=[])=>{try{const v=JSON.parse(localStorage.getItem(k));return Array.isArray(v)?v:def}catch{return def}};
const canCommand=()=>['owner','director'].includes(window.EFDBAuth?.user?.role);
const remote=(dataset,action,extra={})=>window.EFDBAuth.request('/live-records',{dataset,action,...extra});
// Production branding: LSPD DB in the original top-left header; search in sidebar.
const identity=$('.ef-header-identity'),brand=$('.ef-brand'),headerSearch=$('.ef-header-search');
if(headerSearch)headerSearch.remove();
if(identity){identity.innerHTML='<img src="assets/lspd-logo.png" alt="LSPD shield"><div><strong>LSPD DB</strong><small>INTELLIGENCE MAP</small></div>';}
if(brand){brand.remove();}
const panel=$('.leftpanel .panel-inner');
if(panel){const search=document.createElement('button');search.type='button';search.className='ef8g-sidebar-search';search.innerHTML='<i class="fa-solid fa-magnifying-glass"></i><span>Search database...</span><kbd>Ctrl K</kbd>';panel.prepend(search);search.addEventListener('click',openSearch);}
// One searchable dialog: clicking a result navigates to its existing section/editor.
function openSearch(){document.getElementById('ef8gSearchOverlay')?.remove();const o=document.createElement('div');o.id='ef8gSearchOverlay';o.className='ef8g-overlay';o.innerHTML='<div class="ef8g-dialog" role="dialog" aria-modal="true" aria-label="Search database"><div class="ef8g-search-head"><i class="fa-solid fa-magnifying-glass"></i><input id="ef8gQuery" placeholder="Search cases, detectives, gangs, contacts, vehicles and locations..." autocomplete="off"><button id="ef8gClose" aria-label="Close search">×</button></div><div id="ef8gResults" class="ef8g-results"></div></div>';document.body.append(o);o.onclick=e=>{if(e.target===o)o.remove()};$('#ef8gClose').onclick=()=>o.remove();const input=$('#ef8gQuery');input.oninput=draw;input.onkeydown=e=>{if(e.key==='Escape')o.remove();if(e.key==='Enter')$('#ef8gResults button')?.click()};input.focus();draw();
 function draw(){const q=input.value.trim().toLowerCase(),results=$('#ef8gResults');if(!q){results.textContent='Type to search your database.';return}const items=[];
 const add=(kind,label,details,open)=>{if([label,details].join(' ').toLowerCase().includes(q))items.push({kind,label,details,open})};
 (window.EFCaseFiles?.list()||[]).forEach(c=>add('Case',c.number||c.title,[c.title,c.detective,c.location,c.suspect].join(' · '),()=>window.EFCaseFiles.open(c.id)));
 get('eflspddb_detective_profiles_v1').forEach(p=>add('Detective',p.name,[p.rank,p.badge,p.callsign].join(' · '),()=>window.showSection?.('directory')));
 get('eflspddb_high_command_v1').forEach(p=>add('High Command',p.name,[p.rank,p.badge,p.callsign].join(' · '),()=>$('.ef-primary-navigation [data-section="high-command"]')?.click()));
 const db=window.database;for(const [section,kind] of [['gangs','Gang'],['contacts','Contact'],['vehicles','Vehicle']]){const rows=Array.isArray(db?.[section])?db[section]:[];rows.forEach(r=>add(kind,r.name||r.title||r.plate||'Record',[r.description,r.location,r.alias,r.plate].join(' · '),()=>window.showSection?.(section)))}
 get('eflspddb_contacts_v1').forEach(c=>add('Contact',c.name,[c.alias,c.location,c.gang].join(' · '),()=>window.showSection?.('contacts')));
 const matches=items.slice(0,40);results.replaceChildren();if(!matches.length){results.textContent='No matching records found in this browser.';return}for(const r of matches){const b=document.createElement('button');b.type='button';b.innerHTML='<strong>'+esc(r.label)+'</strong><small>'+esc(r.kind+' · '+r.details)+'</small>';b.onclick=()=>{o.remove();r.open()};results.append(b)}}}
document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();openSearch()}if(e.key==='Escape')$('#ef8gSearchOverlay')?.remove()});
// Reports are existing case files. Do not delete or migrate reports or change case IDs.
const reportsButton=$('.ef-primary-navigation [data-section="reports"]');if(reportsButton)reportsButton.remove();
function mountReports(){const view=$('#recordsView');if(!view)return;let area=$('#ef8gReports');if(!area){area=document.createElement('section');area.id='ef8gReports';area.className='db-card';view.append(area)}const files=window.EFCaseFiles?.list()||[];area.innerHTML='<h3>CASE REPORTS</h3><p>Reports are managed within their investigation cases. Existing records have not been moved or deleted.</p><div class="ef8g-report-list">'+(files.map(f=>'<button type="button" data-case="'+esc(f.id)+'"><strong>'+esc(f.number||'Case')+'</strong> '+esc(f.title||'')+'</button>').join('')||'<p>No case reports yet.</p>')+'</div>';area.querySelectorAll('[data-case]').forEach(b=>b.onclick=()=>window.EFCaseFiles?.open(b.dataset.case))}
// Case Reports duplicate panel disabled; reports live inside each case.
// Account directory bridge. Idempotent matching by stable account id, then badge, then name.
const PROFILE_KEY='eflspddb_detective_profiles_v1';
function syncAccounts(accounts){
 if(!Array.isArray(accounts))return;
 const rows=get(PROFILE_KEY);
 const ids=new Set(accounts.map(a=>a.id).filter(Boolean));
 const names=new Set(accounts.map(a=>String(a.display_name||'').trim().toLowerCase()).filter(Boolean));
 // Account-backed profiles not returned by the authoritative account list are stale.
 const clean=rows.filter(p=>{
   if(p.account_id||p.accountId)return ids.has(p.account_id||p.accountId);
   // Do not keep orphaned auto-generated duplicates after a real account exists.
   return !names.has(String(p.name||'').trim().toLowerCase());
 });
 for(const a of accounts){
   if(!a?.id||!a.display_name)continue;
   let entry=clean.find(p=>(p.account_id||p.accountId)===a.id)||
     rows.find(p=>!p.account_id&&!p.accountId&&a.badge_number&&p.badge===a.badge_number)||
     rows.find(p=>!p.account_id&&!p.accountId&&p.name?.trim().toLowerCase()===a.display_name.trim().toLowerCase())||{};
   const profile={...entry,account_id:a.id,accountId:a.id,name:a.display_name,
     rank:(a.role||'detective').replaceAll('_',' '),role:a.role,
     badge:a.badge_number||'',callsign:a.callsign||'',
     photo:a.profile_photo_path||'',active:a.active!==false};
   const idx=clean.findIndex(p=>(p.account_id||p.accountId)===a.id);
   if(idx>=0)clean[idx]=profile;else clean.push(profile);
 }
 try{localStorage.setItem(PROFILE_KEY,JSON.stringify(clean));
   window.EFCaseFiles?.setRoster(clean.filter(p=>p.active!==false&&p.role!=='high_command').map(p=>p.name));
 }catch(e){console.warn('Directory sync could not save',e)}
}

window.EF8GSyncAccounts=syncAccounts;
async function loadAccounts(){if(!window.EFDBAuth?.loggedIn)return;try{const r=await window.EFDBAuth.request('/accounts',{action:'list'});syncAccounts(r.accounts||[])}catch{/* Account list may be restricted to administrators. */}}
window.addEventListener('efdb-auth-login',loadAccounts);
$('.ef-primary-navigation [data-section="directory"]')?.addEventListener('click',()=>{loadAccounts().then(()=>{if(typeof window.renderExtra==='function'&&$('#extraTitle')?.textContent==='DETECTIVE DIRECTORY')window.renderExtra('directory')})});
// High Command uses the existing authenticated live-records endpoint. No silent local upload.
const HC_KEY='eflspddb_high_command_v1';let hcRecords=[],hcOnline=false,hcError='';
async function showHighCommand(){const content=$('#extraContent');if(!content)return;$('#mapView')?.classList.add('hidden');$('#recordsView')?.classList.add('hidden');$('#extraView')?.classList.remove('hidden');$('#extraTitle').textContent='HIGH COMMAND';$('#addEntryBtn').style.display='none';hcError='';hcOnline=false;
 try{if(!window.EFDBAuth?.loggedIn)throw Error('Sign in to load the shared roster');const r=await remote('high_command','list');hcRecords=(r.records||[]).filter(x=>!x.deleted_at);hcOnline=true}catch(e){hcError=e.message;hcRecords=[]}drawHighCommand()}
function drawHighCommand(){const content=$('#extraContent');if(!content||$('#extraTitle')?.textContent!=='HIGH COMMAND')return;const canWrite=hcOnline&&canCommand();const local=get(HC_KEY);const rows=hcOnline?hcRecords.map(r=>({...r.body,_id:r.record_id,_version:r.version})):local.map(x=>({...x,_offline:true}));content.innerHTML='<div class="db-card ef-hc-page"><div class="ef-heading-row"><div><h3>HIGH COMMAND ROSTER</h3><p>'+(hcOnline?'Shared roster · Supabase-backed':'Shared roster unavailable · browser-only entries shown for reference')+'</p></div>'+(canWrite?'<button class="blue" id="ef8gAddHC">+ Add Member</button>':'')+'</div>'+(hcError?'<p class="ef-hc-warning">'+esc(hcError)+' — no shared changes can be made.</p>':'')+'<div class="ef-hc-list">'+(rows.map((m,i)=>'<div class="ef-hc-member"><div class="ef-hc-avatar"><i class="fa-solid fa-shield-halved"></i></div><div class="ef-hc-details"><strong>'+esc(m.name)+'</strong><span>'+esc(m.rank||'Rank not set')+' · '+esc(m.callsign||'No callsign')+'</span><small>Badge: '+esc(m.badge||'—')+'</small>'+(m.notes?'<p>'+esc(m.notes)+'</p>':'')+'</div>'+(canWrite?'<div class="ef-hc-controls"><button data-hc-edit="'+i+'">Edit</button><button data-hc-delete="'+i+'">Remove</button></div>':'')+'</div>').join('')||'<p>No shared High Command members found.</p>')+'</div></div>';
 $('#ef8gAddHC')?.addEventListener('click',()=>editHC());content.querySelectorAll('[data-hc-edit]').forEach(b=>b.onclick=()=>editHC(rows[Number(b.dataset.hcEdit)]));content.querySelectorAll('[data-hc-delete]').forEach(b=>b.onclick=()=>deleteHC(rows[Number(b.dataset.hcDelete)]));}
function editHC(entry={}){if(!hcOnline||!canCommand())return;const o=document.createElement('div');o.className='ef-hc-overlay';o.innerHTML='<form class="ef-hc-form"><div class="ef-hc-formtop"><h2>'+(entry._id?'Edit':'Add')+' High Command</h2><button type="button" data-close>×</button></div>'+[['name','Name'],['rank','Rank'],['callsign','Callsign'],['badge','Badge']].map(([k,label])=>'<label>'+label+'<input name="'+k+'" maxlength="90" '+(k==='name'?'required':'')+' value="'+esc(entry[k])+'"></label>').join('')+'<label>Notes<textarea name="notes" rows="3">'+esc(entry.notes)+'</textarea></label><p id="ef8gHCError" role="alert"></p><div class="ef-hc-actions"><button type="button" data-close>Cancel</button><button class="blue" type="submit">Save Member</button></div></form>';document.body.append(o);o.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>o.remove());o.querySelector('form').onsubmit=async e=>{e.preventDefault();const data=Object.fromEntries(new FormData(e.currentTarget));if(!data.name.trim())return;const submit=o.querySelector('[type="submit"]');submit.disabled=true;try{if(entry._id)await remote('high_command','update',{id:entry._id,version:entry._version,body:data});else await remote('high_command','create',{id:'hc-'+(crypto.randomUUID?.()||Date.now()),body:data});o.remove();await showHighCommand()}catch(err){o.querySelector('#ef8gHCError').textContent='Not saved: '+err.message;submit.disabled=false}}}
async function deleteHC(entry){if(!hcOnline||!canCommand()||!confirm('Remove this High Command member from the shared roster?'))return;try{await remote('high_command','delete',{id:entry._id,version:entry._version});await showHighCommand()}catch(e){alert('Not removed: '+e.message)}}
// Capture navigation before original browser-local High Command handler.
const hcButton=$('.ef-primary-navigation [data-section="high-command"]');if(hcButton)hcButton.addEventListener('click',e=>{e.stopImmediatePropagation();document.querySelectorAll('.ef-primary-navigation button').forEach(b=>b.classList.remove('active'));hcButton.classList.add('active');showHighCommand()},true);
})();

// Remove legacy reports panel after section redraws.
