(()=>{'use strict';
function bind(){const btn=document.getElementById('addPinBtn');if(!btn||btn.dataset.efLaunchRepair)return;btn.dataset.efLaunchRepair='1';btn.addEventListener('click',event=>{event.preventDefault();event.stopImmediatePropagation();const choice=document.getElementById('pinChoice');if(choice)choice.classList.add('hidden');if(typeof window.EFDBOpenUnifiedPin==='function'){try{window.EFDBOpenUnifiedPin('General Location');}catch(err){console.error('Add Pin editor failed to open:',err);}}else{console.error('Add Pin editor unavailable; main map script did not initialize.');}},true);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});else bind();
})();
