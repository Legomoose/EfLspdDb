(()=>{'use strict';
const $=s=>document.querySelector(s);
const header=$('#efHeaderSearch');
if(header){const result=document.createElement('div');result.id='efQuickSearchResults';result.setAttribute('role','status');result.hidden=true;header.parentElement?.append(result);
const run=()=>{const q=header.value.trim();if(!q){result.hidden=true;return;}document.querySelector('[data-section="search"]')?.click();setTimeout(()=>{const global=$('#globalSearch');if(global){global.value=q;global.dispatchEvent(new Event('input',{bubbles:true}));result.textContent='Search results displayed below';result.hidden=false;setTimeout(()=>result.hidden=true,2000)}},70)};
header.addEventListener('input',()=>{clearTimeout(header._efTimer);header._efTimer=setTimeout(run,300)});header.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();run()}});
}
const modal=$('#caseModal'),form=$('#caseForm');
if(modal&&form){const head=form.querySelector('.modalhead');if(head){const btn=document.createElement('button');btn.type='button';btn.id='efExpandPinEditor';btn.title='Expand or restore pin editor';btn.textContent='⛶ Expand';head.insertBefore(btn,head.lastElementChild);btn.addEventListener('click',()=>{modal.classList.toggle('ef-editor-expanded');btn.textContent=modal.classList.contains('ef-editor-expanded')?'⛶ Restore':'⛶ Expand';try{localStorage.setItem('ef_pin_editor_expanded',modal.classList.contains('ef-editor-expanded')?'1':'0')}catch{}});if(localStorage.getItem('ef_pin_editor_expanded')==='1'){modal.classList.add('ef-editor-expanded');btn.textContent='⛶ Restore'}}
const notice=document.createElement('span');notice.id='efSaveFeedback';notice.setAttribute('aria-live','polite');notice.hidden=true;form.querySelector('.modalactions')?.prepend(notice);
form.addEventListener('submit',()=>{notice.textContent='Saving changes…';notice.hidden=false;setTimeout(()=>{notice.textContent='Changes saved';setTimeout(()=>notice.hidden=true,2500)},400)});
}
})();
