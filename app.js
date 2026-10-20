const STORAGE_KEY = "everfall_lspd_cases_v1";
const seedCases = [
  {id:"EF-26-014",caseNo:"EF-26-014",status:"Open",location:"Legion Square",detective:"Unassigned",suspect:"Unknown",notes:"Sample record — replace with real investigation information.",lat: -0.48,lng:0.15,updated:new Date().toISOString()},
  {id:"EF-26-011",caseNo:"EF-26-011",status:"Active",location:"Pillbox Hill",detective:"Detective Bureau",suspect:"Person of interest",notes:"Sample record for demonstration.",lat:-0.17,lng:0.08,updated:new Date(Date.now()-86400000).toISOString()},
  {id:"EF-26-008",caseNo:"EF-26-008",status:"Closed",location:"Vespucci Beach",detective:"Unassigned",suspect:"N/A",notes:"Sample closed record.",lat:-0.40,lng:-0.38,updated:new Date(Date.now()-172800000).toISOString()}
];
let cases = loadCases();
let editingId = null;
let pendingLocation = null;
let placingForId = null;
const $ = id => document.getElementById(id);
const statusColors = {Open:"#e45e65",Active:"#e7ae4d",Closed:"#53bd91",Cold:"#6da8ef"};

function loadCases(){try{const saved=localStorage.getItem(STORAGE_KEY);return saved?JSON.parse(saved):seedCases;}catch{return seedCases;}}
function saveCases(){localStorage.setItem(STORAGE_KEY,JSON.stringify(cases));}
function safe(value=""){return String(value).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function fmtDate(value){try{return new Date(value).toLocaleDateString(undefined,{day:"2-digit",month:"short",year:"numeric"});}catch{return "—";}}
function filteredCases(){const q=$("searchInput").value.trim().toLowerCase(),status=$("categoryFilter").value;return cases.filter(c=>(status==="all"||c.status===status)&&(!q||[c.caseNo,c.location,c.detective,c.suspect,c.notes].join(" ").toLowerCase().includes(q)));}
function markerIcon(status){return L.divIcon({className:"case-marker-wrap",html:`<div style="width:15px;height:15px;border-radius:50%;background:${statusColors[status]||statusColors.Open};border:2px solid #f1f5f9;box-shadow:0 0 0 4px ${(statusColors[status]||statusColors.Open)}35,0 2px 8px #0008"></div>`,iconSize:[15,15],iconAnchor:[7,7]});}

const map = L.map("map",{crs:L.CRS.Simple,minZoom:-2,maxZoom:3,zoomControl:true,attributionControl:true});
const tileBase="https://viruxe.github.io/gtav-map-tiles/atlas/{z}/{x}-{y}.webp";
L.tileLayer(tileBase,{minZoom:0,maxZoom:5,noWrap:true,attribution:'Unofficial GTA V map tiles · Rockstar Games assets belong to their respective owners'}).addTo(map);
map.setView([0,0],0);
const markerLayer=L.layerGroup().addTo(map);

function render(){
  const list=filteredCases();
  $("caseCount").textContent=cases.length;
  $("openCount").textContent=cases.filter(c=>c.status==="Open").length;
  $("activeCount").textContent=cases.filter(c=>c.status==="Active").length;
  $("closedCount").textContent=cases.filter(c=>c.status==="Closed").length;
  $("caseList").innerHTML=list.length?list.map(c=>`<div class="case-row" data-case="${safe(c.id)}"><div class="case-row-top"><span class="case-id">${safe(c.caseNo)}</span><span class="status-tag ${safe(c.status)}">${safe(c.status)}</span></div><div class="case-location">${safe(c.location||"Map location pending")}</div><div class="case-meta">Lead: ${safe(c.detective||"Unassigned")} · ${fmtDate(c.updated)}</div></div>`).join(""):`<div class="empty-state">No investigations match your search.<br>Add a pin to get started.</div>`;
  markerLayer.clearLayers();
  cases.forEach(c=>{
    if(typeof c.lat!=="number"||typeof c.lng!=="number")return;
    const marker=L.marker([c.lat,c.lng],{icon:markerIcon(c.status)}).addTo(markerLayer);
    marker.bindPopup(`<div class="popup-case">${safe(c.caseNo)} · ${safe(c.status)}</div><div class="popup-location">${safe(c.location)}</div><button class="popup-button" onclick="window.openCase('${safe(c.id)}')">View investigation</button>`);
    marker.on("click",()=>selectCase(c.id,false));
  });
  renderRecords();
}
function selectCase(id,zoom=true){
  const c=cases.find(x=>x.id===id);if(!c)return;
  document.querySelectorAll(".case-row").forEach(el=>el.classList.toggle("selected",el.dataset.case===id));
  const marker=markerLayer.getLayers().find(m=>{const p=m.getLatLng();return p.lat===c.lat&&p.lng===c.lng;});
  if(marker){if(zoom)map.setView(marker.getLatLng(),Math.max(map.getZoom(),1));marker.openPopup();}
  else if(zoom)toast("This record has no map position yet. Use Place pin on its record.");
}
window.openCase=id=>{const c=cases.find(x=>x.id===id);if(!c)return;openModal(c);};
function renderRecords(){
  $("recordsBody").innerHTML=cases.length?cases.slice().sort((a,b)=>new Date(b.updated)-new Date(a.updated)).map(c=>`<tr><td><strong>${safe(c.caseNo)}</strong></td><td>${safe(c.location||"Not set")}</td><td>${safe(c.detective||"Unassigned")}</td><td><span class="status-tag ${safe(c.status)}">${safe(c.status)}</span></td><td>${fmtDate(c.updated)}</td><td><button data-edit="${safe(c.id)}">Edit</button> · <button data-place="${safe(c.id)}">Place pin</button></td></tr>`).join(""):`<tr><td colspan="6">No records yet.</td></tr>`;
}
function openModal(c=null){
  editingId=c?c.id:null;pendingLocation=c&&typeof c.lat==="number"?{lat:c.lat,lng:c.lng}:null;
  $("modalTitle").textContent=c?"Edit investigation":"Add investigation pin";
  const f=$("caseForm");f.reset();
  if(c){for(const key of ["caseNo","status","location","detective","suspect","notes"])f.elements[key].value=c[key]||"";}
  $("caseModal").classList.remove("hidden");
}
function closeModal(){$("caseModal").classList.add("hidden");}
function toast(msg){$("toast").textContent=msg;$("toast").classList.remove("hidden");setTimeout(()=>$("toast").classList.add("hidden"),2600);}
function showView(which){
  const mapMode=which==="map";$("mapView").classList.toggle("hidden",!mapMode);$("recordsView").classList.toggle("hidden",mapMode);
  $("mapNav").classList.toggle("active",mapMode);$("recordsNav").classList.toggle("active",!mapMode);
  $("pageTitle").textContent=mapMode?"Investigation Map":"Case Records";
  if(mapMode)setTimeout(()=>map.invalidateSize(),100);
}
$("caseForm").addEventListener("submit",e=>{
  e.preventDefault();const f=e.currentTarget;
  const data={caseNo:f.elements.caseNo.value.trim(),status:f.elements.status.value,location:f.elements.location.value.trim(),detective:f.elements.detective.value.trim()||"Unassigned",suspect:f.elements.suspect.value.trim()||"Unknown",notes:f.elements.notes.value.trim(),updated:new Date().toISOString()};
  if(!data.caseNo||!data.location)return;
  if(editingId){const old=cases.find(c=>c.id===editingId);Object.assign(old,data);if(pendingLocation){old.lat=pendingLocation.lat;old.lng=pendingLocation.lng;}}
  else{const id=data.caseNo; if(cases.some(c=>c.caseNo.toLowerCase()===data.caseNo.toLowerCase())){toast("That case number already exists.");return;}cases.unshift({id,...data,lat:pendingLocation?.lat??null,lng:pendingLocation?.lng??null});editingId=id;}
  saveCases();closeModal();render();toast("Investigation saved in this browser.");
  if(!pendingLocation){placingForId=editingId;showView("map");toast("Click the map to place the new investigation pin.");}
});
$("addPinBtn").onclick=()=>openModal();$("addRecordBtn").onclick=()=>openModal();
$("closeModal").onclick=closeModal;$("cancelModal").onclick=closeModal;
$("caseModal").addEventListener("click",e=>{if(e.target===$("caseModal"))closeModal();});
$("searchInput").addEventListener("input",render);$("categoryFilter").addEventListener("change",render);
$("clearSearch").onclick=()=>{$("searchInput").value="";$("categoryFilter").value="all";render();};
$("mapNav").onclick=()=>showView("map");$("recordsNav").onclick=()=>showView("records");
$("caseList").addEventListener("click",e=>{const row=e.target.closest("[data-case]");if(row)selectCase(row.dataset.case);});
$("recordsBody").addEventListener("click",e=>{const edit=e.target.closest("[data-edit]"),place=e.target.closest("[data-place]");if(edit){openModal(cases.find(c=>c.id===edit.dataset.edit));}if(place){placingForId=place.dataset.place;showView("map");toast("Click the map to position this case pin.");}});
map.on("click",e=>{
  if(placingForId){const c=cases.find(x=>x.id===placingForId);if(c){c.lat=e.latlng.lat;c.lng=e.latlng.lng;c.updated=new Date().toISOString();saveCases();render();toast(`Pin placed for ${c.caseNo}.`);}placingForId=null;}
  else if(!$("caseModal").classList.contains("hidden"))pendingLocation={lat:e.latlng.lat,lng:e.latlng.lng};
});
render();
