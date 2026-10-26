/* Responsive case overview toggle and Leaflet resize; no data/sync changes. */
(()=>{'use strict';
 const ws=document.querySelector('.workspace');
 const toggle=document.getElementById('toggleRightPanel');
 if(!ws||!toggle)return;
 const narrow=()=>window.innerWidth>=851&&window.innerWidth<=1599;
 let wasNarrow=false;
 function adapt(){
   if(narrow()){
     if(!wasNarrow){ws.classList.remove('responsive-detail-open');}
     wasNarrow=true;
   }else{wasNarrow=false;ws.classList.remove('responsive-detail-open');}
   const map=window.map;
   if(map&&typeof map.invalidateSize==='function')requestAnimationFrame(()=>map.invalidateSize({pan:false}));
 }
 toggle.addEventListener('click',()=>{
   if(!narrow())return;
   // Existing toggle handler may update right-collapsed. Keep the rail accessible.
   ws.classList.toggle('responsive-detail-open');
   ws.classList.remove('right-collapsed');
   requestAnimationFrame(adapt);
 });
 window.addEventListener('resize',adapt,{passive:true});
 const observer=new ResizeObserver(()=>{
   const map=window.map;
   if(map&&typeof map.invalidateSize==='function')map.invalidateSize({pan:false});
 });
 const center=ws.querySelector('.center');if(center)observer.observe(center);
 adapt();
})();
