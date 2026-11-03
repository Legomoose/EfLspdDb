/* EFLSPDDB — unified map panels. One state owner, one close control per panel. */
(()=>{'use strict';
 const $=s=>document.querySelector(s);
 function boot(){
  const ws=$('.workspace'),mapView=$('#mapView'),left=ws?.querySelector(':scope > .leftpanel'),right=ws?.querySelector(':scope > .rightpanel');
  if(!ws||!mapView||!left||!right)return;
  let launch=$('#efMapOnlyToolsBtn');
  if(!launch){launch=document.createElement('button');launch.id='efMapOnlyToolsBtn';launch.type='button';mapView.append(launch)}
  launch.innerHTML='<i class="fa-solid fa-layer-group" aria-hidden="true"></i> Pins & Filters';
  launch.className='ef-map-tools-button';launch.setAttribute('aria-controls','efMapToolsDrawer');
  left.id='efMapToolsDrawer';
  left.querySelectorAll('.ef-map-tools-close').forEach(b=>b.remove());
  const close=document.createElement('button');close.type='button';close.className='ef-map-tools-close';close.textContent='× Close';close.setAttribute('aria-label','Close Pins & Filters');left.prepend(close);
  right.querySelectorAll('.ef-repair-detail-close').forEach(b=>b.remove());
  const rightClose=$('#toggleRightPanel');if(rightClose){rightClose.innerHTML='<i class="fa-solid fa-xmark"></i>';rightClose.title='Close selected pin';rightClose.setAttribute('aria-label','Close selected pin');rightClose.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();ws.classList.add('ef-map-detail-closed');right.setAttribute('aria-hidden','true')},true)}
  let mapWasVisible=false;
  const active=()=>!mapView.classList.contains('hidden')&&mapView.getClientRects().length>0;
  const resizeMap=()=>{setTimeout(()=>{try{window.EFDBMap?.invalidateSize?.({pan:false})}catch{};window.dispatchEvent(new Event('resize'))},80)};
  function tools(open){ws.classList.toggle('ef-map-tools-collapsed',!open);launch.setAttribute('aria-expanded',String(open));resizeMap()}
  launch.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();tools(ws.classList.contains('ef-map-tools-collapsed'))});
  close.addEventListener('click',e=>{e.preventDefault();tools(false)});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&active())tools(false)});
  function sync(){
   const yes=active();document.body.classList.toggle('ef-map-unified-active',yes);ws.classList.toggle('ef-map-page',yes);
   if(yes&&!mapWasVisible){ws.classList.remove('ef-map-tools-collapsed','ef-map-detail-closed');right.setAttribute('aria-hidden','false');resizeMap()}
   mapWasVisible=yes;launch.setAttribute('aria-expanded',String(!ws.classList.contains('ef-map-tools-collapsed')));
  }
  // The renderer updates the selected case heading on the first marker click.
  function openDetail(){if(!active())return;ws.classList.remove('ef-map-detail-closed');right.setAttribute('aria-hidden','false');resizeMap()}
  const heading=$('#detailCase'),body=$('#detailContent');
  if(heading)new MutationObserver(()=>{const s=heading.textContent.trim();if(s&&s!=='CASE OVERVIEW')openDetail()}).observe(heading,{childList:true,subtree:true,characterData:true});
  if(body)new MutationObserver(()=>{if(active()&&body.textContent.trim()&&!body.textContent.includes('Select a map pin'))openDetail()}).observe(body,{childList:true});
  new MutationObserver(()=>{if(active()&&right.querySelector('#efLocationProfile'))openDetail()}).observe(right,{childList:true});
  // Fallback for pin types that don't change the heading; never block Leaflet's own handler.
  $('#map')?.addEventListener('click',e=>{if(e.target.closest('.leaflet-marker-icon'))setTimeout(openDetail,30)},false);
  new MutationObserver(sync).observe(mapView,{attributes:true,attributeFilter:['class','style']});
  const dash=$('#cyberDashboard');if(dash)new MutationObserver(sync).observe(dash,{attributes:true,attributeFilter:['class','style']});
  document.querySelectorAll('.cyber-topnav button,.tactical-side-nav button').forEach(b=>b.addEventListener('click',()=>setTimeout(sync,60)));
  sync();
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
