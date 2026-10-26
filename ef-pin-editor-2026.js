(()=>{'use strict';
const modal=document.getElementById('caseModal'),form=document.getElementById('caseForm'),launch=document.getElementById('addPinBtn');
if(!modal||!form||!launch)return;
const categories=[['📍','General Location'],['📁','Active Investigation'],['🚩','Gang / Territory'],['🛡️','Police Station'],['🏬','Business'],['⭐','Location of Interest']];
// Remove obsolete duplicate launch controls; retain native handlers for map-placement and existing records.
document.getElementById('efPinLauncher')?.remove();document.getElementById('pinChoice')?.classList.add('hidden');
let picker=form.querySelector('.ef-pin-category-picker');
if(picker)picker.remove();
picker=document.createElement('section');picker.className='ef-pin-category-picker';
picker.innerHTML='<div class="ef-pin-section-label">📍 PIN CATEGORY</div><div class="ef-pin-category-grid" role="group" aria-label="Pin category"></div>';
form.querySelector('.formgrid')?.before(picker);
const grid=picker.querySelector('.ef-pin-category-grid');
function choose(label){const select=form.elements.markerCategory;if(!select)return;select.value=label;window.EFDBSetUnifiedPinCategory?.(label);select.dispatchEvent(new Event('change',{bubbles:true}));refresh();}
for(const [emoji,label] of categories){const b=document.createElement('button');b.type='button';b.className='ef-pin-category';b.dataset.category=label;b.innerHTML='<span class="ef-pin-category-emoji">'+emoji+'</span><span>'+label+'</span>';b.addEventListener('click',()=>choose(label));grid.append(b);}
function refresh(){const value=form.elements.markerCategory?.value;grid.querySelectorAll('button').forEach(b=>b.classList.toggle('is-selected',b.dataset.category===value));}
form.elements.markerCategory?.addEventListener('change',()=>{window.EFDBSetUnifiedPinCategory?.(form.elements.markerCategory.value);refresh()});
// The original handler merely opens a duplicate category launcher. Capture first and open the actual editor.
launch.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();document.getElementById('pinChoice')?.classList.add('hidden');if(typeof window.EFDBOpenUnifiedPin==='function'){window.EFDBOpenUnifiedPin();refresh();}else{console.warn('Unified pin editor unavailable');}},true);
const expand=document.getElementById('efExpandPinEditor');
if(expand){modal.classList.remove('ef-editor-expanded');expand.textContent='⛶ Expand';try{localStorage.removeItem('ef_pin_editor_expanded')}catch{};expand.addEventListener('click',()=>{requestAnimationFrame(()=>{expand.textContent=modal.classList.contains('ef-editor-expanded')?'⛶ Restore':'⛶ Expand';})});}
const heading=document.getElementById('modalTitle');
const observer=new MutationObserver(()=>{if(!modal.classList.contains('hidden')){if(!heading.textContent.startsWith('EDIT '))heading.textContent='📍 ADD MAP PIN';refresh();}});
observer.observe(modal,{attributes:true,attributeFilter:['class']});
const actions=form.querySelector('.modalactions button[type="submit"]');if(actions)actions.textContent='📍 Save Pin';
})();