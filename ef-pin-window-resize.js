(()=>{'use strict';
const modal=document.getElementById('caseModal'),form=document.getElementById('caseForm');
if(!modal||!form||form.dataset.efWindowResize==='1')return;
form.dataset.efWindowResize='1';
const header=form.querySelector('.modalhead');if(!header)return;
const grip=document.createElement('div');grip.id='efPinResizeGrip';grip.title='Drag to resize pin editor';grip.setAttribute('aria-label','Drag to resize pin editor');form.append(grip);
const storageKey='ef_pin_editor_window_v1';
const clamp=(v,min,max)=>Math.min(Math.max(v,min),Math.max(min,max));
function limits(){return {vw:window.innerWidth,vh:window.innerHeight,minW:Math.min(560,window.innerWidth-8),minH:Math.min(410,window.innerHeight-8)}}
function setBox(box){const l=limits();const w=clamp(box.w,l.minW,l.vw-8),h=clamp(box.h,l.minH,l.vh-8);const x=clamp(box.x,4,l.vw-w-4),y=clamp(box.y,4,l.vh-h-4);form.style.setProperty('--ef-pin-left',x+'px');form.style.setProperty('--ef-pin-top',y+'px');form.style.setProperty('--ef-pin-width',w+'px');form.style.setProperty('--ef-pin-height',h+'px');form.classList.add('ef-manual-window');return{x,y,w,h}}
function current(){const r=form.getBoundingClientRect();return{x:r.left,y:r.top,w:r.width,h:r.height}}
function persist(){if(modal.classList.contains('ef-editor-expanded'))return;try{localStorage.setItem(storageKey,JSON.stringify(current()))}catch(e){}}
function restore(){if(modal.classList.contains('ef-editor-expanded'))return;try{const saved=JSON.parse(localStorage.getItem(storageKey)||'null');if(saved&&['x','y','w','h'].every(k=>Number.isFinite(saved[k])))setBox(saved)}catch(e){}}
function begin(e,kind){if(e.button!==0||modal.classList.contains('ef-editor-expanded')||window.innerWidth<=600)return;
if(kind==='move'&&(e.target.closest('button,input,a,select,textarea,label')||e.target.closest('#efPinResizeGrip')))return;
e.preventDefault();e.stopPropagation();const base=current(),sx=e.clientX,sy=e.clientY;
const onMove=ev=>{const dx=ev.clientX-sx,dy=ev.clientY-sy;setBox(kind==='resize'?{...base,w:base.w+dx,h:base.h+dy}:{...base,x:base.x+dx,y:base.y+dy})};
const onEnd=()=>{window.removeEventListener('pointermove',onMove);window.removeEventListener('pointerup',onEnd);window.removeEventListener('pointercancel',onEnd);persist()};
window.addEventListener('pointermove',onMove);window.addEventListener('pointerup',onEnd);window.addEventListener('pointercancel',onEnd);
}
header.addEventListener('pointerdown',e=>begin(e,'move'));grip.addEventListener('pointerdown',e=>begin(e,'resize'));
window.addEventListener('resize',()=>{if(form.classList.contains('ef-manual-window')&&!modal.classList.contains('ef-editor-expanded'))setBox(current())});
const observer=new MutationObserver(()=>{if(!modal.classList.contains('hidden'))restore()});observer.observe(modal,{attributes:true,attributeFilter:['class']});
restore();
})();