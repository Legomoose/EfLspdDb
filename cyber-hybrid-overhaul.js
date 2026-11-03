/* Cyber Hybrid 3.0: presentation-only enhancements over existing live renderers. */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const art={cases:'case-cover.webp',gangs:'gang-cover.webp',vehicles:'port-cover.webp',items:'forensic.webp',contacts:'interrogation.webp',directory:'operations.webp',documents:'operations-hq.webp',settings:'operations-hq.webp',reports:'crime-scene.webp','high-command':'operations.webp'};
const copy={cases:['INVESTIGATION CENTRE','Investigations, evidence and active casework'],gangs:['GANG INTELLIGENCE','Organisations, territory and associated investigations'],vehicles:['VEHICLE INTELLIGENCE','Vehicles of interest and associated records'],items:['CRIMINAL ITEM DATABASE','Seized property, contraband and known items'],contacts:['CONTACT DIRECTORY','Individuals, affiliations and intelligence contacts'],directory:['PERSONNEL DIRECTORY','Detectives, command and departmental contacts'],documents:['DEPARTMENT DOCUMENTS','Policies, procedures and shared references'],settings:['SYSTEM ADMINISTRATION','Appearance, security and database operations'],reports:['CASE REPORTS','Investigation reports and related evidence'],'high-command':['HIGH COMMAND','Departmental command and oversight']};
let current='dashboard', queued=false;
const header=()=>{
 const h=document.querySelector('.ef-new-header');if(h)h.classList.add('hybrid-header');
 const nav=document.querySelector('.cyber-topnav');if(nav)nav.classList.add('hybrid-nav');
 const search=$('efHeaderSearch');if(search)search.placeholder='Search investigations, suspects, vehicles...';
};
function section(){if(!$('cyberDashboard')?.classList.contains('hidden'))return 'dashboard';if(!$('mapView')?.classList.contains('hidden'))return 'map';if(!$('recordsView')?.classList.contains('hidden'))return 'cases';
 const text=($('extraTitle')?.textContent||'').toLowerCase();if(text.includes('gang'))return 'gangs';if(text.includes('vehicle'))return 'vehicles';if(text.includes('criminal'))return 'items';if(text.includes('contact'))return 'contacts';if(text.includes('personnel'))return 'directory';if(text.includes('document'))return 'documents';if(text.includes('setting'))return 'settings';if(text.includes('report'))return 'reports';if(text.includes('command'))return 'high-command';return 'other';}
function banner(sec){
 const target=sec==='cases'?$('recordsView'):$('extraView');if(!target)return;
 let hero=target.querySelector(':scope > .hybrid-hero');if(!hero){hero=document.createElement('div');hero.className='hybrid-hero';target.insertBefore(hero,target.firstChild)}
 if(hero.dataset.section===sec)return;
 hero.dataset.section=sec;
 const [title,sub]=copy[sec]||['INTELLIGENCE DATABASE','Department records and operational intelligence'];
 const img=art[sec]||'operations.webp';
 hero.innerHTML=`<div class="hybrid-hero-content"><div class="hybrid-kicker"><span class="hybrid-pulse"></span> LSPD / DETECTIVE BUREAU / SECURE DATABASE</div><h1>${title}</h1><p>${sub}</p></div><img src="assets/cyber2/${img}" alt="" aria-hidden="true">`;
}
function enhanceCases(){
 const view=$('recordsView'),body=$('recordsBody');if(!view||!body)return;
 view.classList.add('hybrid-cases');
 const table=view.querySelector('table');if(table)table.classList.add('hybrid-case-grid');
 for(const row of body.querySelectorAll('tr')){
  if(row.children.length!==6)continue;
  row.classList.add('hybrid-case-card');
  [...row.children].forEach((cell,i)=>{cell.dataset.label=['CASE FILE','LOCATION','LEAD DETECTIVE','STATUS','LAST UPDATED','CASE ACTIONS'][i]});
  if(!row.querySelector('.hybrid-case-art')){
   const artEl=document.createElement('div');artEl.className='hybrid-case-art';artEl.innerHTML='<img src="assets/cyber2/case-cover.webp" alt=""><span>DETECTIVE BUREAU · CASE FILE</span>';
   row.prepend(artEl);
  }
 }
}
function enhanceExtra(sec){
 const root=$('extraContent');if(!root)return;
 root.classList.toggle('hybrid-documents',sec==='documents');
 root.classList.toggle('hybrid-directory',sec==='directory');
 root.classList.toggle('hybrid-settings',sec==='settings');
 root.classList.toggle('hybrid-intelligence',!['settings','documents','directory'].includes(sec));
 for(const card of root.querySelectorAll('.db-card,.ef8g-detective,.ef8g-card,.ef8g-tile,.ef7b-settings,.ef-update-panel')){
  card.classList.add('hybrid-record-card');
 }
}
function run(){queued=false;header();const sec=section();if(sec!==current){current=sec;document.body.dataset.hybridSection=sec;}
 if(sec==='cases'){banner(sec);enhanceCases()}
 else if(!['dashboard','map'].includes(sec)){banner(sec);enhanceExtra(sec)}
}
function queue(){if(queued)return;queued=true;requestAnimationFrame(run)}
function boot(){
 header();run();
 const target=$('recordsBody');if(target)new MutationObserver(queue).observe(target,{childList:true,subtree:true});
 const extra=$('extraContent');if(extra)new MutationObserver(queue).observe(extra,{childList:true,subtree:false});
 for(const id of ['mapView','recordsView','extraView','cyberDashboard']){const node=$(id);if(node)new MutationObserver(queue).observe(node,{attributes:true,attributeFilter:['class']})}
 const title=$('extraTitle');if(title)new MutationObserver(queue).observe(title,{childList:true});
 document.querySelectorAll('.cyber-topnav button').forEach(b=>b.addEventListener('click',()=>setTimeout(queue,100)));
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
