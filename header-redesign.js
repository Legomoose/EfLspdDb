(()=>{
const search=document.getElementById('efHeaderSearch');
const old=document.getElementById('searchInput');
search?.addEventListener('input',()=>{if(old){old.value=search.value;old.dispatchEvent(new Event('input',{bubbles:true}))}});
search?.addEventListener('keydown',event=>{if(event.key==='Enter'){document.querySelector('[data-section="search"]')?.click()}});
document.getElementById('efHeaderAccountToggle')?.addEventListener('click',()=>document.querySelector('.ef-primary-navigation button[data-section="settings"]')?.click());
document.getElementById('efThemeToggle')?.addEventListener('click',()=>{document.querySelector('.ef-new-header')?.classList.toggle('ef-header-light')});
})();