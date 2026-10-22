(function(){
'use strict';
const css=document.createElement('style');
css.textContent=`.ef-auth-bar{position:fixed;right:16px;bottom:16px;z-index:9000;background:#11243b;border:1px solid #44658b;color:white;padding:9px 12px;border-radius:10px;display:flex;gap:12px;align-items:center;font:13px Arial}.ef-auth-bar button,.ef-admin button{background:#2669af;border:0;border-radius:6px;color:white;padding:7px 10px;cursor:pointer}.ef-auth-warning{position:fixed;top:12px;left:50%;transform:translateX(-50%);z-index:9998;background:#613b0b;color:#fff;padding:12px 18px;border-radius:9px;font:14px Arial}.ef-admin{position:fixed;inset:6vh 9vw;z-index:9500;background:#0e1c30;color:white;border:1px solid #45617d;border-radius:14px;box-shadow:0 20px 100px #000b;overflow:auto;padding:24px;font:14px Arial}.ef-admin input,.ef-admin select{background:#142c47;color:white;padding:9px;border:1px solid #52718e;border-radius:6px;margin:5px}.ef-admin table{width:100%;border-collapse:collapse}.ef-admin td,.ef-admin th{padding:10px;text-align:left;border-bottom:1px solid #34465d}.ef-admin .danger{background:#a43d4b}.ef-admin .code{background:#243f53;padding:12px;margin:12px 0;font-size:19px;letter-spacing:2px}.ef-admin .notice{color:#f7c46d}`;
document.head.appendChild(css);
let launch;
window.addEventListener('efdb-auth-login',ev=>{
 const role=ev.detail.role;
 if(!['owner','admin'].includes(role))return;
 const bar=document.getElementById('efAuthBar');
 launch=document.createElement('button');launch.textContent='Manage Accounts';launch.onclick=openAdmin;
 bar?.insertBefore(launch,bar.lastChild);
});
window.addEventListener('efdb-auth-logout',()=>document.querySelector('.ef-admin')?.remove());
async function openAdmin(){
 const api=window.EFDBAuth;
 const panel=document.createElement('section');panel.className='ef-admin';
 const h=document.createElement('h2');h.textContent='EFLSPDDB · Account Management';
 const close=document.createElement('button');close.textContent='Close';close.onclick=()=>panel.remove();
 const notice=document.createElement('p');notice.className='notice';notice.textContent='New codes are shown once. Save them securely before closing.';
 const form=document.createElement('form');
 const name=document.createElement('input');name.placeholder='Detective name';name.required=true;name.maxLength=80;
 const role=document.createElement('select');
 for(const r of (api.user.role==='owner'?['detective','admin']:['detective'])){const o=document.createElement('option');o.value=r;o.textContent=r;role.appendChild(o);}
 const create=document.createElement('button');create.type='submit';create.textContent='Create account';
 const result=document.createElement('div');
 form.append(name,role,create);
 const table=document.createElement('table');
 panel.append(h,close,notice,form,result,table);document.body.appendChild(panel);
 async function reload(){
  try{
   const data=await api.request('/accounts',{action:'list'});
   table.replaceChildren();
   const header=document.createElement('tr');
   for(const t of ['Name','Role','Status','Action']){const th=document.createElement('th');th.textContent=t;header.appendChild(th);}table.appendChild(header);
   for(const acct of data.accounts){
    const tr=document.createElement('tr');
    for(const t of [acct.display_name,acct.role,acct.active?'Active':'Disabled']){const td=document.createElement('td');td.textContent=t;tr.appendChild(td);}
    const td=document.createElement('td');
    if(api.user.role==='owner'&&acct.role!=='owner'&&acct.active){
      const b=document.createElement('button');b.textContent='Disable';b.className='danger';
      b.onclick=async()=>{if(!confirm('Disable '+acct.display_name+'?'))return;try{await api.request('/accounts',{action:'disable',id:acct.id});await reload();}catch(e){result.textContent=e.message;}};
      td.appendChild(b);
    }tr.appendChild(td);table.appendChild(tr);
   }
  }catch(e){result.textContent='Unable to load accounts: '+e.message;}
 }
 form.onsubmit=async e=>{
  e.preventDefault();create.disabled=true;result.textContent='';
  try{
   const data=await api.request('/accounts',{action:'create',name:name.value.trim(),role:role.value});
   const label=document.createElement('p');label.textContent='New code for '+data.account.name+' (copy now):';
   const code=document.createElement('div');code.className='code';code.textContent=data.account.code;
   const copy=document.createElement('button');copy.type='button';copy.textContent='Copy code';copy.onclick=()=>navigator.clipboard.writeText(data.account.code);
   result.replaceChildren(label,code,copy);name.value='';await reload();
  }catch(err){result.textContent=err.message;}finally{create.disabled=false;}
 };
 reload();
}
})();
