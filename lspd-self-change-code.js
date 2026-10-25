/* LSPD DB: authenticated self-service access-code change. */
(()=>{'use strict';
const menu=document.getElementById('efAccountMenu');
if(!menu||document.getElementById('lspdSelfCodeButton'))return;
const button=document.createElement('button');button.type='button';button.id='lspdSelfCodeButton';
button.innerHTML='<i class="fa-solid fa-key" aria-hidden="true"></i> Change Access Code';
const settings=[...menu.querySelectorAll('button')].find(b=>/Settings/.test(b.textContent));
if(settings)menu.insertBefore(button,settings);else menu.append(button);
const style=document.createElement('style');style.textContent=`
.lspd-code-overlay{position:fixed;inset:0;z-index:300000;background:rgba(2,9,19,.85);display:flex;align-items:center;justify-content:center;padding:18px;backdrop-filter:blur(7px)}
.lspd-code-dialog{width:min(100%,430px);background:linear-gradient(155deg,#112941,#071522);color:#edf6ff;border:1px solid #4b85bd;border-radius:17px;box-shadow:0 25px 90px #000b;padding:25px;font:14px Arial,sans-serif}
.lspd-code-dialog h2{font-size:22px;margin:0 0 8px}.lspd-code-dialog p{color:#b6cbe0;line-height:1.5}
.lspd-code-dialog label{display:block;margin:15px 0;color:#d7e8f9;font-size:13px}
.lspd-code-dialog input{display:block;width:100%;box-sizing:border-box;background:#071421;color:white;border:1px solid #547ba1;border-radius:9px;padding:13px;margin-top:7px;font-size:20px;letter-spacing:5px}
.lspd-code-dialog input:focus{outline:2px solid #70b8fa}
.lspd-code-actions{display:flex;gap:10px;justify-content:flex-end;margin-top:18px}
.lspd-code-actions button{padding:11px 15px;border-radius:8px;border:1px solid #5a81a9;background:#18344e;color:white;cursor:pointer}
.lspd-code-actions .lspd-code-save{background:#2470b8;border-color:#58aaf6}
.lspd-code-actions button:disabled{opacity:.55;cursor:wait}
.lspd-code-feedback{min-height:19px;color:#ffcf87!important;margin:12px 0 0}
`;document.head.append(style);
button.addEventListener('click',()=>{
 menu.hidden=true;if(!window.EFDBAuth?.loggedIn)return;
 document.querySelector('.lspd-code-overlay')?.remove();
 const overlay=document.createElement('div');overlay.className='lspd-code-overlay';
 const dialog=document.createElement('form');dialog.className='lspd-code-dialog';dialog.setAttribute('role','dialog');dialog.setAttribute('aria-modal','true');dialog.setAttribute('aria-label','Change Access Code');
 const title=document.createElement('h2');title.textContent='Change Access Code';
 const description=document.createElement('p');description.textContent='Enter your current code and choose a new six-digit access code. You will need to sign in again after saving.';
 const makeInput=(caption,max)=>{const label=document.createElement('label');label.textContent=caption;const input=document.createElement('input');input.type='password';input.inputMode='numeric';input.autocomplete='off';input.maxLength=max;input.required=true;input.pattern='[0-9]*';label.append(input);return {label,input};};
 const old=makeInput('Current access code (6 or 12 digits)',12);
 const next=makeInput('New six-digit access code',6);
 const confirm=makeInput('Confirm new access code',6);
 const feedback=document.createElement('p');feedback.className='lspd-code-feedback';feedback.setAttribute('role','alert');
 const actions=document.createElement('div');actions.className='lspd-code-actions';
 const cancel=document.createElement('button');cancel.type='button';cancel.textContent='Cancel';
 const save=document.createElement('button');save.type='submit';save.textContent='Update Access Code';save.className='lspd-code-save';
 actions.append(cancel,save);dialog.append(title,description,old.label,next.label,confirm.label,feedback,actions);overlay.append(dialog);document.body.append(overlay);
 const close=()=>overlay.remove();cancel.addEventListener('click',close);
 overlay.addEventListener('click',e=>{if(e.target===overlay)close();});
 overlay.addEventListener('keydown',e=>{if(e.key==='Escape')close();});
 old.input.focus();
 dialog.addEventListener('submit',async e=>{
  e.preventDefault();const current=old.input.value,newCode=next.input.value,confirmation=confirm.input.value;
  if(!/^(?:\d{6}|\d{12})$/.test(current)){feedback.textContent='Your current code must contain 6 or 12 digits.';return;}
  if(!/^\d{6}$/.test(newCode)){feedback.textContent='Your new code must contain exactly 6 digits.';return;}
  if(newCode!==confirmation){feedback.textContent='The new codes do not match.';return;}
  if(current===newCode){feedback.textContent='Choose a different code.';return;}
  save.disabled=true;cancel.disabled=true;feedback.textContent='Updating your access code…';
  try{await window.EFDBAuth.request('/change-code',{current_code:current,code:newCode});
   old.input.value='';next.input.value='';confirm.input.value='';close();window.EFDBAuth.logout();
  }catch(error){feedback.textContent=error.message||'Unable to change access code.';save.disabled=false;cancel.disabled=false;}
 });
});
window.addEventListener('efdb-auth-logout',()=>document.querySelector('.lspd-code-overlay')?.remove());
})();
