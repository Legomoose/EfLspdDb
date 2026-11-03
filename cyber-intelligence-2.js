/* Cyber Intelligence 2.1 — additive website presentation. Do not mutate saved pins/cases, database tables or realtime endpoints. */
(()=>{'use strict';
const KEY='eflspddb_ui_preferences_v1';
let p={};try{p=JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch{}
if(!p.theme||p.theme==='classic'){p.theme='cyber';try{localStorage.setItem(KEY,JSON.stringify(p))}catch{}}
document.documentElement.setAttribute('data-ef-theme',p.theme);
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const photo=name=>'assets/cyber2/'+name;
const dashboardGallery=['cruiser.webp','crime-scene.webp','forensic.webp','interrogation.webp','operations.webp','warehouse.webp','gang-cover.webp','store.webp','harbour.webp','scene-cover.webp'];
function listCaseFiles(){try{return window.EFCaseFiles?.list?.()||[]}catch{return []}}
function syncThemeSelector(){
 const sel=$('cyberThemeSelect'); if(!sel) return;
 [...sel.querySelectorAll('option')].forEach(opt=>{if(opt.value==='classic')opt.remove()});
 if(sel.value==='classic'||!sel.value) sel.value='cyber';
 sel.addEventListener('change',()=>{let prefs={};try{prefs=JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch{};prefs.theme=sel.value;localStorage.setItem(KEY,JSON.stringify(prefs));document.documentElement.setAttribute('data-ef-theme',sel.value);});
 new MutationObserver(()=>{const v=document.documentElement.getAttribute('data-ef-theme');if(v&&v!=='classic'&&v!==sel.value)sel.value=v}).observe(document.documentElement,{attributes:true,attributeFilter:['data-ef-theme']});
}
function syncLayoutMode(){
 const mapView=$('mapView');
 const onMap=!!mapView && !mapView.classList.contains('hidden'); if(!onMap)document.body.classList.remove('cyber-map-drawer-open');
 document.body.classList.toggle('cyber-map-mode',onMap);
 document.body.classList.toggle('cyber-nonmap-mode',!onMap);
 const btn=$('cyberMapControlsToggle');
 if(btn) btn.setAttribute('aria-pressed', String(!!document.querySelector('.workspace')?.classList.contains('left-collapsed')));
}
function enhanceMapToolbar(){
 const toolbar=document.querySelector('.maptoolbar');
 if(!toolbar || $('cyberMapControlsToggle')) return;
 const btn=document.createElement('button');
 btn.type='button'; btn.id='cyberMapControlsToggle';
 btn.innerHTML='<i class="fa-solid fa-sliders"></i> Pins & Filters';
 btn.addEventListener('click',()=>{document.body.classList.toggle('cyber-map-drawer-open');btn.setAttribute('aria-expanded',String(document.body.classList.contains('cyber-map-drawer-open')));setTimeout(()=>window.dispatchEvent(new Event('resize')),90)});
 toolbar.appendChild(btn);
}
function initCaseToolbar(){
 const view=$('recordsView'); const pagehead=view?.querySelector('.pagehead'); const tbody=$('recordsBody');
 if(!view||!pagehead||!tbody) return;
 if(!$('cyberCaseToolbar')){
  const bar=document.createElement('div');
  bar.id='cyberCaseToolbar'; bar.className='cyber-case-toolbar';
  bar.innerHTML='<div class="cyber-case-search"><i class="fa-solid fa-magnifying-glass"></i><input id="cyberCaseSearch" type="search" placeholder="Search case number, location or detective"></div><label><span>Status</span><select id="cyberCaseStatus"><option value="">All</option><option value="Open">Open</option><option value="Active">Active</option><option value="Closed">Closed</option><option value="Cold">Cold</option></select></label>';
  pagehead.insertAdjacentElement('afterend',bar);
  const run=()=>{
   const q=( $('cyberCaseSearch')?.value || '' ).trim().toLowerCase();
   const st=( $('cyberCaseStatus')?.value || '' ).trim().toLowerCase();
   [...tbody.querySelectorAll('tr')].forEach(tr=>{
    const status=(tr.querySelector('.status-tag')?.textContent||'').trim().toLowerCase();
    const text=(tr.textContent||'').toLowerCase();
    const show=(!q||text.includes(q))&&(!st||status===st);
    tr.style.display=show?'':'none';
   });
  };
  bar.addEventListener('input',run); bar.addEventListener('change',run);
 }
 const btn=pagehead.querySelector('#addRecordBtn');
 if(btn) btn.innerHTML='＋ New Investigation';
 const head=pagehead.querySelector('h2');
 if(head) head.textContent='INVESTIGATION CASES';
 [...tbody.querySelectorAll('tr button[data-select]')].forEach(b=>b.classList.add('ef-case-number-btn'));
}
function enhanceDocumentsView(){
 const title=$('extraTitle'); const content=$('extraContent');
 if(!title||!content) return;
 const isDocs=(title.textContent||'').trim().toLowerCase()==='department documents';
 document.body.classList.toggle('cyber-documents-view',isDocs);
 content.querySelector('#cyberDocIntro')?.remove();
 if(isDocs){
  const intro=document.createElement('div');
  intro.id='cyberDocIntro'; intro.className='cyber-doc-intro';
  intro.innerHTML='<strong>Department Documents</strong><span>Shared SOPs, forms and references. Existing Google permissions still control access to the linked files.</span>';
  content.prepend(intro);
 }
}
function initSectionObservers(){
 const title=$('extraTitle'); if(title){new MutationObserver(()=>{enhanceDocumentsView();setTimeout(syncLayoutMode,20)}).observe(title,{childList:true,subtree:true,characterData:true});}
 ['mapView','recordsView','extraView','cyberDashboard'].forEach(id=>{const el=$(id); if(el) new MutationObserver(syncLayoutMode).observe(el,{attributes:true,attributeFilter:['class']});});
 const body=$('recordsBody'); if(body) new MutationObserver(initCaseToolbar).observe(body,{childList:true,subtree:true});
}
function renderSectionArt(){
 const extra=$('extraView'),titleEl=$('extraTitle'); if(!extra||!titleEl) return;
 const sectionArt={GANGS:['gang-cover.webp','Gang Intelligence'],VEHICLE:['port-cover.webp','Vehicle Intelligence'],CRIMINAL:['forensic.webp','Criminal Items'],CONTACTS:['interrogation.webp','Contacts'],PERSONNEL:['operations.webp','Personnel Directory'],DOCUMENT:['operations-hq.webp','Department Documents'],REPORTS:['crime-scene.webp','Reports'],SETTINGS:['operations-hq.webp','Administration']};
 const text=(titleEl.textContent||'').trim().toUpperCase(); const found=Object.entries(sectionArt).find(([key])=>text.includes(key));
 let banner=$('cyberSectionBanner'); if(!found){banner?.remove(); return}
 if(!banner){banner=document.createElement('div');banner.id='cyberSectionBanner';banner.className='cyber-section-banner';titleEl.insertAdjacentElement('afterend',banner)}
 banner.innerHTML=`<img src="${photo(found[1][0])}" alt="${esc(found[1][1])} background">`;
}
function initSidebarArt(){
 const inner=document.querySelector('.leftpanel .panel-inner');
 if(inner&&!inner.querySelector('.cyber-sidebar-art')){
  const box=document.createElement('div'); box.className='cyber-sidebar-art';
  box.innerHTML=`<img src="${photo('sidebar-police.webp')}" alt="Los Santos Police night patrol"><span>SERVING · PROTECTING · OUR COMMUNITY</span>`;
  inner.append(box);
 }
}
function initCaseEditorCover(){
 const caseEditor=$('caseEditor'); if(!caseEditor) return;
 const dialog=caseEditor.querySelector('.ef-dialog'),head=caseEditor.querySelector('.ef-dialog-head'); if(!dialog||!head||caseEditor.querySelector('.cyber-case-cover')) return;
 const cover=document.createElement('div'); cover.className='cyber-case-cover'; cover.innerHTML=`<img alt="Investigation cover photograph" src="${photo('case-cover.webp')}">`;
 head.insertAdjacentElement('afterend',cover);
 function updateCover(){if(caseEditor.classList.contains('hidden'))return; const img=$('casePhotoGallery')?.querySelector('img'); cover.querySelector('img').src=img?.src||photo('case-cover.webp')}
 new MutationObserver(updateCover).observe(caseEditor,{attributes:true,attributeFilter:['class']});
}
function initDashboardCarousel(images){
 clearInterval(window.__efCyberCarousel||0);
 const root=$('cyberFeatureCarousel'); const img=$('cyberFeatureImage'); const dots=$('cyberFeatureDots');
 if(!root||!img||!dots||!images.length) return;
 let index=0;
 const draw=()=>{img.src=images[index]; dots.querySelectorAll('button').forEach((b,i)=>b.classList.toggle('active',i===index));};
 dots.innerHTML=images.map((_,i)=>`<button type="button" aria-label="Show image ${i+1}" data-i="${i}" class="${i===0?'active':''}"></button>`).join('');
 dots.onclick=e=>{const b=e.target.closest('button[data-i]'); if(!b) return; index=Number(b.dataset.i)||0; draw();};
 root.onclick=e=>{if(e.target.closest('#cyberFeatureDots')) return; index=(index+1)%images.length; draw();};
 draw(); window.__efCyberCarousel=setInterval(()=>{index=(index+1)%images.length; draw();},10000);
}
function drawDashboard(){
 const el=$('cyberDashboard'); if(!el) return;
 const files=listCaseFiles();
 const active=files.filter(f=>/active|pending|open/i.test(f.status||''));
 const evidenceCount=files.reduce((n,f)=>n+(f.photos?.length||0)+(f.videos?.length||0),0);
 const recent=[...files].sort((a,b)=>new Date(b.updated||0)-new Date(a.updated||0)).slice(0,5);
 const first=active[0]||recent[0];
 const title=first?.title||'Your next investigation begins here';
 const gallery=[...(first?.photos?.[0]?.data?[first.photos[0].data]:[]),...dashboardGallery.map(photo)];
 const thumbs=[['crime-scene.webp','Crime Scene'],['forensic.webp','Forensic Evidence'],['interrogation.webp','Interview Room'],['operations.webp','Intelligence'],['store.webp','Storefront'],['harbour.webp','Harbour']];
 el.innerHTML=`<p class="cyber-breadcrumb">⌂ / Intelligence Overview</p><div class="cyber-page-heading"><div><h1>Detective Bureau Dashboard</h1><p>Live overview of your existing investigations and intelligence records.</p></div><button class="cyber-action" data-cyber-action="new-case">＋ New Investigation</button></div>
 <div class="cyber-stats"><div class="cyber-stat"><small>Active Investigations</small><strong>${active.length}</strong></div><div class="cyber-stat"><small>Case Attachments</small><strong>${evidenceCount}</strong></div><div class="cyber-stat"><small>Case Files</small><strong>${files.length}</strong></div><div class="cyber-stat"><small>Closed Investigations</small><strong>${files.filter(f=>String(f.status).toLowerCase()==='closed').length}</strong></div></div>
 <article class="cyber-panel cyber-feature"><div class="cyber-panel-head">★ Featured Investigation <button data-cyber-action="cases">View All →</button></div><div class="cyber-feature-carousel" id="cyberFeatureCarousel"><img id="cyberFeatureImage" alt="Cinematic investigation cover" src="${esc(gallery[0])}"><div class="cyber-carousel-dots" id="cyberFeatureDots"></div></div><div class="cyber-feature-copy"><small>${esc(first?.number||'LSPD DETECTIVE BUREAU')}</small><strong>${esc(title)}</strong><p>${first?esc((first.detective||'Unassigned')+' · '+(first.status||'Active')):'Create an investigation to begin linking your detectives, reports, evidence and map pins.'}</p><button data-cyber-action="${first?'open-case':'new-case'}" ${first?`data-id="${esc(first.id)}"`:''}>${first?'Open case file →':'Create case →'}</button></div></article>
 <div class="cyber-lower"><article class="cyber-panel"><div class="cyber-panel-head">▣ Recent Cases <button data-cyber-action="cases">View All →</button></div><div class="cyber-content">${recent.length?recent.map(f=>`<button class="cyber-case-row" data-cyber-action="open-case" data-id="${esc(f.id)}"><span>${esc(f.number||'Case')} — ${esc(f.title||'Untitled')}</span><small>${esc(f.status||'')}</small></button>`).join(''):'<p>No investigations yet. Existing map pins are not treated as cases.</p>'}</div></article><article class="cyber-panel"><div class="cyber-panel-head">▣ Intelligence Imagery <button data-cyber-action="items">Criminal Items →</button></div><div class="cyber-content cyber-media-grid">${thumbs.slice(0,4).map(([im,txt])=>`<button data-cyber-action="items"><img alt="${txt}" src="${photo(im)}"><span>${txt}</span></button>`).join('')}</div></article><article class="cyber-panel"><div class="cyber-panel-head">◷ Intelligence Links <button data-cyber-action="map">Open Map →</button></div><div class="cyber-timeline"><p>Satellite map & postals</p><p>Gang intelligence profiles</p><p>Vehicle and criminal item records</p><p>Existing accounts and permissions remain in place</p></div></article></div>
 <div class="cyber-scene-gallery">${[['scene-cover.webp','Investigations','cases'],['gang-cover.webp','Gang intelligence','gangs'],['port-cover.webp','Vehicle intelligence','vehicles']].map(([im,cap,target])=>`<button type="button" class="cyber-panel" data-cyber-action="${target}"><img src="${photo(im)}" alt="${cap}"><span>${cap} →</span></button>`).join('')}</div>`;
 initDashboardCarousel(gallery.slice(0,10));
}
function boot(){
 syncThemeSelector();
 enhanceMapToolbar();
 initSidebarArt();
 initCaseEditorCover();
 initCaseToolbar();
 initSectionObservers();
 const dash=$('cyberDashboard'); const navigation=[...document.querySelectorAll('.cyber-topnav button')];
 if(!dash||!navigation.length) return;
 function navigate(sec){
  if(sec==='dashboard'){
   document.querySelectorAll('#mapView,#recordsView,#extraView').forEach(x=>x.classList.add('hidden')); dash.classList.remove('hidden'); drawDashboard();
   navigation.forEach(b=>b.classList.toggle('active',b.dataset.cyberSection==='dashboard')); syncLayoutMode(); return;
  }
  dash.classList.add('hidden');
  const matching=[...document.querySelectorAll('.ef-primary-navigation [data-section]')].find(x=>x.dataset.section===sec);
  if(matching) matching.click();
  else { const original=document.querySelector(`[data-section="${sec}"]`); if(original) original.click(); else {console.warn('Missing section',sec);return;} }
  navigation.forEach(b=>b.classList.toggle('active',b.dataset.cyberSection===sec));
  if(sec==='map') setTimeout(()=>{try{window.EFDBMap?.invalidateSize?.()}catch{}; window.dispatchEvent(new Event('resize')); syncLayoutMode();},130);
  setTimeout(()=>{initCaseToolbar(); enhanceDocumentsView(); renderSectionArt(); syncLayoutMode();},150);
 }
 navigation.forEach(b=>b.addEventListener('click',()=>navigate(b.dataset.cyberSection)));
 document.querySelectorAll('.ef-primary-navigation [data-section], .intel-topnav [data-section]').forEach(b=>b.addEventListener('click',()=>{dash.classList.add('hidden'); navigation.forEach(n=>n.classList.toggle('active',n.dataset.cyberSection===b.dataset.section)); setTimeout(()=>{initCaseToolbar(); enhanceDocumentsView(); renderSectionArt(); syncLayoutMode();},120);}));
 $('efHeaderSearch')?.addEventListener('keydown',e=>{if(e.key==='Enter'){navigate('cases'); const search=$('cyberCaseSearch'); if(search){search.value=$('efHeaderSearch').value; search.dispatchEvent(new Event('input',{bubbles:true}))}}});
 dash.addEventListener('click',e=>{const b=e.target.closest('[data-cyber-action]'); if(!b) return; const action=b.dataset.cyberAction; if(action==='new-case'){navigate('cases'); window.EFCaseFiles?.create?.(); return} if(['cases','map','gangs','vehicles','items','contacts'].includes(action)){navigate(action); return} if(action==='open-case'){navigate('cases'); window.EFCaseFiles?.open?.(b.dataset.id); return}});
 const gate=$('accessGate'); let landed=false; function homeAfterLogin(){if(landed||!gate||!gate.classList.contains('hidden'))return; landed=true; navigate('dashboard')}
 if(gate) new MutationObserver(homeAfterLogin).observe(gate,{attributes:true,attributeFilter:['class']}); if(gate?.classList.contains('hidden')) homeAfterLogin();
 const title=$('extraTitle'); if(title) new MutationObserver(renderSectionArt).observe(title,{childList:true,subtree:true});
 renderSectionArt(); enhanceDocumentsView(); syncLayoutMode(); drawDashboard();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot); else boot();
})();
