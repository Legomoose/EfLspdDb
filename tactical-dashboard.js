
(()=>{'use strict';
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
const photos=['cruiser.webp','crime-scene.webp','forensic.webp','interrogation.webp','operations.webp','warehouse.webp','gang-cover.webp','store.webp','harbour.webp','scene-cover.webp'].map(n=>'assets/cyber2/'+n);
const routes=[['dashboard','fa-table-cells-large','Dashboard'],['cases','fa-folder-open','Cases'],['gangs','fa-people-group','Gangs'],['map','fa-location-dot','Map'],['vehicles','fa-car','Vehicles'],['items','fa-cube','Known Criminal Items'],['contacts','fa-address-card','Contacts'],['directory','fa-users','Personnel'],['documents','fa-file-lines','Department Documents'],['settings','fa-gear','Settings']];
let current=0,timer=null,rendering=false;
function navigate(id){document.querySelector('.cyber-topnav [data-cyber-section="'+id+'"]')?.click();setTimeout(updateActive,90)}
function updateActive(){
const section= !$('cyberDashboard')?.classList.contains('hidden')?'dashboard':document.querySelector('.cyber-topnav button.active')?.dataset.cyberSection||'dashboard';
document.querySelectorAll('.tactical-side-nav button').forEach(b=>b.classList.toggle('active',b.dataset.route===section));
document.body.classList.toggle('tactical-map',section==='map');
}
function mount(){
if(document.querySelector('.tactical-sidebar'))return;
const sidebar=document.createElement('aside');sidebar.className='tactical-sidebar';
sidebar.innerHTML='<nav class="tactical-side-nav" aria-label="Database sections">'+routes.map(([id,ico,name])=>`<button type="button" data-route="${id}"><i class="fa-solid ${ico}"></i><span>${name}</span></button>`).join('')+'</nav><div class="tactical-side-foot"><strong>LSPD DB</strong><span><b>●</b> Secure Database</span></div>';
document.querySelector('.workspace')?.prepend(sidebar);
sidebar.addEventListener('click',e=>{const b=e.target.closest('[data-route]');if(b)navigate(b.dataset.route)});
const header=document.querySelector('.ef-header')||document.querySelector('header');
if(header){header.classList.add('tactical-header');}
updateActive();
}
function getFiles(){try{return window.EFCaseFiles?.list?.()||[]}catch{return []}}
function countById(id){const e=document.querySelector(id);if(!e)return 0;return e.querySelectorAll('.ef-tile,.ef-card,.cyber-card,.record-card').length}
function makeDashboard(){
const root=$('cyberDashboard');if(!root||root.classList.contains('hidden')||rendering)return;
rendering=true;
try{
const files=getFiles(),open=files.filter(f=>!/closed|resolved/i.test(f.status||'')),closed=files.length-open.length;
const recent=[...files].sort((a,b)=>new Date(b.updated||b.updatedAt||0)-new Date(a.updated||a.updatedAt||0)).slice(0,5);
const stats=[['fa-folder-open','OPEN CASES',open.length],['fa-clipboard-check','CLOSED CASES',closed],['fa-location-dot','MAP PINS',document.querySelectorAll('.leaflet-marker-icon').length],['fa-people-group','KNOWN GANGS',countById('#extraContent')],['fa-car','TRACKED VEHICLES','—']];
root.innerHTML=`<div class="tactical-stats">${stats.map(([icon,label,num])=>`<div class="tactical-stat"><i class="fa-solid ${icon}"></i><div><small>${label}</small><strong>${num}</strong></div></div>`).join('')}</div>
<div class="tactical-main-grid"><div class="tactical-hero"><img id="tacticalHeroImage" src="${photos[0]}" alt="LSPD night patrol"><button class="tactical-arrow prev" data-slide="-1" aria-label="Previous image">❮</button><button class="tactical-arrow next" data-slide="1" aria-label="Next image">❯</button><div class="tactical-dots">${photos.map((_,i)=>`<button type="button" data-photo="${i}" class="${i===0?'active':''}" aria-label="Image ${i+1}"></button>`).join('')}</div></div>
<div class="tactical-side-panels"><article class="tactical-panel tactical-bureau"><div class="tactical-bureau-heading"><img src="assets/lspd-logo.png" alt="LSPD badge"><div><h2>DETECTIVE BUREAU</h2><small>INVESTIGATE &nbsp; • &nbsp; ANALYSE &nbsp; • &nbsp; LINK &nbsp; • &nbsp; RESOLVE</small></div></div><p>The LSPD Detective Bureau is responsible for the investigation, coordination and resolution of major and complex crimes within EverFall and the greater Los Santos area.</p></article>
<article class="tactical-panel tactical-actions"><h2><i class="fa-solid fa-bolt"></i> QUICK ACTIONS</h2><div class="tactical-action-grid">${[['fa-folder-plus','New Case','new-case'],['fa-map-pin','Add Pin','map'],['fa-car','Add Vehicle','vehicles'],['fa-user-plus','Add Contact','contacts'],['fa-cube','Add Item','items']].map(([icon,label,action])=>`<button type="button" data-action="${action}"><i class="fa-solid ${icon}"></i><span>${label}</span></button>`).join('')}</div></article></div></div>
<div class="tactical-bottom-grid"><article class="tactical-panel"><h2><i class="fa-regular fa-folder-open"></i> ACTIVE CASES <button data-action="cases">View All →</button></h2><div class="tactical-list">${open.length?open.slice(0,5).map(f=>`<button class="tactical-case-row" data-action="open-case" data-id="${esc(f.id)}"><span class="tactical-case-id">${esc(f.number||'CASE')}</span><span>${esc(f.title||'Untitled investigation')}</span><em>${esc(f.status||'Open')}</em></button>`).join(''):'<p class="tactical-empty">No active investigations yet. Create a case to get started.</p>'}</div></article>
<article class="tactical-panel"><h2><i class="fa-solid fa-wave-square"></i> RECENT ACTIVITY <button data-action="cases">View All →</button></h2><div class="tactical-list">${recent.length?recent.map(f=>`<button class="tactical-activity" data-action="open-case" data-id="${esc(f.id)}"><i class="fa-regular fa-folder"></i><span>${esc(f.number||'Case')} · ${esc(f.title||'Investigation')}</span><small>${esc(f.status||'')}</small></button>`).join(''):'<p class="tactical-empty">No case activity recorded yet.</p>'}</div></article>
<article class="tactical-panel"><h2><i class="fa-solid fa-microchip"></i> INVESTIGATION TOOLS</h2><div class="tactical-tool-grid">${[['fa-map','Map','Postals / Pins / Locations','map'],['fa-users','Gangs','Profiles / Members / Links','gangs'],['fa-address-card','Contacts','People / Affiliations','contacts'],['fa-layer-group','Intelligence','Vehicles / Items / Reports','items']].map(([icon,name,sub,action])=>`<button data-action="${action}"><i class="fa-solid ${icon}"></i><span><strong>${name}</strong><small>${sub}</small></span></button>`).join('')}</div></article></div>`;
root.querySelectorAll('[data-slide]').forEach(b=>b.addEventListener('click',()=>slide(Number(b.dataset.slide))));
root.querySelectorAll('[data-photo]').forEach(b=>b.addEventListener('click',()=>slide(Number(b.dataset.photo),true)));
root.querySelectorAll('[data-action]').forEach(b=>b.addEventListener('click',()=>{const action=b.dataset.action;if(action==='new-case'){navigate('cases');setTimeout(()=>window.EFCaseFiles?.create?.(),150)}else if(action==='open-case'){navigate('cases');setTimeout(()=>window.EFCaseFiles?.open?.(b.dataset.id),150)}else navigate(action)}));
clearInterval(timer);current=0;timer=setInterval(()=>{if(!root.classList.contains('hidden'))slide(1)},10000);
}catch(e){console.error('Tactical dashboard:',e)}finally{rendering=false}
}
function slide(n,absolute=false){current=absolute?n:(current+n+photos.length)%photos.length;const img=$('tacticalHeroImage');if(img)img.src=photos[current];document.querySelectorAll('.tactical-dots button').forEach((b,i)=>b.classList.toggle('active',i===current))}
function boot(){
mount();
const dash=$('cyberDashboard');if(!dash)return;
let pending=false;
new MutationObserver(()=>{if(rendering||pending)return; if(dash.classList.contains('hidden')){updateActive();return}if(dash.querySelector('.tactical-stats'))return;pending=true;queueMicrotask(()=>{pending=false;makeDashboard();updateActive()})}).observe(dash,{childList:true,attributes:true,attributeFilter:['class']});
document.querySelectorAll('.cyber-topnav button').forEach(b=>b.addEventListener('click',()=>setTimeout(updateActive,120)));
if(!dash.classList.contains('hidden'))makeDashboard();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
