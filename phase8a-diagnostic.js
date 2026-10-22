(()=>{'use strict';
function add(){const p=document.getElementById('ef7bShared');if(!p||document.getElementById('ef8Status'))return;
const box=document.createElement('div');box.className='db-card';box.innerHTML='<h3>PHASE 8A · LIVE RECORDS DIAGNOSTIC</h3><p>Backend foundation only. Automatic synchronization is not enabled yet; existing browser data stays untouched.</p><button id="ef8Test">Test per-record database</button><p id="ef8Status" role="status">Not checked</p>';p.append(box);
box.querySelector('#ef8Test').onclick=async()=>{const e=box.querySelector('#ef8Status');e.textContent='Checking…';try{const r=await window.EFDBAuth.request('/live-records',{action:'list',dataset:'cases'});e.textContent='Connected · '+r.records.length+' shared case records in Phase 8 table.';}catch(err){e.textContent='Error: '+err.message}}}
document.addEventListener('click',()=>setTimeout(add,100));
})();