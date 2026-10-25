/* EFLSPDDB Stage 2 - ordered classic scripts. Source sections preserved. */

;
/* ===== SOURCE: access.js ===== */
// Phase 3 secure numerical login. Session token kept only in JS memory.
(function(){
'use strict';
const API='https://eflspddb-auth.danielmcmahon1995.workers.dev';
const gate=document.getElementById('accessGate'),form=document.getElementById('accessForm');
const input=document.getElementById('accessInput'),hint=document.getElementById('accessHint');
const reset=document.getElementById('resetAccessCode');
if(!gate||!form||!input||!hint)return;
let token=null,user=null,lastActivity=Date.now(),warningShown=false,refreshing=false;
const inactivity=10*60*1000;
window.EFDBAuth={
  get user(){return user;},get loggedIn(){return !!token;},
  async request(path,data={}){
    if(!token)throw Error('Not logged in');
    const res=await fetch(API+path,{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},body:JSON.stringify(data)});
    const json=await res.json().catch(()=>({}));
    if(res.status===401){lock('Session expired. Enter your code again.');throw Error('Session expired');}
    if(!res.ok)throw Error(json.error||'Request failed');
    return json;
  },
  logout(){lock('You have been logged out.');}
};
function lock(message){
 const old=token;token=null;user=null;warningShown=false;
 gate.classList.remove('hidden');hint.textContent=message||'Enter your assigned 6-digit access code.';
 document.getElementById('efAuthBar')?.remove();document.getElementById('efAuthWarning')?.remove();
 window.dispatchEvent(new Event('efdb-auth-logout'));
 if(old)fetch(API+'/logout',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+old},body:'{}'}).catch(()=>{});
}
function activity(){if(token)lastActivity=Date.now();}
['pointerdown','keydown','touchstart','scroll'].forEach(ev=>document.addEventListener(ev,activity,{passive:true}));
async function ping(){
 if(!token||refreshing)return;
 refreshing=true;
 try{await window.EFDBAuth.request('/me',{});}catch{lock('Session expired. Enter your code again.');}
 finally{refreshing=false;}
}
setInterval(()=>{
 if(!token)return;
 const remaining=inactivity-(Date.now()-lastActivity);
 if(remaining<=0){lock('Logged out after 10 minutes of inactivity.');return;}
 if(remaining<=120000){
  let el=document.getElementById('efAuthWarning');
  if(!el){el=document.createElement('div');el.id='efAuthWarning';el.className='ef-auth-warning';document.body.appendChild(el);}
  el.textContent='Session expires in '+Math.ceil(remaining/1000)+' seconds without activity.';
 }else document.getElementById('efAuthWarning')?.remove();
},1000);
// Only refresh backend session on actual activity, never extend an idle session.
setInterval(()=>{if(token&&Date.now()-lastActivity<60000)ping();},60000);
form.addEventListener('submit',async event=>{
 event.preventDefault();
 const code=input.value.trim();
 if(!/^(?:\d{6}|\d{12})$/.test(code)){hint.textContent='Enter your 6-digit code (existing 12-digit codes also accepted temporarily).';return;}
 const btn=form.querySelector('button');btn.disabled=true;hint.textContent='Checking access code…';
 try{
  const res=await fetch(API+'/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({code})});
  const json=await res.json().catch(()=>({}));
  if(!res.ok)throw Error(json.error||'Unable to sign in');
  token=json.token;user=json.user;lastActivity=Date.now();input.value='';
  gate.classList.add('hidden');
  const bar=document.createElement('div');bar.id='efAuthBar';bar.className='ef-auth-bar';
  const label=document.createElement('span');label.textContent=user.name+' · '+user.role;
  const logout=document.createElement('button');logout.type='button';logout.textContent='Log out';logout.onclick=()=>lock('You have been logged out.');
  bar.append(label,logout);document.body.appendChild(bar);
  window.dispatchEvent(new CustomEvent('efdb-auth-login',{detail:user}));
  if(user.must_change_code)window.dispatchEvent(new Event('efdb-change-required'));
 }catch(err){hint.textContent=err.message||'Login failed';}
 finally{btn.disabled=false;}
});
reset?.addEventListener('click',()=>{hint.textContent='Ask an EFLSPDDB administrator to issue or reset your code.';});
hint.textContent='Enter your assigned 6-digit access code.';
})();

;

;
/* ===== SOURCE: lspd-login-keypad.js ===== */
(function(){'use strict';const gate=document.getElementById('accessGate'),input=document.getElementById('accessInput'),digits=document.getElementById('lspdLoginDigits'),pad=document.getElementById('lspdLoginPad'),legacy=document.getElementById('lspdLoginLegacy'),reveal=document.getElementById('lspdLoginReveal'),form=document.getElementById('accessForm');if(!gate||!input||!digits||!pad||!form)return;let old=false,visible=false;const submit=form.querySelector('[type="submit"]');function render(){const value=input.value.replace(/\D/g,'').slice(0,old?12:6);if(input.value!==value)input.value=value;digits.replaceChildren();for(let i=0;i<(old?12:6);i++){const slot=document.createElement('span');slot.className='lspd-login-slot'+(i===value.length?' active':'');slot.textContent=value[i]?(visible?value[i]:'•'):'';digits.appendChild(slot)}submit.disabled=value.length!==(old?12:6);submit.setAttribute('aria-disabled',String(submit.disabled));}function update(v){input.value=v;input.dispatchEvent(new Event('input',{bubbles:true}));}pad.addEventListener('click',e=>{const btn=e.target.closest('button');if(!btn)return;const digit=btn.dataset.digit,action=btn.dataset.action;if(digit!==undefined)update(input.value+digit);if(action==='clear')update('');if(action==='delete')update(input.value.slice(0,-1));});legacy?.addEventListener('click',()=>{old=!old;legacy.textContent=old?'Use a new 6-digit code':'Use an existing 12-digit code';document.querySelector('.lspd-login-subtitle').textContent=old?'Enter your existing 12-digit access code':'Enter your six-digit access code';update('');});reveal?.addEventListener('click',()=>{visible=!visible;reveal.innerHTML=visible?'Hide code <i class="fa-regular fa-eye-slash"></i>':'Show code <i class="fa-regular fa-eye"></i>';render()});digits.addEventListener('click',()=>input.focus());input.addEventListener('input',render);document.addEventListener('keydown',e=>{if(gate.classList.contains('hidden')||e.ctrlKey||e.metaKey||e.altKey||e.target.closest('input,textarea,[contenteditable="true"]'))return;if(/^\d$/.test(e.key)){e.preventDefault();update(input.value+e.key)}else if(e.key==='Backspace'){e.preventDefault();update(input.value.slice(0,-1))}else if(e.key==='Escape'){e.preventDefault();update('')}else if(e.key==='Enter'&&!submit.disabled){e.preventDefault();form.requestSubmit()}});form.addEventListener('submit',()=>{submit.disabled=true});new MutationObserver(()=>{if(!gate.classList.contains('hidden')){update('');}}).observe(gate,{attributes:true,attributeFilter:['class']});render();})();

;
