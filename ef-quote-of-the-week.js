/* LSPD DB · Quote of the Week · 220 original quotes
 * Same quote on every device using Europe/London Monday dates.
 * Static library only; no database writes, account changes or Worker polling.
 */
(()=>{'use strict';
const LIBRARY_URL='ef-quote-library-220.json?v=20261104-q220-v1';
const START_WEEK_UTC=Date.UTC(2026,10,2); // Monday 2 November 2026.
const WEEK_MS=7*24*60*60*1000;
const FALLBACK={id:'Q151',text:'Every detail tells a story. Your job is to find the truth.',category:'EverFall LSPD originals',inspired_by:[],type:'original_everfall'};
let quotes=null;
let weekKey='';
let displayedQuote='';
const quoteValid=q=>q&&typeof q.id==='string'&&typeof q.text==='string'&&q.text.trim().length>0;
function londonCivilDate(now){
 const parts=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/London',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);
 const get=k=>Number(parts.find(p=>p.type===k)?.value);
 const y=get('year'),m=get('month'),d=get('day');
 return Date.UTC(y,m-1,d);
}
function rotationWeek(now=new Date()){
 const day=londonCivilDate(now);
 return Math.floor((day-START_WEEK_UTC)/WEEK_MS);
}
function seededShuffle(qs){
 // Place the previously agreed first EverFall quote in week zero, then shuffle
 // the remaining 219 entries once with a fixed seed. Repeat only after 220 weeks.
 const lead=qs.find(q=>q.id==='Q151')||qs[0];
 const rest=qs.filter(q=>q!==lead);
 let seed=0x5d1a2026;
 const random=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0};
 for(let i=rest.length-1;i>0;i--){const j=random()%(i+1);[rest[i],rest[j]]=[rest[j],rest[i]]}
 return [lead,...rest];
}
function select(now=new Date()){
 const week=rotationWeek(now);
 const library=quotes?.length?quotes:[FALLBACK];
 const order=seededShuffle(library);
 return {quote:order[((week%order.length)+order.length)%order.length],week};
}
function credit(q){
 if(q.category==='Detective Bureau humour')return 'Detective Bureau · Original humour';
 if(q.type==='original_everfall')return 'EverFall LSPD · Original';
 if(q.type==='original_humour')return 'Detective Bureau · Original humour';
 const shows=Array.isArray(q.inspired_by)?q.inspired_by.filter(Boolean):[];
 return shows.length?'Original quote · Inspired by '+shows.join(' / '):'LSPD DB · Original quote';
}
function startMondayLabel(week){
 const day=new Date(START_WEEK_UTC+week*WEEK_MS);
 return new Intl.DateTimeFormat('en-GB',{day:'2-digit',month:'short',year:'numeric',timeZone:'UTC'}).format(day);
}
function update(){
 const target=document.querySelector('#cyberDashboard .tactical-bureau');
 if(!target)return;
 const selection=select();
 const currentKey=String(selection.week)+':'+selection.quote.id+':'+(quotes?.length||1);
 if(target.dataset.efQuoteWeek===currentKey && target.querySelector('.ef-weekly-quote-body'))return;
 const q=selection.quote;
 const heading=document.createElement('div');
 heading.className='tactical-bureau-heading ef-weekly-heading';
 heading.innerHTML='<img src="assets/lspd-logo.png" alt="LSPD badge"><div class="ef-weekly-heading-copy"><h2>QUOTE OF THE WEEK</h2><small>DETECTIVE BUREAU <span aria-hidden="true">·</span> WEEK OF <time class="ef-weekly-date"></time></small></div><i class="fa-solid fa-quote-right ef-weekly-mark" aria-hidden="true"></i>';
 heading.querySelector('time').textContent=startMondayLabel(selection.week);
 const body=document.createElement('blockquote');
 body.className='ef-weekly-quote-body';
 body.textContent='“'+q.text+'”';
 const foot=document.createElement('div');
 foot.className='ef-weekly-quote-foot';
 const source=document.createElement('span');
 source.className='ef-weekly-credit';
 source.textContent=credit(q);
 const count=document.createElement('span');
 count.className='ef-weekly-progress';
 const total=quotes?.length||1;
 count.textContent='QUOTE '+String(((selection.week%total)+total)%total+1).padStart(3,'0')+' / '+total;
 foot.append(source,count);
 target.replaceChildren(heading,body,foot);
 target.classList.add('ef-weekly-quote');
 target.dataset.efQuoteWeek=currentKey;
 weekKey=currentKey;
 displayedQuote=q.id;
}
async function loadLibrary(){
 try{
  const response=await fetch(LIBRARY_URL,{cache:'force-cache'});
  if(!response.ok)throw new Error('Library HTTP '+response.status);
  const data=await response.json();
  const list=data?.quotes;
  if(!Array.isArray(list)||list.length!==220||list.some(q=>!quoteValid(q))||new Set(list.map(q=>q.id)).size!==220)throw new Error('Unexpected quote library');
  quotes=list;
 }catch(err){
  console.warn('LSPD DB Quote of the Week: using original fallback quote. Verify ef-quote-library-220.json.',err);
  quotes=[FALLBACK];
 }
 update();
}
function boot(){
 const dash=document.getElementById('cyberDashboard');
 if(!dash)return;
 // Dashboard can be rebuilt by existing renderers when navigating. Reapply
 // without changing their logic or watching unrelated DOM nodes.
 new MutationObserver(update).observe(dash,{childList:true});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)update()});
 window.addEventListener('focus',update);
 // Local date check only. No network requests or backend polling.
 setInterval(()=>{if(!document.hidden)update()},10*60*1000);
 update();
 loadLibrary();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
// Expose read-only diagnostics for tests/admin troubleshooting (no mutation).
window.EFLSPDWeeklyQuote={getCurrent:()=>({id:displayedQuote,week:weekKey,total:quotes?.length||0}),selectForDate:(date)=>select(new Date(date))};
})();
