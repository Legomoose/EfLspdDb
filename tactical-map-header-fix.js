(()=>{'use strict';
const KEY='eflspddb_ui_preferences_v1';
function theme(id){if(!['cyber','midnight','emerald','crimson','dark'].includes(id))return;let p={};try{p=JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch{}p.theme=id;try{localStorage.setItem(KEY,JSON.stringify(p))}catch{}document.documentElement.setAttribute('data-ef-theme',id);const sel=document.getElementById('cyberThemeSelect');if(sel)sel.value=id;document.querySelectorAll('.ef-update-theme').forEach(b=>{b.setAttribute('aria-pressed',String(b.dataset.theme===id));const s=b.querySelector('span');if(s)s.textContent=b.dataset.theme===id?'✓ Selected':'Apply theme'})}
function init(){
const ws=document.querySelector('.workspace'),map=document.getElementById('mapView');
if(!ws||!map)return;
const existing=document.getElementById('efMapOnlyToolsBtn');
if(existing){existing.textContent='';existing.innerHTML='<i class="fa-solid fa-layer-group"></i> Pins & Filters';existing.title='Toggle Pins & Filters';}
const oldToggle=document.getElementById('toggleLeftPanel');if(oldToggle){oldToggle.tabIndex=-1;oldToggle.setAttribute('aria-hidden','true')}
const close=document.querySelector('.ef-map-tools-close');if(close)close.style.display='none';
const toggle=()=>{const open=ws.classList.contains('ef-map-tools-open');ws.classList.toggle('ef-map-tools-open',!open);existing?.setAttribute('aria-expanded',String(!open));window.dispatchEvent(new Event('resize'))};
if(existing){const replacement=existing.cloneNode(true);existing.replaceWith(replacement);replacement.addEventListener('click',toggle)}
document.addEventListener('pointerdown',e=>{if(!ws.classList.contains('ef-map-tools-open'))return;const panel=ws.querySelector(':scope > .leftpanel');if(panel?.contains(e.target)||e.target.closest('#efMapOnlyToolsBtn'))return;ws.classList.remove('ef-map-tools-open')});
document.addEventListener('keydown',e=>{if(e.key==='Escape')ws.classList.remove('ef-map-tools-open')});
document.addEventListener('click',e=>{const b=e.target.closest('.ef-update-theme[data-theme]');if(b)theme(b.dataset.theme)},true);
try{const saved=JSON.parse(localStorage.getItem(KEY)||'{}');theme(saved.theme||'cyber')}catch{theme('cyber')}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();