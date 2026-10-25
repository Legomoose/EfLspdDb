/* Phase 8F: visibility and manual sync controls for the existing guarded Phase 8E pilot.
   No credentials, remote writes, bulk imports or deletion behavior are added. */
(()=>{'use strict';
const KEY='ef8e_auto_sync_optin_v1';
let busy=false;
const panel=()=>document.getElementById('ef8e-panel');
const status=()=>document.getElementById('ef8e-status');
function mount(){const root=panel();if(!root||document.getElementById('ef8f-sync-controls'))return;
 const box=document.createElement('div');box.id='ef8f-sync-controls';box.style.cssText='display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-top:12px';
 const button=document.createElement('button');button.type='button';button.textContent='Check for updates now';button.disabled=localStorage.getItem(KEY)!=='yes';
 const label=document.createElement('span');label.id='ef8f-connection';label.style.cssText='font-size:12px;color:#b9cddd';label.setAttribute('role','status');
 box.append(button,label);root.append(box);
 const update=()=>{const opted=localStorage.getItem(KEY)==='yes';button.disabled=!opted||!window.EFDBAuth?.loggedIn||busy;label.textContent=!opted?'Automatic sharing paused':!window.EFDBAuth?.loggedIn?'Sign in to sync':navigator.onLine===false?'Offline — local data preserved':document.hidden?'Background tab — checks paused':'Online — guarded 2-second checks';};
 button.addEventListener('click',async()=>{if(busy||button.disabled)return;busy=true;update();button.textContent='Checking…';try{
  // Trigger existing Phase 8E cycle through its established focus handler.
  window.dispatchEvent(new Event('focus'));
  await new Promise(resolve=>setTimeout(resolve,700));
  label.textContent=status()?.textContent||'Update check requested';
 }finally{busy=false;button.textContent='Check for updates now';setTimeout(update,1800)}});
 root.querySelector('#ef8e-enable')?.addEventListener('change',()=>setTimeout(update,0));
 window.addEventListener('online',update);window.addEventListener('offline',update);
 window.addEventListener('efdb-auth-login',update);window.addEventListener('efdb-auth-logout',update);
 document.addEventListener('visibilitychange',update);update();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
function init(){mount();new MutationObserver(()=>{if(!document.getElementById('ef8f-sync-controls'))mount()}).observe(document.body,{childList:true,subtree:true})}
})();
