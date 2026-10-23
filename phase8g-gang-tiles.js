/* Phase 8G: Gang listing presentation only. Existing account, profile and CRUD handlers are retained. */
(()=>{'use strict';
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const original=window.renderExtra;
 if(typeof original!=='function')return;
 window.renderExtra=function(section){
  original.apply(this,arguments);
  if(section!=='gangs')return;
  const root=document.getElementById('extraContent');
  if(!root||root.querySelector('.gang-profile'))return;
  const rows=Array.isArray(database.gangs)?database.gangs:[];
  const search=document.createElement('div');search.className='ef-gang-filters';
  search.innerHTML='<input id="efGangSearch" type="search" placeholder="Search gang name, territory or notes..." aria-label="Search gangs"><select id="efGangTerritory" aria-label="Filter by territory"><option value="">All territories</option></select><select id="efGangStatus" aria-label="Filter by status"><option value="">All statuses</option><option value="Active">Active</option><option value="Monitoring">Monitoring</option><option value="Inactive">Inactive</option></select><button type="button" id="efGangClear">Clear Filters</button>';
  const list=document.createElement('div');list.className='ef-gang-list';
  root.replaceChildren(search,list);
  const territories=[...new Set(rows.map(g=>String(g.territory||g.location||'').trim()).filter(Boolean))].sort();
  const territory=search.querySelector('#efGangTerritory');
  for(const name of territories){const option=document.createElement('option');option.value=name;option.textContent=name;territory.appendChild(option)}
  const query=search.querySelector('#efGangSearch'),status=search.querySelector('#efGangStatus');
  const statusOf=g=>String(g.status||'Active').trim()||'Active';
  const paint=()=>{
   const q=query.value.trim().toLowerCase();const t=territory.value;const s=status.value;
   const matching=rows.map((g,i)=>({g,i})).filter(({g})=>(!q||[g.title,g.description,g.territory,g.location,g.style].some(x=>String(x||'').toLowerCase().includes(q)))&&(!t||String(g.territory||g.location||'')===t)&&(!s||statusOf(g)===s));
   list.innerHTML=matching.length?matching.map(({g,i})=>{
    const st=statusOf(g);const tone=st==='Active'?'active':st==='Inactive'?'inactive':'monitoring';
    const logo=typeof window.efGangLogoHtml==='function'?window.efGangLogoHtml(g):'<span class="ef-gang-card-logo">G</span>';
    const linked=(typeof cases!=='undefined'&&Array.isArray(cases))?cases.filter(p=>String(p.linkedGang??'')===String(i)).length:0;
    return `<article class="ef-gang-tile"><div class="ef-gang-identity">${logo}<div><h3>${esc(g.title||'Unnamed gang')}</h3><p>${esc(g.description||'No description recorded.')}</p></div></div><div class="ef-gang-metric"><small>MEMBERS</small><strong>${(g.members||[]).length}</strong></div><div class="ef-gang-metric"><small>TERRITORY</small><strong>${esc(g.territory||g.location||'Not recorded')}</strong></div><div class="ef-gang-metric"><small>MAP LINKS</small><strong>${linked+(g.pinId&&!linked?1:0)}</strong></div><div class="ef-gang-metric"><small>STATUS</small><span class="ef-gang-status ${tone}">${esc(st)}</span></div><div class="ef-gang-actions"><button type="button" class="blue" data-gang-open="${i}">View Profile</button><button type="button" data-gang-edit="${i}">Edit</button><button type="button" class="danger" data-gang-delete="${i}">Delete</button></div></article>`;
   }).join(''):'<div class="db-card">No gangs match these filters.</div>';
  };
  query.addEventListener('input',paint);territory.addEventListener('change',paint);status.addEventListener('change',paint);
  search.querySelector('#efGangClear').onclick=()=>{query.value='';territory.value='';status.value='';paint()};
  paint();
 };
})();
