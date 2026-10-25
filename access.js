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
