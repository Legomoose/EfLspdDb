/* Phase 8G MAIN UI: non-destructive layout helper. No storage or network writes. */
(()=>{'use strict';
 const cases=document.getElementById('recordsView');
 if(cases){const toolbar=cases.querySelector('.case-toolbar');const header=cases.querySelector('.pagehead');if(toolbar&&header&&toolbar.compareDocumentPosition(header)&Node.DOCUMENT_POSITION_FOLLOWING){header.after(toolbar);}}
 const extra=document.getElementById('extraView');
 if(extra){const mark=()=>{const title=document.getElementById('extraTitle')?.textContent?.trim()?.toLowerCase()||'';extra.classList.toggle('ef-main-gangs',title==='gangs');extra.classList.toggle('ef-main-items',title.includes('criminal items'));extra.classList.toggle('ef-main-contacts',title.includes('contact'));};mark();const title=document.getElementById('extraTitle');if(title)new MutationObserver(mark).observe(title,{childList:true,characterData:true,subtree:true});}
})();
