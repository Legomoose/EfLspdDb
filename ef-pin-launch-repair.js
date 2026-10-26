/* Single Add Pin launcher: replace the button node to discard legacy conflicting handlers. */
(()=>{'use strict';
function install(){
 const old=document.getElementById('addPinBtn');if(!old)return;
 const button=old.cloneNode(true);button.type='button';button.removeAttribute('onclick');button.dataset.efSingleLauncher='1';
 old.replaceWith(button);
 button.addEventListener('click',function(event){
  event.preventDefault();
  const choice=document.getElementById('pinChoice');if(choice)choice.classList.add('hidden');
  try{
   if(typeof window.EFDBOpenUnifiedPin==='function'){
    window.EFDBOpenUnifiedPin('General Location');
   }else{
    throw new Error('Unified pin editor function unavailable');
   }
   const modal=document.getElementById('caseModal');
   if(modal&&modal.classList.contains('hidden'))modal.classList.remove('hidden');
  }catch(error){
   console.error('[EFLSPDDB] Add Pin failed:',error);
   const modal=document.getElementById('caseModal');
   if(modal){modal.classList.remove('hidden');document.getElementById('modalTitle').textContent='📍 ADD MAP PIN';}
   else window.alert('Add Pin could not open. Check browser console for details.');
  }
 });
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
