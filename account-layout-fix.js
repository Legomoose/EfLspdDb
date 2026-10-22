/* Phase 3.1: account menu and working resizable panels. Does not alter saved records. */
(()=>{'use strict';
const toggle=document.getElementById('efHeaderAccountToggle');
const header=document.querySelector('.ef-header-right');
if(toggle&&header){
 const menu=document.createElement('div');menu.id='efAccountMenu';menu.className='ef-account-menu';menu.hidden=true;
 const name=document.createElement('div');name.className='ef-account-menu-name';
 const manage=document.createElement('button');manage.type='button';manage.innerHTML='<i class="fa-solid fa-users-gear"></i> Manage Accounts';
 const logout=document.createElement('button');logout.type='button';logout.innerHTML='<i class="fa-solid fa-right-from-bracket"></i> Log Out';
 menu.append(name,manage,logout);header.append(menu);
 const refresh=()=>{
  const user=window.EFDBAuth?.user;
  document.getElementById('efHeaderUserName').textContent=user?.name||'Detective';
  document.getElementById('efHeaderUserRole').textContent=user?.role?(window.EFDBRoleTitle?.(user.role)||user.role):'Signed out';
  name.textContent=user?`${user.name} · ${window.EFDBRoleTitle?.(user.role)||user.role}`:'Not signed in';
  manage.hidden=!['owner','admin','director','deputy_director','supervisory_detective'].includes(user?.role);
  if(!user)menu.hidden=true;
 };
 toggle.addEventListener('click',e=>{e.stopImmediatePropagation();if(!window.EFDBAuth?.loggedIn)return;menu.hidden=!menu.hidden;refresh();},true);
 manage.addEventListener('click',()=>{menu.hidden=true;window.EFDBOpenAdmin?.();});
 logout.addEventListener('click',()=>{menu.hidden=true;window.EFDBAuth?.logout();});
 document.addEventListener('click',e=>{if(!header.contains(e.target))menu.hidden=true;});
 window.addEventListener('efdb-auth-login',refresh);
 window.addEventListener('efdb-auth-logout',refresh);
 refresh();
}
const workspace=document.querySelector('.workspace');
if(!workspace)return;
for(const [side,key] of [['left','eflspddb_left_width_v1'],['right','eflspddb_right_width_v1']]){
 const panel=workspace.querySelector('.'+side+'panel');if(!panel)continue;
 const handle=document.createElement('div');handle.className='ef-resize-handle ef-resize-'+side;
 handle.title='Drag to resize '+side+' panel';handle.setAttribute('role','separator');handle.setAttribute('aria-orientation','vertical');
 panel.append(handle);
 const initial=Number(localStorage.getItem(key));
 if(initial>=150&&initial<=900)panel.style.setProperty('width',initial+'px','important');
 let startX,startWidth,active=false;
 handle.addEventListener('pointerdown',e=>{
  if(workspace.classList.contains(side+'-collapsed'))return;
  e.preventDefault();startX=e.clientX;startWidth=panel.getBoundingClientRect().width;active=true;
  handle.setPointerCapture(e.pointerId);document.body.classList.add('ef-resizing');
 });
 handle.addEventListener('pointermove',e=>{
  if(!active)return;
  const change=(e.clientX-startX)*(side==='left'?1:-1);
  const other=workspace.querySelector(side==='left'?'.rightpanel':'.leftpanel');
  const available=workspace.clientWidth-(other?.getBoundingClientRect().width||0)-240;
  const width=Math.round(Math.max(side==='left'?185:270,Math.min(650,available,startWidth+change)));
  panel.style.setProperty('width',width+'px','important');
  if(window.map?.invalidateSize)window.map.invalidateSize({pan:false});
 });
 const finish=()=>{if(!active)return;active=false;document.body.classList.remove('ef-resizing');localStorage.setItem(key,String(Math.round(panel.getBoundingClientRect().width)));};
 handle.addEventListener('pointerup',finish);handle.addEventListener('pointercancel',finish);
}
})();
