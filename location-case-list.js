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
   const html=`<div class="gang-map-popup ef-location-popup">${heading}${profile}${casesHtml}</div>`;
   // Hover is a quick preview. Clicking the pin opens a persistent, clickable Leaflet popup.
   marker.unbindTooltip();
   marker.bindTooltip(html,{direction:'top',offset:[0,-24],opacity:1,interactive:true,className:'case-map-tooltip gang-map-tooltip'});
   marker.bindPopup(html,{maxWidth:340,minWidth:235,autoPan:true,closeButton:true,className:'ef-location-leaflet-popup'});
   // Register the action on both surfaces; use delegation so nested labels work.
   const attachActions=element=>{
    if(!element)return;
    L.DomEvent.disableClickPropagation(element);
    L.DomEvent.disableScrollPropagation(element);
    element.addEventListener('click',ev=>{
     const button=ev.target.closest('[data-loc-case],[data-loc-gang]');
     if(!button)return;
     ev.preventDefault();ev.stopPropagation();
     marker.closePopup();marker.closeTooltip();
     if(button.hasAttribute('data-loc-case')){
      const id=button.getAttribute('data-loc-case');
      showSection('cases');
      // Open the actual investigation record, not the map marker editor.
      document.querySelectorAll('[data-fileopen]').forEach(link=>{
       if(link.getAttribute('data-fileopen')===id){link.click();}
      });
     }else if(button.hasAttribute('data-loc-gang')){
      const index=button.getAttribute('data-loc-gang');
      showSection('gangs');
      document.querySelectorAll('[data-gang-open]').forEach(link=>{
       if(link.getAttribute('data-gang-open')===index){link.click();}
      });
     }
    });
   };
   marker.on('tooltipopen',e=>attachActions(e.tooltip.getElement()));
   marker.on('popupopen',e=>attachActions(e.popup.getElement()));

  });
 }
 render=function(){previousRender();refreshLocationTooltips()};
 refreshLocationTooltips();
})();
