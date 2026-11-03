/* Cyber Intelligence 2.0 — additive website presentation. Do not mutate saved pins/cases, database tables or realtime endpoints. */
(()=>{'use strict';
const KEY='eflspddb_ui_preferences_v1';
let p={};try{p=JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch{}
if(!p.theme){p.theme='cyber';try{localStorage.setItem(KEY,JSON.stringify(p))}catch{}}
document.documentElement.setAttribute('data-ef-theme',p.theme);
const $=id=>document.getElementById(id);
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const photo=name=>'assets/cyber2/'+name;
function boot(){
 const sel=$('cyberThemeSelect'),dash=$('cyberDashboard');if(!sel||!dash)return;
 sel.value=document.documentElement.getAttribute('data-ef-theme')||'cyber';
 sel.addEventListener('change',()=>{let prefs={};try{prefs=JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch{};prefs.theme=sel.value;localStorage.setItem(KEY,JSON.stringify(prefs));document.documentElement.setAttribute('data-ef-theme',sel.value);});
 new MutationObserver(()=>{const v=document.documentElement.getAttribute('data-ef-theme');if(v&&v!==sel.value)sel.value=v}).observe(document.documentElement,{attributes:true,attributeFilter:['data-ef-theme']});
 const navigation=[...document.querySelectorAll('.cyber-topnav button')];
 function navigate(sec){
  if(sec==='dashboard'){
   document.querySelectorAll('#mapView,#recordsView,#extraView').forEach(x=>x.classList.add('hidden'));
   dash.classList.remove('hidden');drawDashboard();
   navigation.forEach(b=>b.classList.toggle('active',b.dataset.cyberSection==='dashboard'));
   return;
  }
  dash.classList.add('hidden');
  const matching=[...document.querySelectorAll('.ef-primary-navigation [data-section]')].find(x=>x.dataset.section===sec);
  if(matching)matching.click();else if(sec==='settings'){
   const s=document.querySelector('[data-section="settings"]');if(s)s.click();else navigate('map');
  }
  navigation.forEach(b=>b.classList.toggle('active',b.dataset.cyberSection===sec));
  if(sec==='map')setTimeout(()=>{try{window.EFDBMap?.invalidateSize?.()}catch{};window.dispatchEvent(new Event('resize'))},130);
 }
 navigation.forEach(b=>b.addEventListener('click',()=>navigate(b.dataset.cyberSection)));
 // Original handlers remain authoritative. Navigation only synchronises display state.
 document.querySelectorAll('.ef-primary-navigation [data-section], .intel-topnav [data-section]').forEach(b=>b.addEventListener('click',()=>{
  dash.classList.add('hidden');navigation.forEach(n=>n.classList.toggle('active',n.dataset.cyberSection===b.dataset.section));
 }));
 const controls=$('efHeaderSearch');if(controls){controls.addEventListener('keydown',e=>{if(e.key==='Enter'){navigate('cases');const c=$('caseFileSearch');if(c){c.value=controls.value;c.dispatchEvent(new Event('input',{bubbles:true}))}}})}
 dash.addEventListener('click',e=>{const b=e.target.closest('[data-cyber-action]');if(!b)return;
  const action=b.dataset.cyberAction;
  if(action==='new-case'){navigate('cases');window.EFCaseFiles?.create?.();return}
  if(action==='cases'||action==='map'||action==='gangs'||action==='vehicles'||action==='items'||action==='contacts'){navigate(action);return}
  if(action==='open-case'){navigate('cases');window.EFCaseFiles?.open?.(b.dataset.id);return}
 });
 // Default landing dashboard after login, while keeping the original map as a first-class workspace.
 const gate=$('accessGate');let landed=false;
 function homeAfterLogin(){if(landed||!gate?.classList.contains('hidden'))return;landed=true;navigate('dashboard')}
 new MutationObserver(homeAfterLogin).observe(gate,{attributes:true,attributeFilter:['class']});
 if(gate.classList.contains('hidden'))homeAfterLogin();
 // Section art is purely decorative: it never changes records or map layers.
 const sectionArt={GANGS:['gang-cover.webp','Gang Intelligence'],VEHICLE:['port-cover.webp','Vehicle Intelligence'],CRIMINAL:['forensic.webp','Criminal Items'],CONTACTS:['interrogation.webp','Contacts'],PERSONNEL:['operations.webp','Personnel Directory'],DOCUMENT:['operations-hq.webp','Department Documents'],REPORTS:['crime-scene.webp','Reports'],SETTINGS:['operations-hq.webp','Administration']};
 const extra=$('extraView'),titleEl=$('extraTitle');
 function updateSectionArt(){if(!extra||!titleEl)return;const text=(titleEl.textContent||'').trim().toUpperCase();const found=Object.entries(sectionArt).find(([key])=>text.includes(key));let banner=$('cyberSectionBanner');if(!found){banner?.remove();return}if(!banner){banner=document.createElement('div');banner.id='cyberSectionBanner';banner.className='cyber-section-banner';titleEl.insertAdjacentElement('afterend',banner)}banner.innerHTML=`<img src="${photo(found[1][0])}" alt="${escape(found[1][1])} background">`}
 if(titleEl)new MutationObserver(updateSectionArt).observe(titleEl,{childList:true,subtree:true});updateSectionArt();
 const caseEditor=$('caseEditor');if(caseEditor){const dialog=caseEditor.querySelector('.ef-dialog'),head=caseEditor.querySelector('.ef-dialog-head');if(dialog&&head){const cover=document.createElement('div');cover.className='cyber-case-cover';cover.innerHTML=`<img alt="Investigation cover photograph" src="${photo('case-cover.webp')}">`;head.insertAdjacentElement('afterend',cover);function updateCover(){if(caseEditor.classList.contains('hidden'))return;const imgs=$('casePhotoGallery')?.querySelector('img');cover.querySelector('img').src=imgs?.src||photo('case-cover.webp')}new MutationObserver(updateCover).observe(caseEditor,{attributes:true,attributeFilter:['class']});}}
 const inner=document.querySelector('.leftpanel .panel-inner');if(inner&&!inner.querySelector('.cyber-sidebar-art')){const box=document.createElement('div');box.className='cyber-sidebar-art';box.innerHTML=`<img src="${photo('sidebar-police.webp')}" alt="Los Santos Police night patrol"><span>SERVING · PROTECTING · OUR COMMUNITY</span>`;inner.append(box)}
 drawDashboard();
 }
function drawDashboard(){const el=$('cyberDashboard');if(!el)return;
 const files=window.EFCaseFiles?.list?.()||[];
 const active=files.filter(f=>/active|pending|open/i.test(f.status||''));
 const evidenceCount=files.reduce((n,f)=>n+(f.photos?.length||0)+(f.videos?.length||0),0);
 const recent=[...files].sort((a,b)=>new Date(b.updated||0)-new Date(a.updated||0)).slice(0,5);
 const first=active[0]||recent[0];
 const title=first?.title||'Your next investigation begins here';
 const image=first?.photos?.[0]?.data||photo('case-cover.webp');
 const thumb=[['crime-scene.webp','Crime Scene'],['forensic.webp','Forensic Evidence'],['interrogation.webp','Interview Room'],['operations.webp','Intelligence'],['store.webp','Storefront'],['harbour.webp','Harbour']];
 el.innerHTML=`<p class="cyber-breadcrumb">⌂ / Intelligence Overview</p><div class="cyber-page-heading"><div><h1>Detective Bureau Dashboard</h1><p>Live overview of your existing investigations and intelligence records.</p></div><button class="cyber-action" data-cyber-action="new-case">＋ New Investigation</button></div>
 <div class="cyber-stats"><div class="cyber-stat"><small>Active Investigations</small><strong>${active.length}</strong></div><div class="cyber-stat"><small>Case Attachments</small><strong>${evidenceCount}</strong></div><div class="cyber-stat"><small>Case Files</small><strong>${files.length}</strong></div><div class="cyber-stat"><small>Closed Investigations</small><strong>${files.filter(f=>f.status==='Closed').length}</strong></div></div>
 <article class="cyber-panel cyber-feature"><div class="cyber-panel-head">★ Featured Investigation <button data-cyber-action="cases">View All →</button></div><img alt="Cinematic investigation cover" src="${escape(image)}" onerror="this.src='${photo('case-cover.webp')}'"><div class="cyber-feature-copy"><small>${escape(first?.number||'LSPD DETECTIVE BUREAU')}</small><strong>${escape(title)}</strong><p>${first?escape((first.detective||'Unassigned')+' · '+(first.status||'Active')):'Create an investigation to begin linking your detectives, reports, evidence and map pins.'}</p><button data-cyber-action="${first?'open-case':'new-case'}" ${first?`data-id="${escape(first.id)}"`:''}>${first?'Open case file →':'Create case →'}</button></div></article>
 <div class="cyber-lower"><article class="cyber-panel"><div class="cyber-panel-head">▣ Recent Cases <button data-cyber-action="cases">View All →</button></div><div class="cyber-content">${recent.length?recent.map(f=>`<button class="cyber-case-row" data-cyber-action="open-case" data-id="${escape(f.id)}"><span>${escape(f.number||'Case')} — ${escape(f.title||'Untitled')}</span><small>${escape(f.status||'')}</small></button>`).join(''):'<p>No investigations yet. Existing map pins are not treated as cases.</p>'}</div></article><article class="cyber-panel"><div class="cyber-panel-head">▣ Intelligence Imagery <button data-cyber-action="items">Criminal Items →</button></div><div class="cyber-content cyber-media-grid">${thumb.slice(0,4).map(([im,txt])=>`<button data-cyber-action="items"><img alt="${txt}" src="${photo(im)}"><span>${txt}</span></button>`).join('')}</div></article><article class="cyber-panel"><div class="cyber-panel-head">◷ Intelligence Links <button data-cyber-action="map">Open Map →</button></div><div class="cyber-timeline"><p>Satellite map & 947 postals</p><p>Gang intelligence profiles</p><p>Vehicle and criminal item records</p><p>Existing accounts and permissions remain in place</p></div></article></div>
 <div class="cyber-scene-gallery">${[['scene-cover.webp','Investigations'],['gang-cover.webp','Gang intelligence'],['port-cover.webp','Vehicle intelligence']].map(([im,cap],i)=>`<button type="button" class="cyber-panel" data-cyber-action="${['cases','gangs','vehicles'][i]}"><img src="${photo(im)}" alt="${cap}"><span>${cap} →</span></button>`).join('')}</div>`;
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
