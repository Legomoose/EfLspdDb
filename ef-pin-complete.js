(()=>{'use strict';
const modal=document.getElementById('caseModal'),form=document.getElementById('caseForm');if(!modal||!form)return;
const main=[['📍','General Location'],['📁','Active Investigation'],['🚩','Gang / Territory'],['🛡️','Police Station'],['🏬','Business'],['⭐','Location of Interest']];
const subs=[['📍','General Location'],['📁','Active Investigation'],['⚠️','Crime Scene'],['⭐','Location of Interest'],['🚩','Gang / Territory'],['🛡️','Police Station'],['🚓','Police Stations'],['🚔','Police Location'],['🏬','Business'],['🏥','Hospitals'],['🌿','Drug Locations'],['🛒','Vendors'],['💰','Money Wash'],['🍴','Restaurants'],['🔧','Mech Shops'],['⛽','Gas Stations'],['🏛️','Banks'],['⚙️','Custom'],['🛠️','Crafting']];
const aliases={'General Location':'General Location','Active Investigation':'Active Investigation','Crime Scene':'Active Investigation','Gang / Territory':'Gang / Territory','Police Station':'Police Station','Police Stations':'Police Station','Police Location':'Police Station','Business':'Business','Hospitals':'Business','Vendors':'Business','Money Wash':'Business','Restaurants':'Business','Mech Shops':'Business','Gas Stations':'Business','Banks':'Business','Location of Interest':'Location of Interest','Drug Locations':'Location of Interest','Custom':'General Location','Crafting':'Business'};
const select=form.elements.markerCategory;
if(![...select.options].some(x=>x.value==='Crafting'))select.add(new Option('Crafting','Crafting'));
const picker=form.querySelector('.ef-pin-category-picker');picker?.remove();
const mainSection=document.createElement('section');mainSection.className='efx-main';mainSection.innerHTML='<div class="efx-label">1. SELECT CATEGORY</div><div class="efx-main-grid"></div>';
const subsSection=document.createElement('section');subsSection.className='efx-sub';subsSection.innerHTML='<div class="efx-label">2. SELECT SUBCATEGORY</div><div class="efx-sub-grid"></div>';
const body=document.createElement('div');body.className='efx-body';
const left=document.createElement('div');left.className='efx-left';const right=document.createElement('aside');right.className='efx-right';
const grid=form.querySelector('.formgrid');form.querySelector('.modalhead').after(body);body.append(left,right);left.append(mainSection,subsSection,grid);
const markerSection=grid.querySelector('.markersection');const originalPreview=document.getElementById('markerPreview');
const details=document.createElement('div');details.className='efx-details';details.innerHTML='<div class="efx-label">3. MARKER DETAILS</div>';
const fields=[...grid.children].filter(el=>el.tagName==='LABEL'&&!el.classList.contains('locklabel'));
for(const el of fields){if(el.querySelector('[name="markerCategory"]')){el.classList.add('efx-hidden-field');continue;}details.append(el);}
grid.prepend(details);grid.classList.add('efx-grid');
const preview=document.createElement('section');preview.className='efx-preview';preview.innerHTML='<div class="efx-label">PREVIEW</div><div class="efx-preview-art"></div><div class="efx-preview-row"><span>Selected Category</span><strong id="efxSelectedMain"></strong></div><div class="efx-preview-row"><span>Selected Subcategory</span><strong id="efxSelectedSub"></strong></div>';
right.append(preview);
const styles=document.createElement('section');styles.className='efx-styles';styles.innerHTML='<div class="efx-label">PIN STYLE</div><div class="efx-style-grid"></div><div class="efx-label efx-color-title">PIN COLOUR</div><div class="efx-swatches"></div><div class="efx-color-controls"><input type="text" id="efxHex" maxlength="7" aria-label="HEX colour" value="#348dff"><button type="button" id="efxPickColor">🎨 Choose</button></div>';
right.append(styles);
const styleOptions=[['standard','Standard','📍'],['ring','Ring','♧'],['square','Square','▣'],['diamond','Diamond','◆'],['circle','Circle','●'],['hexagon','Hexagon','⬡']];
const shape=form.elements.markerShape;
function button(icon,label,cls,fn){const b=document.createElement('button');b.type='button';b.className=cls;b.innerHTML='<span aria-hidden="true">'+icon+'</span><span>'+label+'</span>';b.addEventListener('click',fn);return b;}
function setCategory(category){if(![...select.options].some(x=>x.value===category))return;select.value=category;select.dispatchEvent(new Event('change',{bubbles:true}));update();}
function setMain(label){const first=select.value;const sub=aliases[first]===label?first:label;setCategory(sub);}
main.forEach(([ico,label])=>mainSection.querySelector('.efx-main-grid').append(button(ico,label,'efx-main-btn',()=>setMain(label))));
subs.forEach(([ico,label])=>subsSection.querySelector('.efx-sub-grid').append(button(ico,label,'efx-sub-btn',()=>setCategory(label))));
styleOptions.forEach(([key,label,ico])=>styles.querySelector('.efx-style-grid').append(button(ico,label,'efx-style-btn',()=>{shape.value=key;shape.dispatchEvent(new Event('change',{bubbles:true}));update();})));
const colors=['#348dff','#ff4d68','#40cb9a','#ffcb53','#9e60ff','#ff914d','#f47cba','#e0e8f3','#111827'];
const nativeColor=form.elements.markerColor;
colors.forEach(c=>{const b=document.createElement('button');b.type='button';b.className='efx-swatch';b.style.background=c;b.title=c;b.setAttribute('aria-label','Use colour '+c);b.addEventListener('click',()=>{nativeColor.value=c;nativeColor.dispatchEvent(new Event('input',{bubbles:true}));update();});styles.querySelector('.efx-swatches').append(b)});
const hex=document.getElementById('efxHex');hex.addEventListener('change',()=>{if(/^#[0-9a-f]{6}$/i.test(hex.value)){nativeColor.value=hex.value;nativeColor.dispatchEvent(new Event('input',{bubbles:true}));update()}else hex.value=nativeColor.value});
document.getElementById('efxPickColor').addEventListener('click',()=>nativeColor.click());
const libraryLabel=document.createElement('div');libraryLabel.className='efx-label';libraryLabel.textContent='4. ICON';markerSection.prepend(libraryLabel);
const compact=markerSection.querySelector('.compact-marker-panel[data-marker-panel="symbol"]');
const libraryDetails=document.createElement('details');libraryDetails.className='efx-library';libraryDetails.open=false;
const librarySummary=document.createElement('summary');librarySummary.textContent='🔎 Browse full icon library';libraryDetails.append(librarySummary);
if(compact){compact.before(libraryDetails);libraryDetails.append(compact);compact.hidden=false;}
const markerTypeTabs=markerSection.querySelector('.compact-marker-tabs');if(markerTypeTabs)markerTypeTabs.classList.add('efx-type-tabs');
if(originalPreview){preview.querySelector('.efx-preview-art').append(originalPreview);}
const lock=markerSection.querySelector('.locklabel');if(lock)markerSection.append(lock);
const existingHint=form.querySelector('.formhint');if(existingHint)existingHint.textContent='Click on the map to place a new pin. Existing records and permissions are preserved.';
const head=form.querySelector('.modalhead');const expand=document.getElementById('efExpandPinEditor');
if(expand){expand.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();modal.classList.toggle('ef-editor-expanded');expand.textContent=modal.classList.contains('ef-editor-expanded')?'↙ Restore':'⛶ Expand';},true);}
function update(){const cat=select.value||'General Location',group=aliases[cat]||'General Location';document.getElementById('efxSelectedMain').textContent=group;document.getElementById('efxSelectedSub').textContent=cat;mainSection.querySelectorAll('button').forEach((b,i)=>b.classList.toggle('selected',main[i][1]===group));subsSection.querySelectorAll('button').forEach((b,i)=>b.classList.toggle('selected',subs[i][1]===cat));styles.querySelectorAll('.efx-style-btn').forEach((b,i)=>b.classList.toggle('selected',styleOptions[i][0]===shape.value));styles.querySelectorAll('.efx-swatch').forEach((b,i)=>b.classList.toggle('selected',colors[i].toLowerCase()===nativeColor.value.toLowerCase()));hex.value=nativeColor.value;}
select.addEventListener('change',update);shape.addEventListener('change',update);nativeColor.addEventListener('input',update);
// Keep original pin rendering, saving, synchronisation and map placement handlers.
const observer=new MutationObserver(()=>{if(!modal.classList.contains('hidden')){update();if(!modal.classList.contains('ef-editor-expanded')&&expand)expand.textContent='⛶ Expand';}});observer.observe(modal,{attributes:true,attributeFilter:['class']});
update();
})();
