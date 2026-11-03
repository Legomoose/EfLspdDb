(()=>{'use strict';
function init(){
 const ws=document.querySelector('.workspace'),mapView=document.getElementById('mapView');
 const left=ws?.querySelector(':scope > .leftpanel'),right=ws?.querySelector(':scope > .rightpanel');
 if(!ws||!mapView||!left||!right)return;
 let btn=document.getElementById('efMapOnlyToolsBtn');
 if(!btn){btn=document.createElement('button');btn.id='efMapOnlyToolsBtn';btn.type='button';mapView.appendChild(btn)}
 btn.className='ef-map-tools-button';btn.innerHTML='<i class="fa-solid fa-layer-group" aria-hidden="true"></i> Pins & Filters';
 left.id='efMapToolsDrawer';btn.setAttribute('aria-controls',left.id);
 // One close control per panel. Old right-panel X remains the only one.
 left.querySelectorAll('.ef-map-tools-close').forEach(b=>b.remove());
 const close=document.createElement('button');close.type='button';close.className='ef-map-tools-close';close.textContent='× Close';left.prepend(close);
 right.querySelectorAll('.ef-repair-detail-close').forEach(b=>b.remove());
 const oldRight=document.getElementById('toggleRightPanel');
 if(oldRight){oldRight.innerHTML='<i class="fa-solid fa-xmark"></i>';oldRight.setAttribute('aria-label','Close location information');
 oldRight.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();ws.classList.remove('ef-map-detail-open')},true)}
 const active=()=>!mapView.classList.contains('hidden')&&!mapView.closest('.hidden')&&mapView.getClientRects().length>0;
 function showTools(v){const on=!!v&&active();ws.classList.toggle('ef-map-tools-open',on);btn.setAttribute('aria-expanded',String(on));if(on)ws.classList.remove('left-collapsed')}
 btn.addEventListener('click',e=>{e.stopImmediatePropagation();e.preventDefault();showTools(!ws.classList.contains('ef-map-tools-open'))},true);
 close.addEventListener('click',e=>{e.preventDefault();showTools(false)});
 function sync(){const on=active();document.body.classList.toggle('ef-map-unified-active',on);ws.classList.toggle('ef-map-page',on);if(!on){ws.classList.remove('ef-map-tools-open','ef-map-detail-open')}else{btn.setAttribute('aria-expanded',String(ws.classList.contains('ef-map-tools-open')))}}
 new MutationObserver(sync).observe(mapView,{attributes:true,attributeFilter:['class','style']});
 const dash=document.getElementById('cyberDashboard');if(dash)new MutationObserver(sync).observe(dash,{attributes:true,attributeFilter:['class','style']});
 document.querySelectorAll('.cyber-topnav button,.tactical-side-nav button').forEach(b=>b.addEventListener('click',()=>setTimeout(sync,30)));
 // Existing pin code populates detailCase when selecting any marker.
 const heading=document.getElementById('detailCase');if(heading)new MutationObserver(()=>{if(active()&&heading.textContent.trim()&&!/CASE OVERVIEW/i.test(heading.textContent.trim()))ws.classList.add('ef-map-detail-open')}).observe(heading,{childList:true,subtree:true,characterData:true});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'){showTools(false);ws.classList.remove('ef-map-detail-open')}});
 sync();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();