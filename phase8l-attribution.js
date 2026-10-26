/* Phase 8L: account-based defaults for existing attribution fields.
   Server remains authoritative for per-record attribution metadata. */
(()=>{'use strict';
const identity=()=>window.EFDBAuth?.loggedIn?window.EFDBAuth.user:null;
function apply(){
 const u=identity();if(!u)return;
 const contact=document.querySelector('#contactForm input[name="addedBy"]');
 if(contact){
   const editing=String(document.querySelector('#contactHeading')?.textContent||'').toLowerCase().includes('edit');
   if(!editing){contact.value=u.name||'';contact.readOnly=true;contact.title='Automatically set from your signed-in account';}
   else {contact.readOnly=true;contact.title='Original attribution is retained';}
 }
 const item=document.querySelector('#itemOverlay select[name="addedBy"],#itemOverlay input[name="addedBy"]');
 if(item){
   const editing=String(document.querySelector('#itemOverlay h2')?.textContent||'').toLowerCase().includes('edit');
   if(!editing){
     if(item.tagName==='SELECT'&&!Array.from(item.options).some(o=>o.value===u.name)){
       const option=document.createElement('option');option.value=u.name;option.textContent=u.name+' (signed in)';item.add(option);
     }
     item.value=u.name||'';
   }
   item.disabled=false;
   item.style.pointerEvents='none';item.title='Automatically set from account';
 }
}
new MutationObserver(apply).observe(document.body,{childList:true,subtree:true});
window.addEventListener('efdb-auth-login',apply);apply();
})();
