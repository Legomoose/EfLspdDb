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
 modal(i===null?'Create Gang':'Edit Gang',field('title','Gang Name *',g.title)+field('description','Description / Intelligence Notes',g.description,'textarea')+field('territory','Known Territory / Area',g.territory)+field('colour','Gang Colour',g.colour),f=>{
 const title=String(f.get('title')||'').trim();if(!title){alert('Enter a gang name.');return}
 database.gangs??=[];const updated={...g,title,description:String(f.get('description')||''),territory:String(f.get('territory')||''),colour:String(f.get('colour')||''),members:g.members||[],updated:new Date().toISOString()};
 if(i===null)database.gangs.push(updated);else database.gangs[i]=updated;
 close();persist();
 });
}
function editMember(gi,mi=null){
 const g=gangAt(gi);if(!g)return;const m=mi===null?{}:(g.members||[])[mi]||{};
 modal(mi===null?`Add Member — ${g.title}`:`Edit Member — ${g.title}`,
 field('name','Member Name *',m.name)+field('alias','Alias / Street Name',m.alias)+field('rank','Gang Rank / Role',m.rank)+field('status','Status (Active, Inactive, Deceased, etc.)',m.status||'Active')+field('notes','Intelligence Notes',m.notes,'textarea'),f=>{
 const name=String(f.get('name')||'').trim();if(!name){alert('Enter a member name.');return}
 g.members??=[];const updated={...m,name,alias:String(f.get('alias')||''),rank:String(f.get('rank')||''),status:String(f.get('status')||''),notes:String(f.get('notes')||''),updated:new Date().toISOString()};
 if(mi===null)g.members.push(updated);else g.members[mi]=updated;
 close();saveDb();renderExtra('gangs');
 });
}
window.renderGangMembers=gi=>{
 const g=gangAt(gi);if(!g)return '';const members=g.members||[];
 return `<section class="ef-gang-members"><div class="ef-gang-members-head"><h3>Gang Members <span class="gang-count">${members.length}</span></h3><button class="blue" data-gang-addmember="${gi}" type="button">+ Add Member</button></div>${g.territory?`<p><strong>Territory:</strong> ${escapeHtml(g.territory)}</p>`:''}${members.length?`<div class="ef-gang-member-grid">${members.map((m,mi)=>`<div class="db-card"><h3>${escapeHtml(m.name)}</h3><p>${escapeHtml([m.alias,m.rank,m.status].filter(Boolean).join(' · '))}</p>${m.notes?`<p>${escapeHtml(m.notes)}</p>`:''}<button data-gang-editmember="${gi}:${mi}">Edit</button> <button data-gang-deletemember="${gi}:${mi}">Remove</button></div>`).join('')}</div>`:'<p>No members recorded yet. Select + Add Member to create one.</p>'}</section>`;
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
 root.querySelectorAll('.db-card').forEach(card=>{const g=card.querySelector('[data-gang-open]');if(!g)return;const idx=Number(g.dataset.gangOpen);const gang=gangAt(idx);if(gang)card.querySelector('h3')?.insertAdjacentHTML('afterend',`<p>${(gang.members||[]).length} member(s)${gang.territory?' · '+escapeHtml(gang.territory):''}</p>`)});
};
document.addEventListener('click',e=>{
 const b=e.target.closest('button');if(!b)return;
 if(b.id==='addEntryBtn'&&currentSection==='gangs'){e.preventDefault();e.stopImmediatePropagation();editGang();return}
 if(b.dataset.gangEdit!==undefined){e.preventDefault();e.stopImmediatePropagation();editGang(Number(b.dataset.gangEdit));return}
 if(b.dataset.gangDelete!==undefined){e.preventDefault();e.stopImmediatePropagation();const i=Number(b.dataset.gangDelete);if(confirm('Delete this gang and its member roster?')){database.gangs.splice(i,1);persist()}return}
 if(b.dataset.gangAddmember!==undefined){e.preventDefault();e.stopImmediatePropagation();editMember(Number(b.dataset.gangAddmember));return}
 if(b.dataset.gangEditmember!==undefined){e.preventDefault();e.stopImmediatePropagation();const [gi,mi]=b.dataset.gangEditmember.split(':').map(Number);editMember(gi,mi);return}
 if(b.dataset.gangDeletemember!==undefined){e.preventDefault();e.stopImmediatePropagation();const [gi,mi]=b.dataset.gangDeletemember.split(':').map(Number);if(confirm('Remove this member from the gang?')){gangAt(gi)?.members?.splice(mi,1);saveDb();renderExtra('gangs')}return}
},true);
})();
