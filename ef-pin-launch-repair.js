/* Location-first Add Pin launcher. The editor opens only after map selection. */
(()=>{'use strict';
function install(){
 const old=document.getElementById('addPinBtn');if(!old)return;
 const button=old.cloneNode(true);button.type='button';button.removeAttribute('onclick');
 old.replaceWith(button);
 button.addEventListener('click',event=>{
  event.preventDefault();
  if(typeof window.EFDBStartPinPlacement==='function')window.EFDBStartPinPlacement();
  else console.error('[EFLSPDDB] Map placement function is unavailable.');
 });
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
