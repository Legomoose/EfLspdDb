/* Optional visual preferences only; never changes or deletes map records. */
(()=>{
'use strict';
const KEY='eflspddb_sidebar_icon_overhaul_v1';
const DEFAULTS=[
['Active Investigation','location-dot','#ff586b'],['Crime Scene','biohazard','#42e8a3'],
['Location of Interest','crosshairs','#ffc23e'],['Gang / Territory','flag','#a64aff'],
['Police Stations','shield','#349bff'],['Hospitals','briefcase-medical','#ff5568'],
['Drug Locations','cannabis','#3ff291'],['Vendors','cart-shopping','#ffc43c'],
['Money Wash','circle-dollar-to-slot','#3ee88c'],['Restaurants','utensils','#ff9846'],
['Mech Shops','wrench','#afbdcb'],['Gas Stations','gas-pump','#ffd04b'],
['Banks','building-columns','#f0f3fa']
];
const icons=['location-dot','flag','shield','shield-halved','crosshairs','magnifying-glass','fingerprint','user-secret','skull','skull-crossbones','biohazard','gun','handcuffs','camera','eye','fire','bolt','star','circle-exclamation','triangle-exclamation','briefcase-medical','hospital','truck-medical','star-of-life','cannabis','flask','pills','cart-shopping','store','shop','gift','gem','circle-dollar-to-slot','sack-dollar','money-bill-wave','coins','credit-card','building-columns','landmark','utensils','burger','pizza-slice','mug-hot','martini-glass','wrench','screwdriver-wrench','gears','car','car-side','motorcycle','truck','gas-pump','oil-can','warehouse','house','building','hotel','train','plane','helicopter','ship','anchor','map-pin','map','compass','tower-broadcast','lock','key','file-lines','folder-open','users','user-group','person','paw','crown','dragon','dice','gamepad','music','palette','diamond','question','circle-check','heart','medical'];
const emoji=['🚩','🏴','👑','⚔️','💀','🕵️','🚔','👮','🚨','🛡️','🎯','📍','📷','📁','🔎','🔫','🔪','💣','🧬','🧪','💉','💊','☣️','🌿','🍃','🌴','🏥','🚑','🩺','❤️','🧯','🏦','💵','💸','💰','💳','🪙','💎','🛒','🛍️','🏪','🏬','🍔','🍕','🍟','☕','🍺','🍽️','🍜','🔧','🛠️','⚙️','🛞','⛽','🚗','🚙','🏍️','🚚','🚁','🚤','🚢','⚓','✈️','🏠','🏢','🏭','🏛️','🏰','🗺️','🧭','📡','🔐','🔑','📋','📜','🪪','🔥','⚡','🌊','🌲','🐍','🦁','🐉','🦇','🦂','🕷️','🐺','🦅','🎲','🃏','🎰','⭐','🌟','🔵','🟢','🟡','🔴','🟣','⚫','⚪','❌','✔️','❗','❓','♻️','🅿️','🆘'];
const escapeHTML=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
const load=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch{return {}}};
let prefs=load();
function config(){return Array.isArray(prefs.categories)?prefs.categories:DEFAULTS.map(([name,icon,color])=>({name,icon,color,emoji:'',hidden:false}))}
function paint(){
 const list=document.getElementById('categoryList');if(!list)return;
 const data=config();
 const template=list.querySelector('button[data-cat]');
 data.forEach(item=>{
  let b=[...list.querySelectorAll('button[data-cat]')].find(el=>el.dataset.cat===item.name);
  if(!b&&!item.hidden){b=document.createElement('button');b.dataset.cat=item.name;list.append(b)}
  if(!b)return;
  b.hidden=!!item.hidden;
  let ico=b.querySelector('b');if(!ico){ico=document.createElement('b');b.prepend(ico)}
  ico.style.color=item.color;ico.style.fontSize='19px';ico.style.width='26px';
  ico.textContent='';
  if(item.emoji){ico.textContent=item.emoji}else{
   const i=document.createElement('i');i.className='fa-solid fa-'+item.icon;ico.append(i)
  }
  let name=b.querySelector('.ef-sidebar-category-label');
  if(!name){[...b.childNodes].forEach(n=>{if(n.nodeType===3&&n.textContent.trim())n.remove()});name=document.createElement('span');name.className='ef-sidebar-category-label';b.insertBefore(name,ico.nextSibling)}
  name.textContent=item.name;
 });
 [...list.querySelectorAll('button[data-cat]')].forEach(b=>{if(!data.some(item=>item.name===b.dataset.cat))b.hidden=true});
}
function save(){prefs.categories=config();localStorage.setItem(KEY,JSON.stringify(prefs));paint()}
function openEditor(){
 document.getElementById('efSidebarIconEditor')?.remove();
 let working=config().map(c=>({...c}));
 const overlay=document.createElement('div');overlay.id='efSidebarIconEditor';overlay.className='ef-sidebar-editor-overlay';
 overlay.innerHTML=`<section class="ef-sidebar-editor ef-overhaul-editor" role="dialog" aria-modal="true" aria-label="Customize sidebar categories">
 <div class="ef-sidebar-editor-header"><h2>Customize Sidebar Icons</h2><button type="button" data-close>×</button></div>
 <p>Choose library icons or emojis, change colours, and add or hide categories. Existing map pins are never deleted.</p>
 <div class="ef-editor-toolbar"><button type="button" data-add>+ Add Category</button><button type="button" data-reset>Restore Defaults</button></div>
 <div class="ef-sidebar-editor-list" id="efCategoryEditorRows"></div>
 <footer><button type="button" data-close>Cancel</button><button type="button" class="blue" data-save>Save Changes</button></footer></section>`;
 document.body.append(overlay);
 const rows=overlay.querySelector('#efCategoryEditorRows');
 function render(){
  rows.innerHTML=working.map((c,i)=>`<div class="ef-custom-category-row" data-index="${i}">
   <div class="ef-category-line"><input aria-label="Category name" data-field="name" value="${escapeHTML(c.name)}" maxlength="60"><label class="ef-hide-cat"><input type="checkbox" data-field="hidden" ${c.hidden?'checked':''}> Hide</label><button type="button" data-remove="${i}" title="Remove category from sidebar (pins remain saved)">×</button></div>
   <div class="ef-category-line"><span class="ef-category-preview" style="color:${escapeHTML(c.color)}">${c.emoji||'<i class="fa-solid fa-'+escapeHTML(c.icon)+'"></i>'}</span>
   <select data-field="icon" aria-label="Library icon">${icons.map(icon=>`<option value="${icon}" ${icon===c.icon?'selected':''}>${icon.replaceAll('-',' ')}</option>`).join('')}</select>
   <select data-field="emoji" aria-label="Emoji"><option value="">No emoji — use icon</option>${emoji.map(e=>`<option value="${e}" ${e===c.emoji?'selected':''}>${e}</option>`).join('')}</select>
   <input type="color" data-field="color" value="${escapeHTML(c.color)}" aria-label="Icon colour"></div>
   </div>`).join('');
 }
 function sync(){rows.querySelectorAll('[data-index]').forEach(row=>{const c=working[Number(row.dataset.index)];if(!c)return;row.querySelectorAll('[data-field]').forEach(input=>{c[input.dataset.field]=input.type==='checkbox'?input.checked:input.value})})}
 render();
 overlay.addEventListener('input',e=>{if(e.target.closest('[data-index]')){sync();const row=e.target.closest('[data-index]');const c=working[Number(row.dataset.index)];const preview=row.querySelector('.ef-category-preview');preview.style.color=c.color;preview.textContent='';if(c.emoji)preview.textContent=c.emoji;else{const i=document.createElement('i');i.className='fa-solid fa-'+c.icon;preview.append(i)}}});
 overlay.addEventListener('change',e=>{if(e.target.closest('[data-index]'))sync()});
 overlay.addEventListener('click',e=>{
  if(e.target===overlay||e.target.closest('[data-close]')){overlay.remove();return}
  if(e.target.closest('[data-add]')){sync();working.push({name:'New Category '+(working.length+1),icon:'location-dot',color:'#49a8ff',emoji:'',hidden:false});render();rows.scrollTop=rows.scrollHeight;return}
  if(e.target.closest('[data-reset]')){working=DEFAULTS.map(([name,icon,color])=>({name,icon,color,emoji:'',hidden:false}));render();return}
  const remove=e.target.closest('[data-remove]');if(remove){sync();working.splice(Number(remove.dataset.remove),1);render();return}
  if(e.target.closest('[data-save]')){
   sync();const names=new Set();for(const c of working){c.name=c.name.trim();if(!c.name||names.has(c.name.toLowerCase())){alert('Category names must be unique and non-empty.');return}names.add(c.name.toLowerCase())}
   prefs.categories=working;localStorage.setItem(KEY,JSON.stringify(prefs));paint();
   // Make newly added categories available in Add/Edit Pin.
   syncPinCategories();overlay.remove();
  }
 });
}
function syncPinCategories(){
 const select=document.querySelector('select[name="markerCategory"]');if(!select)return;
 const old=select.value;
 config().forEach(c=>{if(![...select.options].some(o=>o.value===c.name)){const opt=document.createElement('option');opt.value=c.name;opt.textContent=c.name;select.append(opt)}});
 [...select.options].forEach(o=>{if(o.value==='Resolved')o.hidden=true});
 select.value=old;
}
document.getElementById('efEditSidebarIcons')?.addEventListener('click',e=>{e.stopImmediatePropagation();openEditor()},true);
// Remember manually resized side-panel widths in this browser.
for(const [selector,key] of [['.workspace>.leftpanel','eflspddb_left_width_v1'],['.workspace>.rightpanel','eflspddb_right_width_v1']]){
 const panel=document.querySelector(selector);if(!panel)continue;
 const stored=Number(localStorage.getItem(key));
 if(stored>=150&&stored<=900)panel.style.setProperty('width',stored+'px','important');
 if(typeof ResizeObserver==='function'){
  let previous=panel.getBoundingClientRect().width;
  new ResizeObserver(entries=>{
   if(panel.closest('.workspace')?.classList.contains(selector.includes('leftpanel')?'left-collapsed':'right-collapsed'))return;
   const width=Math.round(entries[0].contentRect.width);
   if(width>145&&Math.abs(width-previous)>3){previous=width;localStorage.setItem(key,String(width))}
  }).observe(panel);
 }
}
paint();syncPinCategories();
document.addEventListener('click',e=>{if(e.target.closest('#addPinBtn,[data-loc-edit],#newGeneralPin'))setTimeout(syncPinCategories,0)},true);
window.addEventListener('storage',e=>{if(e.key===KEY){prefs=load();paint();syncPinCategories()}});
})();