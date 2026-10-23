/* LSPD DB — consistent confirmation for existing Delete / Remove actions.
   Does not change deletion or synchronisation implementations. */
(()=>{
  'use strict';
  const css=`
  .lspd-delete-overlay{position:fixed;inset:0;z-index:2147483646;background:rgba(1,8,20,.77);display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(3px)}
  .lspd-delete-dialog{width:min(100%,450px);background:#15253e;border:1px solid #3b587c;border-radius:12px;box-shadow:0 20px 70px rgba(0,0,0,.65);padding:23px;color:#e9f2ff;font:inherit}
  .lspd-delete-dialog h2{font-size:19px;margin:0 0 13px;color:#fff}.lspd-delete-dialog p{font-size:14px;line-height:1.55;color:#bed1e8;margin:0 0 22px}
  .lspd-delete-actions{display:flex;justify-content:flex-end;gap:10px}.lspd-delete-actions button{font:inherit;font-size:14px;cursor:pointer;padding:10px 18px;border-radius:6px;border:1px solid #536b8d;color:white;background:#2a4264}
  .lspd-delete-actions button.lspd-delete-danger{background:#a92f43;border-color:#ca4d5e}.lspd-delete-actions button:focus-visible{outline:2px solid #8ebeff;outline-offset:2px}`;
  const style=document.createElement('style');style.textContent=css;document.head.appendChild(style);
  let active=false,replaying=false;
  function dialog(message,permanent){
    return new Promise(resolve=>{
      const layer=document.createElement('div');layer.className='lspd-delete-overlay';layer.innerHTML=`<div class="lspd-delete-dialog" role="alertdialog" aria-modal="true" aria-labelledby="lspd-delete-title" aria-describedby="lspd-delete-desc"><h2 id="lspd-delete-title">${permanent?'Permanently Delete Record':'Confirm Deletion'}</h2><p id="lspd-delete-desc"></p><div class="lspd-delete-actions"><button type="button" data-cancel>Cancel</button><button type="button" class="lspd-delete-danger" data-accept>${permanent?'Permanently Delete':'Delete'}</button></div></div>`;
      layer.querySelector('p').textContent=message;
      const oldFocus=document.activeElement;
      function finish(value){document.removeEventListener('keydown',key,true);layer.remove();active=false;if(oldFocus?.isConnected)oldFocus.focus();resolve(value)}
      function key(e){if(e.key==='Escape'){e.preventDefault();e.stopPropagation();finish(false)}else if(e.key==='Tab'){const buttons=[...layer.querySelectorAll('button')];const idx=buttons.indexOf(document.activeElement);if(e.shiftKey&&idx===0){e.preventDefault();buttons[1].focus()}else if(!e.shiftKey&&idx===1){e.preventDefault();buttons[0].focus()}}}
      layer.querySelector('[data-cancel]').onclick=()=>finish(false);
      layer.querySelector('[data-accept]').onclick=()=>finish(true);
      layer.addEventListener('click',e=>{if(e.target===layer)finish(false)});
      document.body.appendChild(layer);document.addEventListener('keydown',key,true);layer.querySelector('[data-cancel]').focus();
    });
  }
  window.lspdConfirmDelete=(message)=>dialog(message,false);
  document.addEventListener('click',async e=>{
    if(replaying||active||!e.isTrusted)return;
    const btn=e.target.closest('button,[role="button"]');if(!btn||btn.closest('.lspd-delete-overlay')||btn.disabled)return;
    const data=Object.keys(btn.dataset||{});
    const label=(btn.textContent||'').trim().replace(/\s+/g,' ').toLowerCase();
    const destructive=/^(delete|remove|permanently delete)(\b|\s)/i.test(label)||data.some(k=>/^(contactdelete|filedelete|itemdelete|gangdelete|vehicledelete|dbdelete|inteldelete|detremove|purge|delete)$/i.test(k));
    if(!destructive)return;
    // Gang actions use the same dialog directly in gang-management.js.
    if(btn.hasAttribute('data-gang-delete')||btn.hasAttribute('data-gang-deletemember'))return;
    // Map pins already have their own authenticated deletion confirmation and must remain untouched.
    if(data.some(k=>/pin(delete|remove)|deletepin|markerdelete|locationdelete/i.test(k)))return;
    if(btn.closest('#map,#locationPanel,#pinDetails,#caseDetailPanel .pin-actions'))return;
    e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();active=true;
    const permanent=/permanent|purge/i.test(label+' '+data.join(' '));
    const caseButton=data.some(k=>/filedelete/i.test(k))||!!btn.closest('.ef-case-row,.ef-case-tile,.ef-case-record');
    const msg=permanent?'This will permanently delete the selected record and cannot be undone.':caseButton?'Delete this investigation case? Linked map pins will be kept.':'Delete the selected record? This action may not be reversible.';
    const accepted=await dialog(msg,permanent);
    if(!accepted||!btn.isConnected)return;
    // The existing click handler performs the real operation. Only its legacy native confirm is bypassed.
    const nativeConfirm=window.confirm;
    try{replaying=true;window.confirm=()=>true;btn.click()}finally{window.confirm=nativeConfirm;replaying=false}
  },true);
})();
