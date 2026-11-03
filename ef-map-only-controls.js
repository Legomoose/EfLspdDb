(()=>{'use strict';function init(){
const ws=document.querySelector('.workspace'),view=document.getElementById('mapView'),left=ws?.querySelector(':scope > .leftpanel'),right=ws?.querySelector(':scope > .rightpanel');if(!ws||!view||!left||!right)return;
ws.classList.add('ef-map-only-layout');
let btn=document.getElementById('efMapOnlyToolsBtn');if(!btn){btn=document.createElement('button');btn.id='efMapOnlyToolsBtn';btn.type='button';view.appendChild(btn)}
btn.className='ef-map-tools-button';btn.innerHTML='<i class="fa-solid fa-layer-group"></i> Pins & Filters';btn.setAttribute('aria-controls','efMapToolsDrawer');left.id='efMapToolsDrawer';
left.querySelectorAll('.ef-map-tools-close').forEach((b,i)=>{if(i)b.remove()});let close=left.querySelector('.ef-map-tools-close');if(!close){close=document.createElement('button');close.className='ef-map-tools-close';close.type='button';left.prepend(close)}close.innerHTML='<i class="fa-solid fa-xmark"></i> Close';
// Remove redundant close button introduced by previous patch.
right.querySelectorAll('.ef-repair-detail-close').forEach(b=>b.remove());
const rightToggle=document.getElementById('toggleRightPanel');if(rightToggle){rightToggle.innerHTML='<i class="fa-solid fa-xmark"></i>';rightToggle.title='Close location information';rightToggle.setAttribute('aria-label','Close location information');rightToggle.addEventListener('click',e=>{e.stopImmediatePropagation();e.preventDefault();ws.classList.remove('ef-map-detail-open')},true)}
function active(){return !view.classList.contains('hidden')&&view.getClientRects().length>0}
function open(v){const yes=!!v&&active();ws.classList.toggle('ef-map-tools-open',yes);btn.setAttribute('aria-expanded',String(yes));if(yes)ws.classList.remove('left-collapsed');window.dispatchEvent(new Event('resize'))}
btn.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();open(!ws.classList.contains('ef-map-tools-open'))});close.addEventListener('click',()=>open(false));
function sync(){const yes=active();ws.classList.toggle('ef-map-page',yes);document.body.classList.toggle('ef-map-unified-active',yes);if(!yes){open(false);ws.classList.remove('ef-map-detail-open')}}
new MutationObserver(sync).observe(view,{attributes:true,attributeFilter:['class','style']});
// React directly to a selected pin's detail heading rather than observing its content rebuild.
const detail=document.getElementById('detailCase');if(detail)new MutationObserver(()=>{if(active()&&detail.textContent.trim()!=='CASE OVERVIEW')ws.classList.add('ef-map-detail-open')}).observe(detail,{childList:true,characterData:true,subtree:true});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){open(false);ws.classList.remove('ef-map-detail-open')}});sync();
}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();})();