(()=>{'use strict';
const modal=document.getElementById('caseModal');if(!modal)return;
const form=document.getElementById('caseForm');if(!form)return;
const restore=document.createElement('button');restore.id='efPinFloatingRestore';restore.type='button';restore.textContent='↙ Restore Window';restore.setAttribute('aria-label','Restore compact pin editor');modal.appendChild(restore);
const expand=document.getElementById('efExpandPinEditor');
function sync(){const expanded=modal.classList.contains('ef-editor-expanded');if(expand){expand.textContent=expanded?'↙ Restore':'⛶ Expand';expand.setAttribute('aria-expanded',String(expanded));}restore.hidden=!expanded;}
function setExpanded(on){modal.classList.toggle('ef-editor-expanded',on);try{localStorage.setItem('ef_pin_editor_expanded',on?'1':'0')}catch{}sync();}
restore.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();setExpanded(false);});
const observer=new MutationObserver(sync);observer.observe(modal,{attributes:true,attributeFilter:['class']});sync();
})();
