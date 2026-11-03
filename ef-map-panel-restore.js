(()=>{'use strict';
function init(){
 const ws=document.querySelector('.workspace'),mv=document.getElementById('mapView'),left=ws?.querySelector(':scope > .leftpanel'),right=ws?.querySelector(':scope > .rightpanel');
 if(!ws||!mv||!left||!right)return;
 let btn=document.getElementById('efMapOnlyToolsBtn');
 if(!btn){btn=document.createElement('button');btn.id='efMapOnlyToolsBtn';btn.type='button';mv.append(btn)}
 btn.innerHTML='<i class="fa-solid fa-layer-group"></i> Pins & Filters';btn.setAttribute('aria-label','Toggle Pins and Filters');
 // Original controls module can retain ownership of the button. Synchronize CSS with its classes.
 function sync(){const visible=!mv.classList.contains('hidden')&&mv.getClientRects().length>0;
 document.body.classList.toggle('ef-repair-map-active',visible);
 if(!visible){ws.classList.remove('ef-map-tools-open','ef-map-detail-open')}
 else if(right.querySelector('#detailCase')?.textContent?.trim()&&!/CASE OVERVIEW/i.test(right.querySelector('#detailCase').textContent))ws.classList.add('ef-map-detail-open');
 }
 // Add a dedicated right-panel close button; do not interfere with pin selection.
 if(!right.querySelector('.ef-repair-detail-close')){const x=document.createElement('button');x.className='ef-repair-detail-close';x.type='button';x.textContent='×';x.title='Close location details';right.prepend(x);x.addEventListener('click',()=>ws.classList.remove('ef-map-detail-open'))}
 const detail=right.querySelector('#detailContent');
 if(detail)new MutationObserver(()=>{if(!mv.classList.contains('hidden'))ws.classList.add('ef-map-detail-open')}).observe(detail,{childList:true,subtree:false});
 new MutationObserver(sync).observe(mv,{attributes:true,attributeFilter:['class','style']});
 document.querySelectorAll('.tactical-side-nav button').forEach(b=>b.addEventListener('click',()=>setTimeout(sync,60)));
 document.addEventListener('keydown',e=>{if(e.key==='Escape')ws.classList.remove('ef-map-detail-open')});
 sync();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();