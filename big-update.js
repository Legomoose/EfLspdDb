/* EFLSPDDB navigation enhancement: category cycling, no data migration. */
(()=>{
 const positions=new Map();
 const categories=document.getElementById('categoryList');
 if(categories)categories.addEventListener('click',event=>{
  const button=event.target.closest('button[data-cat]');if(!button)return;
  // Capture before the original handler, which always selects the first pin.
  event.stopImmediatePropagation();
  const category=button.dataset.cat;
  const matches=cases.filter(c=>typeof c.lat==='number'&&typeof c.lng==='number'&&
   (displayMarkerCategory(c)===category||(category==='Location of Interest'&&c.markerCategory==='Person of Interest')||
    (category==='Active Investigation'&&c.kind!=='general'&&c.status==='Active')));
  if(!matches.length){toast('No positioned '+category.toLowerCase()+' markers yet.');return}
  const index=(positions.get(category)||0)%matches.length;
  positions.set(category,index+1);
  const pin=matches[index];
  showSection('map');
  map.setView([pin.lat,pin.lng],Math.max(map.getZoom(),2),{animate:true});
  selectCase(pin.id,false);
  button.dataset.cycle=`${index+1} of ${matches.length}`;
  button.title=`${pin.caseNo||'Location'} — ${index+1} of ${matches.length}`;
  categories.querySelectorAll('button[data-cat]').forEach(b=>{if(b!==button)delete b.dataset.cycle});
  if(typeof render==='function')render();
 },true);
 // Highlight navigation buttons on the left as sections change.
 document.querySelectorAll('.ef-primary-navigation button[data-section]').forEach(button=>button.addEventListener('click',()=>{
  document.querySelectorAll('.ef-primary-navigation button').forEach(b=>b.classList.toggle('ef-current',b===button));
 }));
 // Photo previews before a vehicle record is saved.
 document.addEventListener('change',event=>{
  if(event.target.id!=='efVehiclePhoto')return;
  const file=event.target.files?.[0],container=event.target.closest('form')?.querySelector('.ef-vehicle-preview');
  if(!container||!file)return;
  if(file.size>350000){container.textContent='File too large — please choose an image under 350 KB.';return}
  const reader=new FileReader();reader.onload=()=>{container.innerHTML='';const img=document.createElement('img');img.src=reader.result;img.alt='Vehicle photo preview';container.append(img)};reader.readAsDataURL(file);
 });
})();