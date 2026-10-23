/* EFLSPDDB gang profile and member editor; preserves existing database.gangs records. */
(()=>{
const escapeHtml=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const gangAt=i=>(database.gangs||[])[i];
const persist=()=>{saveDb();renderExtra('gangs')};
const field=(name,label,value='',kind='text')=>`<label>${label}${kind==='textarea'?`<textarea name="${name}" rows="3">${escapeHtml(value)}</textarea>`:`<input name="${name}" type="${kind}" value="${escapeHtml(value)}">`}</label>`;
const close=()=>document.getElementById('efGangOverlay')?.remove();
const standardPositions=['Leader','Second-in-Command','Third-in-Command','Member','Associate'];
const positionsFor=g=>Array.isArray(g.positions)?g.positions:standardPositions;
function managePositions(gi){
 const g=gangAt(gi);if(!g)return;
 modal(`Manage Positions — ${g.title}`,`<p>One position per line, in rank order. Leave empty for no preset positions. Members retain their assigned rank even when you remove a preset.</p><label>Gang Positions<textarea name="positions" rows="9">${escapeHtml(positionsFor(g).join('\n'))}</textarea></label>`,f=>{
 const lines=String(f.get('positions')||'').split(/\r?\n/).map(v=>v.trim()).filter(Boolean);
 g.positions=[...new Set(lines)];saveDb();close();renderExtra('gangs');window.refreshGangIntel?.(gi);
 });
}

function modal(title,body,submit){
 close();const overlay=document.createElement('div');overlay.id='efGangOverlay';overlay.className='ef-overlay';
 overlay.innerHTML=`<div class="ef-dialog ef-gang-dialog" role="dialog" aria-modal="true" aria-label="${escapeHtml(title)}"><div class="ef-dialog-head"><h2>${escapeHtml(title)}</h2><button type="button" id="efGangClose">✕</button></div><form id="efGangForm">${body}<div class="ef-actions"><button type="button" id="efGangCancel">Cancel</button><button type="submit" class="blue">Save Changes</button></div></form></div>`;
 document.body.appendChild(overlay);
 overlay.querySelector('#efGangClose').onclick=close;overlay.querySelector('#efGangCancel').onclick=close;
 overlay.addEventListener('pointerdown',e=>{if(e.target===overlay)close()});
 overlay.querySelector('form').onsubmit=e=>{e.preventDefault();submit(new FormData(e.target));};
 overlay.querySelector('input')?.focus();
}
function gangLogoHtml(g){const colour=/^#[0-9a-fA-F]{6}$/.test(g.colour||'')?g.colour:'#3978d8';const image=typeof g.logoImage==='string'&&/^data:image\/(?:png|jpeg|webp|gif);base64,/.test(g.logoImage)?g.logoImage:'';return image?`<img class="ef-gang-uploaded-logo" src="${image}" alt="Gang logo">`:`<span class="ef-gang-card-logo" style="background:${colour}">${escapeHtml(g.emoji||'🏴')}</span>`;}
window.efGangLogoHtml=gangLogoHtml;
function editGang(i=null){
 const g=i===null?{}:gangAt(i)||{};
 const manualPins=cases.filter(p=>p.kind==='general'&&p.id);
 const pinChoices=manualPins.map(p=>`<option value="${escapeHtml(p.id)}" ${String(g.pinId||'')===String(p.id)?'selected':''}>${escapeHtml(p.caseNo||p.title||p.markerCategory||'Map pin')} — ${escapeHtml(p.location||'No postal')}</option>`).join('');
 const color=g.colour||'#3978d8';
 let logoImage=g.logoImage||"";
 const emojis=['🏴','💀','👑','🐍','🦂','🐺','🦅','🔥','⚡','💎','🃏','🔱','🛡️','🚩','🏍️','💰','🦇','🌹'];
 modal(i===null?'Create Gang':'Edit Gang',
 field('title','Gang Name *',g.title)+
 field('description','Description / Intelligence Notes',g.description,'textarea')+
 field('location','Gang Location / Postal',g.location||'')+field('territory','Territory / Areas Controlled',g.territory||'')+field('style','Style of Gang',g.style||'')+`<label>Threat Level<select name="threat">${['Unknown','Low','Moderate','High','Critical'].map(v=>`<option ${v===(g.threat||'Unknown')?'selected':''}>${v}</option>`).join('')}</select></label>`+
 `<label>Assign Existing Map Pin<select name="pinId"><option value="">No pin assigned</option>${pinChoices}</select></label><small>Choose a pin already placed on the map. Assigning it links that pin to this gang without moving it.</small>`+
 `<label>Gang Hex Colour<div class="ef-gang-color-row"><input name="colour" id="efGangHex" type="text" maxlength="7" pattern="#[0-9a-fA-F]{6}" value="${escapeHtml(color)}" placeholder="#3978D8" required><input type="color" id="efGangColorPicker" value="${/^#[0-9a-fA-F]{6}$/.test(color)?escapeHtml(color):'#3978d8'}"></div></label>`+
 `<label>Custom Gang Logo (PNG, JPG, WEBP or GIF)<input type="file" id="efGangLogoUpload" accept="image/png,image/jpeg,image/webp,image/gif"></label><small>Optional. Images are resized for local storage. Maximum original file size: 5 MB.</small><button type="button" id="efGangRemoveLogo">Remove Custom Logo</button>`+
 `<label>Gang Logo Emoji<input name="emoji" id="efGangEmoji" maxlength="12" value="${escapeHtml(g.emoji||'🏴')}" placeholder="🏴"></label><div class="ef-gang-emoji-picker">${emojis.map(em=>`<button type="button" class="ef-emoji-option" data-emoji="${em}">${em}</button>`).join('')}</div><div class="ef-gang-logo-preview"><span id="efGangLogoPreview" style="background:${escapeHtml(color)}">${escapeHtml(g.emoji||'🏴')}</span><span>Gang logo preview</span></div>`,
 f=>{
 const title=String(f.get('title')||'').trim();if(!title){alert('Enter a gang name.');return}
 const colour=String(f.get('colour')||'').trim();
 if(!/^#[0-9a-fA-F]{6}$/.test(colour)){alert('Enter a valid 6-digit hex colour, e.g. #3978D8');return}
 const pinId=String(f.get('pinId')||'');
 const location=String(f.get('location')||'').trim();
 const emoji=String(f.get('emoji')||'🏴').trim()||'🏴';
 database.gangs??=[];
 const gi=i===null?database.gangs.length:i;
 const updated={...g,logoImage,title,description:String(f.get('description')||''),location,territory:String(f.get('territory')||''),style:String(f.get('style')||''),threat:String(f.get('threat')||'Unknown'),colour,emoji,pinId,members:g.members||[],updated:new Date().toISOString()};
 if(i===null)database.gangs.push(updated);else database.gangs[i]=updated;
 // Remove only the link to this gang from the previously assigned pin.
 if(g.pinId&&g.pinId!==pinId){const old=cases.find(p=>p.id===g.pinId);if(old&&String(old.linkedGang)===String(gi))old.linkedGang='';}
 if(pinId){const pin=cases.find(p=>p.id===pinId&&p.kind==='general');if(pin)pin.linkedGang=String(gi);}
 if(g.pinId!==pinId)saveCases();
 close();persist();window.refreshGangIntel?.(gi);
 });
 const overlay=document.getElementById('efGangOverlay');
 const hex=overlay.querySelector('#efGangHex'),picker=overlay.querySelector('#efGangColorPicker'),emojiInput=overlay.querySelector('#efGangEmoji'),preview=overlay.querySelector('#efGangLogoPreview');
 const upload=overlay.querySelector('#efGangLogoUpload');
 upload.onchange=async()=>{const file=upload.files?.[0];if(!file)return;if(!['image/png','image/jpeg','image/webp','image/gif'].includes(file.type)||file.size>5*1024*1024){alert('Choose a PNG, JPG, WEBP or GIF under 5 MB.');upload.value='';return}try{const img=await createImageBitmap(file);const c=document.createElement('canvas');const scale=Math.min(1,256/Math.max(img.width,img.height));c.width=Math.max(1,Math.round(img.width*scale));c.height=Math.max(1,Math.round(img.height*scale));c.getContext('2d').drawImage(img,0,0,c.width,c.height);const encoded=c.toDataURL('image/webp',.85);if(encoded.length>300000){alert('Logo is too large to store in this browser. Try a smaller image.');return}logoImage=encoded;refresh()}catch(err){alert('Unable to read this image. Please try a PNG or JPG.')}};
 overlay.querySelector('#efGangRemoveLogo').onclick=()=>{logoImage='';upload.value='';refresh()};
 const refresh=()=>{if(/^#[0-9a-fA-F]{6}$/.test(hex.value)){picker.value=hex.value;preview.style.background=hex.value}preview.innerHTML=logoImage?`<img src="${logoImage}" alt="Gang logo">`:escapeHtml(emojiInput.value||'🏴')};
 picker.oninput=()=>{hex.value=picker.value;refresh()};
 hex.oninput=refresh;emojiInput.oninput=refresh;
 overlay.querySelectorAll('[data-emoji]').forEach(btn=>btn.onclick=()=>{emojiInput.value=btn.dataset.emoji;refresh()});
}
function editMember(gi,mi=null){
 const g=gangAt(gi);if(!g)return;const m=mi===null?{}:(g.members||[])[mi]||{};
 let photo=m.photo||'';
 modal(mi===null?`Add Member — ${g.title}`:`Edit Member — ${g.title}`,
 field('name','Member Name *',m.name)+field('alias','Alias / Street Name',m.alias)+field('phone','Phone Number',m.phone||'','tel')+
 field('rank','Gang Rank / Role',m.rank||m.position||'')+
 field('status','Status (Active, Inactive, Deceased, etc.)',m.status||'Active')+
 field('notes','Intelligence Notes',m.notes,'textarea')+
 `<label>Member Photograph (PNG, JPG, WEBP)<input type="file" id="efMemberPhoto" accept="image/png,image/jpeg,image/webp"></label><small>Images are resized and stored locally in this browser. Maximum file size: 5 MB.</small><div class="ef-member-photo-preview" id="efMemberPhotoPreview"></div><button type="button" id="efMemberRemovePhoto">Remove Photograph</button>`,f=>{
 const name=String(f.get('name')||'').trim();if(!name){alert('Enter a member name.');return}
 g.members??=[];
 const updated={...m,name,alias:String(f.get('alias')||''),phone:String(f.get('phone')||'').trim(),rank:String(f.get('rank')||''),position:'',status:String(f.get('status')||''),notes:String(f.get('notes')||''),photo,updated:new Date().toISOString()};
 const existing=window.efContacts?.get().find(c=>c.id===m.contactId)||window.efContacts?.get().find(c=>c.name.trim().toLowerCase()===name.toLowerCase());
 const contactId=existing?.id||('contact-'+Date.now()+'-'+Math.random().toString(36).slice(2,7));
 updated.contactId=contactId;
 if(mi===null)g.members.push(updated);else g.members[mi]=updated;
 const affiliations=(existing?.affiliations||[]).filter(a=>a.gangId!==String(gi));affiliations.push({gangId:String(gi),gang:g.title,position:updated.rank,status:updated.status});
 window.efContacts?.upsert({...existing,id:contactId,name,alias:updated.alias,phone:updated.phone,photo:updated.photo,gang:g.title,type:existing?.type||'Associate',notes:existing?.notes||updated.notes,addedBy:existing?.addedBy||'Gang Roster',affiliations,updated:new Date().toISOString()});
 close();saveDb();renderExtra('gangs');window.refreshGangIntel?.(gi);
 });
 const overlay=document.getElementById('efGangOverlay'),upload=overlay.querySelector('#efMemberPhoto'),preview=overlay.querySelector('#efMemberPhotoPreview');
 const showPhoto=()=>{preview.replaceChildren();if(photo){const img=document.createElement('img');img.src=photo;img.alt='Member photograph';preview.appendChild(img)}else preview.textContent='No photograph selected';};
 showPhoto();
 upload.onchange=async()=>{
  const file=upload.files?.[0];if(!file)return;
  if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>5*1024*1024){alert('Choose a PNG, JPG or WEBP image under 5 MB.');upload.value='';return;}
  try{
   const bitmap=await createImageBitmap(file),canvas=document.createElement('canvas');
   const scale=Math.min(1,512/Math.max(bitmap.width,bitmap.height));canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));
   canvas.getContext('2d').drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close?.();
   const encoded=canvas.toDataURL('image/webp',.72);
   if(encoded.length>380000){alert('Photo is too large for local browser storage. Please choose a smaller image.');return;}
   photo=encoded;showPhoto();
  }catch(err){alert('Unable to process photograph. Try a different PNG or JPG.');}
 };
 overlay.querySelector('#efMemberRemovePhoto').onclick=()=>{photo='';upload.value='';showPhoto()};
}

window.efSyncContactToGangs=contact=>{for(let gi=0;gi<(database.gangs||[]).length;gi++){const g=database.gangs[gi];for(const m of g.members||[]){if(m.contactId===contact.id){m.name=contact.name;m.alias=contact.alias;}}}saveDb();};
window.efOpenGangMemberContact=(gi,mi)=>{const member=gangAt(gi)?.members?.[mi];if(!member)return;let contact=window.efContacts?.get().find(c=>c.id===member.contactId);if(!contact){member.contactId='contact-'+Date.now()+'-'+Math.random().toString(36).slice(2,7);contact={id:member.contactId,name:member.name,alias:member.alias||'',type:'Associate',gang:gangAt(gi)?.title||'',addedBy:'Gang Roster',affiliations:[{gangId:String(gi),gang:gangAt(gi)?.title||'',position:member.position||'Member',status:member.status||'Active'}]};window.efContacts?.upsert(contact);saveDb();}document.getElementById('efIntelOverlay')?.remove();window.efContacts?.open(member.contactId)};
window.renderGangMembers=gi=>{
 const g=gangAt(gi);if(!g)return '';const members=g.members||[];
 return `<section class="ef-gang-members"><div class="ef-gang-members-head"><h3>Gang Members <span class="gang-count">${members.length}</span></h3><button class="blue" data-gang-addmember="${gi}" type="button">+ Add Member</button></div>${g.territory?`<p><strong>Territory:</strong> ${escapeHtml(g.territory)}</p>`:''}${members.length?`<div class="ef-gang-member-grid">${members.map((m,mi)=>`<div class="db-card">${m.photo&&/^data:image\/(?:png|jpeg|webp);base64,/.test(m.photo)?`<img class="ef-member-card-photo" src="${m.photo}" alt="Member photo">`:``}<h3>${escapeHtml(m.name)}</h3><p>${escapeHtml([m.alias,m.rank||m.position,m.status].filter(Boolean).join(' · '))}</p>${m.phone?`<p>Phone: ${escapeHtml(m.phone)}</p>`:``}${m.notes?`<p>${escapeHtml(m.notes)}</p>`:''}<button data-gang-editmember="${gi}:${mi}">Edit</button> <button data-gang-deletemember="${gi}:${mi}">Remove</button></div>`).join('')}</div>`:'<p>No members recorded yet. Select + Add Member to create one.</p>'}</section>`;
};
const previousRenderExtra=renderExtra;
renderExtra=function(section){
 previousRenderExtra(section);
 if(section!=='gangs')return;
 document.getElementById('extraTitle').textContent='GANGS';
 const b=document.getElementById('addEntryBtn');b.textContent='+ Add Gang';b.style.display='';
 const root=document.getElementById('extraContent');
 if(root.querySelector('.gang-profile'))return;
 root.querySelectorAll('[data-dbedit]').forEach(btn=>{btn.dataset.gangEdit=btn.dataset.dbedit;btn.removeAttribute('data-dbedit')});
 root.querySelectorAll('[data-dbdelete]').forEach(btn=>{btn.dataset.gangDelete=btn.dataset.dbdelete;btn.removeAttribute('data-dbdelete')});
 root.querySelectorAll('.db-card').forEach(card=>{const g=card.querySelector('[data-gang-open]');if(!g)return;const idx=Number(g.dataset.gangOpen);const gang=gangAt(idx);if(gang){const title=card.querySelector('h3');if(title){title.style.display='flex';title.style.alignItems='center';title.style.gap='9px';title.insertAdjacentHTML('afterbegin',gangLogoHtml(gang));title.insertAdjacentHTML('afterend',`<p>${(gang.members||[]).length} member(s)${gang.location||gang.territory?' · '+escapeHtml(gang.location||gang.territory):''}${gang.pinId?' · Map pin linked':''}</p>`)} }});
};
document.addEventListener('click',async e=>{
 const b=e.target.closest('button');if(!b)return;
 if(b.id==='addEntryBtn'&&currentSection==='gangs'){e.preventDefault();e.stopImmediatePropagation();editGang();return}
 if(b.dataset.gangEdit!==undefined){e.preventDefault();e.stopImmediatePropagation();editGang(Number(b.dataset.gangEdit));return}
 if(b.dataset.gangDelete!==undefined){e.preventDefault();e.stopImmediatePropagation();const i=Number(b.dataset.gangDelete);if(await window.lspdConfirmDelete('Delete this gang and its member roster?')){database.gangs.splice(i,1);persist()}return}
 if(b.dataset.gangPositions!==undefined){e.preventDefault();e.stopImmediatePropagation();managePositions(Number(b.dataset.gangPositions));return}
 if(b.dataset.gangAddmember!==undefined){e.preventDefault();e.stopImmediatePropagation();editMember(Number(b.dataset.gangAddmember));return}
 if(b.dataset.gangEditmember!==undefined){e.preventDefault();e.stopImmediatePropagation();const [gi,mi]=b.dataset.gangEditmember.split(':').map(Number);editMember(gi,mi);return}
 if(b.dataset.gangDeletemember!==undefined){e.preventDefault();e.stopImmediatePropagation();const [gi,mi]=b.dataset.gangDeletemember.split(':').map(Number);if(await window.lspdConfirmDelete('Remove this member from the gang?')){const removed=gangAt(gi)?.members?.splice(mi,1)?.[0];if(removed?.contactId){const contact=window.efContacts?.get().find(c=>c.id===removed.contactId);if(contact){contact.affiliations=(contact.affiliations||[]).filter(a=>a.gangId!==String(gi));contact.gang=contact.affiliations[0]?.gang||'';window.efContacts?.save();}}saveDb();renderExtra('gangs');window.refreshGangIntel?.(gi)}return}
},true);
})();
