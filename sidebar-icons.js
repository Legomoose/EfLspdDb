/* Sidebar category icon preferences, local to this browser. */
(()=>{
 const key='eflspddb_sidebar_icons_v1';
 const defaults={
 'Active Investigation':['location-dot','#fa5262'],'Crime Scene':['location-dot','#46e6a0'],
 'Location of Interest':['crosshairs','#ffb735'],'Resolved':['location-dot','#a9b6c7'],
 'Gang / Territory':['flag','#a342f5'],'Police Stations':['shield','#2498ff'],
 'Hospitals':['briefcase-medical','#ff5269'],'Drug Locations':['cannabis','#38e881'],
 'Vendors':['cart-shopping','#ffc32f'],'Money Wash':['circle-dollar-to-slot','#22e78a'],
 'Restaurants':['utensils','#ff943e'],'Mech Shops':['wrench','#a9b9cb'],
 'Gas Stations':['gas-pump','#f6c43c'],'Banks':['building-columns','#e8efff']
 };
 const choices=['location-dot','shield','flag','briefcase-medical','hospital','cannabis','cart-shopping','circle-dollar-to-slot','utensils','wrench','gas-pump','building-columns','crosshairs','magnifying-glass','car','store','warehouse','skull','house','star','landmark','truck-medical','user-secret','camera','fire','bolt','gear','screwdriver-wrench','money-bill-wave','coins','handcuffs','person','train','plane','helicopter','anchor','shop','map-pin','building-shield','shield-halved'];
 let preferences={};try{preferences=JSON.parse(localStorage.getItem(key)||'{}')||{}}catch{}
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function apply(){
  document.querySelectorAll('#categoryList button[data-cat]').forEach(button=>{
   const category=button.dataset.cat,entry=preferences[category]||defaults[category];
   if(!entry)return;
   let icon=button.querySelector('b');if(!icon){icon=document.createElement('b');button.prepend(icon)}
   icon.innerHTML='<i class="fa-solid fa-'+esc(entry[0])+'"></i>';
   icon.style.color=entry[1];
   icon.style.fontSize='18px';
  });
 }
 apply();
 const editor=document.getElementById('efEditSidebarIcons');
 if(!editor)return;
 editor.addEventListener('click',()=>{
  document.getElementById('efSidebarIconEditor')?.remove();
  const backdrop=document.createElement('div');
  backdrop.id='efSidebarIconEditor';backdrop.className='ef-sidebar-editor-overlay';
  const rows=Object.keys(defaults).map(category=>{
   const entry=preferences[category]||defaults[category];
   return `<label class="ef-icon-row"><span>${esc(category)}</span><select data-icon-cat="${esc(category)}">${choices.map(icon=>`<option value="${esc(icon)}"${icon===entry[0]?' selected':''}>${esc(icon.replaceAll('-',' '))}</option>`).join('')}</select><input aria-label="Icon color for ${esc(category)}" type="color" data-color-cat="${esc(category)}" value="${esc(entry[1])}"></label>`;
  }).join('');
  backdrop.innerHTML=`<section class="ef-sidebar-editor"><div class="ef-sidebar-editor-header"><h2>Customize Sidebar Icons</h2><button type="button" data-icon-close>×</button></div><p>Choose an icon and color for each category. Your preferences are saved in this browser.</p><div class="ef-sidebar-editor-list">${rows}</div><footer><button type="button" data-icon-reset>Restore Defaults</button><button type="button" class="blue" data-icon-save>Save Icons</button></footer></section>`;
  document.body.append(backdrop);
  backdrop.addEventListener('click',e=>{
   if(e.target===backdrop||e.target.closest('[data-icon-close]')){backdrop.remove();return}
   if(e.target.closest('[data-icon-reset]')){preferences={};localStorage.removeItem(key);apply();backdrop.remove();return}
   if(e.target.closest('[data-icon-save]')){
    backdrop.querySelectorAll('[data-icon-cat]').forEach(select=>{
     const cat=select.dataset.iconCat,color=backdrop.querySelector('[data-color-cat="'+CSS.escape(cat)+'"]');
     preferences[cat]=[select.value,color?.value||defaults[cat][1]];
    });
    localStorage.setItem(key,JSON.stringify(preferences));apply();backdrop.remove();
   }
  });
 });
})();