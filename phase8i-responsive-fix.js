/* Phase 8I: constrain saved panel widths when the browser becomes narrower. */
(()=>{'use strict';
 const workspace=document.querySelector('.workspace');
 if(!workspace)return;
 const left=workspace.querySelector('.leftpanel');
 const right=workspace.querySelector('.rightpanel');
 if(!left||!right)return;
 let busy=false;
 const width=el=>el.getBoundingClientRect().width;
 function adapt(){
  if(busy)return;busy=true;
  try{
   const available=workspace.clientWidth;
   if(!available)return;
   const leftClosed=workspace.classList.contains('left-collapsed');
   const rightClosed=workspace.classList.contains('right-collapsed');
   const minCenter=Math.min(320,Math.max(180,Math.round(available*.28)));
   const minLeft=leftClosed?42:Math.min(185,Math.max(120,available*.16));
   const minRight=rightClosed?42:Math.min(270,Math.max(150,available*.22));
   const budget=Math.max(0,available-minCenter);
   let lw=leftClosed?42:width(left),rw=rightClosed?42:width(right);
   // Only shrink panels when necessary. Never overwrite their preferred stored sizes.
   if(lw+rw>budget){
    let excess=lw+rw-budget;
    const rCut=Math.min(excess,Math.max(0,rw-minRight));rw-=rCut;excess-=rCut;
    const lCut=Math.min(excess,Math.max(0,lw-minLeft));lw-=lCut;excess-=lCut;
    if(excess>0){const sum=lw+rw||1;lw=Math.max(42,lw-excess*lw/sum);rw=Math.max(42,rw-excess*rw/sum)}
    if(!leftClosed)left.style.setProperty('width',Math.floor(lw)+'px','important');
    if(!rightClosed)right.style.setProperty('width',Math.floor(rw)+'px','important');
   }
   if(window.map&&typeof window.map.invalidateSize==='function')window.map.invalidateSize({pan:false});
  }finally{busy=false}
 }
 let queued=false;
 function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;adapt()})}
 window.addEventListener('resize',schedule,{passive:true});
 if(typeof ResizeObserver==='function')new ResizeObserver(schedule).observe(workspace);
 new MutationObserver(schedule).observe(workspace,{attributes:true,attributeFilter:['class']});
 schedule();
})();
