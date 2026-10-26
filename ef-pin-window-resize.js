(()=>{'use strict';
const modal=document.getElementById('caseModal'),form=document.getElementById('caseForm');
if(!modal||!form||form.dataset.efWindowResize==='2')return;
form.dataset.efWindowResize='2';
const header=form.querySelector(':scope > .modalhead');if(!header)return;
let grip=document.getElementById('efPinResizeGrip');if(!grip){grip=document.createElement('div');grip.id='efPinResizeGrip';grip.title='Drag to resize Pin Editor';form.append(grip);}
const key='ef_pin_editor_window_v2';
const clamp=(n,a,b)=>Math.min(Math.max(n,a),Math.max(a,b));
function viewport(){return {w:window.innerWidth,h:window.innerHeight}}
function setBox(b){const v=viewport(),w=clamp(b.w,Math.min(520,v.w-8),v.w-8),h=clamp(b.h,Math.min(350,v.h-8),v.h-8),x=clamp(b.x,4,v.w-w-4),y=clamp(b.y,4,v.h-h-4);
 form.style.setProperty('--ef-pin-left',x+'px');form.style.setProperty('--ef-pin-top',y+'px');form.style.setProperty('--ef-pin-width',w+'px');form.style.setProperty('--ef-pin-height',h+'px');form.classList.add('ef-manual-window');return{x,y,w,h};}
function current(){const r=form.getBoundingClientRect();return{x:r.left,y:r.top,w:r.width,h:r.height}}
function persist(){if(modal.classList.contains('ef-editor-expanded'))return;try{localStorage.setItem(key,JSON.stringify(current()))}catch(e){}}
function restore(){if(modal.classList.contains('ef-editor-expanded'))return;try{const b=JSON.parse(localStorage.getItem(key)||'null');if(b&&['x','y','w','h'].every(k=>Number.isFinite(b[k])))setBox(b)}catch(e){}}
function start(e,kind){if(e.button!==0||modal.classList.contains('ef-editor-expanded')||window.innerWidth<=600)return;
 if(kind==='move'&&e.target.closest('button,input,a,select,textarea,label'))return;
 e.preventDefault();e.stopPropagation();const b=current(),sx=e.clientX,sy=e.clientY;
 const move=ev=>{const dx=ev.clientX-sx,dy=ev.clientY-sy;setBox(kind==='resize'?{...b,w:b.w+dx,h:b.h+dy}:{...b,x:b.x+dx,y:b.y+dy})};
 const end=()=>{window.removeEventListener('pointermove',move);window.removeEventListener('pointerup',end);window.removeEventListener('pointercancel',end);persist()};
 window.addEventListener('pointermove',move);window.addEventListener('pointerup',end);window.addEventListener('pointercancel',end);
}
header.addEventListener('pointerdown',e=>start(e,'move'));grip.addEventListener('pointerdown',e=>start(e,'resize'));
window.addEventListener('resize',()=>{if(form.classList.contains('ef-manual-window')&&!modal.classList.contains('ef-editor-expanded'))setBox(current())});
new MutationObserver(()=>{if(!modal.classList.contains('hidden'))restore()}).observe(modal,{attributes:true,attributeFilter:['class']});
restore();
})();