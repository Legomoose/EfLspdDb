/* EFLSPDDB — approved final visual consolidation. UI only: no account/pin/data mutation. */
(()=>{'use strict';
const $=s=>document.querySelector(s);
const map=$('#mapView'),ws=$('.workspace');
const PAGE_LABELS={cases:['+ New Investigation','#addRecordBtn'],gangs:['+ Add Gang','#addEntryBtn'],vehicles:['+ Add Vehicle','#addEntryBtn'],items:['+ Add Criminal Item','#addEntryBtn'],contacts:['+ Add Contact','#addEntryBtn'],directory:['+ Add Record','#addEntryBtn'],documents:['+ Add Document','#lspdDocsAdd']};
let queued=false;
function section(){
 const from= document.body.dataset.hybridSection;
 if(map&&!map.classList.contains('hidden'))return 'map';
 if(!$('#recordsView')?.classList.contains('hidden'))return 'cases';
 if($('#extraView')?.classList.contains('hidden'))return 'dashboard';
 if(from&&PAGE_LABELS[from])return from;
 const t=($('#extraTitle')?.textContent||'').toUpperCase();
 for(const [k,word] of Object.entries({gangs:'GANG',vehicles:'VEHICLE',items:'CRIMINAL',contacts:'CONTACT',directory:'PERSONNEL',documents:'DOCUMENT'}))if(t.includes(word))return k;
 return from||'other';
}
function prepHeader(){
 const header=$('#lspdRebuiltHeader');if(!header)return;
 if(!header.querySelector('.ef-final-header-message')){
  const label=document.createElement('div');label.className='ef-final-header-message';label.textContent='SECURE INTELLIGENCE DATABASE';header.insertBefore(label,header.querySelector('.lspd-rebuilt-controls'));
 }
 const sidebar=$('.tactical-sidebar');if(sidebar&&!sidebar.querySelector('.ef-final-sidebar-art')){
  const picture=document.createElement('div');picture.className='ef-final-sidebar-art';picture.setAttribute('role','img');picture.setAttribute('aria-label','Los Santos night patrol beneath the city skyline');
  sidebar.insertBefore(picture,sidebar.querySelector('.tactical-side-foot'));
 }
}
function prepMap(){
 if(!ws||!map)return;
 if(!ws.querySelector('.ef-big-map-hero')){
  const hero=document.createElement('div');hero.className='ef-big-map-hero';hero.innerHTML='<div><small><span class="ef-pulse"></span> LSPD / DETECTIVE BUREAU / SECURE DATABASE</small><h1>MAP INTELLIGENCE</h1><p>Geospatial incidents, investigations and departmental points of interest</p></div>';
  ws.insertBefore(hero,ws.querySelector(':scope > .leftpanel'));
 }
 const left=$('.leftpanel .panel-inner');if(!left)return;
 const search=$('#searchInput')?.closest('.searchfield');
 if(search&&!left.querySelector('.ef-final-map-search')){
  const section=document.createElement('div');section.className='ef-final-map-search';section.innerHTML='<h3><i class="fa-solid fa-magnifying-glass"></i> MAP SEARCH</h3>';
  section.appendChild(search);left.insertBefore(section,left.querySelector(':scope > h3')||left.firstChild);
 }
 let art=left.querySelector('.cyber-sidebar-art');
 if(!art){art=document.createElement('div');art.className='cyber-sidebar-art';art.innerHTML='<img src="assets/ef2026/sidebar-patrol.webp" alt="Los Santos police patrol"><span>SERVING · PROTECTING · OUR COMMUNITY</span>';left.append(art)}
 art.querySelector('img')?.setAttribute('src','assets/ef2026/sidebar-patrol.webp');
}
function createHeroAction(sec){
 const view=sec==='cases'?$('#recordsView'):$('#extraView');if(!view)return;
 const hero=view.querySelector(':scope > .hybrid-hero');if(!hero)return;
 const conf=PAGE_LABELS[sec];
 const old=hero.querySelector('.ef-big-hero-action');
 if(!conf){old?.remove();return}
 const [label,selector]=conf;
 const original=$(selector);
 // Respect the renderer's permissions and never make a fake privileged action visible.
 const allowed=!!original&&original.style.display!=='none'&&!original.disabled;
 if(!allowed){old?.remove();return}
 let action=old;if(!action){action=document.createElement('button');action.type='button';action.className='ef-big-hero-action blue';hero.appendChild(action)}
 action.dataset.target=selector;action.innerHTML='<i class="fa-solid fa-file-circle-plus" aria-hidden="true"></i><span></span>';action.querySelector('span').textContent=label;
 action.onclick=()=>{const button=$(action.dataset.target);if(button&&!button.disabled)button.click()};
}
function augmentDocHero(sec){
 if(sec!=='documents')return;
 const hero=$('#extraView > .hybrid-hero');if(hero){hero.classList.add('ef-documents-hero');}
}
function organizeCases(){
 // The existing functional filters are owned by the case management module.
 // Hide only the second, presentation-only toolbar; preserve Manage Detectives.
 const bar=$('#recordsView > .case-toolbar');if(bar)bar.classList.add('ef-single-case-toolbar');
}
function arrange(){queued=false;prepHeader();prepMap();const sec=section();
 document.body.dataset.efFinalSection=sec;
 if(sec==='documents')augmentDocHero(sec);
 createHeroAction(sec);if(sec==='cases')organizeCases();
 // Ensure no duplicate map close buttons remain from earlier patch versions.
 $('.rightpanel')?.querySelectorAll('.ef-repair-detail-close').forEach(n=>n.remove());
}
function queue(){if(queued)return;queued=true;requestAnimationFrame(arrange)}
function boot(){
 arrange();
 const title=$('#extraTitle');if(title)new MutationObserver(queue).observe(title,{childList:true,characterData:true,subtree:true});
 const content=$('#extraContent');if(content)new MutationObserver(queue).observe(content,{childList:true});
 const heroNodes=[$('#recordsView'),$('#extraView')];heroNodes.forEach(n=>{if(n)new MutationObserver(queue).observe(n,{childList:true,attributes:true,attributeFilter:['class']})});
 for(const id of ['mapView','cyberDashboard']){const n=$('#'+id);if(n)new MutationObserver(queue).observe(n,{attributes:true,attributeFilter:['class']})}
 document.querySelectorAll('.cyber-topnav button,.tactical-side-nav button').forEach(n=>n.addEventListener('click',()=>setTimeout(queue,100)));
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
