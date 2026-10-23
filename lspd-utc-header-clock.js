/* UTC time shown beside the existing live browser-local header clock. */
(()=>{'use strict';
 const local=document.getElementById('lspdHeaderClock');
 if(!local||document.getElementById('lspdUtcClock'))return;
 const el=document.createElement('div');el.id='lspdUtcClock';el.className='lspd-utc-clock';
 el.setAttribute('aria-label','Coordinated Universal Time');
 el.innerHTML='<small>UTC</small><strong>--:--</strong>';
 local.parentNode.insertBefore(el,local);
 const time=el.querySelector('strong');const pad=n=>String(n).padStart(2,'0');
 const tick=()=>{const d=new Date();time.textContent=pad(d.getUTCHours())+':'+pad(d.getUTCMinutes());};
 tick();const timer=setInterval(tick,1000);window.addEventListener('pagehide',()=>clearInterval(timer),{once:true});
})();
