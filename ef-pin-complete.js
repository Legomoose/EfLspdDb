(()=>{'use strict';
const modal=document.getElementById('caseModal'),form=document.getElementById('caseForm');if(!modal||!form)return;
const groups=[
 {label:'General',icon:'location-dot',color:'#64aaff',types:[['General Location','location-dot'],['Custom','sliders']]},
 {label:'Investigations',icon:'fingerprint',color:'#f17c88',types:[['Active Investigation','folder-open'],['Location of Interest','crosshairs']]},
 {label:'Gangs',icon:'shield-halved',color:'#ae91ed',types:[['Gang / Territory','flag'],['Drug Locations','flask'],['Crafting','hammer']]},
 {label:'Locations & Services',icon:'building',color:'#e6b45f',types:[['Police Stations','shield-halved'],['Business','store'],['Hospitals','hospital'],['Vendors','cart-shopping'],['Money Wash','money-bill-wave'],['Restaurants','utensils'],['Mech Shops','wrench'],['Gas Stations','gas-pump'],['Banks','building-columns']]}
];
const legacy={'Crime Scene':'Active Investigation','Police Location':'Location of Interest','Police Station':'Police Stations'};
const groupFor=v=>groups.find(g=>g.types.some(t=>t[0]===(legacy[v]||v)))||groups[0];
const fa=icon=>'<i class="fa-solid fa-'+icon+'" aria-hidden="true"></i>';
const select=form.elements.markerCategory;
for(const g of groups)for(const [label] of g.types)if(![...select.options].some(x=>x.value===label))select.add(new Option(label,label));
const picker=form.querySelector('.ef-pin-category-picker');picker?.remove();
const mainSection=document.createElement('section');mainSection.className='efx-main';mainSection.innerHTML='<div class="efx-label">01 — PIN CLASSIFICATION</div><div class="efx-main-grid"></div>';
const subsSection=document.createElement('section');subsSection.className='efx-sub';subsSection.innerHTML='<div class="efx-label">SELECT PIN TYPE</div><div class="efx-sub-grid"></div>';
const body=document.createElement('div');body.className='efx-body';
const left=document.createElement('div');left.className='efx-left';const right=document.createElement('aside');right.className='efx-right';
const grid=form.querySelector('.formgrid');form.querySelector('.modalhead').after(body);body.append(left,right);left.append(mainSection,subsSection,grid);
const markerSection=grid.querySelector('.markersection');const originalPreview=document.getElementById('markerPreview');
const details=document.createElement('div');details.className='efx-details';details.innerHTML='<div class="efx-label">3. MARKER DETAILS</div>';
const fields=[...grid.children].filter(el=>el.tagName==='LABEL'&&!el.classList.contains('locklabel'));
for(const el of fields){if(el.querySelector('[name="markerCategory"]')){el.classList.add('efx-hidden-field');continue;}details.append(el);}
grid.prepend(details);grid.classList.add('efx-grid');
const preview=document.createElement('section');preview.className='efx-preview';preview.innerHTML='<div class="efx-label">PREVIEW</div><div class="efx-preview-art"></div><div class="efx-preview-row"><span>Group</span><strong id="efxSelectedMain"></strong></div><div class="efx-preview-row"><span>Pin type</span><strong id="efxSelectedSub"></strong></div>';
right.append(preview);
const styles=document.createElement('section');styles.className='efx-styles';styles.innerHTML='<div class="efx-label">PIN STYLE</div><div class="efx-style-grid"></div><div class="efx-label efx-color-title">PIN COLOUR</div><div class="efx-swatches"></div><div class="efx-picker" id="efxPicker"><div class="efx-picker-square" id="efxPickerSquare"><span class="efx-picker-cursor" id="efxPickerCursor"></span></div><div class="efx-picker-hue" id="efxPickerHue"><span id="efxHueCursor"></span></div></div><div class="efx-color-controls"><span id="efxColourSample"></span><input type="text" id="efxHex" maxlength="7" aria-label="HEX colour" value="#348dff"><button type="button" id="efxPickColor">System picker</button></div>';
right.append(styles);
const styleOptions=[['standard','Standard','♧'],['ring','Ring','◎'],['square','Square','▣'],['diamond','Diamond','◆'],['circle','Circle','●'],['hexagon','Hexagon','⬡']];
// The redesigned shape selector must have a real form field. Older builds omitted it.
let shape=form.elements.markerShape;
if(!shape){shape=document.createElement('input');shape.type='hidden';shape.name='markerShape';shape.value='standard';form.appendChild(shape);}

function button(icon,label,cls,fn){const b=document.createElement('button');b.type='button';b.className=cls;b.innerHTML='<span aria-hidden="true">'+icon+'</span><span>'+label+'</span>';b.addEventListener('click',fn);return b;}
function setCategory(category){if(![...select.options].some(x=>x.value===category))select.add(new Option(category,category));select.value=category;select.dispatchEvent(new Event('change',{bubbles:true}));update();}
function setMain(group){setCategory(group.types[0][0]);}
const groupButtons=[];
groups.forEach(g=>{const btn=button(fa(g.icon),g.label,'efx-main-btn',()=>setMain(g));btn.style.setProperty('--group-accent',g.color);mainSection.querySelector('.efx-main-grid').append(btn);groupButtons.push(btn)});
function renderSubtypes(g){const target=subsSection.querySelector('.efx-sub-grid');target.replaceChildren();g.types.forEach(([label,icon])=>{const btn=button(fa(icon),label,'efx-sub-btn',()=>setCategory(label));btn.style.setProperty('--group-accent',g.color);if(select.value===label)btn.classList.add('selected');target.append(btn)});}
styleOptions.forEach(([key,label,ico])=>styles.querySelector('.efx-style-grid').append(button(ico,label,'efx-style-btn',()=>{shape.value=key;shape.dispatchEvent(new Event('change',{bubbles:true}));update();})));
// Consistent vector shape previews, independent of OS emoji fonts.
const shapePaths={standard:'M24 3 C12 3 5 12 5 24 C5 35 17 45 24 53 C31 45 43 35 43 24 C43 12 36 3 24 3 Z',ring:'M24 5 A19 19 0 1 1 23.99 5 Z',square:'M7 8 H41 V42 H7 Z',diamond:'M24 4 L44 27 L24 50 L4 27 Z',circle:'M24 5 A19 19 0 1 1 23.99 5 Z',hexagon:'M13 6 H35 L45 27 L35 48 H13 L3 27 Z'};
styles.querySelectorAll('.efx-style-btn').forEach((b,i)=>{const key=styleOptions[i][0],span=b.querySelector('span');if(!span)return;span.innerHTML='<svg viewBox="0 0 48 56" width="30" height="34" aria-hidden="true"><path d="'+shapePaths[key]+'" fill="none" stroke="currentColor" stroke-width="4" stroke-linejoin="round"/>'+(key==='ring'?'<circle cx="24" cy="24" r="12" fill="none" stroke="currentColor" stroke-width="2"/>':'')+'</svg>';});
const colors=['#348dff','#ff4d68','#40cb9a','#ffcb53','#9e60ff','#ff914d','#f47cba','#e0e8f3','#111827'];
const nativeColor=form.elements.markerColor;
colors.forEach(c=>{const b=document.createElement('button');b.type='button';b.className='efx-swatch';b.style.background=c;b.title=c;b.setAttribute('aria-label','Use colour '+c);b.addEventListener('click',()=>{nativeColor.value=c;nativeColor.dispatchEvent(new Event('input',{bubbles:true}));update();});styles.querySelector('.efx-swatches').append(b)});
const hex=document.getElementById('efxHex');
const pickerSquare=document.getElementById('efxPickerSquare'),pickerHue=document.getElementById('efxPickerHue');
const cursor=document.getElementById('efxPickerCursor'),hueCursor=document.getElementById('efxHueCursor'),sample=document.getElementById('efxColourSample');
let hsv={h:0,s:1,v:1};
function rgbFromHex(v){return [1,3,5].map(i=>parseInt(v.slice(i,i+2),16));}
function rgbToHsv(r,g,b){r/=255;g/=255;b/=255;const max=Math.max(r,g,b),min=Math.min(r,g,b),d=max-min;let h=0;if(d){switch(max){case r:h=((g-b)/d)%6;break;case g:h=(b-r)/d+2;break;default:h=(r-g)/d+4;}h*=60;if(h<0)h+=360;}return {h,s:max===0?0:d/max,v:max};}
function hsvToHex(h,s,v){const c=v*s,x=c*(1-Math.abs((h/60)%2-1)),m=v-c;let r=0,g=0,b=0;if(h<60){r=c;g=x}else if(h<120){r=x;g=c}else if(h<180){g=c;b=x}else if(h<240){g=x;b=c}else if(h<300){r=x;b=c}else{r=c;b=x}return '#'+[r,g,b].map(t=>Math.round((t+m)*255).toString(16).padStart(2,'0')).join('');}
function setColour(v){nativeColor.value=v;nativeColor.dispatchEvent(new Event('input',{bubbles:true}));update();}
function pickSquare(e){const r=pickerSquare.getBoundingClientRect();hsv.s=Math.max(0,Math.min(1,(e.clientX-r.left)/r.width));hsv.v=1-Math.max(0,Math.min(1,(e.clientY-r.top)/r.height));setColour(hsvToHex(hsv.h,hsv.s,hsv.v));}
function pickHue(e){const r=pickerHue.getBoundingClientRect();hsv.h=360*Math.max(0,Math.min(1,(e.clientX-r.left)/r.width));setColour(hsvToHex(hsv.h,hsv.s,hsv.v));}
for(const [element,fn] of [[pickerSquare,pickSquare],[pickerHue,pickHue]]){element.addEventListener('pointerdown',e=>{element.setPointerCapture(e.pointerId);fn(e)});element.addEventListener('pointermove',e=>{if(element.hasPointerCapture(e.pointerId))fn(e)});element.addEventListener('keydown',e=>{if(e.key!=='ArrowLeft'&&e.key!=='ArrowRight'&&e.key!=='ArrowUp'&&e.key!=='ArrowDown')return;e.preventDefault();if(element===pickerHue)hsv.h=(hsv.h+(e.key==='ArrowRight'?3:-3)+360)%360;else{hsv.s=Math.max(0,Math.min(1,hsv.s+(e.key==='ArrowRight'?.02:e.key==='ArrowLeft'?-.02:0)));hsv.v=Math.max(0,Math.min(1,hsv.v+(e.key==='ArrowUp'?.02:e.key==='ArrowDown'?-.02:0)));}setColour(hsvToHex(hsv.h,hsv.s,hsv.v));});element.tabIndex=0;element.setAttribute('role','slider');}
hex.addEventListener('change',()=>{if(/^#[0-9a-f]{6}$/i.test(hex.value))setColour(hex.value);else hex.value=nativeColor.value;});
document.getElementById('efxPickColor').addEventListener('click',()=>nativeColor.click());
function refreshPicker(){const value=nativeColor.value;if(!/^#[0-9a-f]{6}$/i.test(value))return;hsv=rgbToHsv(...rgbFromHex(value));pickerSquare.style.backgroundColor=`hsl(${hsv.h},100%,50%)`;cursor.style.left=(hsv.s*100)+'%';cursor.style.top=((1-hsv.v)*100)+'%';hueCursor.style.left=(hsv.h/360*100)+'%';sample.style.backgroundColor=value;}
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
function update(){const cat=select.value||'General Location',group=groupFor(cat);document.getElementById('efxSelectedMain').textContent=group.label;document.getElementById('efxSelectedSub').textContent=cat;groupButtons.forEach((b,i)=>b.classList.toggle('selected',groups[i]===group));renderSubtypes(group);styles.querySelectorAll('.efx-style-btn').forEach((b,i)=>b.classList.toggle('selected',styleOptions[i][0]===shape.value));styles.querySelectorAll('.efx-swatch').forEach((b,i)=>b.classList.toggle('selected',colors[i].toLowerCase()===String(nativeColor.value||'').toLowerCase()));hex.value=nativeColor.value;refreshPicker();}
select.addEventListener('change',update);shape.addEventListener('change',update);nativeColor.addEventListener('input',update);
// Keep original pin rendering, saving, synchronisation and map placement handlers.
const observer=new MutationObserver(()=>{if(!modal.classList.contains('hidden')){update();if(!modal.classList.contains('ef-editor-expanded')&&expand)expand.textContent='⛶ Expand';}});observer.observe(modal,{attributes:true,attributeFilter:['class']});
update();
})();
