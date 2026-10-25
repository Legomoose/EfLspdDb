/* LSPD DB — unified Personnel: DB accounts + existing shared HC roster. No migrations. */
(()=>{'use strict';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const $=s=>document.querySelector(s);
// Natural callsign ordering: 1W-9 before 1W-18; blanks last.
function lspdCompareCallsign(a,b){
 const x=String(a?.callsign||'').trim(),y=String(b?.callsign||'').trim();
 if(!x&&!y)return String(a?.name||'').localeCompare(String(b?.name||''));
 if(!x)return 1;if(!y)return -1;
 const result=x.localeCompare(y,undefined,{numeric:true,sensitivity:'base'});
 return result||String(a?.name||'').localeCompare(String(b?.name||''));
}
window.LSPDCompareCallsign=lspdCompareCallsign;
const canEdit=()=>['owner','high_command','director'].includes(window.EFDBAuth?.user?.role);
const caseCount=name=>(window.EFCaseFiles?.list?.()||[]).filter(f=>String(f.detective||'').trim().toLowerCase()===String(name||'').trim().toLowerCase()).length;
const api=(action,extra={})=>window.EFDBAuth.request('/live-records',{dataset:'high_command',action,...extra});
const nav=$('.ef-primary-navigation [data-section="high-command"]');if(nav)nav.remove();
let lastRun=0, hcRows=[], hcOnline=false, accountHCRows=[];
function moveSpenser(){
 const directory=$('#efDirectoryGrid'), ownerGrid=$('#lspdHCOwnerGrid');
 if(!directory||!ownerGrid)return;
 const cards=[...directory.querySelectorAll('.ef8g-detective')];
 const card=cards.find(el=>el.querySelector('.ef8g-detective-name')?.textContent.trim().toLowerCase()==='clay spenser');
 if(card){card.classList.add('lspd-hc-owner-card');const meta=card.querySelector('.ef8g-detective-meta');if(meta&&meta.firstChild&&meta.firstChild.nodeType===Node.TEXT_NODE&&meta.firstChild.textContent.trim().toLowerCase()==='owner')meta.firstChild.textContent='Office of Operations';ownerGrid.append(card)}
 // Search re-renders the account cards, so clear the previously moved one if absent.
 else ownerGrid.replaceChildren();
}
const prior=window.renderExtra;
window.renderExtra=function(section){
  if(section==='high-command')section='directory';
  const result=prior.apply(this,[section]);
  if(section==='directory')mount();
  return result;
};
function active(){return $('#extraTitle')?.textContent==='PERSONNEL DIRECTORY' && !!$('#lspdHCSection')}
function mount(){
 const content=$('#extraContent');if(!content)return;
 $('#extraTitle').textContent='PERSONNEL DIRECTORY';
 const card=content.querySelector('.db-card');if(!card)return;
 const head=card.querySelector('.ef-heading-row h3');if(head)head.textContent='DETECTIVE BUREAU';
 const description=card.querySelector('.ef-heading-row p');if(description)description.textContent='Detective profiles and assigned investigations';
 const section=document.createElement('section');section.id='lspdHCSection';section.className='lspd-hc-section';
 section.innerHTML='<div class="lspd-hc-heading"><div><h3>HIGH COMMAND</h3><p>Command personnel and departmental positions</p></div><div class="lspd-hc-actions"><button id="lspdHCAdd" type="button" class="blue" hidden>+ Add Member</button></div></div><div id="lspdHCOwnerGrid" class="ef8g-directory lspd-hc-grid"></div><div id="lspdHCStatus" role="status">Loading shared High Command roster…</div><div id="lspdHCGrid" class="ef8g-directory lspd-hc-grid"></div>';
 card.after(section);
 const search=$('#efDirectorySearch');if(search){search.placeholder='Search personnel by name, badge, rank or callsign...';search.addEventListener('input',()=>{moveSpenser();drawAccountHC();drawHC()})}
 moveSpenser();
 const run=++lastRun;
 loadHCAccounts(run);
 hcOnline=false;hcRows=[];
 if(!window.EFDBAuth?.loggedIn){$('#lspdHCStatus').textContent='Sign in to view the shared High Command roster.';return}
 api('list').then(r=>{if(run!==lastRun||!active())return;hcOnline=true;hcRows=(r.records||[]).filter(x=>!x.deleted_at).map(r=>({...r.body,_id:r.record_id,_version:r.version}));$('#lspdHCAdd').hidden=!canEdit();$('#lspdHCAdd').onclick=()=>editor();drawHC()}).catch(e=>{if(run!==lastRun||!active())return;$('#lspdHCStatus').textContent='Shared High Command roster unavailable: '+e.message;$('#lspdHCGrid').replaceChildren()});
}
async function loadHCAccounts(run){
 try{
  const response=await window.EFDBAuth.request('/accounts',{action:'list'});
  if(run!==lastRun||!active())return;
  accountHCRows=(response.accounts||[]).filter(a=>a.active!==false&&['owner','high_command'].includes(a.role));
  drawAccountHC();
  drawHC();
 }catch(e){
  if(run!==lastRun||!active())return;
  const status=$('#lspdHCAccountStatus');
  if(status)status.textContent='Account directory unavailable: '+e.message;
 }
}
function drawAccountHC(){
 const grid=$('#lspdHCOwnerGrid');if(!grid)return;
 const q=($('#efDirectorySearch')?.value||'').trim().toLowerCase();
 const existing=grid.querySelectorAll('[data-hc-account]');
 existing.forEach(el=>el.remove());
 const movedNames=new Set([...grid.querySelectorAll('.ef8g-detective:not([data-hc-account])')].map(el=>el.querySelector('.ef8g-detective-name')?.textContent.trim().toLowerCase()));
 const accounts=accountHCRows.filter(a=>!movedNames.has(String(a.display_name||'').trim().toLowerCase()))
  .filter(a=>[a.display_name,a.callsign,a.badge_number,a.role].some(v=>String(v||'').toLowerCase().includes(q)))
  .sort((a,b)=>lspdCompareCallsign({callsign:a.callsign,name:a.display_name},{callsign:b.callsign,name:b.display_name}));
 for(const a of accounts){
  const card=document.createElement('article');card.className='ef8g-detective lspd-hc-card';card.dataset.hcAccount=a.id;
  card.innerHTML=`<div class="ef8g-detective-top"><div class="ef8g-detective-avatar"><i class="fa-solid fa-shield-halved"></i></div><div><div class="ef8g-detective-name">${esc(a.display_name)}</div><div class="ef8g-detective-meta">${esc(a.role==='owner'?'Office of Operations':'High Command')}<br>Badge #${esc(a.badge_number||'—')}<br>Callsign: ${esc(a.callsign||'—')}</div></div></div><div class="ef8g-detective-stats"><span>📁 ${caseCount(a.display_name)} Assigned Cases</span><span>● Active</span></div><button type="button" data-profile>View Profile</button>`;
  card.querySelector('[data-profile]').onclick=()=>profile({name:a.display_name,rank:a.role==='owner'?'Office of Operations':'High Command',callsign:a.callsign,badge:a.badge_number,notes:a.profile_notes});
  grid.append(card);
 }
}
function drawHC(){if(!active()||!hcOnline)return;const q=($('#efDirectorySearch')?.value||'').trim().toLowerCase();const existingNames=new Set([...accountHCRows.map(a=>a.display_name),...Array.from($('#lspdHCOwnerGrid')?.querySelectorAll('.lspd-hc-owner-card .ef8g-detective-name')||[],e=>e.textContent)].map(n=>String(n||'').trim().toLowerCase()));const rows=hcRows.map((r,i)=>({...r,_idx:i})).filter(r=>!existingNames.has(String(r.name||'').trim().toLowerCase())).filter(r=>[r.name,r.rank,r.callsign,r.badge,r.notes].some(v=>String(v||'').toLowerCase().includes(q))).sort(lspdCompareCallsign);
 const status=$('#lspdHCStatus');const total=rows.length+accountHCRows.filter(a=>a.active!==false).length;status.textContent=total?`${total} High Command account/roster member${total===1?'':'s'}`:(q?'No matching High Command members.':'No High Command members yet.');
 const grid=$('#lspdHCGrid');grid.innerHTML=rows.map(r=>`<article class="ef8g-detective lspd-hc-card"><div class="ef8g-detective-top"><div class="ef8g-detective-avatar"><i class="fa-solid fa-shield-halved"></i></div><div><div class="ef8g-detective-name">${esc(r.name)}</div><div class="ef8g-detective-meta">${esc(r.rank||'High Command')}<br>Badge #${esc(r.badge||'—')}<br>Callsign: ${esc(r.callsign||'—')}</div></div></div><div class="ef8g-detective-stats"><span>High Command</span><span>Shared roster</span></div>${r.notes?`<p class="lspd-hc-note">${esc(r.notes)}</p>`:''}<button type="button" data-hc-view="${r._idx}">View Profile</button>${canEdit()?`<div class="lspd-hc-card-controls"><button type="button" data-hc-edit="${r._idx}">Edit</button><button type="button" data-hc-remove="${r._idx}">Remove</button></div>`:''}</article>`).join('');
 grid.querySelectorAll('[data-hc-view]').forEach(b=>b.onclick=()=>profile(hcRows[+b.dataset.hcView]));grid.querySelectorAll('[data-hc-edit]').forEach(b=>b.onclick=()=>editor(hcRows[+b.dataset.hcEdit]));grid.querySelectorAll('[data-hc-remove]').forEach(b=>b.onclick=()=>remove(hcRows[+b.dataset.hcRemove]));
}
function overlay(title,inner){const bg=document.createElement('div');bg.className='ef-hc-overlay lspd-hc-modal';bg.innerHTML=`<div class="ef-hc-form"><div class="ef-hc-formtop"><h2>${esc(title)}</h2><button type="button" data-close aria-label="Close">×</button></div>${inner}</div>`;document.body.append(bg);bg.querySelector('[data-close]').onclick=()=>bg.remove();bg.addEventListener('click',e=>{if(e.target===bg)bg.remove()});return bg}
function profile(r){const bg=overlay('High Command Profile',`<div class="lspd-hc-profile"><h3>${esc(r.name)}</h3><p>${esc(r.rank||'High Command')} · ${esc(r.callsign||'No callsign')}</p><p>Badge: ${esc(r.badge||'—')}</p>${r.notes?`<p>${esc(r.notes)}</p>`:''}</div>`);return bg}
function editor(r={}){if(!hcOnline||!canEdit())return;const bg=overlay(r._id?'Edit High Command Member':'Add High Command Member',`<form id="lspdHCForm">${[['name','Name'],['rank','Rank'],['callsign','Callsign'],['badge','Badge']].map(([k,label])=>`<label>${label}<input name="${k}" maxlength="90" ${k==='name'?'required':''} value="${esc(r[k])}"></label>`).join('')}<label>Notes<textarea name="notes" rows="3">${esc(r.notes)}</textarea></label><p id="lspdHCError" role="alert"></p><div class="ef-hc-actions"><button type="button" data-cancel>Cancel</button><button type="submit" class="blue">Save Member</button></div></form>`);
 bg.querySelector('[data-cancel]').onclick=()=>bg.remove();bg.querySelector('form').onsubmit=async e=>{e.preventDefault();const data=Object.fromEntries(new FormData(e.currentTarget));if(!data.name.trim())return;const submit=bg.querySelector('[type="submit"]');submit.disabled=true;try{if(r._id)await api('update',{id:r._id,version:r._version,body:data});else await api('create',{id:'hc-'+(crypto.randomUUID?.()||Date.now()),body:data});bg.remove();refresh()}catch(err){bg.querySelector('#lspdHCError').textContent='Not saved: '+err.message;submit.disabled=false}}}
async function remove(r){if(!hcOnline||!canEdit())return;const confirmed=await ask(`Remove ${r.name} from the shared High Command roster?`);if(!confirmed)return;try{await api('delete',{id:r._id,version:r._version});refresh()}catch(e){window.alert('Not removed: '+e.message)}}
async function ask(message){if(typeof window.LSPDConfirm==='function')return !!(await window.LSPDConfirm(message));return new Promise(resolve=>{const bg=overlay('Remove High Command Member',`<p>${esc(message)}</p><div class="ef-hc-actions"><button type="button" data-cancel>Cancel</button><button type="button" class="lspd-danger" data-delete>Remove</button></div>`);bg.querySelector('[data-cancel]').onclick=()=>{bg.remove();resolve(false)};bg.querySelector('[data-delete]').onclick=()=>{bg.remove();resolve(true)};bg.querySelector('[data-close]').onclick=()=>{bg.remove();resolve(false)}})}
function refresh(){if(active())window.renderExtra('directory')}
})();
