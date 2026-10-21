/* Show linked investigations under existing map locations without creating extra pins. */
(()=>{
 const escape=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const files=()=>{try{return JSON.parse(localStorage.getItem('eflspddb_investigation_files_v1'))||[]}catch{return []}};
 const previousRender=render;
 function refreshLocationTooltips(){
  markerLayer.eachLayer(marker=>{
   const pos=marker.getLatLng();
   const pin=cases.find(c=>c.kind==='general'&&c.lat===pos.lat&&c.lng===pos.lng);
   if(!pin)return;
   const gangIndex=pin.linkedGang!==undefined&&pin.linkedGang!==''?Number(pin.linkedGang):-1;
   const gang=database.gangs?.[gangIndex];
   const matching=files().filter(f=>Array.isArray(f.linked)&&f.linked.map(String).includes(String(pin.id)));
   const heading=`<strong>${escape(pin.caseNo||'Marked location')}</strong><small>${escape(pin.location||'')}</small>`;
   const profile=gang?`<button type="button" data-loc-gang="${gangIndex}">View ${escape(gang.title)} Gang Profile ↗</button>`:'';
   const casesHtml=`<h4>Linked Investigations (${matching.length})</h4>${matching.length?matching.map(f=>`<button type="button" class="ef-location-case" data-loc-case="${escape(f.id)}"><b>${escape(f.number||'Case')}</b><span>${escape(f.title||'Untitled')}</span><small>${escape(f.status||'')}</small></button>`).join(''):'<span class="ef-location-empty">No cases linked to this location</span>'}`;
   marker.unbindTooltip();
   marker.bindTooltip(`<div class="gang-map-popup ef-location-popup">${heading}${profile}${casesHtml}</div>`,{direction:'top',offset:[0,-24],opacity:1,interactive:true,className:'case-map-tooltip gang-map-tooltip'});
   marker.on('tooltipopen',e=>{
    const element=e.tooltip.getElement();if(!element)return;
    element.onpointerdown=ev=>ev.stopPropagation();
    element.onclick=ev=>{
     const b=ev.target.closest('button');if(!b)return;ev.stopPropagation();
     if(b.dataset.locCase){showSection('cases');document.querySelector(`[data-fileopen="${CSS.escape(b.dataset.locCase)}"]`)?.click();}
     if(b.dataset.locGang!==undefined){showSection('gangs');document.querySelector(`[data-gang-open="${CSS.escape(b.dataset.locGang)}"]`)?.click();}
    };
   });
  });
 }
 render=function(){previousRender();refreshLocationTooltips()};
 refreshLocationTooltips();
})();
