/* Reliable header date, browser-local time, and UTC time. */
(function(){'use strict';
 function setup(){
  var right=document.querySelector('.header.ef-new-header .ef-header-right');
  if(!right)return;
  var local=document.getElementById('lspdHeaderClock');
  if(!local){local=document.createElement('div');local.id='lspdHeaderClock';local.className='lspd-header-clock';local.setAttribute('aria-label','Current local date and time');local.innerHTML='<strong class="lspd-clock-time"></strong><small class="lspd-clock-date"></small>';right.insertBefore(local,right.firstChild);}
  var utc=document.getElementById('lspdUtcClock');
  if(!utc){utc=document.createElement('div');utc.id='lspdUtcClock';utc.className='lspd-utc-clock';utc.setAttribute('aria-label','Coordinated Universal Time');utc.innerHTML='<small>UTC</small><strong></strong>';local.insertAdjacentElement('afterend',utc);}
  var time=local.querySelector('.lspd-clock-time'),date=local.querySelector('.lspd-clock-date'),utcTime=utc.querySelector('strong');
  function tick(){var now=new Date();time.textContent=now.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false});date.textContent=now.toLocaleDateString('en-GB',{weekday:'short',day:'2-digit',month:'short',year:'numeric'});utcTime.textContent=now.toLocaleTimeString('en-GB',{timeZone:'UTC',hour:'2-digit',minute:'2-digit',hour12:false});}
  tick();if(!window.__lspdHeaderClockInterval){window.__lspdHeaderClockInterval=setInterval(tick,1000);}
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup,{once:true});else setup();
})();
