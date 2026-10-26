(()=>{'use strict';
const form=document.getElementById('caseForm');if(!form)return;
const panel=form.querySelector('[data-marker-panel="symbol"]');
if(panel&&!panel.querySelector('.ef-pin-library-header')){
 const header=document.createElement('div');header.className='ef-pin-library-header';
 const label=document.createElement('span');label.textContent='✦ PIN ICON LIBRARY';
 const help=document.createElement('small');help.textContent='Select an icon to preview';
 header.append(label,help);panel.prepend(header);
 const legend=document.createElement('div');legend.className='ef-pin-library-legend';
 ['🔵 Locations','🔴 Investigations','🟢 Territories','🟡 Businesses','🟣 Interests'].forEach(s=>{const el=document.createElement('span');el.textContent=s;legend.append(el)});
 panel.append(legend);
}
const imagePanel=form.querySelector('[data-marker-panel="image"]');
if(imagePanel&&!imagePanel.querySelector('.ef-pin-icon-hint')){
 const note=document.createElement('p');note.className='ef-pin-icon-hint';note.textContent='Custom image uploads currently use the existing browser-local storage workflow; do not assume they sync across devices.';imagePanel.append(note);
}
})();