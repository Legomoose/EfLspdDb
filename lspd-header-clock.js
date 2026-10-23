/* LSPD DB header clock: browser-local time, 24-hour display. */
(()=>{
 'use strict';
 const right=document.querySelector('.ef-header-right');
 if(!right||document.getElementById('lspdHeaderClock'))return;
 const clock=document.createElement('div');
 clock.id='lspdHeaderClock';
 clock.className='lspd-header-clock';
 clock.setAttribute('role','timer');
 clock.setAttribute('aria-label','Current local date and time');
 clock.innerHTML='<strong class="lspd-clock-time">--:--:--</strong><small class="lspd-clock-date">--/--/----</small>';
 right.prepend(clock);
 const time=clock.querySelector('.lspd-clock-time');
 const date=clock.querySelector('.lspd-clock-date');
 const two=n=>String(n).padStart(2,'0');
 function update(){
  const d=new Date();
  time.textContent=`${two(d.getHours())}:${two(d.getMinutes())}:${two(d.getSeconds())}`;
  date.textContent=`${two(d.getDate())}/${two(d.getMonth()+1)}/${d.getFullYear()}`;
 }
 update();
 const interval=setInterval(update,1000);
 window.addEventListener('pagehide',()=>clearInterval(interval),{once:true});
})();
