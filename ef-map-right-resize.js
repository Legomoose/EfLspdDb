/* EFLSPDDB Map-only right-panel resizing; does not modify pins or data. */
(()=>{'use strict';
 function boot(){
  const ws=document.querySelector('.workspace');
  const right=ws?.querySelector(':scope > .rightpanel');
  if(!ws||!right)return;
  const key='eflspddb_map_right_width_v2';
  const isMap=()=>document.body.classList.contains('ef-map-unified-active');
  const clamp=(n,a,b)=>Math.max(a,Math.min(n,b));
  let width=Number(localStorage.getItem(key));
  if(!Number.isFinite(width)||width<260||width>560)width=318;
  function sizes(){
   const w=ws.getBoundingClientRect().width||window.innerWidth;
   const narrow=w<=1050;
   const nav=w>=1600?220:w>1050?205:w>700?72:65;
   const tools=ws.classList.contains('ef-map-tools-collapsed')?0:w>=1600?335:w>1050?305:w>700?275:0;
   const min= w>1450?318: w>1050?280:Math.min(280,Math.max(170,w-nav-12));
   const max=narrow?Math.max(min,Math.min(500,w-nav-20)):
           Math.max(min,Math.min(560,w-nav-tools-270));
   return {min,max,narrow};
  }
  function apply(){
   if(!isMap())return;
   // Old site remembers a panel width independently of the map grid.
   // Remove that inline width and size the grid track instead.
   right.style.removeProperty('width');
   const range=sizes();width=clamp(width,range.min,range.max);
   ws.style.setProperty('--ef-map-right-width',width+'px');
  }
  let dragging=false,startX=0,startWidth=0;
  // Capture first so the legacy pointer handler does not fight the map grid.
  document.addEventListener('pointerdown',e=>{
   const handle=e.target.closest?.('.workspace>.rightpanel>.ef-resize-right');
   if(!handle||!isMap()||innerWidth<=1050)return;
   e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
   startX=e.clientX;startWidth=right.getBoundingClientRect().width;
   dragging=true;document.body.classList.add('ef-resizing');
  },true);
  document.addEventListener('pointermove',e=>{
   if(!dragging)return;
   e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
   const range=sizes();width=clamp(startWidth+(startX-e.clientX),range.min,range.max);
   apply();
  },true);
  const finish=()=>{
   if(!dragging)return;
   dragging=false;document.body.classList.remove('ef-resizing');
   localStorage.setItem(key,String(Math.round(width)));
   window.dispatchEvent(new Event('resize'));
  };
  document.addEventListener('pointerup',finish,true);
  document.addEventListener('pointercancel',finish,true);
  window.addEventListener('blur',finish);
  window.addEventListener('resize',()=>{if(!dragging)apply()});
  const map=document.getElementById('mapView');
  if(map)new MutationObserver(()=>requestAnimationFrame(apply)).observe(map,{attributes:true,attributeFilter:['class','style']});
  new MutationObserver(()=>{if(!dragging)apply()}).observe(ws,{attributes:true,attributeFilter:['class']});
  // The Map activation class is applied asynchronously by the map controller.
  const observer=new MutationObserver(()=>{if(isMap())apply()});
  observer.observe(document.body,{attributes:true,attributeFilter:['class']});
  apply();
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
