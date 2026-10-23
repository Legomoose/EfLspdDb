/* EFLSPDDB requested UI improvements. Does not modify map assets or saved pins. */
(()=>{
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const KEY='eflspddb_detective_profiles_v1';
const profiles=()=>{try{const existing=localStorage.getItem(KEY);if(existing!==null)return JSON.parse(existing)||[];return (window.EFCaseFiles?.getRoster()||[]).map(name=>({name,rank:'Detective',badge:'',callsign:''}));}catch{return []}};
const saveProfiles=a=>{localStorage.setItem(KEY,JSON.stringify(a));window.EFCaseFiles?.setRoster(a.map(x=>x.name))};
const modal=(title,body)=>{document.getElementById('efEnhanceOverlay')?.remove();document.body.insertAdjacentHTML('beforeend',`<div class="ef-overlay" id="efEnhanceOverlay"><div class="ef-dialog ef-enhance-dialog"><div class="ef-dialog-head"><h2>${esc(title)}</h2><button type="button" id="efCloseEnhance">✕</button></div>${body}</div></div>`);const o=document.getElementById('efEnhanceOverlay');document.getElementById('efCloseEnhance').onclick=()=>o.remove();o.addEventListener('click',e=>{if(e.target===o)o.remove()});return o};
const close=()=>document.getElementById('efEnhanceOverlay')?.remove();
const oldRender=renderExtra;
renderExtra=function(section){
 if(section==='reports'){
  document.getElementById('extraTitle').textContent='CASE REPORTS';document.getElementById('addEntryBtn').style.display='none';
  const files=window.EFCaseFiles?.list()||[];
  document.getElementById('extraContent').innerHTML=`<div class="db-card"><div class="ef-heading-row"><div><h3>CASE REPORTS</h3><p>Open an investigation below or create a new case.</p></div><button class="ef-primary" id="efCreateReport">+ Create Case</button></div><div class="ef-report-grid">${files.length?files.map(f=>`<button class="ef-report-tile" data-report-id="${esc(f.id)}"><strong>${esc(f.number)}</strong><span>${esc(f.title)}</span><small>${esc(f.status)} · ${esc(f.detective||'Unassigned')}</small></button>`).join(''):'<p>No investigation cases yet. Click Create Case to start.</p>'}</div></div>`;
  document.getElementById('efCreateReport').onclick=()=>window.EFCaseFiles?.create();document.querySelectorAll('[data-report-id]').forEach(b=>b.onclick=()=>window.EFCaseFiles?.open(b.dataset.reportId));return;
 }
 if(section==='directory'){
  const roster=profiles().filter(d=>d.active!==false&&d.role!=='high_command').sort(window.LSPDCompareCallsign);
  document.getElementById('extraTitle').textContent='DETECTIVE DIRECTORY';
  document.getElementById('addEntryBtn').style.display='none';
  document.getElementById('extraContent').innerHTML=`<div class="db-card"><div class="ef-heading-row"><div><h3>PERSONNEL DIRECTORY</h3><p>Detective profiles and case assignments. Contacts remain separate.</p></div><input id="efDirectorySearch" aria-label="Search detectives" placeholder="Search name, badge, rank or callsign..."></div><div class="ef-report-grid" id="efDirectoryGrid"></div></div>`;
  const grid=document.getElementById('efDirectoryGrid');grid.className='ef8g-directory';
  const draw=()=>{const q=document.getElementById('efDirectorySearch').value.trim().toLowerCase();
   const matches=roster.map((d,i)=>({...d,_index:i})).filter(d=>[d.name,d.rank,d.badge,d.callsign].some(x=>String(x||'').toLowerCase().includes(q)));
   grid.innerHTML=matches.length?matches.map(d=>{
    const assigned=(window.EFCaseFiles?.list()||[]).filter(f=>String(f.detective||'').trim().toLowerCase()===String(d.name||'').trim().toLowerCase());
    return `<article class="ef8g-detective"><div class="ef8g-detective-top"><div class="ef8g-detective-avatar">${d.photo&&/^https:\/\//i.test(d.photo)?`<img src="${esc(d.photo)}" alt="">`:'<i class="fa-solid fa-user-shield"></i>'}</div><div><div class="ef8g-detective-name">${esc(d.name)}</div><div class="ef8g-detective-meta">${esc(d.rank||'Detective')}<br>Badge #${esc(d.badge||'—')}<br>Callsign: ${esc(d.callsign||'—')}</div></div></div><div class="ef8g-detective-stats"><span>📁 ${assigned.length} Assigned Cases</span><span>${d.active===false?'Inactive':'● Active'}</span></div><button type="button" data-det-view="${d._index}">View Profile</button></article>`;
   }).join(''):'<p>No matching active detectives.</p>';
   grid.querySelectorAll('[data-det-view]').forEach(b=>b.onclick=()=>viewDetective(roster[+b.dataset.detView]));
  };
  document.getElementById('efDirectorySearch').addEventListener('input',draw);draw();return;
 }
 if(section==='vehicles'){
  document.getElementById('extraTitle').textContent='VEHICLE INTELLIGENCE';const a=document.getElementById('addEntryBtn');a.textContent='+ Add Vehicle';a.style.display='';
  const content=document.getElementById('extraContent');
  content.innerHTML=`<div class="ef8g-vehicle-tools"><input id="ef8gVehicleSearch" placeholder="Search model, plate or owner..."><select id="ef8gVehicleCase"><option value="">All linked cases</option></select></div><div class="ef8g-vehicles" id="ef8gVehicleList"></div>`;
  const rows=database.vehicles||[];
  const sel=content.querySelector('#ef8gVehicleCase');
  [...new Set(rows.map(r=>r.caseNo).filter(Boolean))].sort().forEach(v=>{const o=document.createElement('option');o.value=v;o.textContent=v;sel.append(o)});
  const draw=()=>{const q=content.querySelector('#ef8gVehicleSearch').value.toLowerCase(),c=sel.value;
   const visible=rows.map((r,i)=>({...r,_index:i})).filter(r=>(!c||r.caseNo===c)&&(!q||[r.title,r.plate,r.owner].join(' ').toLowerCase().includes(q)));
   content.querySelector('#ef8gVehicleList').innerHTML=visible.length?visible.map(r=>`<article class="ef8g-vehicle"><div class="ef8g-vehicle-image">${r.photo?`<img src="${esc(r.photo)}" alt="Vehicle">`:'<i class="fa-solid fa-car"></i>'}</div><div class="ef8g-vehicle-title"><h3>${esc(r.title||'Unknown model')}</h3><small>Plate: ${esc(r.plate||'—')}</small></div><div class="ef8g-vehicle-col"><small>Colour</small>${esc(r.color||'—')}</div><div class="ef8g-vehicle-col"><small>Registered Owner</small>${esc(r.owner||'—')}</div><div class="ef8g-vehicle-col"><small>Linked Case</small>${esc(r.caseNo||'None')}</div><div class="ef8g-vehicle-actions"><button data-vehicle-edit="${r._index}">Edit</button><button data-vehicle-delete="${r._index}">Delete</button></div><div class="ef8g-vehicle-notes">${esc(r.description||'No intelligence notes')}</div></article>`).join(''):'<div class="db-card">No matching vehicle records.</div>';
  };
  content.querySelector('#ef8gVehicleSearch').oninput=draw;sel.onchange=draw;draw();
  content.onclick=e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.vehicleEdit!==undefined)vehicleEditor(+b.dataset.vehicleEdit);if(b.dataset.vehicleDelete!==undefined&&confirm('Delete this vehicle record?')){database.vehicles.splice(+b.dataset.vehicleDelete,1);saveDb();renderExtra('vehicles')}};
  return;
 }

 oldRender(section);
 if(section==='settings'){
  document.getElementById('extraContent').insertAdjacentHTML('beforeend',`<div class="db-card"><h3>DETECTIVE MANAGEMENT</h3><p>Manage detective profiles and the case assignment roster. <strong>Local preview only:</strong> secure generated login numbers, passwords and department-wide audit logs require backend setup.</p><button id="efManageSettings">Manage Detectives</button><button id="efBackendHelp">Account Setup Instructions</button></div>`);
  document.getElementById('efManageSettings').onclick=manageDetectives;document.getElementById('efBackendHelp').onclick=()=>alert('Read ACCOUNT-SETUP.md included in the website ZIP. Secure accounts cannot be activated on GitHub Pages alone.');
 }
};
function viewDetective(d){
 const assigned=(window.EFCaseFiles?.list()||[]).filter(f=>String(f.detective||'').trim().toLowerCase()===String(d.name||'').trim().toLowerCase());
 const o=modal('Detective Profile',`<div class="ef-directory-detail"><div class="ef-directory-head">${d.photo&&/^https?:\/\//i.test(d.photo)?`<img class="ef-directory-photo" src="${esc(d.photo)}" alt="">`:'<span class="ef-directory-avatar"><i class="fa-solid fa-user-shield"></i></span>'}<div><h3>${esc(d.name)}</h3><p>${esc(d.rank||'Detective')} · ${esc(d.callsign||'No callsign')}</p><small>Badge: ${esc(d.badge||'—')}</small></div></div><h3>Assigned Investigation Cases (${assigned.length})</h3><div class="ef8g-assigned">${assigned.length?assigned.map(f=>`<div class="ef8g-assigned-row"><div><strong>${esc(f.number||'Case')}</strong><br>${esc(f.title||'Untitled')}</div><div><small>LOCATION</small><br>${esc(f.location||'—')}</div><div><small>ROLE</small><br>Lead Detective</div><div><small>STATUS</small><br>${esc(f.status||'—')}</div><div><small>UPDATED</small><br>${f.updated?new Date(f.updated).toLocaleDateString('en-GB'):'—'}</div><button data-open-case="${esc(f.id)}">Edit</button><button data-map-case="${esc(f.id)}">Map</button></div>`).join(''):'<p>No assigned investigations.</p>'}</div></div>`);
 o.querySelectorAll('[data-open-case]').forEach(b=>b.onclick=()=>{close();window.EFCaseFiles?.open(b.dataset.openCase)});
 o.querySelectorAll('[data-map-case]').forEach(b=>b.onclick=()=>{close();document.querySelector('[data-section="cases"]')?.click();setTimeout(()=>document.querySelector('#recordsBody [data-filemap="'+CSS.escape(b.dataset.mapCase)+'"]')?.click(),70)});
}
function vehicleEditor(index=null){const old=index===null?{}:(database.vehicles||[])[index]||{};
 const fields=[['title','Vehicle / Model','text',true],['plate','Registration / Plate','text'],['color','Colour','text'],['owner','Owner / Associated Person','text'],['location','Last Known Location / Postal','text'],['caseNo','Linked Case Number','text']];
 const o=modal(index===null?'Add Vehicle':'Edit Vehicle',`<form id="efVehicleForm" class="ef-enhance-form"><div class="ef-formgrid">${fields.map(([key,label,type,required])=>`<label>${label}<input name="${key}" type="${type}" value="${esc(old[key])}" ${required?'required':''}></label>`).join('')}<label class="wide">Description / Notes<textarea name="description" rows="5">${esc(old.description||'')}</textarea></label><label class="wide">Vehicle Photograph (PNG, JPG, WebP — max 350 KB)<input id="efVehiclePhoto" type="file" accept="image/png,image/jpeg,image/webp"></label><div class="wide ef-vehicle-preview">${old.photo?`<img src="${esc(old.photo)}" alt="Saved vehicle photograph">`:''}</div>${old.photo?'<label class="wide"><input type="checkbox" name="removePhoto" value="yes"> Remove existing photograph</label>':''}</div><div class="ef-actions"><button type="button" id="efCancelVehicle">Cancel</button><button type="submit" class="ef-primary">Save Vehicle</button></div></form>`);
 o.querySelector('#efCancelVehicle').onclick=close;o.querySelector('form').onsubmit=e=>{e.preventDefault();const data=Object.fromEntries(new FormData(e.target));const entry={...old,...data,updated:new Date().toISOString()};delete entry.removePhoto;if(data.removePhoto==='yes')delete entry.photo;
 const finish=()=>{database.vehicles??=[];if(index===null)database.vehicles.push(entry);else database.vehicles[index]=entry;try{saveDb()}catch(err){alert('Could not save vehicle: browser storage may be full.');return}close();renderExtra('vehicles')};
 const photo=o.querySelector('#efVehiclePhoto')?.files[0];
 if(photo){if(photo.size>350000||!['image/png','image/jpeg','image/webp'].includes(photo.type)){alert('Use a PNG, JPG or WebP image under 350 KB.');return}const reader=new FileReader();reader.onload=()=>{entry.photo=reader.result;finish()};reader.readAsDataURL(photo)}else finish()};}
function manageDetectives(){const a=profiles();const o=modal('Manage Detectives',`<p class="ef-hint">Detective profiles and case assignments only. Accounts and credentials require secure backend configuration.</p><div class="ef-actions"><button class="ef-primary" id="efNewDetective">+ Add Detective</button></div><div class="ef-report-grid">${a.length?a.map((d,i)=>`<article class="db-card"><h3>${esc(d.name)}</h3><p>${esc(d.rank||'Detective')} · ${esc(d.callsign||'No callsign')}</p><small>Badge: ${esc(d.badge||'—')}</small><div class="ef-actions"><button data-det-edit="${i}">Edit</button><button data-det-remove="${i}">Remove</button></div></article>`).join(''):'<p>No detectives added yet.</p>'}</div>`);
 o.querySelector('#efNewDetective').onclick=()=>editDetective();o.querySelectorAll('[data-det-edit]').forEach(b=>b.onclick=()=>editDetective(+b.dataset.detEdit));o.querySelectorAll('[data-det-remove]').forEach(b=>b.onclick=()=>{if(confirm('Remove this detective from the local roster?')){a.splice(+b.dataset.detRemove,1);saveProfiles(a);manageDetectives()}});}
function editDetective(index=null){const a=profiles(),d=index===null?{}:a[index];const o=modal(index===null?'Add Detective':'Edit Detective',`<form id="efDetectiveForm" class="ef-enhance-form"><div class="ef-formgrid"><label>Detective Name<input name="name" required value="${esc(d.name)}"></label><label>Badge Number<input name="badge" value="${esc(d.badge)}"></label><label>Rank<input name="rank" value="${esc(d.rank||'Detective')}"></label><label>Callsign<input name="callsign" value="${esc(d.callsign)}"></label><label class="wide">Profile Photo URL (optional)<input name="photo" type="url" value="${esc(d.photo)}"></label></div><div class="ef-actions"><button type="button" id="efCancelDetective">Cancel</button><button type="submit" class="ef-primary">Save Detective</button></div></form>`);o.querySelector('#efCancelDetective').onclick=close;o.querySelector('form').onsubmit=e=>{e.preventDefault();const data=Object.fromEntries(new FormData(e.target));if(a.some((v,i)=>i!==index&&v.name.toLowerCase()===data.name.trim().toLowerCase()))return alert('A detective with this name already exists.');if(index===null)a.push(data);else a[index]={...d,...data};saveProfiles(a);manageDetectives()};}
window.EFManageDetectives=manageDetectives;
// Intercept the original generic + Add Vehicle button, without affecting other sections.
document.getElementById('addEntryBtn').addEventListener('click',e=>{if(currentSection==='vehicles'){e.stopImmediatePropagation();vehicleEditor()}},true);
// Existing Reports button navigation remains normal; clicking Reports no longer launches an editor.
})();
