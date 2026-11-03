/* Navigation/layout-only update. Does not edit pins, case state, postals or sync. */
(()=>{'use strict';
 function init(){
  const ws=document.querySelector('.workspace');
  const mapView=document.getElementById('mapView');
  const panel=ws?.querySelector(':scope > .leftpanel');
  if(!ws||!mapView||!panel||document.getElementById('efMapOnlyToolsBtn'))return;
  ws.classList.add('ef-map-only-layout');
  // Retain all existing pin/filter controls and their listeners in place.
  const launch=document.createElement('button');launch.id='efMapOnlyToolsBtn';
  launch.className='ef-map-tools-button';launch.type='button';
  launch.innerHTML='<i class="fa-solid fa-layer-group" aria-hidden="true"></i><span>Pins & Filters</span>';
  launch.setAttribute('aria-controls','efMapToolsDrawer');launch.setAttribute('aria-expanded','false');
  mapView.appendChild(launch);panel.id='efMapToolsDrawer';
  const close=document.createElement('button');close.type='button';close.className='ef-map-tools-close';
  close.innerHTML='<i class="fa-solid fa-xmark" aria-hidden="true"></i> Close';
  close.setAttribute('aria-label','Close map controls');panel.prepend(close);
  const refreshMap=()=>{try{if(typeof map!=='undefined'&&map?.invalidateSize)map.invalidateSize({pan:false});}catch{};
   try{window.EFDBMap?.invalidateSize?.({pan:false})}catch{};
   window.dispatchEvent(new Event('resize'));
  };
  const open=value=>{const yes=!!value&&ws.classList.contains('ef-map-page');
    ws.classList.toggle('ef-map-tools-open',yes);launch.setAttribute('aria-expanded',String(yes));
    launch.title=yes?'Close Pins & Filters':'Open Pins & Filters';
    if(yes){ws.classList.remove('left-collapsed');}
    setTimeout(refreshMap,230);
  };
  launch.addEventListener('click',()=>open(!ws.classList.contains('ef-map-tools-open')));
  close.addEventListener('click',()=>open(false));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&ws.classList.contains('ef-map-tools-open'))open(false)});
  const sync=()=>{const mapVisible=!mapView.classList.contains('hidden')&&mapView.getClientRects().length>0;
    ws.classList.toggle('ef-map-page',mapVisible);
    if(!mapVisible)open(false);else setTimeout(refreshMap,70);
  };
  new MutationObserver(sync).observe(mapView,{attributes:true,attributeFilter:['class','style']});
  const dashboard=document.getElementById('cyberDashboard');if(dashboard)new MutationObserver(sync).observe(dashboard,{attributes:true,attributeFilter:['class','style']});
  document.querySelectorAll('.cyber-topnav button').forEach(b=>b.addEventListener('click',()=>setTimeout(sync,0)));
  sync();
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
