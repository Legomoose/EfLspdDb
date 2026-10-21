/* EFLSPDDB gang profile and member editor; preserves existing database.gangs records. */
(()=>{
const escapeHtml=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const gangAt=i=>(database.gangs||[])[i];
const persist=()=>{saveDb();renderExtra('gangs')};
const field=(name,label,value='',kind='text')=>`<label>${label}${kind==='textarea'?`<textarea name="${name}" rows="3">${escapeHtml(value)}</textarea>`:`<input name="${name}" type="${kind}" value="${escapeHtml(value)}">`}</label>`;
const close=()=>document.getElementById('efGangOverlay')?.remove();
function modal(title,body,submit){
 close();const overlay=document.createElement('div');overlay.id='efGangOverlay';overlay.className='ef-overlay';
 overlay.innerHTML=`<div class="ef-dialog ef-gang-dialog" role="dialog" aria-modal="true" aria-label="${escapeHtml(title)}"><div class="ef-dialog-head"><h2>${escapeHtml(title)}</h2><button type="button" id="efGangClose">✕</button></div><form id="efGangForm">${body}<div class="ef-actions"><button type="button" id="efGangCancel">Cancel</button><button type="submit" class="blue">Save Changes</button></div></form></div>`;
 document.body.appendChild(overlay);
 overlay.querySelector('#efGangClose').onclick=close;overlay.querySelector('#efGangCancel').onclick=close;
 overlay.addEventListener('pointerdown',e=>{if(e.target===overlay)close()});
 overlay.querySelector('form').onsubmit=e=>{e.preventDefault();submit(new FormData(e.target));};
 overlay.querySelector('input')?.focus();
}
function editGang(i=null){
 const g=i===null?{}:gangAt(i)||{};
 const manualPins=cases.filter(p=>p.kind==='general'&&p.id);
 const pinChoices=manualPins.map(p=>`<option value="${escapeHtml(p.id)}" ${String(g.pinId||'')===String(p.id)?'selected':''}>${escapeHtml(p.caseNo||p.title||p.markerCategory||'Map pin')} — ${escapeHtml(p.location||'No postal')}</option>`).join('');
 const color=g.colour||'#3978d8';
 const emojis=['🏴','💀','👑','🐍','🦂','🐺','🦅','🔥','⚡','💎','🃏','🔱','🛡️','🚩','🏍️','💰','🦇','🌹'];
 modal(i===null?'Create Gang':'Edit Gang',
 field('title','Gang Name *',g.title)+
 field('description','Description / Intelligence Notes',g.description,'textarea')+
 field('location','Gang Location / Postal',g.location||'')+field('territory','Territory / Areas Controlled',g.territory||'')+field('style','Style of Gang',g.style||'')+`<label>Threat Level<select name="threat">${['Unknown','Low','Moderate','High','Critical'].map(v=>`<option ${v===(g.threat||'Unknown')?'selected':''}>${v}</option>`).join('')}</select></label>`+
 `<label>Assign Existing Map Pin<select name="pinId"><option value="">No pin assigned</option>${pinChoices}</select></label><small>Choose a pin already placed on the map. Assigning it links that pin to this gang without moving it.</small>`+
 `<label>Gang Hex Colour<div class="ef-gang-color-row"><input name="colour" id="efGangHex" type="text" maxlength="7" pattern="#[0-9a-fA-F]{6}" value="${escapeHtml(color)}" placeholder="#3978D8" required><input type="color" id="efGangColorPicker" value="${/^#[0-9a-fA-F]{6}$/.test(color)?escapeHtml(color):'#3978d8'}"></div></label>`+
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
 const updated={...g,title,description:String(f.get('description')||''),location,territory:String(f.get('territory')||''),style:String(f.get('style')||''),threat:String(f.get('threat')||'Unknown'),colour,emoji,pinId,members:g.members||[],updated:new Date().toISOString()};
 if(i===null)database.gangs.push(updated);else database.gangs[i]=updated;
 // Remove only the link to this gang from the previously assigned pin.
 if(g.pinId&&g.pinId!==pinId){const old=cases.find(p=>p.id===g.pinId);if(old&&String(old.linkedGang)===String(gi))old.linkedGang='';}
 if(pinId){const pin=cases.find(p=>p.id===pinId&&p.kind==='general');if(pin)pin.linkedGang=String(gi);}
 if(g.pinId!==pinId)saveCases();
 close();persist();window.refreshGangIntel?.(gi);
 });
 const overlay=document.getElementById('efGangOverlay');
 const hex=overlay.querySelector('#efGangHex'),picker=overlay.querySelector('#efGangColorPicker'),emojiInput=overlay.querySelector('#efGangEmoji'),preview=overlay.querySelector('#efGangLogoPreview');
 const refresh=()=>{if(/^#[0-9a-fA-F]{6}$/.test(hex.value)){picker.value=hex.value;preview.style.background=hex.value}preview.textContent=emojiInput.value||'🏴'};
 picker.oninput=()=>{hex.value=picker.value;refresh()};
 hex.oninput=refresh;emojiInput.oninput=refresh;
 overlay.querySelectorAll('[data-emoji]').forEach(btn=>btn.onclick=()=>{emojiInput.value=btn.dataset.emoji;refresh()});
}
function editMember(gi,mi=null){
 const g=gangAt(gi);if(!g)return;const m=mi===null?{}:(g.members||[])[mi]||{};
 modal(mi===null?`Add Member — ${g.title}`:`Edit Member — ${g.title}`,
 field('name','Member Name *',m.name)+field('alias','Alias / Street Name',m.alias)+`<label>Gang Position<select name="position">${['Leader','Second-in-Command','Third-in-Command','Member','Associate'].map(v=>`<option ${v===(m.position||'Member')?'selected':''}>${v}</option>`).join('')}</select></label>`+field('rank','Gang Rank / Role',m.rank)+field('status','Status (Active, Inactive, Deceased, etc.)',m.status||'Active')+field('notes','Intelligence Notes',m.notes,'textarea'),f=>{
 const name=String(f.get('name')||'').trim();if(!name){alert('Enter a member name.');return}
 g.members??=[];const updated={...m,name,position:String(f.get('position')||'Member'),alias:String(f.get('alias')||''),rank:String(f.get('rank')||''),status:String(f.get('status')||''),notes:String(f.get('notes')||''),updated:new Date().toISOString()};
 const existing=window.efContacts?.get().find(c=>c.id===m.contactId)||window.efContacts?.get().find(c=>c.name.trim().toLowerCase()===name.toLowerCase());
 const contactId=existing?.id||('contact-'+Date.now()+'-'+Math.random().toString(36).slice(2,7));
 updated.contactId=contactId;
 if(mi===null)g.members.push(updated);else g.members[mi]=updated;
 const affiliations=(existing?.affiliations||[]).filter(a=>a.gangId!==String(gi));affiliations.push({gangId:String(gi),gang:g.title,position:updated.position,status:updated.status});
 window.efContacts?.upsert({...existing,id:contactId,name,alias:updated.alias,gang:g.title,type:existing?.type||'Associate',notes:existing?.notes||updated.notes,addedBy:existing?.addedBy||'Gang Roster',affiliations,updated:new Date().toISOString()});
 close();saveDb();renderExtra('gangs');window.refreshGangIntel?.(gi);
 });
}
window.efSyncContactToGangs=contact=>{for(let gi=0;gi<(database.gangs||[]).length;gi++){const g=database.gangs[gi];for(const m of g.members||[]){if(m.contactId===contact.id){m.name=contact.name;m.alias=contact.alias;}}}saveDb();};
window.efOpenGangMemberContact=(gi,mi)=>{const member=gangAt(gi)?.members?.[mi];if(!member)return;let contact=window.efContacts?.get().find(c=>c.id===member.contactId);if(!contact){member.contactId='contact-'+Date.now()+'-'+Math.random().toString(36).slice(2,7);contact={id:member.contactId,name:member.name,alias:member.alias||'',type:'Associate',gang:gangAt(gi)?.title||'',addedBy:'Gang Roster',affiliations:[{gangId:String(gi),gang:gangAt(gi)?.title||'',position:member.position||'Member',status:member.status||'Active'}]};window.efContacts?.upsert(contact);saveDb();}document.getElementById('efIntelOverlay')?.remove();window.efContacts?.open(member.contactId)};
window.renderGangMembers=gi=>{
 const g=gangAt(gi);if(!g)return '';const members=g.members||[];
 return `<section class="ef-gang-members"><div class="ef-gang-members-head"><h3>Gang Members <span class="gang-count">${members.length}</span></h3><button class="blue" data-gang-addmember="${gi}" type="button">+ Add Member</button></div>${g.territory?`<p><strong>Territory:</strong> ${escapeHtml(g.territory)}</p>`:''}${members.length?`<div class="ef-gang-member-grid">${members.map((m,mi)=>`<div class="db-card"><h3>${escapeHtml(m.name)}</h3><p>${escapeHtml([m.position||'Member',m.alias,m.rank,m.status].filter(Boolean).join(' · '))}</p>${m.notes?`<p>${escapeHtml(m.notes)}</p>`:''}<button data-gang-editmember="${gi}:${mi}">Edit</button> <button data-gang-deletemember="${gi}:${mi}">Remove</button></div>`).join('')}</div>`:'<p>No members recorded yet. Select + Add Member to create one.</p>'}</section>`;
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
 root.querySelectorAll('.db-card').forEach(card=>{const g=card.querySelector('[data-gang-open]');if(!g)return;const idx=Number(g.dataset.gangOpen);const gang=gangAt(idx);if(gang){const title=card.querySelector('h3');if(title){title.style.display='flex';title.style.alignItems='center';title.style.gap='9px';title.insertAdjacentHTML('afterbegin',`<span class="ef-gang-card-logo" style="background:${/^#[0-9a-fA-F]{6}$/.test(gang.colour||'')?gang.colour:'#3978d8'}">${escapeHtml(gang.emoji||'🏴')}</span>`);title.insertAdjacentHTML('afterend',`<p>${(gang.members||[]).length} member(s)${gang.location||gang.territory?' · '+escapeHtml(gang.location||gang.territory):''}${gang.pinId?' · Map pin linked':''}</p>`)} }});
};
document.addEventListener('click',e=>{
 const b=e.target.closest('button');if(!b)return;
 if(b.id==='addEntryBtn'&&currentSection==='gangs'){e.preventDefault();e.stopImmediatePropagation();editGang();return}
 if(b.dataset.gangEdit!==undefined){e.preventDefault();e.stopImmediatePropagation();editGang(Number(b.dataset.gangEdit));return}
 if(b.dataset.gangDelete!==undefined){e.preventDefault();e.stopImmediatePropagation();const i=Number(b.dataset.gangDelete);if(confirm('Delete this gang and its member roster?')){database.gangs.splice(i,1);persist()}return}
 if(b.dataset.gangAddmember!==undefined){e.preventDefault();e.stopImmediatePropagation();editMember(Number(b.dataset.gangAddmember));return}
 if(b.dataset.gangEditmember!==undefined){e.preventDefault();e.stopImmediatePropagation();const [gi,mi]=b.dataset.gangEditmember.split(':').map(Number);editMember(gi,mi);return}
 if(b.dataset.gangDeletemember!==undefined){e.preventDefault();e.stopImmediatePropagation();const [gi,mi]=b.dataset.gangDeletemember.split(':').map(Number);if(confirm('Remove this member from the gang?')){const removed=gangAt(gi)?.members?.splice(mi,1)?.[0];if(removed?.contactId){const contact=window.efContacts?.get().find(c=>c.id===removed.contactId);if(contact){contact.affiliations=(contact.affiliations||[]).filter(a=>a.gangId!==String(gi));contact.gang=contact.affiliations[0]?.gang||'';window.efContacts?.save();}}saveDb();renderExtra('gangs');window.refreshGangIntel?.(gi)}return}
},true);
})();
