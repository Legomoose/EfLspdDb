(()=>{'use strict';
const $=s=>document.querySelector(s);
const modal=$('#caseModal'),form=$('#caseForm'),button=$('#addPinBtn');
if(!modal||!form)return;
const cats=[['📍','General Location','general'],['📁','Active Investigation','investigation'],['🚩','Gang / Territory','general'],['🛡️','Police Station','general'],['🏬','Business','general'],['⭐','Location of Interest','general']];
let nextCategory=null;
const title=$('#modalTitle');
const head=form.querySelector('.modalhead');
if(head){const subtitle=document.createElement('p');subtitle.className='ef-pin-subtitle';subtitle.textContent='Choose a category, customise the appearance and place your marker on the map.';head.after(subtitle)}
const grid=form.querySelector('.formgrid');
if(grid){const wrap=document.createElement('div');wrap.className='ef-pin-category-picker';wrap.innerHTML='<div class="ef-pin-section-label">📍 PIN CATEGORY</div><div class="ef-pin-category-grid" role="group" aria-label="Pin category"></div>';grid.before(wrap);
const choices=wrap.querySelector('.ef-pin-category-grid');
cats.forEach(([emoji,label,kind])=>{const b=document.createElement('button');b.type='button';b.className='ef-pin-category';b.innerHTML='<span class="ef-pin-category-emoji">'+emoji+'</span><span>'+label+'</span>';b.dataset.category=label;b.addEventListener('click',()=>{
 const isInvestigation=label==='Active Investigation';
 const currentIsGeneral=title?.textContent.includes('GENERAL LOCATION');
 if(isInvestigation&&currentIsGeneral){alert('For an Investigation Pin, choose Investigation from Add Pin before placing it on the map.');return;}
 const sel=form.elements.markerCategory;if(sel){sel.value=label;sel.dispatchEvent(new Event('change',{bubbles:true}))}refresh();
});choices.append(b)});
}
function refresh(){const category=form.elements.markerCategory?.value;document.querySelectorAll('.ef-pin-category').forEach(b=>b.classList.toggle('is-selected',b.dataset.category===category));}
form.elements.markerCategory?.addEventListener('change',refresh);
const observer=new MutationObserver(()=>{if(!modal.classList.contains('hidden')){if(nextCategory){const select=form.elements.markerCategory;if(select&&Array.from(select.options).some(o=>o.value===nextCategory)){select.value=nextCategory;select.dispatchEvent(new Event('change',{bubbles:true}))}nextCategory=null;}refresh();}});
observer.observe(modal,{attributes:true,attributeFilter:['class']});
const expand=$('#efExpandPinEditor');
if(expand){expand.textContent='⛶ Fullscreen';expand.title='Toggle fullscreen pin editor';expand.addEventListener('click',()=>{requestAnimationFrame(()=>{expand.textContent=modal.classList.contains('ef-editor-expanded')?'⛶ Restore':'⛶ Fullscreen';form.querySelector('.formgrid')?.scrollTo({top:0,behavior:'instant'})})});}
const actions=form.querySelector('.modalactions');if(actions){const submit=actions.querySelector('[type="submit"]');if(submit)submit.textContent='📍 Save Pin';}
// Keep the original pin placement, persistence and Realtime handlers intact.
if(button){const menu=document.createElement('div');menu.className='ef-pin-launcher hidden';menu.id='efPinLauncher';menu.innerHTML='<div class="ef-pin-launcher-title">📍 Create Map Pin</div><div class="ef-pin-launcher-grid"></div>';button.insertAdjacentElement('afterend',menu);
for(const [emoji,label,kind] of cats){const b=document.createElement('button');b.type='button';b.textContent=emoji+' '+label;b.addEventListener('click',()=>{nextCategory=label;menu.classList.add('hidden');const original=$('#'+(kind==='investigation'?'newInvestigationPin':'newGeneralPin'));if(original){original.click()}else{nextCategory=null;alert('The pin placement tool is unavailable.')}});menu.querySelector('.ef-pin-launcher-grid').append(b)}
button.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();menu.classList.toggle('hidden');$('#pinChoice')?.classList.add('hidden')},true);
document.addEventListener('click',e=>{if(!menu.contains(e.target)&&e.target!==button)menu.classList.add('hidden')});
}
})();