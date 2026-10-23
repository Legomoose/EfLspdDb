/* Repairs: case empty state and Gangs Delete (window capture precedes old document handlers). */
(()=>{'use strict';
 const body=document.getElementById('recordsBody');
 function fixEmpty(){if(!body)return;body.querySelectorAll('tr').forEach(row=>row.classList.toggle('lspd-empty-case-row',!!row.querySelector('td[colspan="6"]')))}
 if(body){new MutationObserver(fixEmpty).observe(body,{childList:true});fixEmpty()}
 let busy=false;
 function ask(message){return new Promise(resolve=>{
   const layer=document.createElement('div');layer.style.cssText='position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(0,7,20,.78);backdrop-filter:blur(4px)';
   layer.innerHTML='<section role="alertdialog" aria-modal="true" aria-label="Confirm deletion" style="width:min(440px,100%);background:#162944;border:1px solid #45678d;border-radius:10px;padding:24px;color:#eef6ff;box-shadow:0 20px 65px #0009;font-family:inherit"><h3 style="margin:0 0 12px;font-size:19px">Delete Gang</h3><p id="lspdGangDeleteMessage" style="margin:0 0 24px;color:#c4d6eb;line-height:1.5"></p><div style="display:flex;gap:10px;justify-content:flex-end"><button type="button" data-no style="background:#304968;color:white;border:1px solid #5a7594;border-radius:6px;padding:10px 16px;cursor:pointer">Cancel</button><button type="button" data-yes style="background:#a72d43;color:white;border:1px solid #d04c63;border-radius:6px;padding:10px 16px;cursor:pointer">Delete</button></div></section>';
   layer.querySelector('#lspdGangDeleteMessage').textContent=message;
   const prior=document.activeElement;
   function done(result){document.removeEventListener('keydown',key,true);layer.remove();busy=false;if(prior&&prior.isConnected)prior.focus();resolve(result)}
   function key(e){if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();done(false)}}
   layer.querySelector('[data-no]').onclick=()=>done(false);
   layer.querySelector('[data-yes]').onclick=()=>done(true);
   layer.addEventListener('click',e=>{if(e.target===layer)done(false)});
   document.body.appendChild(layer);document.addEventListener('keydown',key,true);layer.querySelector('[data-no]').focus();
 })}
 window.addEventListener('click',async e=>{
   const btn=e.target.closest?.('button[data-gang-delete],button[data-gangdelete],button[data-dbdelete]');
   if(!btn||busy||!btn.closest('#extraContent')||typeof currentSection==='undefined'||currentSection!=='gangs')return;
   e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();busy=true;
   const i=Number(btn.dataset.gangDelete??btn.dataset.gangdelete??btn.dataset.dbdelete);
   if(!Number.isInteger(i)||i<0||!Array.isArray(database?.gangs)||!database.gangs[i]){busy=false;return}
   const gang=database.gangs[i];
   if(await ask('Delete '+String(gang.title||'this gang')+' and its member roster?')){
     // Resolve by object identity if list changed while confirmation was open.
     const index=database.gangs.indexOf(gang);
     if(index>=0){database.gangs.splice(index,1);saveDb();renderExtra('gangs')}
   }
 },true);
})();
