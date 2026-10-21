/* Location intelligence profiles for all manually placed map pins. */
(()=>{
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 const KEY='eflspddb_location_profiles_v1',FILES='eflspddb_investigation_files_v1';
 const read=(k,def)=>{try{return JSON.parse(localStorage.getItem(k))||def}catch{return def}};
 const profiles=()=>read(KEY,{}),files=()=>read(FILES,[]);
 const getPin=id=>cases.find(p=>p.kind==='general'&&String(p.id)===String(id));
 const linked=(pin)=>files().filter(f=>Array.isArray(f.linked)&&f.linked.map(String).includes(String(pin.id)));
 const close=()=>document.getElementById('efLocationProfile')?.remove();
 function openCase(id){close();showSection('cases');const button=[...document.querySelectorAll('[data-fileopen]')].find(el=>el.getAttribute('data-fileopen')===String(id));if(button)button.click();}
 function openGang(index){close();showSection('gangs');const b=[...document.querySelectorAll('[data-gang-open]')].find(el=>el.getAttribute('data-gang-open')===String(index));if(b)b.click();}
 function showProfile(id,edit=false){
  const pin=getPin(id);if(!pin)return;const saved=profiles()[id]||{},all=files(),assigned=linked(pin);
  const gi=pin.linkedGang!==undefined&&pin.linkedGang!==''?Number(pin.linkedGang):-1,gang=database.gangs?.[gi];
  close();const overlay=document.createElement('div');overlay.id='efLocationProfile';overlay.className='ef-overlay';
  const notes=esc(saved.notes||''),activity=esc(saved.activity||''),people=esc(saved.people||''),vehicles=esc(saved.vehicles||'');
  const assignedIcon=typeof markerIcon==='function'?markerIcon(pin).options.html:'';
  const image=saved.image?`<img src="${esc(saved.image)}" alt="Location evidence photograph" class="ef-location-photo">`:'';
  const caseCards=assigned.map(f=>`<button type="button" class="ef-loc-case-card" data-open-case="${esc(f.id)}"><strong>${esc(f.number||'Case')}</strong><span>${esc(f.title||'Untitled')}</span><small>${esc(f.status||'')}</small></button>`).join('');
  overlay.innerHTML=`<div class="ef-dialog ef-location-dialog" role="dialog" aria-modal="true" aria-label="Location Intelligence File">
  <div class="ef-dialog-head"><div><small class="ef-loc-eyebrow">LOCATION INTELLIGENCE FILE</small><h2 class="ef-loc-heading">${assignedIcon?`<span class="ef-loc-assigned-icon">${assignedIcon}</span>`:''}<span>${esc(pin.caseNo||'Marked Location')}</span></h2><p>${esc(pin.location||'Postal not set')} · ${esc(pin.markerCategory||pin.category||'Map location')}</p></div><button type="button" data-loc-close aria-label="Close">✕</button></div>
  <div class="ef-loc-stats"><div><small>LINKED CASES</small><b>${assigned.length}</b></div><div><small>LOCATION</small><b>${esc(pin.location||'Unspecified')}</b></div><div><small>GANG</small><b>${esc(gang?.title||'None')}</b></div></div>
  <div class="ef-loc-tabs"><button type="button" data-loc-tab="overview" class="selected">Overview</button><button type="button" data-loc-tab="cases">Cases (${assigned.length})</button><button type="button" data-loc-tab="evidence">Evidence</button><button type="button" data-loc-tab="connections">Connections</button></div>
  <section data-loc-panel="overview"><h3>Location Intelligence</h3><p class="ef-loc-body">${notes||'No intelligence notes yet.'}</p><h3>Known Activity</h3><p class="ef-loc-body">${activity||'No activity recorded yet.'}</p>${gang?`<button type="button" class="ef-loc-secondary" data-open-gang="${gi}">View ${esc(gang.title)} Gang Profile ↗</button>`:''}</section>
  <section data-loc-panel="cases" hidden><h3>Linked Investigations</h3><div class="ef-loc-case-grid">${caseCards||'<p>No investigations linked to this pin.</p>'}</div><h3>Link / Unlink Cases</h3><div class="ef-loc-checklist">${all.map(f=>`<label><input type="checkbox" data-link-case="${esc(f.id)}" ${assigned.some(a=>String(a.id)===String(f.id))?'checked':''}> ${esc(f.number||'Case')} — ${esc(f.title||'Untitled')}</label>`).join('')||'<p>Create a case first to link it here.</p>'}</div><button type="button" class="blue" data-save-links>Save Case Links</button></section>
  <section data-loc-panel="evidence" hidden><h3>Location Photograph</h3>${image||'<p>No location photo uploaded.</p>'}<p class="ef-hint">Photos are saved in this browser. Keep images small to avoid storage limits.</p></section>
  <section data-loc-panel="connections" hidden><h3>Known Individuals</h3><p class="ef-loc-body">${people||'No individuals recorded.'}</p><h3>Associated Vehicles</h3><p class="ef-loc-body">${vehicles||'No vehicles recorded.'}</p></section>
  <div class="ef-loc-editor" ${edit?'':'hidden'}><h3>Edit Location Intelligence</h3><label>Intelligence Notes<textarea data-loc-field="notes" rows="4">${notes}</textarea></label><label>Known Activity<textarea data-loc-field="activity" rows="3">${activity}</textarea></label><label>Known Individuals / Contacts<textarea data-loc-field="people" rows="2">${people}</textarea></label><label>Associated Vehicles<textarea data-loc-field="vehicles" rows="2">${vehicles}</textarea></label><label>Location Photograph<input type="file" data-loc-image accept="image/png,image/jpeg,image/webp"></label><button type="button" class="blue" data-loc-save>Save Intelligence File</button></div>
  <div class="ef-actions"><button type="button" data-loc-edit>${edit?'Hide Editor':'Edit Location File'}</button><button type="button" data-loc-close>Close</button></div></div>`;
  document.body.appendChild(overlay);
  overlay.addEventListener('pointerdown',e=>{if(e.target===overlay)close()});
  overlay.addEventListener('click',e=>{
   const b=e.target.closest('button');if(!b)return;
   if(b.hasAttribute('data-loc-close')){close();return}
   if(b.hasAttribute('data-loc-tab')){const tab=b.dataset.locTab;overlay.querySelectorAll('[data-loc-tab]').forEach(t=>t.classList.toggle('selected',t.dataset.locTab===tab));overlay.querySelectorAll('[data-loc-panel]').forEach(t=>t.hidden=t.dataset.locPanel!==tab);return}
   if(b.hasAttribute('data-open-case')){openCase(b.dataset.openCase);return}
   if(b.hasAttribute('data-open-gang')){openGang(b.dataset.openGang);return}
   if(b.hasAttribute('data-loc-edit')){const ed=overlay.querySelector('.ef-loc-editor');ed.hidden=!ed.hidden;b.textContent=ed.hidden?'Edit Location File':'Hide Editor';return}
   if(b.hasAttribute('data-save-links')){const ids=new Set([...overlay.querySelectorAll('[data-link-case]:checked')].map(el=>el.dataset.linkCase));const list=files();list.forEach(f=>{f.linked=Array.isArray(f.linked)?f.linked:[];f.linked=f.linked.filter(x=>String(x)!==String(id));if(ids.has(String(f.id)))f.linked.push(id)});try{localStorage.setItem(FILES,JSON.stringify(list));showProfile(id);overlay.remove()}catch{alert('Unable to save case links. Check browser storage space.')}return}
   if(b.hasAttribute('data-loc-save')){const record={...saved};overlay.querySelectorAll('[data-loc-field]').forEach(t=>record[t.dataset.locField]=t.value);const photo=overlay.querySelector('[data-loc-image]').files[0];const commit=()=>{const next=profiles();next[id]=record;try{localStorage.setItem(KEY,JSON.stringify(next));showProfile(id)}catch{alert('Could not save: browser storage is full. Try a smaller photo.')}};if(photo){if(photo.size>350000){alert('Please choose an image smaller than 350 KB.');return}const reader=new FileReader();reader.onload=()=>{record.image=reader.result;commit()};reader.readAsDataURL(photo)}else commit();return}
  });
 }
 window.openLocationIntelligenceProfile=showProfile;
 const priorRender=render;
 function refresh(){if(typeof markerLayer==='undefined')return;markerLayer.eachLayer(marker=>{const pos=marker.getLatLng();const pin=cases.find(c=>c.kind==='general'&&c.lat===pos.lat&&c.lng===pos.lng);if(!pin)return;const gangIndex=pin.linkedGang!==undefined&&pin.linkedGang!==''?Number(pin.linkedGang):-1;const gang=database.gangs?.[gangIndex];const count=linked(pin).length;const html=`<div class="gang-map-popup ef-location-popup"><strong>${esc(pin.caseNo||'Marked Location')}</strong><small>${esc(pin.location||'')}</small><p>${count} linked investigation${count===1?'':'s'}</p><span>Click pin to open location intelligence file</span></div>`;marker.unbindTooltip();marker.bindTooltip(html,{direction:'top',offset:[0,-24],opacity:1,className:'case-map-tooltip gang-map-tooltip'});marker.unbindPopup();marker.off('click');marker.on('click',e=>{if(e.originalEvent)L.DomEvent.stop(e.originalEvent);marker.closeTooltip();showProfile(pin.id)});});}
 render=function(){priorRender();refresh()};refresh();
})();
